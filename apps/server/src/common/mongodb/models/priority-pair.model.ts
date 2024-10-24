import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPriorityPair extends Document {
  _id: string | Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId; // References Program._id
  countryOperatorPairId: Schema.Types.ObjectId; // References CountryOperatorPair._id
  highPriority: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPriorityPairModel extends Model<IPriorityPair> {}

const PriorityPairSchema: Schema<IPriorityPair> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program', // References the Program model
      required: true,
    },
    countryOperatorPairId: {
      type: Schema.Types.ObjectId,
      ref: 'CountryOperatorPair', // References the CountryOperatorPair model
      required: true,
    },
    highPriority: {
      type: Boolean,
      default: true, // Always marked as high priority
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

export const PriorityPair: Model<IPriorityPair> = mongoose.model<IPriorityPair>(
  'PriorityPair',
  PriorityPairSchema,
);
