import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote, Undo, Redo, Minus } from 'lucide-react'
import { Button, ButtonGroup, Card, CardBody } from '@heroui/react'
import PropTypes from 'prop-types'

const RichTextEditor = ({ value, onChange, placeholder, disabled = false, maxLength = 2000, error, description }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      })
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()

      // Validar límite de caracteres
      if (text.length <= maxLength) {
        onChange?.(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 text-gray-200',
        placeholder: placeholder || 'Escribe aquí...'
      }
    }
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  if (!editor) {
    return null
  }

  const currentLength = editor.getText().length
  const isOverLimit = currentLength > maxLength

  return (
    <Card
      className={`w-full ${error ? 'border-2 border-red-500/50' : 'border border-gray-700/50'} bg-gray-800/40 backdrop-blur-sm overflow-hidden`}>
      <CardBody className='p-0'>
        {/* Toolbar */}
        <div className='flex flex-wrap items-center gap-2 p-3 border-b border-gray-700/50 bg-gray-900/40'>
          <ButtonGroup size='sm' variant='flat'>
            <Button
              isIconOnly
              className={editor.isActive('bold') ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleBold().run()}
              onPress={() => editor.chain().focus().toggleBold().run()}>
              <Bold size={16} />
            </Button>
            <Button
              isIconOnly
              className={editor.isActive('italic') ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
              onPress={() => editor.chain().focus().toggleItalic().run()}>
              <Italic size={16} />
            </Button>
          </ButtonGroup>

          <ButtonGroup size='sm' variant='flat'>
            <Button
              isIconOnly
              className={editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
              onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
              <Heading2 size={16} />
            </Button>
            <Button
              isIconOnly
              className={editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
              onPress={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
              <Heading3 size={16} />
            </Button>
          </ButtonGroup>

          <ButtonGroup size='sm' variant='flat'>
            <Button
              isIconOnly
              className={editor.isActive('bulletList') ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleBulletList().run()}
              onPress={() => editor.chain().focus().toggleBulletList().run()}>
              <List size={16} />
            </Button>
            <Button
              isIconOnly
              className={editor.isActive('orderedList') ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleOrderedList().run()}
              onPress={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered size={16} />
            </Button>
          </ButtonGroup>

          <ButtonGroup size='sm' variant='flat'>
            <Button
              isIconOnly
              className={editor.isActive('blockquote') ? 'bg-primary/20 text-primary-400' : ''}
              isDisabled={disabled || !editor.can().chain().focus().toggleBlockquote().run()}
              onPress={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote size={16} />
            </Button>
            <Button
              isIconOnly
              isDisabled={disabled || !editor.can().chain().focus().setHorizontalRule().run()}
              onPress={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus size={16} />
            </Button>
          </ButtonGroup>

          <ButtonGroup size='sm' variant='flat'>
            <Button
              isIconOnly
              isDisabled={disabled || !editor.can().chain().focus().undo().run()}
              onPress={() => editor.chain().focus().undo().run()}>
              <Undo size={16} />
            </Button>
            <Button
              isIconOnly
              isDisabled={disabled || !editor.can().chain().focus().redo().run()}
              onPress={() => editor.chain().focus().redo().run()}>
              <Redo size={16} />
            </Button>
          </ButtonGroup>
        </div>

        {/* Editor Content */}
        <div className={`bg-gray-800/20 text-gray-200 min-h-[200px] ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
          <EditorContent editor={editor} />
        </div>

        {/* Footer Info */}
        <div className='p-3 border-t border-gray-700/50 bg-gray-900/40'>
          <div className='flex justify-between items-center w-full'>
            <div>
              {error ? (
                <span className='text-xs text-red-400'>{error}</span>
              ) : description ? (
                <span className='text-xs text-gray-400'>{description}</span>
              ) : null}
            </div>
            <span className={`text-xs ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
              {currentLength} / {maxLength}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  error: PropTypes.string,
  description: PropTypes.string
}

export default RichTextEditor
