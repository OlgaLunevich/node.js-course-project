import { useEffect, useState } from 'react';
import axios from 'axios';
import Editor from './components/Editor';
import ArticleList from './components/ArticleList';
import ArticleView from './components/ArticleView';
import './index.css';

interface Article {
    id: string;
    title: string;
    content?: string;
}

function App() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [articles, setArticles] = useState<Article[]>([]);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    const API = 'http://localhost:5000';

    const loadArticles = async () => {
        const res = await axios.get<Article[]>(`${API}/articles`);
        setArticles(res.data);
    };

    const loadArticle = async (id: string) => {
        const res = await axios.get<Article>(`${API}/articles/${id}`);
        setSelectedArticle(res.data);
    };

    const saveArticle = async () => {
        if (!title.trim() || !content.trim()) return alert('Fill title & content');

        await axios.post(`${API}/articles`, { title, content });

        alert('Saved!');
        setTitle('');
        setContent('');
        loadArticles();
    };

    useEffect(() => {
        loadArticles();
    }, []);

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <h1>Create Article</h1>

            <input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <Editor content={content} onChange={setContent} />

            <button onClick={saveArticle}>Save</button>

            <hr />

            <ArticleList articles={articles} onSelect={loadArticle} />

            {selectedArticle && (
                <ArticleView
                    title={selectedArticle.title}
                    content={selectedArticle.content || ''}
                />
            )}
        </div>
    );
}

export default App;
