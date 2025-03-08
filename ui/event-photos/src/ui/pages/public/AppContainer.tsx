import React from 'react';
import { EventPageController } from './event/EventPageController';
import './app.module.css';
import { Outlet } from 'react-router-dom';
function AppContainer() {
    return <Outlet />;
}

export default AppContainer;
