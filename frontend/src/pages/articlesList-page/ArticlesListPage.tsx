import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleList from "../../components/articleList/ArticleList.tsx";
import ArticleView from "../../components/articleView/ArticleView.tsx";
import ConfirmModal from "../../components/ui/confirmModal/ConfirmModal.tsx";
import type {Article} from "../../shared/types/article.ts";

const API = 'http://localhost:5000';

const ArticlesListPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [selected, setSelected] = useState<Article | null>(null);
    const [error, setError] = useState('');
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const navigate = useNavigate();

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
        if (selected && selected.id === id) {
            setSelected(null);
            return;
        }
        loadArticle(id);
    };

    const handleEdit = (id: string) => {
        navigate(`/articles/${id}/edit`);
    };

    const handleDeleteClick = (id: string) => {
        setConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!confirmId) return;

        setError('');
        try {
            await axios.delete(`${API}/articles/${confirmId}`);
            setArticles(prev => prev.filter(a => a.id !== confirmId));
            if (selected && selected.id === confirmId) {
                setSelected(null);
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ||
                e?.response?.data?.errors?.join(', ') ||
                e.message ||
                'Failed to delete article';
            setError(msg);
        } finally {
            setConfirmId(null);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    return (

        <div>
            {error && <div className="alert alert--error">{error}</div>}

            <ArticleList
                articles={articles}
                onSelect={handleSelect}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                selectedId={selected?.id}
            />

            {selected && (
                <ArticleView
                    title={selected.title}
                    content={selected.content || ''}
                    attachments={selected.attachments}
                />
            )}

            <ConfirmModal
                open={!!confirmId}
                title="Delete article"
                message="Are you sure you want to delete this article?"
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={confirmDelete}
                onCancel={() => setConfirmId(null)}
            />
        </div>
    );
};

export default ArticlesListPage;
