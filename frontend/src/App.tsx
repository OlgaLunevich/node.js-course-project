import './App.css';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from "./app-routes/AppRoutes.tsx";
import {useWsNotifications} from "./shared/hooks/useWsNotifications.ts";
import { AuthProvider} from "./auth/AuthContext.tsx";

const App: React.FC = () => {
    useWsNotifications();
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;
