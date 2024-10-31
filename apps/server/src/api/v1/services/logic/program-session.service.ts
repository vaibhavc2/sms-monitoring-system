import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { ProgramSessionDTO } from '../../entities/dtos/program-session.dto';
import cipherService from '../helper/cipher.service';

class ProgramSessionService {
  async create({
    programId,
    countryOperatorPairId,
    sessionName,
    userId,
  }: ProgramSessionDTO.Create & { userId: number }) {
    // check if the program exists
    const programExists = await mongo.Program.findOne({
      id: programId,
    });

    if (!programExists) {
      throw ApiError.badRequest('Program not found!');
    }

    // check if the countryOperatorPair exists
    const countryOperatorPairExists = await mongo.CountryOperatorPair.findOne({
      id: countryOperatorPairId,
    });

    if (!countryOperatorPairExists) {
      throw ApiError.badRequest('Country Operator Pair not found!');
    }

    // save the details to the database
    const programSession = await mongo.ProgramSession.create({
      programId,
      sessionName,
      countryOperatorPairId,
      createdBy: userId,
    });

    if (!programSession) {
      throw ApiError.internal('Error creating program session!');
    }

    return {
      message: 'Program session created successfully',
      data: {
        programSession: {
          ...programSession.toJSON(),
          createdBy: cipherService.encodeId(programSession.createdBy),
        },
      },
    };
  }
}

const programSessionService = new ProgramSessionService();
export default programSessionService;
