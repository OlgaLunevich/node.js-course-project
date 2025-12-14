export interface Article {
    id: string;
    title: string;
    content: string;
    attachments?: Attachment[];
}

export interface Attachment {
    id: string;
    originalName: string;
    mimeType: string;
    url: string;
}