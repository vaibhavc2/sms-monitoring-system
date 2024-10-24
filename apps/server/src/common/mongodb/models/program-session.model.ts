import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProgramSession extends Document {
  _id: string | Schema.Types.ObjectId;
  programId: Schema.Types.ObjectId; // References Program._id
  countryOperatorPairs: Array<Schema.Types.ObjectId>; // References country_operator_pairs._id
  sessionName: string;
  status: 'running' | 'stopped' | 'restarted';
  startTime: Date;
  endTime?: Date;
  lastAction: 'started' | 'stopped' | 'restarted';
  createdBy: Schema.Types.ObjectId; // References users._id
  updatedBy?: Schema.Types.ObjectId; // References users._id
  createdAt: Date;
  updatedAt: Date;
}

export interface IProgramSessionModel extends Model<IProgramSession> {}

const ProgramSessionSchema: Schema<IProgramSession> = new Schema(
  {
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program', // References the Program model
      required: true,
    },
    countryOperatorPairs: [
      {
        type: Schema.Types.ObjectId,
        ref: 'CountryOperatorPair', // References the CountryOperatorPair model
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

export const ProgramSession: Model<IProgramSession> =
  mongoose.model<IProgramSession>('ProgramSession', ProgramSessionSchema);
