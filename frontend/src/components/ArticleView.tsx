interface ArticleViewProps {
    title: string;
    content: string;
}

const ArticleView: React.FC<ArticleViewProps> = ({ title, content }) => (
    <div style={{ marginTop: 20 }}>
        <h2>{title}</h2>
        <div dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
);

export default ArticleView;
