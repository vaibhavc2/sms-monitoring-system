import ct from '#/common/constants';
import mongoose, { AggregatePaginateModel, Document, Schema } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IOperator extends Document {
  _id: string | Schema.Types.ObjectId;
  name: Schema.Types.ObjectId;
  createdAt: Date;
}

export interface IOperatorModel extends AggregatePaginateModel<IOperator> {}

const OperatorSchema: Schema<IOperator> = new Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
  },
  ct.mongo.baseOptions,
);

OperatorSchema.plugin(mongooseAggregatePaginate);

export const Operator: IOperatorModel = mongoose.model<
  IOperator,
  IOperatorModel
>('Operator', OperatorSchema);
