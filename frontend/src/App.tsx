import './App.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from "./app-routes/AppRoutes.tsx";
import {useWsNotifications} from "./shared/hooks/useWsNotifications.ts";

const App: React.FC = () => {
    useWsNotifications();
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
};

export default App;