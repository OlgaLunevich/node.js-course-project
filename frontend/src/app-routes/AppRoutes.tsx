import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from "../pages/home-page/HomePage.tsx";
import ArticlesListPage from "../pages/articlesList-page/ArticlesListPage.tsx";
import CreateArticlePage from "../pages/createArticle-page/CreateArticlePage.tsx";
import ArticleDetailsPage from "../pages/articleDetales-page/ArticleDetalesPage.tsx";

const AppRoutes: React.FC = () => {
    // return (
    //     <Routes>
    //         <Route element={<Layout />} path="/">
    //             {/* /  → список статей */}
    //             <Route index element={<ArticlesListPage />} />
    //
    //             {/* /articles/new → создание статьи */}
    //             <Route path="articles/new" element={<CreateArticlePage />} />
    //
    //             {/* /articles/:id → просмотр одной статьи */}
    //             <Route path="articles/:id" element={<ArticleDetailsPage />} />
    //         </Route>
    //     </Routes>
    // );

    return (
        <Routes>
            <Route element={<Layout />} path="/">
                {/* Главная страница — только хэдер */}
                <Route index element={<HomePage />} />

                {/* Теперь список статей здесь */}
                <Route path="articles" element={<ArticlesListPage />} />

                <Route path="articles/new" element={<CreateArticlePage />} />

                <Route path="articles/:id" element={<ArticleDetailsPage />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes;
