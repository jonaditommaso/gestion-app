'use client'

import { cn } from '@/lib/utils'
import { Separator } from '../ui/separator'
import { useRef, useEffect, useState } from 'react'
import TextFormatting from './TextFormatting'
import ListActions from './ListActions'
import MediaActions from './MediaActions'
import LinkDialog from './LinkDialog'

interface RichTextAreaProps {
    value?: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    memberOptions?: { id: string, name: string }[]
}

const RichTextArea = ({
    value,
    onChange,
    placeholder = 'Add description...',
    className,
    // memberOptions = []
}: RichTextAreaProps) => {
    const editorRef = useRef<HTMLDivElement>(null)
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

    // const handleImage = () => {
    //     const url = window.prompt('URL de la imagen:')
    //     if (url) {
    //         applyFormat('insertImage', url)
    //     } else {
    //         editorRef.current?.focus()
    //     }
    // }

    // const handleMention = () => {
    //     if (memberOptions.length === 0) {
    //         document.execCommand('insertText', false, '@')
    //         editorRef.current?.focus()
    //         return
    //     }

    //     const names = memberOptions.map((m, i) => `${i + 1}. ${m.name}`).join('\n')
    //     const selection = window.prompt(`Mencionar a:\n${names}\n\nEscribe el número:`)

    //     if (selection) {
    //         const index = parseInt(selection) - 1
    //         if (index >= 0 && index < memberOptions.length) {
    //             const mention = document.createElement('span')
    //             mention.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
    //             mention.style.color = '#3b82f6'
    //             mention.style.padding = '2px 4px'
    //             mention.style.borderRadius = '3px'
    //             mention.textContent = `@${memberOptions[index].name}`

    //             const sel = window.getSelection()
    //             if (sel && sel.rangeCount > 0) {
    //                 const range = sel.getRangeAt(0)
    //                 range.insertNode(mention)
    //                 range.setStartAfter(mention)
    //                 range.setEndAfter(mention)
    //                 updateContent()
    //             }
    //         }
    //     }
    //     editorRef.current?.focus()
    // }

    return (
        <div className={cn('border rounded-md overflow-hidden', className)}>
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
                    // onImage={handleImage}
                    onDivider={handleDivider}
                    // onMention={handleMention}
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
                    '[&_li]:my-1'
                )}
                data-placeholder={placeholder}
            />
        </div>
    )
}

export default RichTextArea
