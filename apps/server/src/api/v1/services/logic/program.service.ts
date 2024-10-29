import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { ProgramDTO } from '../../entities/dtos/program.dto';
import { v4 as uuidv4 } from 'uuid';
import cipherService from '../helper/cipher.service';
import fileService from '../helper/file.service';
import prisma from '#/common/db/prisma/prisma.client';
import mongoose from 'mongoose';

interface ProgramServiceDTO {}

class ProgramService implements ProgramServiceDTO {
  constructor() {}

  async upload({
    name,
    description,
    fileName,
    serverFileName,
    userId,
  }: ProgramDTO.Upload) {
    // check if the name is already in use
    const programExists = await mongo.Program.findOne({ name });

    if (programExists) {
      fileService.deleteFile(serverFileName);
      throw new ApiError(400, 'Program name already in use');
    }

    // save the details to the database
    const program = await mongo.Program.create({
      name,
      description,
      fileName,
      serverFileName,
      createdBy: userId,
    });

    if (!program) {
      fileService.deleteFile(serverFileName);
      throw ApiError.internal('Error uploading program!');
    }

    return {
      message: 'Program uploaded successfully',
      data: {
        program: {
          ...program.toJSON(),
          createdBy: cipherService.encodeId(program.createdBy),
        },
      },
    };
  }

  async updateDetails({
    name,
    description,
    userId,
    programId,
  }: ProgramDTO.UpdateDetails) {
    // find the program by id
    const program = await mongo.Program.findById(programId);
    if (!program) throw new ApiError(404, 'Program not found!');

    // basic validation
    if (!name && !description) throw new ApiError(400, 'No details to update!');

    // check uniqueness of the new name
    const programExists = await mongo.Program.findOne({ name });
    if (programExists) throw new ApiError(400, 'Program name already in use!');

    // update the program details
    if (name) program.name = name;
    if (description) program.description = description;
    program.updatedBy = userId;

    // save the updated details
    await program.save();

    return {
      message: 'Program details updated successfully',
      data: {
        program: {
          ...program.toJSON(),
          createdBy: cipherService.encodeId(program.createdBy),
          updatedBy: cipherService.encodeId(program.updatedBy),
        },
      },
    };
  }

  async updateFile({
    fileName,
    userId,
    programId,
    serverFileName,
  }: ProgramDTO.UpdateFile) {
    // find the program by id
    const program = await mongo.Program.findById(programId);
    if (!program) {
      fileService.deleteFile(serverFileName);
      throw new ApiError(404, 'Program not found!');
    }

    const oldServerFileName = program.serverFileName;

    // update the program details
    program.fileName = fileName;
    program.updatedBy = userId;
    program.serverFileName = serverFileName;

    // save the updated details
    await program.save();

    // delete the old file from the server
    fileService.deleteFile(oldServerFileName);

    return {
      message: 'Program file updated successfully',
      data: {
        program: {
          ...program.toJSON(),
          createdBy: cipherService.encodeId(program.createdBy),
          updatedBy: cipherService.encodeId(program.updatedBy),
        },
      },
    };
  }

  async delete({ programId }: ProgramDTO.Common) {
    // find the program by id
    const program = await mongo.Program.findById(programId);
    if (!program) throw new ApiError(404, 'Program not found!');

    // delete the file from the server
    fileService.deleteFile(program.serverFileName);

    // delete the program
    await program.deleteOne();

    return {
      message: 'Program deleted successfully',
      data: null,
    };
  }

  async get({ programId }: ProgramDTO.Common) {
    // find the program by id
    const program = await mongo.Program.findById(programId);
    if (!program) throw new ApiError(404, 'Program not found!');

    return {
      message: 'Program retrieved successfully',
      data: {
        program: {
          ...program.toJSON(),
          createdBy: cipherService.encodeId(program.createdBy),
          updatedBy: cipherService.encodeId(Number(program.updatedBy)),
        },
      },
    };
  }

  async getDetails({ programId }: ProgramDTO.Common) {
    // Aggregate query to fetch detailed program information, including nested session and user data
    const program = await mongo.Program.aggregate([
      {
        // Step 1: Match the specific program by its ID
        $match: { _id: new mongoose.Types.ObjectId(programId) },
      },
      {
        // Step 2: Lookup to populate details for `countryOperatorPairs` in the `Program`
        $lookup: {
          from: 'countryoperatorpairs', // Target collection to join
          localField: 'countryOperatorPairs', // Local field containing ObjectId references
          foreignField: '_id', // Foreign field in the target collection
          as: 'countryOperatorPairsDetails', // Output array field to store the populated data
        },
      },
      {
        // Step 3: Lookup to populate `activeSessions` with session details
        $lookup: {
          from: 'programsessions', // Target collection to join
          localField: 'activeSessions', // Local field with ObjectId references
          foreignField: '_id', // Foreign field in the target collection
          as: 'activeSessionsDetails', // Output array field to store populated data
        },
      },
      {
        // Step 4: Unwind `activeSessionsDetails` to process each session individually in the next lookup
        $unwind: {
          path: '$activeSessionsDetails', // Array field to unwind
          preserveNullAndEmptyArrays: true, // Keep documents without `activeSessionsDetails`
        },
      },
      {
        // Step 5: Nested lookup to populate `countryOperatorPair` details within each session
        $lookup: {
          from: 'countryoperatorpairs', // Target collection for nested data
          localField: 'activeSessionsDetails.countryOperatorPair', // Field within each session
          foreignField: '_id', // Foreign field in `countryoperatorpairs` collection
          as: 'activeSessionsDetails.countryOperatorPairDetails', // Output field for nested data
        },
      },
      {
        // Step 6: Group back into a single document after unwind and nested lookups
        $group: {
          _id: '$_id', // Re-group by the original program ID
          name: { $first: '$name' }, // Retain program name
          description: { $first: '$description' }, // Retain program description
          fileName: { $first: '$fileName' }, // Retain original file name
          serverFileName: { $first: '$serverFileName' }, // Retain server file name
          countryOperatorPairsDetails: {
            $first: '$countryOperatorPairsDetails',
          }, // Include `countryOperatorPairs` details
          activeSessionsDetails: { $push: '$activeSessionsDetails' }, // Rebuild `activeSessionsDetails` array
          createdBy: { $first: '$createdBy' }, // Retain createdBy user ID
          updatedBy: { $first: '$updatedBy' }, // Retain updatedBy user ID (if exists)
          createdAt: { $first: '$createdAt' }, // Include timestamp for creation
          updatedAt: { $first: '$updatedAt' }, // Include timestamp for last update
        },
      },
      {
        // Step 10: Project the final shape of the document, including only relevant fields
        $project: {
          _id: 1, // Program ID
          name: 1, // Program name
          description: 1, // Program description
          fileName: 1, // Original file name
          serverFileName: 1, // Server file name
          countryOperatorPairsDetails: 1, // Populated country operator pairs
          activeSessionsDetails: 1, // Populated active sessions with nested country operator pairs
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1, // Created at timestamp
          updatedAt: 1, // Last updated timestamp
        },
      },
    ]);

    if (program[0].createdBy === program[0].updatedBy) {
      const userId = program[0].createdBy;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isVerified: true,
          disabled: true,
          disabledAt: true,
        },
      });

      return {
        message: 'Program details retrieved successfully',
        data: {
          program: {
            ...program[0],
            id: program[0]._id,
            _id: undefined,
            createdBy: {
              ...user,
              id: cipherService.encodeId(userId),
            },
            updatedBy: {
              ...user,
              id: cipherService.encodeId(userId),
            },
          },
        },
      };
    }

    const userIds = [program[0].createdBy, program[0].updatedBy];

    // fetch user details from prisma for both createdBy and updatedBy in a single query
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        disabled: true,
        disabledAt: true,
      },
    });

    if (program.length === 0) throw new ApiError(404, 'Program not found!');

    return {
      message: 'Program details retrieved successfully',
      data: {
        program: {
          ...program[0],
          id: program[0]._id,
          _id: undefined,
          createdBy: {
            ...users[0],
            id: cipherService.encodeId(users[0].id),
          },
          updatedBy:
            users.length === 1
              ? null
              : {
                  ...users[1],
                  id: cipherService.encodeId(users[1].id),
                },
        },
      },
    };
  }

  async getPrograms({
    page,
    limit,
    sortBy,
    sortOrder,
    query,
  }: ProgramDTO.GetPrograms) {
    const aggregatePipeline = [
      {
        $match: {
          ...(query && {
            name: { $regex: String(query) || '', $options: 'i' },
            description: { $regex: String(query) || '', $options: 'i' },
          }),
        },
      }, // Apply filters based on query
      {
        $lookup: {
          from: 'countryoperatorpairs', // Adjust collection name if needed
          localField: 'countryOperatorPairs',
          foreignField: '_id',
          as: 'countryOperatorPairsDetails',
        },
      },
      {
        $lookup: {
          from: 'programsessions', // Adjust collection name if needed
          localField: 'activeSessions',
          foreignField: '_id',
          as: 'activeSessionsDetails',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          fileName: 1,
          serverFileName: 1,
          countryOperatorPairsDetails: 1,
          activeSessionsDetails: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    // Define the options for pagination and sorting
    const options = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      sort: sortBy &&
        sortOrder && {
          [sortBy as string]: sortOrder === 'desc' ? -1 : 1,
        },
    };

    // Execute the paginated aggregation
    const programs = await mongo.Program.aggregatePaginate(
      mongo.Program.aggregate(aggregatePipeline),
      options,
    );

    if (programs.totalDocs === 0) throw new ApiError(404, 'No programs found!');

    // Extract unique user IDs from createdBy and updatedBy fields
    const userIds = new Set<number>();
    programs.docs.forEach((program) => {
      userIds.add(program.createdBy);
      if (program.updatedBy) userIds.add(program.updatedBy);
    });

    // Fetch user details from Prisma based on the unique IDs
    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, name: true, email: true }, // Select necessary fields
    });

    // Map user data to a lookup object for efficient retrieval
    const userLookup = users.reduce(
      (acc, user) => {
        acc[user.id] = {
          ...user,
          id: cipherService.encodeId(user.id),
        };
        return acc;
      },
      {} as Record<
        number,
        {
          id: string;
          name: string;
          email: string;
        }
      >,
    );

    // Attach user details to each program
    const enrichedPrograms = programs.docs.map((program) => ({
      ...program,
      id: program._id,
      _id: undefined,
      createdBy: userLookup[program.createdBy],
      updatedBy: program.updatedBy ? userLookup[program.updatedBy] : null,
    }));

    return {
      message: 'Programs retrieved successfully',
      data: {
        programs: enrichedPrograms,
        totalDocs: programs.totalDocs,
        limit: programs.limit,
        page: programs.page,
        totalPages: programs.totalPages,
        hasNextPage: programs.hasNextPage,
        hasPrevPage: programs.hasPrevPage,
        nextPage: programs.nextPage,
        prevPage: programs.prevPage,
      },
    };
  }
}

const programService = new ProgramService();
export default programService;
