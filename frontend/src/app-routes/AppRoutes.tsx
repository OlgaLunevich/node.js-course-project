import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import HomePage from "../pages/home-page/HomePage.tsx";
import ArticlesListPage from "../pages/articlesList-page/ArticlesListPage.tsx";
import CreateArticlePage from "../pages/createArticle-page/CreateArticlePage.tsx";
import ArticleDetailsPage from "../pages/articleDetales-page/ArticleDetalesPage.tsx";
import EditArticlePage from "../pages/editArticle-page/EditArticlePage.tsx";

import { RequireAuth } from "../auth/RequireAuth";
import { LoginPage} from "../pages/login-page/LoginPage.tsx";
import { RegisterPage} from "../pages/register-page/RegisterPage.tsx";

const AppRoutes = () => (
    <Routes>
        <Route element={<Layout />} path="/">
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            <Route
                path="articles"
                element={
                    <RequireAuth>
                        <ArticlesListPage />
                    </RequireAuth>
                }
            />
            <Route
                path="articles/new"
                element={
                    <RequireAuth>
                        <CreateArticlePage />
                    </RequireAuth>
                }
            />
            <Route
                path="articles/:id"
                element={
                    <RequireAuth>
                        <ArticleDetailsPage />
                    </RequireAuth>
                }
            />
            <Route
                path="articles/:id/edit"
                element={
                    <RequireAuth>
                        <EditArticlePage />
                    </RequireAuth>
                }
            />
        </Route>
    </Routes>
);

export default AppRoutes;
