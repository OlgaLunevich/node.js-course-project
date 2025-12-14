export type WsMessage =
    | { type: 'connected'; message: string; ts: number }
    | {
    type: 'article_created';
    articleId: string;
    title: string;
    attachmentsAdded: number;
    message: string;
    ts: number;
}
    | {
    type: 'article_updated';
    articleId: string;
    title: string;
    attachmentsAdded: number;
    attachmentsRemoved: number;
    message: string;
    ts: number;
}
    | {
    type: 'article_deleted';
    articleId: string;
    title: string;
    message: string;
    ts: number;
};