import React from "react";
import './articleView.css';

interface Attachment {
    id: string;
    originalName: string;
    mimeType: string;
    url: string;
}

interface Props {
    title: string;
    content: string;
    attachments?: Attachment[];
}

const API = "http://localhost:5000";

const ArticleView: React.FC<Props> = ({ title, content, attachments = [] }) => {
    return (
        <div className="article">

            <h2 className="article-view__title">{title}</h2>

            {attachments.length > 0 && (
                <div className="attachments-bar">
                    {attachments.map((att) => (
                        <a
                            key={att.id}
                            href={`${API}${att.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="attachments-bar__item"
                        >
              <span className="attachments-bar__icon">
                {att.mimeType === "application/pdf" ? "📄" : "🖼️"}
              </span>
                            <span className="attachments-bar__name">{att.originalName}</span>
                        </a>
                    ))}
                </div>
            )}

            <div
                className="article-view__content"
                dangerouslySetInnerHTML={{__html: content}}
            />
        </div>
    );
};


export default ArticleView;

