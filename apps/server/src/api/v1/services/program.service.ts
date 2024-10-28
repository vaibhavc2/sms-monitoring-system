import { mongoModels } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import { ProgramDTO } from '../entities/dtos/program.dto';
import { v4 as uuidv4 } from 'uuid';

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
          createdBy: uuidv4(),
        },
      },
    };
  }

  async update() {}

  async delete() {}

  async get() {}

  async run() {}

  async stop() {}

  async restart() {}

  async getAll() {}
}

const programService = new ProgramService();
export default programService;
