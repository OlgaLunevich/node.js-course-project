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

export interface Comment {
    id: string;
    content: string;
    createdAt?: string;
}
