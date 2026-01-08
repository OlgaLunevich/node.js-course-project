import React, { useMemo, useState } from 'react';
import axios from 'axios';
import type { Comment } from "../../shared/types/article";
import './commetsBlock.css';
import ConfirmModal from "../ui/confirmModal/ConfirmModal.tsx";


const API = 'http://localhost:5000';

type CommentsProps = {
    articleId: string;
    initialComments?: Comment[];
    onCommentAdded: () => Promise<void> | void;
    collapsedByDefault?: boolean;
};

function getApiErrorMessage(e: any) {
    const data = e?.response?.data;
    if (data?.error) return String(data.error);
    if (Array.isArray(data?.errors) && data.errors.length) return data.errors.join(', ');
    if (data?.message) return String(data.message);
    return e?.message || 'Request failed';
}

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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [editError, setEditError] = useState('');
    const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
    const [commentToUpdate, setCommentToUpdate] = useState<{ id: string; content: string } | null>(null);


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

    const startEdit = (c: Comment) => {
        setEditError('');
        setEditingId(String(c.id));
        setEditText(String(c.content ?? ''));
    };

    const cancelEdit = () => {
        setEditError('');
        setEditingId(null);
        setEditText('');
    };

    const updateComment = async (id: string, content: string) => {
        setEditError('');
        setSaving(true);
        try {
            await axios.put(`${API}/comments/${id}`, { content });
            cancelEdit();
            await onCommentAdded();
        } catch (e: any) {
            setEditError(getApiErrorMessage(e));
        } finally {
            setSaving(false);
        }
    };


    const deleteComment = async (id: string) => {
        setCommentError('');
        setSaving(true);
        try {
            await axios.delete(`${API}/comments/${id}`);
            if (editingId === id) cancelEdit();
            await onCommentAdded();
        } catch (e: any) {
            setCommentError(getApiErrorMessage(e));
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
                    {comments.map(c => {
                        const id = String(c.id);
                        const isEditing = editingId === id;

                        return (
                            <li key={id} className="comments__item">
                                {!isEditing ? (
                                    <>
                                        <div className="comments__content">{c.content}</div>

                                        {c.createdAt && (
                                            <div className="comments__meta">
                                                {new Date(c.createdAt).toLocaleString()}
                                            </div>
                                        )}

                                        <div className="comments__actions">
                                            <button
                                                className="btn btn--secondary"
                                                onClick={() => startEdit(c)}
                                                disabled={saving}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn btn--secondary"
                                                onClick={() => setCommentToDelete(c)}
                                                disabled={saving}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <textarea
                                            className="input comments__textarea"
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            placeholder="Edit comment..."
                                            rows={3}
                                            disabled={saving}
                                        />

                                        {editError && <div className="alert alert--error">{editError}</div>}

                                        <div className="comments__actions">
                                            <button
                                                className="btn"
                                                onClick={() => {
                                                    setEditError('');
                                                    const text = editText.trim();
                                                    if (!text) {
                                                        setEditError('Comment cannot be empty');
                                                        return;
                                                    }
                                                    if (!editingId) return;
                                                    setCommentToUpdate({id: editingId, content: text});
                                                }}
                                                disabled={saving}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>

                                            <button
                                                className="btn btn--secondary"
                                                onClick={cancelEdit}
                                                disabled={saving}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </>
                                )}
                            </li>
                        );
                    })}
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

            <ConfirmModal
                open={!!commentToDelete}
                title="Delete comment"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onCancel={() => setCommentToDelete(null)}
                onConfirm={async () => {
                    if (!commentToDelete) return;
                    const id = String(commentToDelete.id);
                    setCommentToDelete(null);
                    await deleteComment(id);
                }}
            />

            <ConfirmModal
                open={!!commentToUpdate}
                title="Update comment"
                message="Save changes to this comment?"
                confirmLabel="Save"
                cancelLabel="Cancel"
                onCancel={() => setCommentToUpdate(null)}
                onConfirm={async () => {
                    if (!commentToUpdate) return;
                    const { id, content } = commentToUpdate;
                    setCommentToUpdate(null);
                    await updateComment(id, content);
                }}
            />

        </div>

    );


};

export default CommentsBlock;

