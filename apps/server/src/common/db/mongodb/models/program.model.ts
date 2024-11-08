import mongoose, { Document, AggregatePaginateModel, Schema } from 'mongoose';
import prisma from '../../prisma/prisma.client';
import ct from '#/common/constants';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IProgram extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  description?: string;
  fileName: string; // file name of the program on the server
  serverFileName: string; // file name of the program on the server
  countryOperatorPairs: Array<Schema.Types.ObjectId>; // References country_operator_pairs._id
  activeSessions: Array<Schema.Types.ObjectId>; // References program_sessions._id
  createdBy: number; // Changed to number to match Prisma User.id
  updatedBy?: number; // Changed to number to match Prisma User.id
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramModel extends AggregatePaginateModel<IProgram> {}

const ProgramSchema: Schema<IProgram> = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    serverFileName: {
      type: String,
      required: true,
      trim: true,
    },
    countryOperatorPairs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CountryOperatorPair',
      },
    ],
    activeSessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ProgramSession',
      },
    ],
    createdBy: {
      type: Number, // Changed to Number type to store Prisma User.id
      required: true,
    },
    updatedBy: {
      type: Number, // Changed to Number type to store Prisma User.id
    },
  },
  ct.mongo.baseOptions(),
);

// Add a middleware to validate that the user exists in Prisma before saving
ProgramSchema.pre('save', async function (next) {
  try {
    // You'll need to import and use your Prisma client here
    // const prisma = global.prisma; // Assuming you have prisma client available globally

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

ProgramSchema.plugin(mongooseAggregatePaginate);

export const Program: IProgramModel = mongoose.model<IProgram, IProgramModel>(
  'Program',
  ProgramSchema,
);
