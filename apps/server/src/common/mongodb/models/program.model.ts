import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProgram extends Document {
  _id: string | Schema.Types.ObjectId;
  name: string;
  description?: string;
  countryOperatorPairs: Array<Schema.Types.ObjectId>; // References country_operator_pairs._id
  activeSessions: Array<Schema.Types.ObjectId>; // References program_sessions._id
  createdBy: Schema.Types.ObjectId; // References users._id
  updatedBy?: Schema.Types.ObjectId; // References users._id
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramModel extends Model<IProgram> {}

const ProgramSchema: Schema<IProgram> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    countryOperatorPairs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CountryOperatorPair', // References the CountryOperatorPair model
      },
    ],
    activeSessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ProgramSession', // References the ProgramSession model
      },
    ],
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

export const Program: Model<IProgram> = mongoose.model<IProgram>(
  'Program',
  ProgramSchema,
);
