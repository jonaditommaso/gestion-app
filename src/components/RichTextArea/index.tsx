'use client'

import { cn } from '@/lib/utils'
import { Separator } from '../ui/separator'
import { useRef, useEffect, useState } from 'react'
import TextFormatting from './TextFormatting'
import ListActions from './ListActions'
import MediaActions from './MediaActions'
import LinkDialog from './LinkDialog'
import MentionDialog from './MentionDialog'

interface RichTextAreaProps {
    value?: string | null
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    memberOptions?: { id: string, name: string }[]
    onImageUpload?: (file: File) => Promise<string>
}

const RichTextArea = ({
    value,
    onChange,
    placeholder = 'Add description...',
    className,
    onImageUpload,
    memberOptions = []
}: RichTextAreaProps) => {
    const editorRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeFormats, setActiveFormats] = useState({
        bold: false,
        italic: false,
        underline: false,
        code: false,
    })
    const [currentColor, setCurrentColor] = useState<string>('default')

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || ''
        }
    }, [value])

    const checkActiveFormats = () => {
        const selection = window.getSelection()
        let isCode = false
        let detectedColor = 'default'

        if (selection && selection.rangeCount > 0) {
            let node = selection.anchorNode

            // Verificar si el nodo o alguno de sus padres es un elemento <code>
            while (node && node !== editorRef.current) {
                if (node.nodeName === 'CODE') {
                    isCode = true
                }
                // Buscar elementos FONT con atributo color (creados por foreColor)
                if (node instanceof HTMLElement) {
                    if (node.nodeName === 'FONT' && node.hasAttribute('color')) {
                        const colorAttr = node.getAttribute('color')
                        if (colorAttr) {
                            detectedColor = colorAttr.toLowerCase()
                        }
                    }
                    // También verificar style.color inline
                    if (node.style && node.style.color) {
                        const color = node.style.color
                        // Convertir RGB a HEX si es necesario
                        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
                        if (match) {
                            const hex = '#' + [1, 2, 3].map(i =>
                                parseInt(match[i]).toString(16).padStart(2, '0')
                            ).join('')
                            detectedColor = hex.toLowerCase()
                        } else if (color.startsWith('#')) {
                            detectedColor = color.toLowerCase()
                        }
                    }
                }
                node = node.parentNode
            }
        }

        setCurrentColor(detectedColor)
        setActiveFormats({
            bold: document.queryCommandState('bold'),
            italic: document.queryCommandState('italic'),
            underline: document.queryCommandState('underline'),
            code: isCode,
        })
    }

    const applyFormat = (command: string, value?: string) => {
        // Enfocar primero el editor
        editorRef.current?.focus()

        // Pequeño delay para asegurar que el editor tenga el foco
        setTimeout(() => {
            document.execCommand(command, false, value)
            updateContent()
            checkActiveFormats()
        }, 0)
    }

    const updateContent = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML
            // Si está vacío o solo tiene <br>, considerar como vacío
            const isEmpty = html === '' || html === '<br>' || html === '<div><br></div>'
            onChange(isEmpty ? '' : html)
        }
    }

    const insertMention = (member: { id: string, name: string }, savedRange?: Range) => {
        const selection = window.getSelection()
        if (!selection) return

        let range: Range | null = null
        if (savedRange) {
            range = savedRange
            selection.removeAllRanges()
            selection.addRange(range)
        } else if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0)
        }

        if (!range) return

        range.deleteContents()

        const mentionElement = document.createElement('span')
        mentionElement.setAttribute('data-mention-id', member.id)
        mentionElement.setAttribute('data-mention-name', member.name)
        mentionElement.setAttribute('contenteditable', 'false')
        mentionElement.className = 'inline-flex items-center rounded-sm bg-primary/10 px-1 py-0.5 text-primary'
        mentionElement.textContent = `@${member.name}`

        range.insertNode(mentionElement)

        const space = document.createTextNode('\u00A0')
        if (mentionElement.nextSibling) {
            mentionElement.parentNode?.insertBefore(space, mentionElement.nextSibling)
        } else {
            mentionElement.parentNode?.appendChild(space)
        }

        const cursorRange = document.createRange()
        cursorRange.setStart(space, 1)
        cursorRange.setEnd(space, 1)

        selection.removeAllRanges()
        selection.addRange(cursorRange)

        editorRef.current?.focus()
        updateContent()
    }

    const handleBold = () => applyFormat('bold')
    const handleItalic = () => applyFormat('italic')
    const handleCode = () => {
        editorRef.current?.focus()

        setTimeout(() => {
            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) return

            const range = selection.getRangeAt(0)

            // Verificar si ya está dentro de un <code>
            let node = selection.anchorNode
            let codeElement: HTMLElement | null = null

            while (node && node !== editorRef.current) {
                if (node.nodeName === 'CODE') {
                    codeElement = node as HTMLElement
                    break
                }
                node = node.parentNode
            }

            if (codeElement) {
                // Si hay texto seleccionado Y está dentro del código, quitar formato del texto seleccionado
                if (!range.collapsed) {
                    const text = range.toString()
                    const textNode = document.createTextNode(text)
                    range.deleteContents()
                    range.insertNode(textNode)

                    // Colocar el cursor después del texto
                    const newRange = document.createRange()
                    newRange.setStartAfter(textNode)
                    newRange.setEndAfter(textNode)
                    selection.removeAllRanges()
                    selection.addRange(newRange)
                } else {
                    // Si NO hay selección, simplemente salir del código
                    // Insertar un espacio después del elemento code
                    const space = document.createTextNode('\u00A0') // Espacio no separable

                    if (codeElement.nextSibling) {
                        codeElement.parentNode?.insertBefore(space, codeElement.nextSibling)
                    } else {
                        codeElement.parentNode?.appendChild(space)
                    }

                    // Colocar el cursor después del espacio
                    const newRange = document.createRange()
                    newRange.setStart(space, 1)
                    newRange.setEnd(space, 1)
                    selection.removeAllRanges()
                    selection.addRange(newRange)
                }
            } else {
                // Aplicar formato de código
                if (range.collapsed) {
                    // Si no hay selección, insertar el código con un marcador y posicionar dentro
                    const code = document.createElement('code')
                    code.style.backgroundColor = 'rgba(150, 150, 150, 0.2)'
                    code.style.padding = '3px 6px'
                    code.style.borderRadius = '4px'
                    code.style.fontFamily = "'Courier New', Consolas, Monaco, monospace"
                    code.style.fontSize = '0.95em'
                    code.style.letterSpacing = '0.5px'

                    // Insertar un zero-width space para que el cursor pueda posicionarse
                    const textNode = document.createTextNode('\u200B')
                    code.appendChild(textNode)

                    range.insertNode(code)

                    // Colocar el cursor dentro del nodo de texto
                    const newRange = document.createRange()
                    newRange.setStart(textNode, 1)
                    newRange.setEnd(textNode, 1)
                    selection.removeAllRanges()
                    selection.addRange(newRange)
                } else {
                    // Si hay texto seleccionado
                    try {
                        const selectedText = range.toString()

                        const code = document.createElement('code')
                        code.style.backgroundColor = 'rgba(150, 150, 150, 0.2)'
                        code.style.padding = '3px 6px'
                        code.style.borderRadius = '4px'
                        code.style.fontFamily = "'Courier New', Consolas, Monaco, monospace"
                        code.style.fontSize = '0.95em'
                        code.style.letterSpacing = '0.5px'
                        code.textContent = selectedText

                        range.deleteContents()
                        range.insertNode(code)

                        // Colocar el cursor después del código
                        const newRange = document.createRange()
                        newRange.setStartAfter(code)
                        newRange.setEndAfter(code)
                        selection.removeAllRanges()
                        selection.addRange(newRange)
                    } catch (e) {
                        console.error('Error applying code format:', e)
                    }
                }
            }

            updateContent()
            checkActiveFormats()
        }, 0)
    }

    const handleColorSelect = (color: string) => {
        setCurrentColor(color)
        applyFormat('foreColor', color)
    }

    const handleBulletList = () => applyFormat('insertUnorderedList')
    const handleOrderedList = () => applyFormat('insertOrderedList')

    const handleDivider = () => {
        editorRef.current?.focus()
        setTimeout(() => {
            document.execCommand('insertHorizontalRule', false)
            updateContent()
        }, 0)
    }

    const handleImage = () => {
        if (!onImageUpload) {
            console.warn('Image upload not configured');
            return;
        }
        fileInputRef.current?.click();
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !onImageUpload) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            console.error('Selected file is not an image');
            return;
        }

        // Validar tamaño (por ejemplo, max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.error('Image is too large. Max size is 5MB');
            return;
        }

        try {
            // Guardar la selección actual
            const selection = window.getSelection();
            let savedRange: Range | null = null;
            if (selection && selection.rangeCount > 0) {
                savedRange = selection.getRangeAt(0).cloneRange();
            }

            // Subir la imagen
            const imageUrl = await onImageUpload(file);

            // Restaurar la selección y insertar la imagen
            if (savedRange && selection) {
                selection.removeAllRanges();
                selection.addRange(savedRange);
            }

            editorRef.current?.focus();

            setTimeout(() => {
                const img = document.createElement('img');
                img.src = imageUrl;
                img.style.maxWidth = '100%';
                img.style.height = 'auto';
                img.style.borderRadius = '8px';
                img.style.margin = '8px 0';
                img.style.display = 'block';

                const range = savedRange || (selection?.rangeCount ? selection.getRangeAt(0) : null);
                if (range) {
                    range.insertNode(img);

                    // Insertar un salto de línea después de la imagen
                    const br = document.createElement('br');
                    if (img.nextSibling) {
                        img.parentNode?.insertBefore(br, img.nextSibling);
                    } else {
                        img.parentNode?.appendChild(br);
                    }

                    // Colocar el cursor después del salto de línea
                    const newRange = document.createRange();
                    newRange.setStartAfter(br);
                    newRange.setEndAfter(br);
                    selection?.removeAllRanges();
                    selection?.addRange(newRange);
                }

                updateContent();
            }, 0);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            // Limpiar el input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }

    const handleLink = (url: string, text?: string, savedRange?: Range) => {
        setTimeout(() => {
            const selection = window.getSelection()
            if (!selection) return

            // Usar el rango guardado si existe, o intentar obtener el actual
            let range: Range | null = null
            if (savedRange) {
                range = savedRange
                selection.removeAllRanges()
                selection.addRange(range)
            } else if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0)
            } else {
                return
            }

            const link = document.createElement('a')
            link.href = url
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            link.style.color = '#3b82f6'
            link.style.textDecoration = 'underline'

            if (text) {
                // Si se proporciona texto, usarlo
                link.textContent = text
            } else if (!range.collapsed) {
                // Si hay texto seleccionado, usarlo
                link.textContent = range.toString()
                range.deleteContents()
            } else {
                // Si no hay texto, usar la URL
                link.textContent = url
            }

            range.insertNode(link)

            // Insertar un espacio después del enlace
            const space = document.createTextNode('\u00A0')
            if (link.nextSibling) {
                link.parentNode?.insertBefore(space, link.nextSibling)
            } else {
                link.parentNode?.appendChild(space)
            }

            // Colocar el cursor después del espacio
            const newRange = document.createRange()
            newRange.setStart(space, 1)
            newRange.setEnd(space, 1)
            selection.removeAllRanges()
            selection.addRange(newRange)

            editorRef.current?.focus()
            updateContent()
        }, 0)
    }

    return (
        <div className={cn('border rounded-md overflow-hidden', className)}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Toolbar */}
            <div className="bg-muted/50 border-b p-2 flex flex-wrap gap-1">
                <TextFormatting
                    onBold={handleBold}
                    onItalic={handleItalic}
                    onCode={handleCode}
                    onColorSelect={handleColorSelect}
                    currentColor={currentColor}
                    isActive={activeFormats}
                />

                <Separator orientation="vertical" className="mx-1 h-8" />

                <ListActions
                    onBulletList={handleBulletList}
                    onOrderedList={handleOrderedList}
                />

                <Separator orientation="vertical" className="mx-1 h-8" />

                <MediaActions
                    linkComponent={<LinkDialog onInsertLink={handleLink} />}
                    mentionComponent={<MentionDialog memberOptions={memberOptions} onInsertMention={insertMention} />}
                    onImage={handleImage}
                    onDivider={handleDivider}
                />
            </div>

            {/* Editor Content */}
            <div
                ref={editorRef}
                contentEditable
                onInput={updateContent}
                onClick={checkActiveFormats}
                onMouseUp={checkActiveFormats}
                onKeyUp={checkActiveFormats}
                onFocus={checkActiveFormats}
                className={cn(
                    'h-[200px] overflow-y-scroll p-3 focus:outline-none',
                    'prose prose-sm max-w-none',
                    '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none',
                    '[&_hr]:my-4',
                    '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-2',
                    '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-2',
                    '[&_li]:my-1',
                    '[&_span[data-mention-id]]:inline-flex [&_span[data-mention-id]]:items-center [&_span[data-mention-id]]:rounded-sm [&_span[data-mention-id]]:bg-primary/10 [&_span[data-mention-id]]:px-1 [&_span[data-mention-id]]:py-0.5 [&_span[data-mention-id]]:text-primary'
                )}
                data-placeholder={placeholder}
            />
        </div>
    )
}

export default RichTextArea
