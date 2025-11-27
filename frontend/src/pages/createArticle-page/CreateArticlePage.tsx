import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from "../../components/editor/Editor.tsx";

const API = 'http://localhost:5000';

const CreateArticlePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const saveArticle = async () => {
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('Введите заголовок и текст');
            return;
        }

        try {
            const res = await axios.post(`${API}/articles`, { title, content });
            const id = res.data?.id;
            setTitle('');
            setContent('');
            if (id) {
                navigate(`/articles/${id}`);
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.errors?.join(', ') ||
                err?.response?.data?.error ||
                'Ошибка сохранения';
            setError(msg);
        }
    };

    return (
        <div className="create">
            <h2>Create Article</h2>

            {error && <div className="alert alert--error">{error}</div>}

            <input
                className="input"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <Editor content={content} onChange={setContent} />

            <div className="create__buttons">
                <button className="btn" onClick={saveArticle}>
                    Save
                </button>
                <button className="btn btn--secondary" onClick={() => navigate(-1)}>
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default CreateArticlePage;
