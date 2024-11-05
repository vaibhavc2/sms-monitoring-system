import mongoose, { Document, AggregatePaginateModel, Schema } from 'mongoose';
import prisma from '../../prisma/prisma.client';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';
import ct from '#/common/constants';

export interface IProgramSession extends Document {
  _id: string | Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId; // References Program._id
  countryOperatorPairId: Schema.Types.ObjectId; // References country_operator_pairs._id
  name: string;
  status: 'running' | 'stopped';
  startTime: Date;
  endTime?: Date;
  lastAction: 'started' | 'stopped' | 'restarted';
  createdBy: number; // Changed to number to match Prisma User.id
  updatedBy?: number; // Changed to number to match Prisma User.id
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramSessionModel
  extends AggregatePaginateModel<IProgramSession> {}

const ProgramSessionSchema: Schema<IProgramSession> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    countryOperatorPairId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CountryOperatorPair',
      },
    ],
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['running', 'stopped'],
      default: 'stopped',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    lastAction: {
      type: String,
      enum: ['started', 'stopped', 'restarted'],
      default: 'stopped',
    },
    createdBy: {
      type: Number, // Changed to Number type to store Prisma User.id
      required: true,
    },
    updatedBy: {
      type: Number, // Changed to Number type to store Prisma User.id
    },
  },
  ct.mongo.baseOptions,
);

// Add a middleware to validate that the user exists in Prisma before saving
ProgramSessionSchema.pre('save', async function (next) {
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

ProgramSessionSchema.plugin(mongooseAggregatePaginate);

export const ProgramSession: IProgramSessionModel = mongoose.model<
  IProgramSession,
  IProgramSessionModel
>('ProgramSession', ProgramSessionSchema);
