import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { ProgramSessionDTO } from '../../entities/dtos/program-session.dto';
import programSessionRepository from '../../repositories/program-session.repository';
import userRepository from '../../repositories/user.repository';
import cipherService from '../helper/cipher.service';
import scriptManager from '../helper/script-manager.service';

class ProgramSessionService {
  async create({
    programId,
    countryOperatorPairId,
    name,
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
      name,
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

  async get(sessionId: string) {
    const programSession = await programSessionRepository.getDetails(sessionId);

    if (!programSession) {
      throw ApiError.notFound('Program session not found!');
    }

    return {
      message: 'Program session details fetched successfully',
      data: {
        programSession,
      },
    };
  }

  async run({ sessionId, userId }: ProgramSessionDTO.Common) {
    // fetch the program session details
    const programSession = await programSessionRepository.getDetails(sessionId);

    if (!programSession) {
      throw ApiError.notFound('Program session not found!');
    }

    // check if the program session is already running
    if (programSession.status === 'running') {
      throw ApiError.badRequest('Program session is already running!');
    }

    // run the program session using script manager service
    scriptManager.run({
      sessionId,
      country: String(programSession.countryOperatorPair.country.name),
      operator: String(programSession.countryOperatorPair.operator.name),
      scriptName: String(programSession.program.serverFileName),
    });

    // update the program session status to running
    const updateSession = await mongo.ProgramSession.updateOne(
      { id: sessionId },
      { status: 'running', lastAction: 'started', updatedBy: userId },
    );

    if (!updateSession) {
      scriptManager.stop(sessionId);
      throw ApiError.internal('Error updating program session status!');
    }

    programSession.status = 'running';
    programSession.updatedBy = await userRepository.getUserById(userId);

    return {
      message: 'Program session started successfully',
      data: {
        programSession,
      },
    };
  }

  async stop({ sessionId, userId }: ProgramSessionDTO.Common) {
    // fetch the program session details
    const programSession = await programSessionRepository.getDetails(sessionId);

    if (!programSession) {
      throw ApiError.notFound('Program session not found!');
    }

    // check if the program session is already stopped
    if (programSession.status === 'stopped') {
      throw ApiError.badRequest('Program session is already stopped!');
    }

    // stop the program session using script manager service
    scriptManager.stop(sessionId);

    // update the program session status to stopped
    const updateSession = await mongo.ProgramSession.updateOne(
      { id: sessionId },
      { status: 'stopped', lastAction: 'stopped', updatedBy: userId },
    );

    if (!updateSession) {
      throw ApiError.internal('Error updating program session status!');
    }

    programSession.status = 'stopped';
    programSession.updatedBy = await userRepository.getUserById(userId);

    return {
      message: 'Program session stopped successfully',
      data: {
        programSession,
      },
    };
  }

  async restart({ sessionId, userId }: ProgramSessionDTO.Common) {
    // fetch the program session details
    const programSession = await programSessionRepository.getDetails(sessionId);

    if (!programSession) {
      throw ApiError.notFound('Program session not found!');
    }

    // check if the program session is stopped
    if (programSession.status !== 'running') {
      throw ApiError.badRequest(
        'Program session is not running! Cannot restart!',
      );
    }

    // restart the program session using script manager service
    scriptManager.restart({
      sessionId,
      country: String(programSession.countryOperatorPair.country.name),
      operator: String(programSession.countryOperatorPair.operator.name),
      scriptName: String(programSession.program.serverFileName),
    });

    // update the program session status to running
    const updateSession = await mongo.ProgramSession.updateOne(
      { id: sessionId },
      { status: 'running', lastAction: 'restarted', updatedBy: userId },
    );

    if (!updateSession) {
      scriptManager.stop(sessionId);
      throw ApiError.internal('Error updating program session status!');
    }

    programSession.status = 'running';
    programSession.updatedBy = await userRepository.getUserById(userId);

    return {
      message: 'Program session restarted successfully',
      data: {
        programSession,
      },
    };
  }

  async getPaginatedProgramSessions({
    page,
    limit,
    sortBy,
    sortOrder,
    query,
    filter,
  }: ProgramSessionDTO.PaginatedExtended) {
    const programSessions =
      await programSessionRepository.getPaginatedProgramSessions({
        page,
        limit,
        sortBy,
        sortOrder,
        query,
        filter,
      });

    if (!programSessions) {
      throw ApiError.notFound('No program sessions found!');
    }

    return {
      message: 'Program sessions fetched successfully',
      data: {
        programSessions,
      },
    };
  }

  async delete(sessionId: string) {
    const programSession = await mongo.ProgramSession.findById(sessionId);

    if (!programSession) {
      throw ApiError.notFound('Program session not found!');
    }

    // kill the program session using script manager service
    await scriptManager.kill(sessionId);

    // delete the program session
    const deleteSession = await mongo.ProgramSession.deleteOne({
      id: sessionId,
    });

    if (!deleteSession) {
      throw ApiError.internal('Error deleting program session!');
    }

    return {
      message: 'Program session deleted successfully',
    };
  }
}

const programSessionService = new ProgramSessionService();
export default programSessionService;
