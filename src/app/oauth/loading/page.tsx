'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl';

export default function AuthLoading() {
  const t = useTranslations('auth');

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = "/";
    }, 2000) // timepo para que el browser guarde la cookie

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex items-center mt-20 justify-center">
      <p className="text-gray-500 text-sm">{t('logging-in')}</p>
    </div>
  )
}
