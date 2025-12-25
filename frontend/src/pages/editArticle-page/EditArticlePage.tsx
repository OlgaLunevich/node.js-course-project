import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Editor from '../../components/editor/Editor';
import type {Article, Attachment} from "../../shared/types/article.ts";
import type { WsMessage } from '../../shared/types/ws';


const API = 'http://localhost:5000';

const EditArticlePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [attachmentsToRemove, setAttachmentsToRemove] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
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
                setAttachments(res.data.attachments || []);
            } catch (e: any) {
                const status = e?.response?.status;

                if (status === 404) {
                    // статья удалена/не существует → уходим на список
                    navigate('/articles');
                    return;
                }
                setError(e?.response?.data?.error || e.message || 'Failed to load article');
            } finally {
                setLoading(false);
            }
        };
        loadArticle();
    }, [id, navigate]);

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

    const handleNewFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        const selected = e.target.files;
        if (!selected) {
            return;
        }
        const selectedArray = Array.from(selected);
        const keptExistingCount = attachments.length - attachmentsToRemove.length;
        const total = keptExistingCount + newFiles.length + selectedArray.length;

        if (total > 5) {
            setError('Total attachments cannot exceed 5');
            e.target.value = '';
            return;
        }
        setNewFiles((prev) => [...prev, ...selectedArray]);
        e.target.value = '';
    };

    const toggleRemoveAttachment = (attachmentId: string) => {
        setAttachmentsToRemove((prev) =>
            prev.includes(attachmentId)
                ? prev.filter((id) => id !== attachmentId)
                : [...prev, attachmentId]
        );
    };

    const saveChanges = async () => {
        if (!id) return;
        setError('');

        if (!title.trim() || !content.trim()) {
            setError('Input title and content');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);

            if (attachmentsToRemove.length > 0) {
                formData.append('attachmentsToRemove', JSON.stringify(attachmentsToRemove));
            }

            if (newFiles.length > 0) {
                newFiles.forEach((file) => {
                    formData.append('attachments', file);
                });
            }

            await axios.put(`${API}/articles/${id}`, formData);
            setNewFiles([]);
            navigate(`/articles/${id}`);
        } catch (e: any) {
            const status = e?.response?.status;
            if (status === 404) {
                navigate('/articles');
                return;
            }
            const msg =
                e?.response?.data?.errors?.join(', ') ||
                e?.response?.data?.error ||
                e.message ||
                'Save error';
            setError(msg);
        }
    };

    if (!id) {
        return <div className="alert alert--error">Incorrect article address</div>;
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
            {attachments.length > 0 && (
                <div className="attachments">
                    <div className="attachments__title">Existing attachments:</div>
                    <ul className="attachments__list">
                        {attachments.map((att) => {
                            const markedForRemoval = attachmentsToRemove.includes(att.id);

                            return (
                                <li key={att.id} className="attachments__item">
                                    <a
                                        href={`${API}${att.url}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={
                                            'attachments__link' +
                                            (markedForRemoval
                                                ? ' attachments__link--removed'
                                                : '')
                                        }
                                    >
                                        {att.originalName}
                                    </a>
                                    <button
                                        type="button"
                                        className="btn btn--secondary attachments__remove-button"
                                        onClick={() => toggleRemoveAttachment(att.id)}
                                    >
                                        {markedForRemoval ? 'Undo remove' : 'Remove'}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {newFiles.length > 0 && (
                <div className="attachments attachments--new">
                    <div className="attachments__title">New attachments (not saved yet):</div>
                    <ul className="attachments__list">
                        {newFiles.map((file, index) => (
                            <li key={index} className="attachments__item">
                    <span className="attachments__link">
                        {file.name}
                    </span>
                                <button
                                    type="button"
                                    className="btn btn--secondary attachments__remove-button"
                                    onClick={() =>
                                        setNewFiles((prev) =>
                                            prev.filter((_, i) => i !== index)
                                        )
                                    }
                                >
                                    Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="attachments-upload">
                <label className="attachments-upload__label">
                    Add new attachments (images, PDF, up to 5 files):
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleNewFilesChange}
                        className="attachments-upload__input"
                    />
                </label>
            </div>

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
