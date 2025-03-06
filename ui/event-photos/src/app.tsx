import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/pages/App';
import { ViewportContextProvider } from './ui/context/ViewportContext';
import SuperTokens from 'supertokens-auth-react';
import EmailPassword from 'supertokens-auth-react/recipe/emailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import { ThemeProvider, Typography } from '@mui/material';
import { theme } from './theme';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AuthorProvider } from './ui/context/AuthorContext';

declare global {
    interface Window {
        Environment: any;
    }
}

SuperTokens.init({
    appInfo: {
        // learn more about this on https://supertokens.com/docs/references/app-info
        appName: 'event-photos',
        apiDomain: window.location.origin,
        websiteDomain: window.location.origin,
        apiBasePath: '/api/event-photos',
        websiteBasePath: '/events'
    },
    recipeList: [EmailPassword.init(), Session.init()]
});

export function Main(props: any) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
                <ViewportContextProvider>
                    <App {...props} />
                </ViewportContextProvider>
            </ThemeProvider>
        </LocalizationProvider>
    );
}

const root = createRoot(document.getElementsByTagName('body')[0]!);
root.render(<Main />);
