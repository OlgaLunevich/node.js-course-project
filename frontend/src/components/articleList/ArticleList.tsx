import React from "react";
import './articleList.css';

interface Article {
    id: string;
    title: string;
}

interface ArticleListProps {
    articles: Article[];
    onSelect: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    selectedId?: string;
}

const ArticleList: React.FC<ArticleListProps> = ({
                                                     articles,
                                                     onSelect,
                                                     onEdit,
                                                     onDelete,
                                                     selectedId,
                                                 }) => (
    <div>
        <ul className="article-list">
            {articles.map((a) => {
                const isSelected = selectedId === a.id;

                return (
                    <li key={a.id} className="article-list__item">
                        <button
                            className="article-list__button"
                            onClick={() => onSelect(a.id)}
                        >
                            {a.title}
                        </button>

                        {isSelected && (onEdit || onDelete) && (
                            <div className="article-list__actions">
                                {onEdit && (
                                    <button
                                        className="article-list__action"
                                        onClick={() => onEdit(a.id)}
                                    >
                                        Edit
                                    </button>
                                )}
                                {onDelete && (
                                    <button
                                        className="article-list__action article-list__action--danger"
                                        onClick={() => onDelete(a.id)}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    </div>
);


export default ArticleList;
