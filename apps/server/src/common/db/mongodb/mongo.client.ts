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

  public connect() {
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
    return new Promise<typeof mongoose>((resolve, reject) => {
      mongoose
        .connect(MONGO_URI)
        .then((connectionInstance) => {
          logger.info(
            `[MONGODB] :: Database connected successfully!! DB HOST: ${connectionInstance.connection.host}`,
          );
          resolve(connectionInstance);
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

  public async disconnect() {
    logger.info('[MONGODB] :: Closing database connection...');
    await mongoose.connection.close();
  }
}

const mongoClient = new MongoClient();

export default mongoClient;
