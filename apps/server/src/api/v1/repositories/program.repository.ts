import { mongo } from '#/common/db/mongodb/mongo.client';
import mongoose from 'mongoose';

class ProgramRepository {
  async getDetailedProgram(id: string) {
    // Aggregate query to fetch detailed program information, including nested session and user data
    const aggregatePipeline = [
      {
        // Step 1: Match the specific program by its ID
        $match: { _id: new mongoose.Types.ObjectId(id) },
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
    ];

    const program = await mongo.Program.aggregate(aggregatePipeline);
    if (program.length === 0) return null;
    return program[0];
  }

  async getPaginatedPrograms({
    page,
    limit,
    sortBy,
    sortOrder,
    query,
  }: {
    page?: string;
    limit?: string;
    sortBy?: string;
    sortOrder?: string;
    query?: string;
  }) {
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

    // Execute the paginated aggregation and return the result
    return await mongo.Program.aggregatePaginate(
      mongo.Program.aggregate(aggregatePipeline),
      options,
    );
  }
}

const programRepository = new ProgramRepository();
export default programRepository;
