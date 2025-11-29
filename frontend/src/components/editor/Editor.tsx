import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {useEffect} from "react";
import './editor.css';

interface Props {
    content: string;
    onChange: (value: string) => void;
}

const Editor: React.FC<Props> = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    useEffect(() => {
        if (!editor) return;
        const html = content || '<p></p>';
        if (html !== editor.getHTML()) {
            editor.commands.setContent(html, { emitUpdate: false });
        }
    }, [content, editor]);


    return (
        <div className="editor">
            <EditorContent editor={editor} className="editor__content" />
        </div>
    );
};

export default Editor;
