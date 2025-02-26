import React from 'react';
import { Outlet } from 'react-router-dom';
import { connect } from 'react-redux';
import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { FlexColumn, FlexRow } from '../../components/containers/Flex';
import styles from './app.module.css';
import LogoutIcon from '@mui/icons-material/Logout';
import Session from 'supertokens-web-js/recipe/session';
import App from '../App';

function AppContent() {
    return (
        <FlexColumn gap={40}>
            <header>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <FlexRow justifyContent="space-between" alignItems="center" fullWidth>
                            <FlexRow alignItems="center" gap={20}>
                                <IconButton edge="start" color="inherit">
                                    <MenuIcon />
                                </IconButton>
                                <Typography
                                    variant="h6"
                                    noWrap
                                    component="div"
                                    sx={{ flexGrow: 1 }}
                                >
                                    Events
                                </Typography>
                            </FlexRow>
                            <IconButton
                                color="inherit"
                                onClick={async () => {
                                    await Session.signOut();
                                    window.location.reload();
                                }}
                            >
                                <LogoutIcon />
                            </IconButton>
                        </FlexRow>
                    </Toolbar>
                </AppBar>
            </header>
            <main className={styles.adminMain}>
                <Outlet />
            </main>
            <footer></footer>
        </FlexColumn>
    );
}

export function AdminAppContainer() {
    return <AppContent />;
}
