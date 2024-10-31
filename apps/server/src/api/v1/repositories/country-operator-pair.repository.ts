import { mongo } from '#/common/db/mongodb/mongo.client';
import mongoose from 'mongoose';
import { CountryOperatorPairDTO } from '../entities/dtos/country-operator-pair.dto';
import userRepository from './user.repository';

class CountryOperatorPairRepository {
  async getDetails({ id }: CountryOperatorPairDTO.Get) {
    // use aggregation to get these details: country, operator, createdBy, updatedBy
    // we don't need to get program details
    const countryOperatorPair = await mongo.CountryOperatorPair.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'operatorId',
          foreignField: '_id',
          as: 'operator',
        },
      },
      {
        $project: {
          _id: 1,
          programId: 1,
          country: {
            $arrayElemAt: ['$country', 0],
          },
          operator: {
            $arrayElemAt: ['$operator', 0],
          },
          active: 1,
          highPriority: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const { createdBy, updatedBy } = countryOperatorPair[0];

    const userIds =
      createdBy === updatedBy ? [createdBy] : [createdBy, updatedBy];
    // fetch createdBy and updatedBy details from the user repository
    const users = await userRepository.getUsersByIds(userIds);

    const result = {
      ...countryOperatorPair[0].toJSON(),
      createdBy: users.find((user) => user.id === createdBy),
      updatedBy: users.find((user) => user.id === updatedBy),
    };

    return result;
  }

  async getDesiredPairs({
    programId,
    disabled,
    highPriority,
  }: CountryOperatorPairDTO.GetDesiredPairs) {
    // use aggregation to get these details: country, operator, createdBy, updatedBy
    const countryOperatorPairs = await mongo.CountryOperatorPair.aggregate([
      {
        $match: {
          programId: new mongoose.Types.ObjectId(programId),
          disabled: disabled ?? false,
          highPriority: highPriority ?? false,
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'operatorId',
          foreignField: '_id',
          as: 'operator',
        },
      },
      {
        $project: {
          _id: 1,
          programId: 1,
          country: {
            $arrayElemAt: ['$country', 0],
          },
          operator: {
            $arrayElemAt: ['$operator', 0],
          },
          active: 1,
          highPriority: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    // get the user lookup from the user repository
    const userLookup = await userRepository.getUserLookup(countryOperatorPairs);

    // map the results to include the user details and return
    return countryOperatorPairs.map((countryOperatorPair) => {
      countryOperatorPair = countryOperatorPair.toJSON();
      const { createdBy, updatedBy } = countryOperatorPair;
      return {
        ...countryOperatorPair,
        createdBy: userLookup[createdBy],
        updatedBy: userLookup[updatedBy],
      };
    });
  }

  async searchById({ query }: CountryOperatorPairDTO.SearchById) {
    // use aggregation to get these details: country, operator, createdBy, updatedBy
    const countryOperatorPairs = await mongo.CountryOperatorPair.aggregate([
      {
        $match: {
          programId: new mongoose.Types.ObjectId(query.programId),
          countryId: new mongoose.Types.ObjectId(query.countryId),
          operatorId: new mongoose.Types.ObjectId(query.operatorId),
          createdBy: new mongoose.Types.ObjectId(query.userId),
          updatedBy: new mongoose.Types.ObjectId(query.userId),
        },
      },
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'operatorId',
          foreignField: '_id',
          as: 'operator',
        },
      },
      {
        $project: {
          _id: 1,
          programId: 1,
          country: {
            $arrayElemAt: ['$country', 0],
          },
          operator: {
            $arrayElemAt: ['$operator', 0],
          },
          active: 1,
          highPriority: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    // get the user lookup from the user repository
    const userLookup = await userRepository.getUserLookup(countryOperatorPairs);

    // map the results to include the user details and return
    return countryOperatorPairs.map((countryOperatorPair) => {
      countryOperatorPair = countryOperatorPair.toJSON();
      const { createdBy, updatedBy } = countryOperatorPair;
      return {
        ...countryOperatorPair,
        createdBy: userLookup[createdBy],
        updatedBy: userLookup[updatedBy],
      };
    });
  }

  async getPaginatedResults({
    page,
    limit,
    sortBy,
    sortOrder,
  }: CountryOperatorPairDTO.GetPaginatedResults) {
    // make aggregation first, then use aggregatePaginate to get paginated results
    const aggregatePipeline = [
      {
        $lookup: {
          from: 'countries',
          localField: 'countryId',
          foreignField: '_id',
          as: 'country',
        },
      },
      {
        $lookup: {
          from: 'operators',
          localField: 'operatorId',
          foreignField: '_id',
          as: 'operator',
        },
      },
      {
        $project: {
          _id: 1,
          programId: 1,
          country: {
            $arrayElemAt: ['$country', 0],
          },
          operator: {
            $arrayElemAt: ['$operator', 0],
          },
          active: 1,
          highPriority: 1,
          createdBy: 1,
          updatedBy: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { [sortBy]: sortOrder === 'asc' ? 1 : -1 },
    };

    const countryOperatorPairs =
      await mongo.CountryOperatorPair.aggregatePaginate(
        mongo.CountryOperatorPair.aggregate(aggregatePipeline),
        options,
      );

    // get the user lookup from the user repository
    const userLookup = await userRepository.getUserLookup(
      countryOperatorPairs.docs,
    );

    // map the results to include the user details and return
    return countryOperatorPairs.docs.map((countryOperatorPair) => {
      countryOperatorPair = countryOperatorPair.toJSON();
      const { createdBy, updatedBy } = countryOperatorPair;
      return {
        ...countryOperatorPair,
        createdBy: userLookup[createdBy],
        updatedBy: userLookup[updatedBy],
      };
    });
  }
}

const countryOperatorPairRepository = new CountryOperatorPairRepository();
export default countryOperatorPairRepository;
