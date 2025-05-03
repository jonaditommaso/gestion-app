'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl';

export default function MeetsLoading() {
  const t = useTranslations('home');

  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.href = "/?meet=success";
    }, 2000) // timepo para que el browser guarde la cookie

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex items-center mt-20 justify-center">
      <p className="text-gray-500 text-sm">{t('creating-meet')}</p>
    </div>
  )
}
