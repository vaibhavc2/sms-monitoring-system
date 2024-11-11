import ct from '#/common/constants';
import mongoose, { AggregatePaginateModel, Document, Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface ISMSMetrics extends Document {
  _id: Schema.Types.ObjectId;
  sessionId: Schema.Types.ObjectId;
  smsCount: number;
  successCount: number;
  failedCount: number;
  errorsMessages: string[];
  timestamp?: Date;
}

export interface ISMSMetricsModel extends AggregatePaginateModel<ISMSMetrics> {}

const SMSMetricsSchema: Schema<ISMSMetrics> = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ProgramSession',
      required: true,
    },
    smsCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    errorsMessages: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
    },
  },
  ct.mongo.baseOptions({ timestamps: false }),
);

SMSMetricsSchema.plugin(mongooseAggregatePaginate);

export const SMSMetrics: ISMSMetricsModel = mongoose.model<
  ISMSMetrics,
  ISMSMetricsModel
>('SMSMetrics', SMSMetricsSchema);
