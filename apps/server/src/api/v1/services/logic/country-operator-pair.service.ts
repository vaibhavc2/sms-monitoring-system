import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { CountryOperatorPairDTO } from '../../entities/dtos/country-operator-pair.dto';
import countryOperatorPairRepository from '../../repositories/country-operator-pair.repository';
import cipherService from '../helper/cipher.service';

class CountryOperatorPairService {
  async create({
    userId,
    programId,
    countryId,
    operatorId,
  }: CountryOperatorPairDTO.Create) {
    // check if program, country and operator exist
    const programExists = await mongo.Program.exists({ _id: programId });

    if (!programExists) {
      return { message: 'Program not found' };
    }

    const countryExists = await mongo.Country.exists({ _id: countryId });

    if (!countryExists) {
      return { message: 'Country not found' };
    }

    const operatorExists = await mongo.Operator.exists({ _id: operatorId });

    if (!operatorExists) {
      return { message: 'Operator not found' };
    }

    // create country operator pair
    const countryOperatorPair = await mongo.CountryOperatorPair.create({
      programId,
      countryId,
      operatorId,
      createdBy: userId,
    });

    return {
      message: 'Country Operator Pair created successfully',
      data: {
        countryOperatorPair: {
          ...countryOperatorPair.toJSON(),
          createdBy: cipherService.encodeId(countryOperatorPair.createdBy),
        },
      },
    };
  }

  async update({
    id,
    userId,
    programId,
    countryId,
    operatorId,
    disabled,
    highPriority,
  }: CountryOperatorPairDTO.Update) {
    // check if country operator pair exists
    const countryOperatorPair = await mongo.CountryOperatorPair.findById(id);

    if (!countryOperatorPair) {
      return { message: 'Country Operator Pair not found' };
    }

    // check if program, country and operator exist
    if (programId) {
      const programExists = await mongo.Program.exists({ _id: programId });

      if (!programExists) {
        return { message: 'Program not found' };
      }
    }

    if (countryId) {
      const countryExists = await mongo.Country.exists({ _id: countryId });

      if (!countryExists) {
        return { message: 'Country not found' };
      }
    }

    if (operatorId) {
      const operatorExists = await mongo.Operator.exists({ _id: operatorId });

      if (!operatorExists) {
        return { message: 'Operator not found' };
      }
    }

    if (
      !programId &&
      !countryId &&
      !operatorId &&
      disabled === undefined &&
      highPriority === undefined
    ) {
      throw ApiError.badRequest('At least one field is required to update');
    }

    // update country operator pair
    const updatedCountryOperatorPair =
      await mongo.CountryOperatorPair.findByIdAndUpdate(
        id,
        {
          programId,
          countryId,
          operatorId,
          updatedBy: userId,
          disabled: disabled ?? countryOperatorPair.disabled,
          highPriority: highPriority ?? countryOperatorPair.highPriority,
          disabledBy: disabled ? userId : countryOperatorPair.disabledBy,
        },
        { new: true },
      );

    if (!updatedCountryOperatorPair) {
      throw ApiError.internal('Failed to update country operator pair');
    }

    return {
      message: 'Country Operator Pair updated successfully',
      data: {
        countryOperatorPair: {
          ...updatedCountryOperatorPair.toJSON(),
          createdBy: cipherService.encodeId(
            updatedCountryOperatorPair.createdBy,
          ),
          updatedBy: cipherService.encodeId(userId),
        },
      },
    };
  }

  async delete({ id }: CountryOperatorPairDTO.Delete) {
    // check if country operator pair exists
    const countryOperatorPair = await mongo.CountryOperatorPair.findById(id);

    if (!countryOperatorPair) {
      throw ApiError.notFound('Country Operator Pair not found');
    }

    // delete country operator pair
    await countryOperatorPair.deleteOne();

    return { message: 'Country Operator Pair deleted successfully', data: {} };
  }

  async get({ id }: CountryOperatorPairDTO.Get) {
    // check if country operator pair exists
    const countryOperatorPair = await countryOperatorPairRepository.getDetails({
      id,
    });

    if (!countryOperatorPair) {
      throw ApiError.notFound('Country Operator Pair not found');
    }

    return {
      message: 'Country Operator Pair retrieved successfully',
      data: {
        countryOperatorPair: {
          ...countryOperatorPair,
          id: countryOperatorPair.id,
          _id: undefined,
          createdBy: {
            ...countryOperatorPair.createdBy,
            id: cipherService.encodeId(countryOperatorPair.createdBy.id),
          },
          updatedBy: countryOperatorPair.updatedBy
            ? {
                ...countryOperatorPair.updatedBy,
                id: cipherService.encodeId(countryOperatorPair.updatedBy.id),
              }
            : null,
        },
      },
    };
  }

  async getDesiredPairs({
    programId,
    highPriority,
    disabled,
  }: CountryOperatorPairDTO.GetDesiredPairs) {
    // get all country operator pairs
    const countryOperatorPairs =
      await countryOperatorPairRepository.getDesiredPairs({
        programId,
        highPriority,
        disabled,
      });

    if (countryOperatorPairs.length === 0) {
      throw ApiError.notFound('Country Operator Pairs not found');
    }

    return {
      message: 'Country Operator Pairs retrieved successfully',
      data: {
        countryOperatorPairs: countryOperatorPairs.map(
          (countryOperatorPair) => ({
            ...countryOperatorPair,
            id: countryOperatorPair.id,
            _id: undefined,
            createdBy: {
              ...countryOperatorPair.createdBy,
              id: cipherService.encodeId(countryOperatorPair.createdBy.id),
            },
            updatedBy: countryOperatorPair.updatedBy
              ? {
                  ...countryOperatorPair.updatedBy,
                  id: cipherService.encodeId(countryOperatorPair.updatedBy.id),
                }
              : null,
          }),
        ),
      },
    };
  }

  async searchById({ query }: CountryOperatorPairDTO.SearchById) {
    const countryOperatorPairs = await countryOperatorPairRepository.searchById(
      {
        query,
      },
    );

    if (countryOperatorPairs.length === 0) {
      throw ApiError.notFound('Country Operator Pairs not found');
    }

    return {
      message: 'Country Operator Pair retrieved successfully',
      data: {
        countryOperatorPairs: countryOperatorPairs.map(
          (countryOperatorPair) => ({
            ...countryOperatorPair,
            id: countryOperatorPair.id,
            _id: undefined,
            createdBy: {
              ...countryOperatorPair.createdBy,
              id: cipherService.encodeId(countryOperatorPair.createdBy.id),
            },
            updatedBy: countryOperatorPair.updatedBy
              ? {
                  ...countryOperatorPair.updatedBy,
                  id: cipherService.encodeId(countryOperatorPair.updatedBy.id),
                }
              : null,
          }),
        ),
      },
    };
  }

  async getPaginatedResults({
    page,
    limit,
    sortBy,
    sortOrder,
  }: CountryOperatorPairDTO.GetPaginatedResults) {
    const countryOperatorPairs =
      await countryOperatorPairRepository.getPaginatedResults({
        page,
        limit,
        sortBy,
        sortOrder,
      });

    if (countryOperatorPairs.length === 0) {
      throw ApiError.notFound('Country Operator Pairs not found');
    }

    return {
      message: 'Country Operator Pairs retrieved successfully',
      data: {
        countryOperatorPairs: countryOperatorPairs.map(
          (countryOperatorPair) => ({
            ...countryOperatorPair,
            id: countryOperatorPair.id,
            _id: undefined,
            createdBy: {
              ...countryOperatorPair.createdBy,
              id: cipherService.encodeId(countryOperatorPair.createdBy.id),
            },
            updatedBy: countryOperatorPair.updatedBy
              ? {
                  ...countryOperatorPair.updatedBy,
                  id: cipherService.encodeId(countryOperatorPair.updatedBy.id),
                }
              : null,
          }),
        ),
      },
    };
  }
}

const countryOperatorPairService = new CountryOperatorPairService();
export default countryOperatorPairService;
