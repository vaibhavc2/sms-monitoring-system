import ct from '#/common/constants';
import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
  openapi: '3.0.0',
  info: {
    title: `${ct.appName} - REST API Documentation`,
    version: ct.appVersion,
    description: ct.appDescription,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [
        'read:current_user', // this enables the user to read their own data
        'write:current_user', // this enables the user to write their own data
        'read:admin', // this enables the admin to read all data
        'write:admin', // this enables the admin to write all data
      ],
    },
  ],
  servers: [
    {
      url: `${ct.base_url}/api/v1`,
      description: 'Api Version 1 - V1',
    },
    {
      url: `${ct.base_url}/api/v2`,
      description: 'Api Version 2 - V2',
    },
  ],
};
