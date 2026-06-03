import React from 'react'

function LanguageSelector({ language, setLanguage }) {
  const languages = [
    { code: 'fr', label: 'FR' },
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'ar', label: 'AR' }
  ]

  return (
    <div className="lang-selector">
      {languages.map(lang => (
        <button
          key={lang.code}
          className={`lang-btn ${language === lang.code ? 'active' : ''}`}
          onClick={() => setLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </div>
  )
}

export default LanguageSelector
