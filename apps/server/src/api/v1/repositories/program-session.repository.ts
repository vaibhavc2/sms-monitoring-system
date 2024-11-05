import { mongo } from '#/common/db/mongodb/mongo.client';
import mongoose from 'mongoose';
import cipherService from '../services/helper/cipher.service';
import { ProgramSessionDTO } from '../entities/dtos/program-session.dto';

class ProgramSessionRepository {
  private replaceIds(programSession: any) {
    programSession.id = programSession._id;
    delete programSession._id;
    programSession.program.id = programSession.program._id;
    delete programSession.program._id;
    programSession.countryOperatorPair.id =
      programSession.countryOperatorPair._id;
    delete programSession.countryOperatorPair._id;
    programSession.countryOperatorPair.country.id =
      programSession.countryOperatorPair.country._id;
    delete programSession.countryOperatorPair.country._id;
    programSession.countryOperatorPair.operator.id =
      programSession.countryOperatorPair.operator._id;
    delete programSession.countryOperatorPair.operator._id;
    programSession.createdBy.id = programSession.createdBy._id;
    delete programSession.createdBy._id;
    programSession.updatedBy.id = programSession.updatedBy._id;
    delete programSession.updatedBy._id;
    return programSession;
  }

  async getDetails(id: string) {
    // use aggregation to get the nested details of the program (programId) and programOperatorPair (countryOperatorPairId)
    const programSession = await mongo.ProgramSession.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'programs',
          localField: 'programId',
          foreignField: '_id',
          as: 'program',
        },
      },
      {
        $unwind: {
          path: '$program',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'countryoperatorpairs',
          localField: 'countryOperatorPairId',
          foreignField: '_id',
          as: 'countryOperatorPair',
        },
      },
      {
        $unwind: {
          path: '$countryOperatorPair',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryOperatorPair.countryId',
          foreignField: '_id',
          as: 'countryOperatorPair.country',
        },
      },
      {
        $unwind: {
          path: '$countryOperatorPair.country',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'countryOperatorPair.operatorId',
          foreignField: '_id',
          as: 'countryOperatorPair.operator',
        },
      },
      {
        $unwind: {
          path: '$countryOperatorPair.operator',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedBy',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          program: 1,
          countryOperatorPair: 1,
          status: 1,
          startTime: 1,
          endTime: 1,
          lastAction: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    if (programSession.length === 0) return null;

    // replace the _id with id and remove the _id field (even nested fields)
    const result = programSession.map((programSession) => {
      this.replaceIds(programSession);
      // replace the user id with the encoded id
      programSession.createdBy.id = cipherService.encodeId(
        programSession.createdBy.id,
      );
    });

    return result[0] as any;
  }

  async getPaginatedProgramSessions({
    page,
    limit,
    sortBy,
    sortOrder,
    query,
    filter,
  }: ProgramSessionDTO.PaginatedExtended) {
    const {
      status,
      lastAction,
      createdBy,
      updatedBy,
      programId,
      countryOperatorPairId,
    } = filter || {};

    const aggregatePipeline = [
      {
        $match: {
          ...(query && {
            name: { $regex: String(query) || '', $options: 'i' },
          }),
          ...(status && { status }),
          ...(lastAction && { lastAction }),
          ...(createdBy && { createdBy: cipherService.decodeId(createdBy) }),
          ...(updatedBy && { updatedBy: cipherService.decodeId(updatedBy) }),
          ...(programId && {
            programId: new mongoose.Types.ObjectId(String(programId)),
          }),
          ...(countryOperatorPairId && {
            countryOperatorPairId: new mongoose.Types.ObjectId(
              String(countryOperatorPairId),
            ),
          }),
        },
      },
      {
        $lookup: {
          from: 'programs',
          localField: 'programId',
          foreignField: '_id',
          as: 'program',
        },
      },
      {
        $unwind: {
          path: '$program',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'countryoperatorpairs',
          localField: 'countryOperatorPairId',
          foreignField: '_id',
          as: 'countryOperatorPair',
        },
      },
      {
        $unwind: {
          path: '$countryOperatorPair',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryOperatorPair.countryId',
          foreignField: '_id',
          as: 'countryOperatorPair.country',
        },
      },
      {
        $unwind: {
          path: '$countryOperatorPair.country',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'countryOperatorPair.operatorId',
          foreignField: '_id',
          as: 'countryOperatorPair.operator',
        },
      },
      {
        $unwind: {
          path: '$countryOperatorPair.operator',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'updatedBy',
          foreignField: '_id',
          as: 'updatedBy',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          program: 1,
          countryOperatorPair: 1,
          status: 1,
          startTime: 1,
          endTime: 1,
          lastAction: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    // Define the options for pagination and sorting
    const options = {
      page: parseInt(String(page), 10) || 1,
      limit: parseInt(String(limit), 10) || 10,
      sort: {
        [sortBy || 'createdAt']: sortOrder === 'asc' ? 1 : -1,
      },
    };

    const programSessions = await mongo.ProgramSession.aggregatePaginate(
      mongo.ProgramSession.aggregate(aggregatePipeline),
      options,
    );

    // replace the _id with id and remove the _id field (even nested fields)
    return programSessions.docs.map((programSession) => {
      this.replaceIds(programSession);
      // replace the user id with the encoded id
      programSession.createdBy.id = cipherService.encodeId(
        programSession.createdBy.id,
      );
    });
  }
}

const programSessionRepository = new ProgramSessionRepository();
export default programSessionRepository;
