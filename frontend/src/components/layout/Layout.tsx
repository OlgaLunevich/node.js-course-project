import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../header/Header.tsx";
import '../../App.css';


const Layout: React.FC = () => {
    return (
        <div className="app">
            <Header />

            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
