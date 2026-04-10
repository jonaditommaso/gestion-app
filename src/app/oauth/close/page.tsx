'use client'
import { useEffect } from 'react';

export default function OAuthClosePage() {
    useEffect(() => {
        window.close();
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-muted-foreground text-sm">Authorization successful. You can close this tab.</p>
        </div>
    );
}
