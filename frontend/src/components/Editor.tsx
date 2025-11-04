import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

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

    return <EditorContent editor={editor} className="editor" />;
};

export default Editor;
