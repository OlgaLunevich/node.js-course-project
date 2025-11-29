import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from "../pages/home-page/HomePage.tsx";
import ArticlesListPage from "../pages/articlesList-page/ArticlesListPage.tsx";
import CreateArticlePage from "../pages/createArticle-page/CreateArticlePage.tsx";
import ArticleDetailsPage from "../pages/articleDetales-page/ArticleDetalesPage.tsx";
import EditArticlePage from "../pages/editArticle-page/EditArticlePage.tsx";

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route element={<Layout />} path="/">
                <Route index element={<HomePage />} />
                <Route path="articles" element={<ArticlesListPage />} />
                <Route path="articles/new" element={<CreateArticlePage />} />
                <Route path="articles/:id" element={<ArticleDetailsPage />} />
                <Route path="articles/:id/edit" element={<EditArticlePage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
