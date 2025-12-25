import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from "../../components/editor/Editor.tsx";

const API = 'http://localhost:5000';

const CreateArticlePage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const navigate = useNavigate();

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');

        const selected = e.target.files;
        if (!selected) {
            return;
        }

        const selectedArray = Array.from(selected);
        const total = files.length + selectedArray.length;

        if (total > 5) {
            setError('You can attach up to 5 files total');
            e.target.value = '';
            return;
        }

        setFiles((prev) => [...prev, ...selectedArray]);
        e.target.value = '';
    };

    const saveArticle = async () => {
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('Input title and content');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);

            if (files.length > 0) {
                files.forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            const res = await axios.post(`${API}/articles`, formData);

            const id = res.data?.id;
            setTitle('');
            setContent('');
            setFiles([]);

            if (id) {
                navigate(`/articles/${id}`);
            } else {
                navigate('/');
            }
        } catch (err: any) {
            const msg =
                err?.response?.data?.errors?.join(', ') ||
                err?.response?.data?.error ||
                err?.message ||
                'Save error';
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

            {files.length > 0 && (
                <ul className="attachments-list">
                    {files.map((file, index) => (
                        <li key={index}>
                            {file.name}
                            <button
                                type="button"
                                onClick={() => {
                                    setFiles((prev) => prev.filter((_, i) => i !== index));
                                    setError(''); // ✅ сбрасываем ошибку, если она висела из-за лимита
                                }}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <div className="attachments-upload">
                <label className="attachments-upload__label">
                    Attach files (images, PDF, up to 5 files):
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFilesChange}
                        className="attachments-upload__input"
                    />
                </label>
            </div>

            <Editor content={content} onChange={setContent}/>

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
