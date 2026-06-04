import React, { useState, useEffect } from 'react'
import { getTranslation } from './i18n'
import Header from './components/Header'
import Generator from './components/Generator'
import Gallery from './components/Gallery'
import Community from './components/Community'
import Profile from './components/Profile'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nanogen_lang') || 'fr'
  })
  const [isRTL, setIsRTL] = useState(language === 'ar')

  const t = (key) => getTranslation(language, key)

  useEffect(() => {
    localStorage.setItem('nanogen_lang', language)
    setIsRTL(language === 'ar')
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  return (
    <div className={`app ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />
      
      <main className="main-content">
        {currentPage === 'home' && (
          <Generator t={t} language={language} />
        )}
        {currentPage === 'explore' && (
          <Gallery t={t} language={language} />
        )}
        {currentPage === 'community' && (
          <Community t={t} language={language} />
        )}
        {currentPage === 'profile' && (
          <Profile t={t} language={language} />
        )}
      </main>
    </div>
  )
}

export default App
