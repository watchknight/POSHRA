'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, type Language } from '@/lib/i18n/translations'
import { Globe } from 'lucide-react'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: typeof translations.en
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: translations.en,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('poshra_lang') as Language
    if (stored === 'en' || stored === 'bn') {
      setLangState(stored)
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('poshra_lang', newLang)
    document.documentElement.lang = newLang
  }

  const currentTranslations = translations[lang] || translations.en

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}

/**
 * Compact pill Language Toggle Switcher (EN | বাংলা)
 */
export function LanguageToggle({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLanguage()

  return (
    <div
      className={`inline-flex items-center rounded-full border border-gray-200 bg-gray-50/90 p-0.5 text-xs font-semibold shadow-2xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-full px-2.5 py-1 transition-all ${
          lang === 'en'
            ? 'bg-gray-900 text-white shadow-2xs'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('bn')}
        className={`rounded-full px-2.5 py-1 transition-all ${
          lang === 'bn'
            ? 'bg-emerald-700 text-white shadow-2xs'
            : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        বাংলা
      </button>
    </div>
  )
}
