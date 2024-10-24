import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICountryOperatorPair extends Document {
  _id: string | Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId; // References Program._id
  country: string;
  operator: string;
  active: boolean;
  highPriority: boolean;
  createdBy: Schema.Types.ObjectId; // References users._id
  updatedBy?: Schema.Types.ObjectId; // References users._id
  createdAt: Date;
  updatedAt: Date;
}

export interface ICountryOperatorPairModel
  extends Model<ICountryOperatorPair> {}

const CountryOperatorPairSchema: Schema<ICountryOperatorPair> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program', // References the Program model
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
      type: Schema.Types.ObjectId,
      ref: 'User', // References the User model
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // References the User model
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  },
);

export const CountryOperatorPair: Model<ICountryOperatorPair> =
  mongoose.model<ICountryOperatorPair>(
    'CountryOperatorPair',
    CountryOperatorPairSchema,
  );
