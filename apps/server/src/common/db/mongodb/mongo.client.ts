import mongoose from 'mongoose';
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

const { MONGO_URI } = envConfig;

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

  public connect() {
    if (this.securityCheck()) return mongoose.connection;

    const connectionInstance = mongoose.createConnection(MONGO_URI);

    connectionInstance.on('error', (err) => {
      logger.error(
        printErrorMessage(
          err,
          '[MONGODB] :: Connection FAILED :: at connectDB() :: Database',
        ),
      );
    });

    connectionInstance.on('disconnected', () => {
      logger.info('[MONGODB] :: Connection DISCONNECTED :: at connectDB()');
    });

    connectionInstance.once('open', () => {
      logger.info(
        `[MONGODB] :: Database connected successfully!! DB HOST: ${connectionInstance.host}`,
      );
    });

    return connectionInstance;
  }

  public async connectAsync() {
    if (this.securityCheck()) return mongoose.connection;
    else {
      return new Promise((resolve, reject) => {
        mongoose
          .connect(MONGO_URI)
          .then((connectionInstance) => {
            logger.info(
              `[MONGODB] :: Database connected successfully!! DB HOST: ${connectionInstance.connection.host}`,
            );
            resolve(connectionInstance.connection);
          })
          .catch((error) => {
            printErrorMessage(
              error,
              '[MONGODB] :: Connection FAILED :: at connectDB() :: Database',
            );
            reject(error);
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

export default mongoClient;
