import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '../../components/editor/Editor';

interface Article {
    id: string;
    title: string;
    content: string;
}

const API = 'http://localhost:5000';

const EditArticlePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

        const loadArticle = async () => {
            setError('');
            setLoading(true);
            try {
                const res = await axios.get<Article>(`${API}/articles/${id}`);
                setTitle(res.data.title);
                setContent(res.data.content);
            } catch (e: any) {
                setError(e?.response?.data?.error || e.message || 'Failed to load article');
            } finally {
                setLoading(false);
            }
        };

        loadArticle();
    }, [id]);

    const saveChanges = async () => {
        if (!id) return;
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('Введите заголовок и текст');
            return;
        }

        try {
            await axios.put(`${API}/articles/${id}`, { title, content });
            navigate(`/articles/${id}`);
        } catch (e: any) {
            const msg =
                e?.response?.data?.errors?.join(', ') ||
                e?.response?.data?.error ||
                e.message ||
                'Ошибка сохранения';
            setError(msg);
        }
    };

    if (!id) {
        return <div className="alert alert--error">Некорректный адрес статьи</div>;
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="create">
            <h2>Edit Article</h2>

            {error && <div className="alert alert--error">{error}</div>}

            <input
                className="input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <Editor content={content} onChange={setContent} />

            <div className="create__buttons">
                <button className="btn" onClick={saveChanges}>
                    Save changes
                </button>
                <button className="btn btn--secondary" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default EditArticlePage;
