import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import mongoose from 'mongoose';
import { OperatorDTO } from '../../entities/dtos/operator.dto';

class OperatorService {
  async create({ name }: OperatorDTO.Create) {
    // check if the operator already exists
    const operatorExists = await mongo.Operator.findOne({ name });

    if (operatorExists) {
      throw ApiError.badRequest('Operator already exists');
    }

    // save the operator to the database
    const operator = await mongo.Operator.create({ name });

    if (!operator) {
      throw ApiError.internal('Error creating operator');
    }

    return {
      message: 'Operator created successfully',
      data: {
        operator,
      },
    };
  }

  async update({ id, name }: OperatorDTO.Update) {
    // check if the operator exists
    const operator = await mongo.Operator.findOne({ name });

    if (operator) throw ApiError.badRequest('Operator already exists!');

    // find and update the operator
    const updatedOperator = await mongo.Operator.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { name },
      { new: true },
    );

    if (!updatedOperator) {
      throw ApiError.internal('Error updating operator!');
    }

    return {
      message: 'Operator updated successfully',
      data: {
        operator: updatedOperator,
      },
    };
  }

  async delete({ id }: OperatorDTO.Delete) {
    // delete the operator
    const deletedOperator = await mongo.Operator.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!deletedOperator) {
      throw ApiError.internal('Error deleting operator!');
    }

    return {
      message: 'Operator deleted successfully',
      data: {
        operator: deletedOperator,
      },
    };
  }

  async get({ id }: OperatorDTO.Get) {
    // find the operator
    const operator = await mongo.Operator.findById({ _id: id });

    if (!operator) {
      throw ApiError.notFound('Operator not found!');
    }

    return {
      message: 'Operator retrieved successfully',
      data: {
        operator,
      },
    };
  }

  async getAll() {
    // get all operators
    const operators = await mongo.Operator.find();

    return {
      message: 'Countries retrieved successfully',
      data: {
        operators,
      },
    };
  }

  async search({ query }: { query: string }) {
    // search for operators
    const operators = await mongo.Operator.find({
      name: { $regex: query, $options: 'i' },
    });

    return {
      message: 'Operators retrieved successfully',
      data: {
        operators,
      },
    };
  }

  async getPaginatedResults({
    page,
    limit,
    sortBy,
    sortOrder,
    query,
  }: OperatorDTO.GetPaginatedResults) {
    // get paginated results
    const options = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      sort: { [sortBy || 'name']: sortOrder === 'desc' ? -1 : 1 },
    };

    const results = await mongo.Operator.aggregatePaginate(
      mongo.Operator.aggregate([
        {
          $match: {
            ...(query && {
              name: { $regex: String(query) || '', $options: 'i' },
            }),
          },
        },
      ]),
      options,
    );

    return {
      message: 'Operators retrieved successfully',
      data: {
        operators: results,
      },
    };
  }
}

const operatorService = new OperatorService();
export default operatorService;
