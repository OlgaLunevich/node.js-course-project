import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    return (
        <header className="header">
            <h1 className="header__title">
                <Link to="/">Articles</Link>
            </h1>

            <nav className="header__nav">
                <Link className="btn" to="/articles">
                    List
                </Link>
                <Link className="btn" to="/articles/new">
                    New Article
                </Link>
            </nav>
        </header>
    );
};

export default Header;



