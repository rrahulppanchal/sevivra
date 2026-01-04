"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { useCallback } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
}

export function RichTextEditor({ content, onChange, readOnly = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run()
  }, [editor])

  const setLink = useCallback(() => {
    const url = window.prompt("Enter URL:")
    if (url) {
      editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-background">
      {/* Formatting Toolbar - Made sticky and responsive */}
      <div className="border-b border-border bg-white px-4 sm:px-6 py-3 flex items-center justify-start gap-1 sm:gap-2 flex-wrap sticky top-0 z-10 overflow-x-auto">
        <button
          onClick={toggleBold}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground font-semibold text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("bold") ? "bg-primary/10 text-primary" : ""
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          onClick={toggleItalic}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground italic text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("italic") ? "bg-primary/10 text-primary" : ""
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          onClick={toggleUnderline}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 underline whitespace-nowrap ${
            editor.isActive("underline") ? "bg-primary/10 text-primary" : ""
          }`}
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          onClick={setLink}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("link") ? "bg-primary/10 text-primary" : ""
          }`}
          title="Add Link"
        >
          🔗
        </button>

        <div className="h-6 w-px bg-border mx-1 sm:mx-2" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("heading", { level: 1 }) ? "bg-primary/10 text-primary" : ""
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("heading", { level: 2 }) ? "bg-primary/10 text-primary" : ""
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("bulletList") ? "bg-primary/10 text-primary" : ""
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap ${
            editor.isActive("orderedList") ? "bg-primary/10 text-primary" : ""
          }`}
          title="Numbered List"
        >
          1. List
        </button>

        <div className="h-6 w-px bg-border mx-1 sm:mx-2" />

        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap"
          title="Undo"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="px-2 py-1 rounded hover:bg-secondary text-foreground text-sm transition-all duration-150 whitespace-nowrap"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor Content - Improved responsive padding and scrolling */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-8">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none"
          style={{
            maxWidth: "56rem",
            margin: "0 auto",
          }}
        />
      </div>
    </div>
  )
}
