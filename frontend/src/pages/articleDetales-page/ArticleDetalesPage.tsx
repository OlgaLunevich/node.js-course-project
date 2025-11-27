import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleView from "../../components/articleView/ArticleView.tsx";


interface Article {
    id: string;
    title: string;
    content: string;
}

const API = 'http://localhost:5000';

const ArticleDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [article, setArticle] = useState<Article | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        (async () => {
            setError('');
            try {
                const res = await axios.get<Article>(`${API}/articles/${id}`);
                setArticle(res.data);
            } catch (e: any) {
                setError(e.message || 'Failed to load article');
            }
        })();
    }, [id]);

    if (error) {
        return <div className="alert alert--error">{error}</div>;
    }

    if (!article) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <button className="btn btn--secondary" onClick={() => navigate(-1)}>
                ⬅ Back
            </button>
            <ArticleView title={article.title} content={article.content} />
        </div>
    );
};

export default ArticleDetailsPage;
