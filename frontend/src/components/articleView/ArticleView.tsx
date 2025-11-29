import React from "react";
import './articleView.css';

interface ArticleViewProps {
    title: string;
    content: string;
}

const ArticleView: React.FC<ArticleViewProps> = ({ title, content }) => (
    <div className="article-view">
        <h2 className="article-view__title">{title}</h2>
        <div
            className="article-view__content"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    </div>
);

export default ArticleView;

