import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Escreva aqui o conteúdo completo da notícia...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4 text-slate-900 leading-relaxed',
      },
    },
  })

  if (!editor) {
    return null
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', previousUrl)

    if (url === null) {
      return
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rounded-xl border border-slate-300 overflow-hidden bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          icon="format_bold"
          title="Negrito"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          icon="format_italic"
          title="Itálico"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          icon="format_underlined"
          title="Sublinhado"
        />
        
        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          icon="format_h2"
          title="Subtítulo Grande"
          label="H2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          icon="format_h3"
          title="Subtítulo Médio"
          label="H3"
        />

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          icon="format_list_bulleted"
          title="Lista de Marcadores"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          icon="format_list_numbered"
          title="Lista Numerada"
        />

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={toggleLink}
          active={editor.isActive('link')}
          icon="link"
          title="Inserir Link"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          icon="format_clear"
          title="Limpar Formatação"
        />
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .tiptap ul { list-style-type: disc; padding-left: 1.5rem; }
        .tiptap ol { list-style-type: decimal; padding-left: 1.5rem; }
        .tiptap h2 { font-size: 1.5rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 1rem; }
        .tiptap h3 { font-size: 1.25rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.75rem; }
        .tiptap a { color: var(--color-primary); text-decoration: underline; }
      `}} />
    </div>
  )
}

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  icon: string
  title: string
  label?: string
}

function ToolbarButton({ onClick, active, icon, title, label }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      className={`
        flex items-center justify-center w-9 h-9 rounded-lg transition-all
        ${active 
          ? 'bg-primary text-white shadow-sm' 
          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'}
      `}
    >
      {label ? (
        <span className="text-[10px] font-black">{label}</span>
      ) : (
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      )}
    </button>
  )
}
