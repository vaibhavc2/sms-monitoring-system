import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { ProgramDTO } from '../../entities/dtos/program.dto';
import { v4 as uuidv4 } from 'uuid';
import cipherService from '../helper/cipher.service';
import fileService from '../helper/file.service';
import prisma from '#/common/db/prisma/prisma.client';
import mongoose from 'mongoose';
import programRepository from '../../repositories/program.repository';
import userRepository from '../../repositories/user.repository';
import lookup from '../helper/lookup-creator.service';

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
    // fetch program details from the database
    const program = await programRepository.getDetailedProgram(programId);

    if (!program) throw new ApiError(404, 'Program not found!');

    let userIds: number[] = [];

    if (program.createdBy === program.updatedBy) {
      userIds.push(program.createdBy);
    } else userIds = [program.createdBy, program.updatedBy];

    // fetch user details from prisma for both createdBy and updatedBy in a single query
    const users = await userRepository.getUsersByIds(userIds);

    // create a lookup object for user details
    const userLookup = lookup.createById(users);

    return {
      message: 'Program details retrieved successfully',
      data: {
        program: {
          ...program,
          id: program._id,
          _id: undefined,
          createdBy: {
            ...userLookup[program.createdBy],
            id: cipherService.encodeId(program.createdBy),
          },
          updatedBy:
            program.updatedBy === null
              ? null
              : {
                  ...userLookup[program.updatedBy],
                  id: cipherService.encodeId(program.updatedBy),
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
    // Fetch paginated programs from the database
    const programs = await programRepository.getPaginatedPrograms({
      page,
      limit,
      sortBy,
      sortOrder,
      query,
    });

    if (programs.totalDocs === 0) throw new ApiError(404, 'No programs found!');

    // Extract unique user IDs from createdBy and updatedBy fields
    const userIds = new Set<number>();
    programs.docs.forEach((program) => {
      userIds.add(program.createdBy);
      if (program.updatedBy) userIds.add(program.updatedBy);
    });

    // Fetch user details from Prisma based on the unique IDs
    const users = await userRepository.getUsersByIds(Array.from(userIds));

    // Create a lookup object for user details
    const userLookup = lookup.createById(users);

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
