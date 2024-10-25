import mongoose, { Document, Model, Schema } from 'mongoose';
import prisma from '../../prisma/prisma.client';

export interface ICountryOperatorPair extends Document {
  _id: string | Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId; // References Program._id
  country: string;
  operator: string;
  active: boolean;
  highPriority: boolean;
  createdBy: number; // Changed to number to match Prisma User.id
  updatedBy?: number; // Changed to number to match Prisma User.id
  createdAt: Date;
  updatedAt: Date;
}

export interface ICountryOperatorPairModel
  extends Model<ICountryOperatorPair> {}

const CountryOperatorPairSchema: Schema<ICountryOperatorPair> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    operator: {
      type: String,
      required: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: false,
    },
    highPriority: {
      type: Boolean,
      default: false,
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
CountryOperatorPairSchema.pre('save', async function (next) {
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

export const CountryOperatorPair: Model<ICountryOperatorPair> =
  mongoose.model<ICountryOperatorPair>(
    'CountryOperatorPair',
    CountryOperatorPairSchema,
  );
