interface ArticleListProps {
    articles: { id: string; title: string }[];
    onSelect: (id: string) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, onSelect }) => (
    <div>
        <h2>Articles</h2>
        <ul>
            {articles.map((a) => (
                <li key={a.id}>
                    <button onClick={() => onSelect(a.id)}>{a.title}</button>
                </li>
            ))}
        </ul>
    </div>
);

export default ArticleList;
