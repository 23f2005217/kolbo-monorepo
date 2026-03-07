"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Button } from '../button';
import { Textarea } from '../textarea';
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, Code } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Underline,
      Image,
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 text-sm max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      if (!isHtmlMode) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  });

  // Update content if value changes externally (e.g. loaded from DB)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isHtmlMode) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isHtmlMode]);

  if (!editor) {
    return null;
  }

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to Rich Text
      editor.commands.setContent(value);
      setIsHtmlMode(false);
    } else {
      // Switching from Rich Text to HTML
      setIsHtmlMode(true);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden bg-background flex flex-col h-full min-h-[200px]">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/50 flex-wrap">
        {!isHtmlMode && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const previousUrl = editor.getAttributes('link').href;
                const url = window.prompt('URL', previousUrl);
                if (url === null) return;
                if (url === '') {
                  editor.chain().focus().extendMarkRange('link').unsetLink().run();
                  return;
                }
                editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
              }}
              className={`h-8 w-8 p-0 ${editor.isActive('link') ? 'bg-muted' : ''}`}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </>
        )}
        <div className="flex-1" />
        <Button
            variant={isHtmlMode ? "secondary" : "ghost"}
            size="sm"
            onClick={toggleHtmlMode}
            className="h-8 px-2 gap-2 text-xs"
        >
            <Code className="h-4 w-4" />
            HTML
        </Button>
      </div>
      
      {isHtmlMode ? (
        <Textarea 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[150px] border-0 focus-visible:ring-0 rounded-none p-4 font-mono text-sm resize-none flex-1"
            placeholder="Enter raw HTML here..."
        />
      ) : (
        <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
      )}
    </div>
  );
}
