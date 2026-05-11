'use client'

import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'

export default function TrelloCallbackPage() {
    const called = useRef(false)

    useEffect(() => {
        if (called.current) return
        called.current = true

        const hash = window.location.hash
        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
        const token = params.get('token')

        if (!token) {
            window.close()
            return
        }

        fetch('/api/sells/trello/save-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        }).finally(() => {
            window.close()
        })
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center gap-3">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Conectando con Trello...</p>
        </div>
    )
}
