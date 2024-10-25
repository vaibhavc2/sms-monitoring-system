import mongoose, { Document, Model, Schema } from 'mongoose';
import prisma from '../../prisma/prisma.client';

export interface IProgramSession extends Document {
  _id: string | Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId; // References Program._id
  countryOperatorPairs: Array<Schema.Types.ObjectId>; // References country_operator_pairs._id
  sessionName: string;
  status: 'running' | 'stopped' | 'restarted';
  startTime: Date;
  endTime?: Date;
  lastAction: 'started' | 'stopped' | 'restarted';
  createdBy: number; // Changed to number to match Prisma User.id
  updatedBy?: number; // Changed to number to match Prisma User.id
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramSessionModel extends Model<IProgramSession> {}

const ProgramSessionSchema: Schema<IProgramSession> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    countryOperatorPairs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CountryOperatorPair',
      },
    ],
    sessionName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'restarted'],
      default: 'running',
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: false,
    },
    lastAction: {
      type: String,
      enum: ['started', 'stopped', 'restarted'],
      default: 'started',
    },
    createdBy: {
      type: Number, // Changed to Number type to store Prisma User.id
      required: true,
    },
    updatedBy: {
      type: Number, // Changed to Number type to store Prisma User.id
    },
  },
  {
    timestamps: true,
  },
);

// Add a middleware to validate that the user exists in Prisma before saving
ProgramSessionSchema.pre('save', async function (next) {
  try {
    // Check if createdBy user exists
    const createdByUser = await prisma.user.findUnique({
      where: { id: this.createdBy },
    });

    if (!createdByUser) {
      throw new Error('Created by user not found in Prisma database');
    }

    // Check if updatedBy user exists (if provided)
    if (this.updatedBy) {
      const updatedByUser = await prisma.user.findUnique({
        where: { id: this.updatedBy },
      });

      if (!updatedByUser) {
        throw new Error('Updated by user not found in Prisma database');
      }
    }

    next();
  } catch (error: any) {
    next(error);
  }
});

export const ProgramSession: Model<IProgramSession> =
  mongoose.model<IProgramSession>('ProgramSession', ProgramSessionSchema);
