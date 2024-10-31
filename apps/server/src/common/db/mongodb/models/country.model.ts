import ct from '#/common/constants';
import mongoose, { AggregatePaginateModel, Document, Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface ICountry extends Document {
  _id: string | Schema.Types.ObjectId;
  name: Schema.Types.ObjectId;
  createdAt: Date;
}

export interface ICountryModel extends AggregatePaginateModel<ICountry> {}

const CountrySchema: Schema<ICountry> = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
  ct.mongo.baseOptions,
);

CountrySchema.plugin(mongooseAggregatePaginate);

export const Country: ICountryModel = mongoose.model<ICountry, ICountryModel>(
  'Country',
  CountrySchema,
);
