import envConfig from '#/common/config/env.config';
import { Request, Response } from 'express';
import { version, description } from '../../package.json';
import { CorsOptions } from 'cors';
import { capitalizeTrimName } from './utils/capitalize-trim-name.util';
import path from 'path';
// import chalk from 'chalk';

const { isDev, HOST, PORT, CLIENT_URL } = envConfig;

const corsMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

type SameSiteOptions = 'strict' | 'lax' | 'none';

const appName = 'SMS Monitoring System';

const ct = {
  appName,
  expressLimit: '50mb',
  corsMethods,
  corsOptions: {
    origin: [CLIENT_URL],
    credentials: true,
    methods: corsMethods,
  } as CorsOptions,
  redisKeyPrefix: String(capitalizeTrimName(appName) + '::'),
  appVersion: version,
  appDescription: description,
  base_url: `${isDev ? 'http' : 'https'}://${HOST}${isDev ? ':' + PORT : ''}`,
  emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  morganOptions: {
    skip: (req: Request, res: Response) => res.statusCode === 304, // skip logging for 304 responses (Not Modified): swagger-ui
  },
  rateLimiter: {
    global: {
      requests: 100, // 100 requests
      duration: 1 * 60, // per 1 minute(s)
    },
    sensitive: {
      requests: 5, // 5 requests
      duration: 1 * 60, // per 1 minute(s)
    },
  },
  cookieOptions: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as SameSiteOptions,
  },
  checkup: {
    http: {
      url: 'https://google.com',
    },
    disk: {
      warningThreshold: 75, // 75% disk space warning
      criticalThreshold: 90, // 90% disk space critical
    },
    memory: {
      warningThreshold: 75, // 75% memory warning
      criticalThreshold: 90, // 90% memory critical
    },
  },
  files: {
    rootPath: path.join(__dirname, '../../'), // root path of the project
    uploadPath: 'uploads/scripts', // path to save uploaded files (scripts) using multer
  },
  mongo: {
    baseOptions: {
      timestamps: true,
      toJSON: {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
          delete ret._id;
          delete ret.__v;
          return ret;
        },
      },
      toObject: {
        virtuals: true,
        transform: (_doc: any, ret: any) => {
          delete ret._id;
          delete ret.__v;
          return ret;
        },
      },
    },
  },
  encoding: {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    base: 62,
  },
};

export default ct;
