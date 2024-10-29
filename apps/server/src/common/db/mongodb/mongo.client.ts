import mongoose, { Connection, Mongoose } from 'mongoose';
import { printErrorMessage } from '../../utils/error-extras.util';
import envConfig from '../../config/env.config';
import { logger } from '../../utils/logger.util';
import { IProgram, Program } from './models/program.model';
import {
  IProgramSession,
  ProgramSession,
} from './models/program-session.model';
import { IPriorityPair, PriorityPair } from './models/priority-pair.model';
import {
  ICountryOperatorPair,
  CountryOperatorPair,
} from './models/country-operator-pair.model';

const { MONGO_URI, MONGO_DB_NAME } = envConfig;

export type { IProgram, IProgramSession, ICountryOperatorPair, IPriorityPair };

type Models = {
  Program: typeof Program;
  ProgramSession: typeof ProgramSession;
  PriorityPair: typeof PriorityPair;
  CountryOperatorPair: typeof CountryOperatorPair;
};

class MongoClient {
  public models: Models;

  constructor() {
    this.models = {
      Program,
      ProgramSession,
      PriorityPair,
      CountryOperatorPair,
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
