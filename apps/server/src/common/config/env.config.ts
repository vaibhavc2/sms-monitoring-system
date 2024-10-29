import dotenv from 'dotenv';
import * as env from 'env-var';

dotenv.config();

const config = {
  PORT: env.get('PORT').default('3000').asIntPositive(),
  HOST: env.get('HOST').default('localhost').asString(),
  NODE_ENV: env.get('NODE_ENV').default('development').asString(),
  CLIENT_URL: env.get('CLIENT_URL').asString(), //! change in production to frontend url only!
  REDIS_URL: env.get('REDIS_URL').default('redis://localhost:6379').asString(),
  MONGO_URI: env.get('MONGO_URI').required().asString(),
  MONGO_DB_NAME: env.get('MONGO_DB_NAME').required().asString(),
  RESEND_API_KEY: env.get('RESEND_API_KEY').required().asString(),
  EMAIL_FROM: env.get('EMAIL_FROM').required().asString(),
  ACCESS_TOKEN_SECRET: env.get('ACCESS_TOKEN_SECRET').required().asString(),
  ACCESS_TOKEN_EXPIRY: env.get('ACCESS_TOKEN_EXPIRY').default('10m').asString(),
  REFRESH_TOKEN_SECRET: env.get('REFRESH_TOKEN_SECRET').required().asString(),
  REFRESH_TOKEN_EXPIRY: env
    .get('REFRESH_TOKEN_EXPIRY')
    .default('7d')
    .asString(),
  ACTIVATION_TOKEN_SECRET: env
    .get('ACTIVATION_TOKEN_SECRET')
    .required()
    .asString(),
  ACTIVATION_TOKEN_EXPIRY: env
    .get('ACTIVATION_TOKEN_EXPIRY')
    .default('10m') // 10 minutes by default
    .asString(),
  CIPHER_OFFSET: env.get('CIPHER_OFFSET').default(99999).asIntPositive(),
};

const extraConfig = {
  isDev: config.NODE_ENV === 'development',
  isProd: config.NODE_ENV === 'production',
};

const envConfig = { ...config, ...extraConfig };
export default envConfig;
