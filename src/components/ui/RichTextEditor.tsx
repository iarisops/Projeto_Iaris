'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: string
}

// ── Toolbar icons ──────────────────────────────────────────────────────────────

function IconBold() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2h4.5a3 3 0 0 1 0 6H4V2ZM4 8h5a3.5 3.5 0 0 1 0 7H4V8Z"/></svg>
}
function IconItalic() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2h6v2H9.5l-3 8H9v2H3v-2h2.5l3-8H6V2Z"/></svg>
}
function IconUnderline() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M3 14h10v1.5H3V14ZM8 11.5A4 4 0 0 1 4 7.5V2h1.5v5.5a2.5 2.5 0 0 0 5 0V2H12v5.5a4 4 0 0 1-4 4Z"/></svg>
}
function IconBulletList() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.2"/><rect x="5" y="3" width="9" height="2"/><circle cx="2" cy="8" r="1.2"/><rect x="5" y="7" width="9" height="2"/><circle cx="2" cy="12" r="1.2"/><rect x="5" y="11" width="9" height="2"/></svg>
}
function IconOrderedList() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="5" fontSize="5" fontFamily="monospace">1.</text><rect x="5" y="3" width="9" height="2"/><text x="0" y="9" fontSize="5" fontFamily="monospace">2.</text><rect x="5" y="7" width="9" height="2"/><text x="0" y="13" fontSize="5" fontFamily="monospace">3.</text><rect x="5" y="11" width="9" height="2"/></svg>
}
function IconChecklist() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="4" height="4" rx="0" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M2 5l1 1 1.5-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="5" y="4" width="9" height="2" fill="currentColor" rx="0"/>
      <rect x="1" y="9" width="4" height="4" rx="0" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="5" y="10" width="9" height="2" fill="currentColor" rx="0"/>
    </svg>
  )
}

// ── Toolbar button ─────────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      // preventDefault on mousedown keeps editor focus/selection intact
      onMouseDown={(e) => e.preventDefault()}
      // onClick fires after mouseup, by which point ProseMirror has
      // finalized the selection — safe for both marks and block commands
      onClick={onClick}
      title={title}
      className={[
        'flex items-center justify-center w-7 h-7 transition-colors',
        active
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />
}

// ── Main component ─────────────────────────────────────────────────────────────

export function RichTextEditor({ value, onChange, placeholder, minHeight = '120px' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        'data-placeholder': placeholder ?? '',
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      onChange(html === '<p></p>' ? '' : html)
    },
  })

  // Sync when value resets (e.g. modal reopened with different task)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const normalized = value === '' ? '<p></p>' : value
    if (current !== normalized) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div className="flex flex-col border border-border bg-surface-2 focus-within:border-primary transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0 px-1 py-1 border-b border-border bg-surface">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Negrito (Ctrl+B)"
        >
          <IconBold />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Itálico (Ctrl+I)"
        >
          <IconItalic />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Sublinhado (Ctrl+U)"
        >
          <IconUnderline />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Lista em tópicos"
        >
          <IconBulletList />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Lista numerada"
        >
          <IconOrderedList />
        </ToolbarBtn>
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive('taskList')}
          title="Checklist"
        >
          <IconChecklist />
        </ToolbarBtn>
      </div>

      {/* Editor area — px-6 garante espaço para marcadores de lista fora do flow */}
      <div className="tiptap-editor pl-6 pr-3 py-2.5 overflow-visible" style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

// ── Strip HTML for plain-text previews ────────────────────────────────────────

export function stripHtml(html: string | null): string {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}
