import healthRouter from '#/api/v1/routes/health.routes';
import userRouter from '#/api/v1/routes/user.routes';
import programRouter from '#/api/v1/routes/program.routes';
import programSessionRouter from '#/api/v1/routes/program-session.routes';
import countryRouter from '#/api/v1/routes/country.routes';
import operatorRouter from '#/api/v1/routes/operator.routes';
import countryOperatorPairRouter from '#/api/v1/routes/country-operator-pairs.routes';
import adminRouter from '#/api/v1/routes/admin.routes';
import express from 'express';

// Create a new router instance
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRouter);

apiV1Router.use('/users', userRouter);

apiV1Router.use('/programs', programRouter);

apiV1Router.use('/program-sessions', programSessionRouter);

apiV1Router.use('/countries', countryRouter);

apiV1Router.use('/operators', operatorRouter);

apiV1Router.use('/country-operator-pairs', countryOperatorPairRouter);

apiV1Router.use('/admin', adminRouter);

// Export the router
export default apiV1Router;
