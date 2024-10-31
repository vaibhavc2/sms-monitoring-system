import { mongo } from '#/common/db/mongodb/mongo.client';
import ApiError from '#/common/utils/api-error.util';
import mongoose from 'mongoose';
import { CountryDTO } from '../../entities/dtos/country.dto';

class CountryService {
  async create({ name }: CountryDTO.Create) {
    // check if the country already exists
    const countryExists = await mongo.Country.findOne({ name });

    if (countryExists) {
      throw ApiError.badRequest('Country already exists');
    }

    // save the country to the database
    const country = await mongo.Country.create({ name });

    if (!country) {
      throw ApiError.internal('Error creating country');
    }

    return {
      message: 'Country created successfully',
      data: {
        country,
      },
    };
  }

  async update({ id, name }: CountryDTO.Update) {
    // check if the country exists
    const country = await mongo.Country.findOne({ name });

    if (country) throw ApiError.badRequest('Country already exists!');

    // find and update the country
    const updatedCountry = await mongo.Country.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { name },
      { new: true },
    );

    if (!updatedCountry) {
      throw ApiError.internal('Error updating country!');
    }

    return {
      message: 'Country updated successfully',
      data: {
        country: updatedCountry,
      },
    };
  }

  async delete({ id }: CountryDTO.Delete) {
    // delete the country
    const deletedCountry = await mongo.Country.findByIdAndDelete({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!deletedCountry) {
      throw ApiError.internal('Error deleting country!');
    }

    return {
      message: 'Country deleted successfully',
      data: {
        country: deletedCountry,
      },
    };
  }

  async get({ id }: CountryDTO.Get) {
    // find the country
    const country = await mongo.Country.findById({ _id: id });

    if (!country) {
      throw ApiError.notFound('Country not found!');
    }

    return {
      message: 'Country retrieved successfully',
      data: {
        country,
      },
    };
  }

  async getAll() {
    // get all countries
    const countries = await mongo.Country.find();

    return {
      message: 'Countries retrieved successfully',
      data: {
        countries,
      },
    };
  }

  async search({ query }: { query: string }) {
    // search for countries
    const countries = await mongo.Country.find({
      name: { $regex: query, $options: 'i' },
    });

    return {
      message: 'Countries retrieved successfully',
      data: {
        countries,
      },
    };
  }

  async getPaginatedResults({
    page,
    limit,
    sortBy,
    sortOrder,
    query,
  }: CountryDTO.GetPaginatedResults) {
    // get paginated results
    const options = {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 10,
      sort: { [sortBy || 'name']: sortOrder === 'desc' ? -1 : 1 },
    };

    const results = await mongo.Country.aggregatePaginate(
      mongo.Country.aggregate([
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
      message: 'Countries retrieved successfully',
      data: {
        countries: results,
      },
    };
  }
}

const countryService = new CountryService();
export default countryService;
