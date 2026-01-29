import React, { useEffect, useState } from 'react';
import axios from 'axios';
import type {VersionInfo} from "../../shared/types/article.ts";
import './articleVersionPicker.css'

const API = 'http://localhost:5000';

type Props = {
    articleId: string;
    currentVersion: number;
    isLatest: boolean;
    onSelectVersion: (v: number) => void;
};

const ArticleVersionPicker: React.FC<Props> = ({
                                                   articleId,
                                                   currentVersion,
                                                   isLatest,
                                                   onSelectVersion,
                                               }) => {
    const [versions, setVersions] = useState<VersionInfo[]>([]);

    useEffect(() => {
        axios
            .get<VersionInfo[]>(`${API}/articles/${articleId}/versions`)
            .then((res) => setVersions(res.data))
            .catch(() => setVersions([]));
    }, [articleId]);

    if (versions.length <= 1) return null;

    return (
        <div className="article-version">
            <label className="article-version__label">
                Version:{' '}
                <select
                    value={currentVersion}
                    onChange={(e) => onSelectVersion(Number(e.target.value))}
                >
                    {versions.map((v) => (
                        <option key={v.id} value={v.version}>
                            v{v.version}
                            {v.version === currentVersion && isLatest
                                ? ' (current)'
                                : ''}
                        </option>
                    ))}
                </select>
            </label>

            {!isLatest && (
                <div className="alert article-version__readonly">
                    Viewing old version (only reading is possible)
                </div>
            )}
        </div>
    );
};

export default ArticleVersionPicker;
