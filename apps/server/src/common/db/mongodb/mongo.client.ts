import mongoose, { Connection, Mongoose } from 'mongoose';
import { printErrorMessage } from '../../utils/error-extras.util';
import envConfig from '../../config/env.config';
import { logger } from '../../utils/logger.util';
import { IProgram, Program } from './models/program.model';
import {
  IProgramSession,
  ProgramSession,
} from './models/program-session.model';
import {
  ICountryOperatorPair,
  CountryOperatorPair,
} from './models/country-operator-pair.model';
import { Country, ICountry } from './models/country.model';
import { Operator, IOperator } from './models/operator.model';
import { SMSMetrics, ISMSMetrics } from './models/sms-metrics.model';

const { MONGO_URI, MONGO_DB_NAME } = envConfig;

export type {
  IProgram,
  IProgramSession,
  ICountryOperatorPair,
  ICountry,
  IOperator,
  ISMSMetrics,
};

type Models = {
  Program: typeof Program;
  ProgramSession: typeof ProgramSession;
  CountryOperatorPair: typeof CountryOperatorPair;
  Country: typeof Country;
  Operator: typeof Operator;
  SMSMetrics: typeof SMSMetrics;
};

class MongoClient {
  public models: Models;

  constructor() {
    this.models = {
      Program,
      ProgramSession,
      CountryOperatorPair,
      Country,
      Operator,
      SMSMetrics,
    };
  }

  private securityCheck() {
    // check if the connection is already open
    if (mongoose.connection.readyState === 1) {
      logger.warn(
        '[MONGODB] :: Connection already open :: at connectDB() :: Database',
      );

      return true;
    }

    return false;
  }

  async connect() {
    if (this.securityCheck()) return mongoose.connection;
    else {
      return new Promise((resolve, reject) => {
        mongoose
          .connect(MONGO_URI, {
            dbName: MONGO_DB_NAME,
          })
          .then((conn) => {
            logger.info(
              `[MONGODB] :: Connected to ${conn.connection.name} database at ${conn.connection.host}`,
            );
            resolve(conn.connection);
          })
          .catch((error) => {
            printErrorMessage(error, '[MONGODB] :: Connection FAILED');
          });
      });
    }
  }

  public async ping() {
    try {
      await mongoose.connection.db?.admin().ping();
      logger.info('[MONGODB] :: Ping successful');
    } catch (error) {
      logger.error(
        printErrorMessage(
          error,
          '[MONGODB] :: Ping FAILED :: at ping() :: Database',
        ),
      );
    }
  }

  public async disconnect() {
    logger.info('[MONGODB] :: Closing database connection...');
    await mongoose.connection.close();
  }
}

const mongoClient = new MongoClient();
export const mongo = mongoClient.models;

export default mongoClient;
