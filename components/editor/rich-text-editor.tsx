"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import { TextStyle } from "@tiptap/extension-text-style"
import { useImperativeHandle, forwardRef, useEffect, useRef } from "react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  readOnly?: boolean
}

export interface RichTextEditorRef {
  toggleBold: () => void
  toggleItalic: () => void
  setLink: () => void
  setHeading: (level: 1 | 2 | 3 | 4 | null) => void
  getCurrentHeading: () => 1 | 2 | 3 | 4 | null
  increaseFontSize: () => void
  decreaseFontSize: () => void
  toggleUppercase: () => void
  toggleLowercase: () => void
  isBold: () => boolean
  isItalic: () => boolean
}

// Custom extension for font size using inline styles
const FontSize = TextStyle.extend({
  name: "fontSize",
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: { fontSize?: string | null }) => {
          if (!attributes.fontSize) {
            return {}
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          }
        },
      },
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: (fontSize: string) => ({ chain }: { chain: any }) => {
        return chain().setMark("fontSize", { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: { chain: any }) => {
        return chain().setMark("fontSize", { fontSize: null }).removeEmptyTextStyle().run()
      },
    }
  },
})

// Custom extension for text transform
const TextTransform = TextStyle.extend({
  name: "textTransform",
  addAttributes() {
    return {
      ...this.parent?.(),
      textTransform: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.textTransform || null,
        renderHTML: (attributes: { textTransform?: string | null }) => {
          if (!attributes.textTransform) {
            return {}
          }
          return {
            style: `text-transform: ${attributes.textTransform}`,
          }
        },
      },
    }
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setTextTransform: (transform: "uppercase" | "lowercase" | "none") => ({ chain }: { chain: any }) => {
        return chain().setMark("textTransform", { textTransform: transform }).run()
      },
      unsetTextTransform: () => ({ chain }: { chain: any }) => {
        return chain().setMark("textTransform", { textTransform: null }).removeEmptyTextStyle().run()
      },
    }
  },
})

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ content, onChange, readOnly = false }, ref) => {
    const lastSyncedHtmlRef = useRef<string>(content)
    const suppressOnUpdateRef = useRef(false)
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
        FontSize,
        TextTransform,
      ],
      content,
      editable: !readOnly,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        if (suppressOnUpdateRef.current) {
          return
        }
        const html = editor.getHTML()
        lastSyncedHtmlRef.current = html
        onChange(html)
      },
    })

    useEffect(() => {
      if (!editor) return
      if (lastSyncedHtmlRef.current !== content) {
        lastSyncedHtmlRef.current = content
        suppressOnUpdateRef.current = true
        editor.commands.setContent(content, false)
        suppressOnUpdateRef.current = false
      }
    }, [content, editor])

    useImperativeHandle(ref, () => ({
      toggleBold: () => {
        editor?.chain().focus().toggleBold().run()
      },
      toggleItalic: () => {
        editor?.chain().focus().toggleItalic().run()
      },
      setLink: () => {
        const url = window.prompt("Enter URL:")
        if (url) {
          editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        }
      },
      setHeading: (level: 1 | 2 | 3 | 4 | null) => {
        if (!editor) return
        if (level === null) {
          editor.chain().focus().setParagraph().run()
        } else {
          editor.chain().focus().toggleHeading({ level }).run()
        }
      },
      getCurrentHeading: () => {
        if (!editor) return null
        if (editor.isActive("heading", { level: 1 })) return 1
        if (editor.isActive("heading", { level: 2 })) return 2
        if (editor.isActive("heading", { level: 3 })) return 3
        if (editor.isActive("heading", { level: 4 })) return 4
        return null
      },
      increaseFontSize: () => {
        if (!editor) return
        const currentSize = editor.getAttributes("fontSize")?.fontSize
        const sizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"]
        const currentIndex = currentSize ? sizes.indexOf(currentSize) : 2 // Default to 16px
        const nextIndex = Math.min(currentIndex + 1, sizes.length - 1)
        ;(editor.chain().focus() as any).setFontSize(sizes[nextIndex]).run()
      },
      decreaseFontSize: () => {
        if (!editor) return
        const currentSize = editor.getAttributes("fontSize")?.fontSize
        const sizes = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px", "48px"]
        const currentIndex = currentSize ? sizes.indexOf(currentSize) : 2 // Default to 16px
        const nextIndex = Math.max(currentIndex - 1, 0)
        ;(editor.chain().focus() as any).setFontSize(sizes[nextIndex]).run()
      },
      toggleUppercase: () => {
        if (!editor) return
        const currentTransform = editor.getAttributes("textTransform")?.textTransform
        if (currentTransform === "uppercase") {
          ;(editor.chain().focus() as any).setTextTransform("none").run()
        } else {
          ;(editor.chain().focus() as any).setTextTransform("uppercase").run()
        }
      },
      toggleLowercase: () => {
        if (!editor) return
        const currentTransform = editor.getAttributes("textTransform")?.textTransform
        if (currentTransform === "lowercase") {
          ;(editor.chain().focus() as any).setTextTransform("none").run()
        } else {
          ;(editor.chain().focus() as any).setTextTransform("lowercase").run()
        }
      },
      isBold: () => {
        return editor?.isActive("bold") ?? false
      },
      isItalic: () => {
        return editor?.isActive("italic") ?? false
      },
    }))

    if (!editor) {
      return null
    }

    return (
      <div className="w-full">
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none font-serif [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[800px] [&_.ProseMirror_h1]:text-4xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mt-6 [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:text-3xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-5 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:text-2xl [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_h4]:text-xl [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:mt-3 [&_.ProseMirror_h4]:mb-2 [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_p]:leading-relaxed"
          style={{
            color: "#1F2937",
          }}
        />
      </div>
    )
  }
)

RichTextEditor.displayName = "RichTextEditor"
