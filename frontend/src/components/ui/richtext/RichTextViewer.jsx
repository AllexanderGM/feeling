import PropTypes from 'prop-types'
import DOMPurify from 'dompurify'

/**
 * RichTextViewer - Componente para visualizar contenido HTML de forma segura
 * @param {string} content - El contenido HTML a renderizar
 * @param {string} className - Clases CSS adicionales
 */
const RichTextViewer = ({ content, className = '' }) => {
  if (!content) {
    return <p className='text-gray-400 text-sm italic'>Sin descripción</p>
  }

  // Sanitizar el HTML para prevenir XSS
  const sanitizedContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'blockquote',
      'hr',
      'code',
      'pre'
    ],
    ALLOWED_ATTR: ['class']
  })

  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      className={`prose prose-sm max-w-none text-gray-300
        [&_p]:mb-3 [&_p]:text-gray-300
        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-4 [&_h2]:text-gray-100
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-gray-100
        [&_ul]:pl-6 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:text-gray-300
        [&_ol]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:text-gray-300
        [&_li]:mb-1
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary-500 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-3 [&_blockquote]:italic [&_blockquote]:text-gray-300 [&_blockquote]:bg-gray-900/20 [&_blockquote]:rounded-r
        [&_hr]:my-4 [&_hr]:border-t [&_hr]:border-gray-700
        [&_code]:bg-gray-900/60 [&_code]:text-primary-300 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
        [&_pre]:bg-gray-900/60 [&_pre]:text-gray-200 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:overflow-x-auto
        [&_pre_code]:bg-transparent [&_pre_code]:p-0
        [&_strong]:font-bold [&_strong]:text-gray-100
        [&_b]:font-bold [&_b]:text-gray-100
        [&_em]:italic
        [&_i]:italic
        ${className}`}
    />
  )
}

RichTextViewer.propTypes = {
  content: PropTypes.string,
  className: PropTypes.string
}

export default RichTextViewer
