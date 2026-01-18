import { useEffect, useState, useCallback} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ArticleView from '../../components/articleView/ArticleView';
import ConfirmModal from "../../components/ui/confirmModal/ConfirmModal.tsx";

import type {ArticleDetails} from "../../shared/types/article.ts";
import type { WsMessage } from '../../shared/types/ws';

const API = 'http://localhost:5000';

const ArticleDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [article, setArticle] = useState<ArticleDetails | null>(null);
    const [error, setError] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const loadArticle = useCallback(async () => {
        if (!id) return;

        setError('');
        setLoading(true);

        try {
            const res = await axios.get<ArticleDetails>(`${API}/articles/${id}`, {
                timeout: 10000,
            });
            setArticle(res.data);
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 404) {
                navigate('/articles');
                return;
            }
            setError(
                e?.response?.data?.error ||
                e?.message ||
                'Failed to load article'
            );
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        loadArticle();
    }, [loadArticle]);

    useEffect(() => {
        if (!id) return;

        const onWsMessage = (e: Event) => {
            const msg = (e as CustomEvent<WsMessage>).detail;

            if (msg.type === 'article_deleted' && msg.articleId === id) {
                navigate('/articles');
            }
        };

        window.addEventListener('ws-message', onWsMessage);
        return () => window.removeEventListener('ws-message', onWsMessage);
    }, [id, navigate]);

    const handleDeleteClick = () => {
        setShowConfirm(true);
    };

    const performDelete = async () => {
        if (!id) return;

        setDeleteError('');
        setDeleting(true);

        try {
            await axios.delete(`${API}/articles/${id}`);
            navigate('/articles');
        } catch (e: any) {

            const status = e?.response?.status;

            if (status === 404) {
                navigate('/articles');
                return;
            }
            const msg =
                e?.response?.data?.error ||
                e?.response?.data?.errors?.join(', ') ||
                e.message ||
                'Failed to delete article';
            setDeleteError(msg);
        } finally {
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    if (!id) {
        return <div className="alert alert--error">Incorrect article address</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error || !article) {
        return <div className="alert alert--error">{error || 'Article not found'}</div>;
    }

    return (
        <div>
            {deleteError && <div className="alert alert--error">{deleteError}</div>}

            <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>

                <Link className="btn" to={`/articles/${id}/edit`}>
                    Edit
                </Link>

                <button className="btn" onClick={handleDeleteClick} disabled={deleting}>
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>

            <ArticleView title={article.title}
                         content={article.content}
                         attachments={article.attachments}
            />

            <ConfirmModal
                open={showConfirm}
                title="Delete article"
                message="Are you sure you want to delete this article?"
                confirmLabel={deleting ? 'Deleting...' : 'Delete'}
                cancelLabel="Cancel"
                onConfirm={performDelete}
                onCancel={() => !deleting && setShowConfirm(false)}
            />
        </div>
    );
};

export default ArticleDetailsPage;
