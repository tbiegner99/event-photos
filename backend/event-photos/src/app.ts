import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import { router } from './routes';

import bodyParser from 'body-parser';
import { HTTPStatus } from './utils/constants';

import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import { middleware } from 'supertokens-node/framework/express';
import Dashboard from 'supertokens-node/recipe/dashboard';
import UserRoles from 'supertokens-node/recipe/userroles';
import { getUserMetadata } from 'supertokens-node/recipe/usermetadata';

supertokens.init({
  framework: 'express',
  supertokens: {
    // We use try.supertokens for demo purposes.
    // At the end of the tutorial we will show you how to create
    // your own SuperTokens core instance and then update your config.
    connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || '',
    apiKey: process.env.SUPERTOKENS_API_KEY || '',
  },
  appInfo: {
    // learn more about this on https://supertokens.com/docs/session/appinfo
    appName: 'event-photos',
    apiDomain: process.env.DOMAIN || '',
    websiteDomain: process.env.DOMAIN || '',
    apiBasePath: '/api/event-photos',
    websiteBasePath: '/auth',
  },
  recipeList: [
    EmailPassword.init(), // initializes signin / sign up features
    Session.init({
      override: {
        functions: (originalImplementation) => {
          return {
            ...originalImplementation,
            createNewSession: async function (input) {
              let userId = input.userId;
              const { metadata } = await getUserMetadata(userId);
              console.log(metadata);
              // This goes in the access token, and is available to read on the frontend.
              input.accessTokenPayload = {
                ...input.accessTokenPayload,
                name: `${metadata.first_name} ${metadata.last_name}`,
                firstName: metadata.first_name,
                lastName: metadata.last_name,
              };

              return originalImplementation.createNewSession(input);
            },
          };
        },
      },
    }), // initializes session features
    Dashboard.init(),
    UserRoles.init(),
  ],
});

const app = express();
app.use(
  cors({
    origin: 'http://localhost:40000',
    allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(middleware());

app.use('/api/event-photos', router);

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err, err.message);
  res
    .status(err.status ? err.status : HTTPStatus.SERVER_ERROR)
    .send(err.message || 'Internal Server Error');
};
app.use(errorHandler);
app.listen(process.env.APP_PORT || 8080, () => {
  console.log('App started on port 8080');
});
