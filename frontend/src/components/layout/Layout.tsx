import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../header/Header.tsx";
import '../../App.css';
import { ToastContainer } from 'react-toastify';

const Layout: React.FC = () => {
    return (
        <div className="app">
            <Header />

            <main>
                <Outlet />
            </main>

            <ToastContainer
                position="top-right"
                autoClose={4000}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
            />
        </div>
    );
};

export default Layout;
