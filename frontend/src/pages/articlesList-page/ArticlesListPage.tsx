import { useEffect, useState } from 'react';
import axios from 'axios';
import ArticleList from "../../components/articleList/ArticleList.tsx";
import ArticleView from "../../components/articleView/ArticleView.tsx";

interface Article {
    id: string;
    title: string;
    content?: string;
}

const API = 'http://localhost:5000';

const ArticlesListPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selected, setSelected] = useState<Article | null>(null);
    const [error, setError] = useState('');

    const loadArticles = async () => {
        setError('');
        try {
            const res = await axios.get<Article[]>(`${API}/articles`);
            setArticles(res.data);
        } catch (e: any) {
            setError(e.message || 'Failed to load articles');
        }
    };

    const loadArticle = async (id: string) => {
        setError('');
        try {
            const res = await axios.get<Article>(`${API}/articles/${id}`);
            setSelected(res.data);
        } catch (e: any) {
            setError(e.message || 'Failed to load article');
        }
    };

    const handleSelect = (id: string) => {
        // если уже выбрана эта статья — скрываем её
        if (selected && selected.id === id) {
            setSelected(null);
            return;
        }
        // иначе загружаем и показываем
        loadArticle(id);
    };

    useEffect(() => {
        loadArticles();
    }, []);

    return (
        <div>
            {error && <div className="alert alert--error">{error}</div>}

            <ArticleList articles={articles} onSelect={handleSelect} />

            {selected && (
                <ArticleView title={selected.title} content={selected.content || ''} />
            )}
        </div>
    );
};

export default ArticlesListPage;
