import React, { useMemo, useState } from 'react';
import axios from 'axios';
import type { Comment } from "../../shared/types/article";
import './commetsBlock.css';

const API = 'http://localhost:5000';

type CommentsProps = {
    articleId: string;
    initialComments?: Comment[];
    onCommentAdded: () => Promise<void> | void;
    collapsedByDefault?: boolean;
};

const CommentsBlock: React.FC<CommentsProps> = ({
                                                    articleId,
                                                    initialComments = [],
                                                    onCommentAdded,
                                                    collapsedByDefault = false,
                                                }) => {
    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState('');
    const [saving, setSaving] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(!collapsedByDefault);

    const comments = useMemo(() => initialComments, [initialComments]);

    const addComment = async () => {
        setCommentError('');
        const text = commentText.trim();

        if (!text) {
            setCommentError('Comment cannot be empty');
            return;
        }

        setSaving(true);
        try {
            await axios.post(`${API}/articles/${articleId}/comments`, { content: text });
            setCommentText('');
            await onCommentAdded();
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ||
                e?.message ||
                'Failed to add comment';
            setCommentError(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="comments">
            <div className="comments__header">
                <h3 className="comments__title">Comments</h3>
                <button
                    className="btn btn--secondary"
                    onClick={() => setIsFormOpen(v => !v)}
                >
                    {isFormOpen ? 'Hide form' : 'Add comment'}
                </button>
            </div>

            {comments.length === 0 ? (
                <div className="comments__empty">No comments yet</div>
            ) : (
                <ul className="comments__list">
                    {comments.map(c => (
                        <li key={c.id} className="comments__item">
                            <div className="comments__content">{c.content}</div>
                            {c.createdAt && (
                                <div className="comments__meta">
                                    {new Date(c.createdAt).toLocaleString()}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            {commentError && <div className="alert alert--error">{commentError}</div>}

            {isFormOpen && (
                <div className="comments__form">
                    <textarea
                        className="input comments__textarea"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        rows={3}
                    />
                    <button className="btn" onClick={addComment} disabled={saving}>
                        {saving ? 'Adding...' : 'Add comment'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommentsBlock;

