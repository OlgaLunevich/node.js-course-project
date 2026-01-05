import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const workspaceId = params.get('workspaceId');
    const listLink = workspaceId ? `/articles?workspaceId=${workspaceId}` : '/articles';
    const newArticleLink = workspaceId ? `/articles/new?workspaceId=${workspaceId}` : '/articles/new';

    return (
        <header className="header">
            <h1 className="header__title">
                <Link to="/">Articles</Link>
            </h1>

            <nav className="header__nav">
                <Link className="btn" to={listLink}>
                    List
                </Link>
                <Link className="btn" to={newArticleLink}>
                    New Article
                </Link>
            </nav>
        </header>
    );
};

export default Header;



