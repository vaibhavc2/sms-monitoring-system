import { mongoModels } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { ProgramDTO } from '../../entities/dtos/program.dto';
import { v4 as uuidv4 } from 'uuid';
import cipherService from '../helper/cipher.service';

interface ProgramServiceDTO {}

class ProgramService implements ProgramServiceDTO {
  constructor() {}

  async upload({ name, description, fileName, userId }: ProgramDTO.Upload) {
    // check if the name is already in use
    const programExists = await mongoModels.Program.findOne({ name });

    if (programExists) throw new ApiError(400, 'Program name already in use');

    // save the details to the database
    const program = await mongoModels.Program.create({
      name,
      description,
      fileName,
      createdBy: userId,
    });

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
    const program = await mongoModels.Program.findById(programId);
    if (!program) throw new ApiError(404, 'Program not found!');

    // basic validation
    if (!name && !description) throw new ApiError(400, 'No details to update!');

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

  async delete() {}

  async get() {}

  async run() {}

  async stop() {}

  async restart() {}

  async getAll() {}
}

const programService = new ProgramService();
export default programService;
