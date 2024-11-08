import mongoose, { AggregatePaginateModel, Document, Schema } from 'mongoose';
import prisma from '../../prisma/prisma.client';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import ct from '#/common/constants';

export interface ICountryOperatorPair extends Document {
  _id: Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId;
  countryId: Schema.Types.ObjectId;
  operatorId: Schema.Types.ObjectId;
  disabled: boolean;
  disabledBy?: number;
  highPriority: boolean;
  createdBy: number;
  updatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICountryOperatorPairModel
  extends AggregatePaginateModel<ICountryOperatorPair> {}

const CountryOperatorPairSchema: Schema<ICountryOperatorPair> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    countryId: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: true,
    },
    operatorId: {
      type: Schema.Types.ObjectId,
      ref: 'Operator',
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    highPriority: {
      type: Boolean,
      default: false,
    },
    disabledBy: {
      type: Number,
    },
    createdBy: {
      type: Number,
      required: true,
    },
    updatedBy: {
      type: Number,
    },
  },
  ct.mongo.baseOptions(),
);

// Add a middleware to validate that the user exists in Prisma before saving
CountryOperatorPairSchema.pre('save', async function (next) {
  try {
    // Check if createdBy user exists
    const createdByUser = await prisma.user.findUnique({
      where: { id: this.createdBy },
    });

    if (!createdByUser) {
      throw new Error('CreatedBy user not found in Prisma database');
    }

    // Check if updatedBy user exists (if provided)
    if (this.updatedBy) {
      const updatedByUser = await prisma.user.findUnique({
        where: { id: this.updatedBy },
      });

      if (!updatedByUser) {
        throw new Error('UpdatedBy user not found in Prisma database');
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

CountryOperatorPairSchema.plugin(mongooseAggregatePaginate);

export const CountryOperatorPair: ICountryOperatorPairModel = mongoose.model<
  ICountryOperatorPair,
  ICountryOperatorPairModel
>('CountryOperatorPair', CountryOperatorPairSchema);
