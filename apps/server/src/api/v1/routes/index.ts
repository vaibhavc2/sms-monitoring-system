import healthRouter from '#/api/v1/routes/health.routes';
import userRouter from '#/api/v1/routes/user.routes';
import programRouter from '#/api/v1/routes/program.routes';
import programSessionRouter from '#/api/v1/routes/program-session.routes';
import express from 'express';

// Create a new router instance
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRouter);

apiV1Router.use('/users', userRouter);

apiV1Router.use('/programs', programRouter);

apiV1Router.use('/program-sessions', programSessionRouter);

// Export the router
export default apiV1Router;
