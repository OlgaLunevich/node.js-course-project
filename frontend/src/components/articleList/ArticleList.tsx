import React from "react";
import './articleList.css';

interface ArticleListProps {
    articles: { id: string; title: string }[];
    onSelect: (id: string) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelect }) => (
    <div>
        <ul className="article-list">
            {articles.map((a) => (
                <li key={a.id} className="article-list__item">
                    <button
                        className="article-list__button"
                        onClick={() => onSelect(a.id)}
                    >
                        {a.title}
                    </button>
                </li>
            ))}
        </ul>
    </div>
);


export default ArticleList;
