import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { axiosClient } from "../../api/axiosClient";
import ArticleList from "../../components/articleList/ArticleList.tsx";
import ArticleView from "../../components/articleView/ArticleView.tsx";
import ConfirmModal from "../../components/ui/confirmModal/ConfirmModal.tsx";
import WorkspaceSwitcher from "../../components/workspaceSwitcher/WorkspaceSwitcher";
import CommentsBlock from "../../components/comments/CommentsBlock.tsx";
import ArticleVersionPicker from "../../components/articleView/ArticleVersionPicker.tsx";
import type { Article, ArticleDetails } from "../../shared/types/article.ts";
import type { WsMessage } from "../../shared/types/ws";
import type { Workspace } from "../../shared/types/workspace";

const ArticlesListPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const workspaceIdFromQuery = searchParams.get('workspaceId') || localStorage.getItem('workspaceId') || '';
    const [articles, setArticles] = useState<Article[]>([]);
    const [selected, setSelected] = useState<ArticleDetails | null>(null);
    const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspaceId, setWorkspaceId] = useState<string>(workspaceIdFromQuery);

    const handleWorkspaceChange = (id: string) => {
        setWorkspaceId(id);
        setSearchParams({ workspaceId: id });
        localStorage.setItem('workspaceId', id);
    };

    useEffect(() => {
        if (workspaceIdFromQuery !== workspaceId) {
            setWorkspaceId(workspaceIdFromQuery);
        }
    }, [workspaceIdFromQuery]);

    const loadWorkspaces = useCallback(async () => {
        setError('');
        try {
            const res = await axiosClient.get<Workspace[]>(`/workspaces`);
            const ws = res.data;
            setWorkspaces(ws);

            if (!workspaceIdFromQuery && !workspaceId && ws.length > 0) {
                const firstId = ws[0].id;
                setWorkspaceId(firstId);
                setSearchParams({ workspaceId: firstId });
                localStorage.setItem('workspaceId', firstId);
            }

        } catch (e: any) {
            setError(e?.message || 'Failed to load workspaces');
        }
    }, [setSearchParams, workspaceIdFromQuery]);

    const loadArticles = useCallback(async () => {
        if (!workspaceId) return;

        setError('');
        try {
            const res = await axiosClient.get<Article[]>(`/articles`, {
                params: { workspaceId },
            });
            setArticles(res.data);
        } catch (e: any) {
            setError(e?.message || 'Failed to load articles');
        }
    }, [workspaceId]);

    const loadArticle = useCallback(async (id: string, version?: number) => {
        setError('');
        try {
            const res = await axiosClient.get<ArticleDetails>(`$/articles/${id}`, {
                params: version ? { version } : undefined,
            });
            setSelected(res.data);
            setSelectedVersion(res.data.version);
        } catch (e: any) {
            setError(e?.message || 'Failed to load article');
        }
    }, []);


    useEffect(() => {
        loadWorkspaces();
    }, [loadWorkspaces]);

    useEffect(() => {
        if (!workspaceId) return;
        loadArticles();
        setSelected(null);
    }, [workspaceId, loadArticles]);

    useEffect(() => {
        const onWsMessage = (e: Event) => {
            const msg = (e as CustomEvent<WsMessage>).detail;

            switch (msg.type) {
                case 'article_deleted': {
                    setArticles((prev) => prev.filter((a) => a.id !== msg.articleId));
                    setSelected((prev) => (prev?.id === msg.articleId ? null : prev));
                    break;
                }
                case 'article_created':
                case 'article_updated': {
                    if (workspaceId) loadArticles();
                    break;
                }
                default:
                    break;
            }
        };

        window.addEventListener('ws-message', onWsMessage);
        return () => window.removeEventListener('ws-message', onWsMessage);
    }, [workspaceId, loadArticles]);

    const handleSelect = (id: string) => {
        if (selected?.id === id) {
            setSelected(null);
            setSelectedVersion(null);
            return;
        }
        setSelectedVersion(null);
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
            await axiosClient.delete(`/articles/${confirmId}`);
            setArticles((prev) => prev.filter((a) => a.id !== confirmId));
            setSelected((prev) => (prev?.id === confirmId ? null : prev));
        } catch (e: any) {
            const msg =
                e?.response?.data?.error ||
                (Array.isArray(e?.response?.data?.errors) ? e.response.data.errors.join(', ') : null) ||
                e?.message ||
                'Failed to delete article';
            setError(msg);
        } finally {
            setConfirmId(null);
        }
    };

    return (
        <div>
            {error && <div className="alert alert--error">{error}</div>}
            <WorkspaceSwitcher
                workspaces={workspaces}
                selectedId={workspaceId}
                onChange={handleWorkspaceChange}
            />

            <ArticleList
                articles={articles}
                onSelect={handleSelect}
                onEdit={selected?.isLatest ? handleEdit : undefined}
                onDelete={selected?.isLatest ? handleDeleteClick : undefined}
                selectedId={selected?.id}
            />

            {selected && (
                <>
                    <ArticleVersionPicker
                        articleId={selected.id}
                        currentVersion={selected.version}
                        isLatest={selected.isLatest}
                        onSelectVersion={(v) => {
                            setSelectedVersion(v);
                            loadArticle(selected.id, v);
                        }}
                    />

                    <ArticleView
                        title={selected.title}
                        content={selected.content || ''}
                        attachments={selected.attachments}
                    />

                    <CommentsBlock
                        articleId={selected.id}
                        initialComments={
                            (selected as any).comments ||
                            (selected as any).Comments ||
                            []
                        }
                        collapsedByDefault={true}
                        onCommentAdded={async () => {
                            await loadArticle(selected.id, selectedVersion ?? undefined);
                        }}
                    />
                </>
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
