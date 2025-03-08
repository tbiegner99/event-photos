import React from 'react';
import * as router from 'react-router-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppContainer from './public/AppContainer';
import { urls } from '../../utils/constants/urls';
import {
    AuthRecipeComponentsOverrideContextProvider,
    getSuperTokensRoutesForReactRouterDom
} from 'supertokens-auth-react/ui';
import { EmailPasswordPreBuiltUI } from 'supertokens-auth-react/recipe/emailpassword/prebuiltui';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';
import { SuperTokensWrapper } from 'supertokens-auth-react';
import { FlexColumn } from '../components/containers/Flex';
import { AdminAppContainer } from './admin/AdminAppContainer';
import { EventsPageController } from './admin/events/EventsPageController';
import { H1 } from '../components/typography/Typography';
import { AuthorProvider } from '../context/AuthorContext';
import { Typography } from '@mui/material';
import { EventPageController } from './public/event/EventPageController';
import { AdminEventPageController } from './admin/events/editEvent/AdminEventPageController';
import { EventQRPageController } from './public/event/EventQRPageController';

function App() {
    return (
        <SuperTokensWrapper>
            <AuthorProvider>
                <Typography component={'span'} variant="body1">
                    <AuthRecipeComponentsOverrideContextProvider
                        components={{
                            AuthPageHeader_Override: () => <div />,
                            AuthPageComponentList_Override: ({ DefaultComponent, ...props }) => {
                                return (
                                    <FlexColumn>
                                        <H1>Admin Login</H1>
                                        <DefaultComponent
                                            {...props}
                                            isSignUp={false}
                                            hasSeparateSignUpView={false}
                                        />
                                    </FlexColumn>
                                );
                            }
                        }}
                    >
                        <BrowserRouter>
                            <Routes>
                                {getSuperTokensRoutesForReactRouterDom(router, [
                                    EmailPasswordPreBuiltUI
                                ])}
                                <Route
                                    path={urls.ADMIN}
                                    element={
                                        <SessionAuth>
                                            <AdminAppContainer />
                                        </SessionAuth>
                                    }
                                >
                                    <Route
                                        path="event/:eventId"
                                        element={<AdminEventPageController />}
                                    />

                                    <Route path="" element={<EventsPageController />} />
                                </Route>
                                <Route path={urls.EVENTS} element={<AppContainer />}>
                                    <Route path="qr" element={<EventQRPageController />} />

                                    <Route path="" element={<EventPageController />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </AuthRecipeComponentsOverrideContextProvider>
                </Typography>
            </AuthorProvider>
        </SuperTokensWrapper>
    );
}

export default App;
