import React, { useState, useEffect } from 'react'
import { getTranslation } from './i18n'
import Header from './components/Header'
import Generator from './components/Generator'
import Gallery from './components/Gallery'
import Community from './components/Community'
import Profile from './components/Profile'
import EmailGate from './components/EmailGate'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('nanogen_lang') || 'fr'
  })
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('nanogen_email') || null
  })
  const [generationCount, setGenerationCount] = useState(() => {
    return parseInt(localStorage.getItem('nanogen_count') || '0')
  })
  const [showEmailGate, setShowEmailGate] = useState(false)
  const [isRTL, setIsRTL] = useState(language === 'ar')

  const t = (key) => getTranslation(language, key)

  useEffect(() => {
    localStorage.setItem('nanogen_lang', language)
    setIsRTL(language === 'ar')
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const handleGeneration = () => {
    const newCount = generationCount + 1
    setGenerationCount(newCount)
    localStorage.setItem('nanogen_count', newCount.toString())
    
    if (newCount >= 5 && !userEmail) {
      setShowEmailGate(true)
    }
  }

  const handleEmailSubmit = (email) => {
    setUserEmail(email)
    localStorage.setItem('nanogen_email', email)
    setShowEmailGate(false)
  }

  const canGenerate = () => {
    return generationCount < 5 || userEmail
  }

  return (
    <div className={`app ${isRTL ? 'rtl' : 'ltr'}`}>
      <Header 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        language={language}
        setLanguage={setLanguage}
        t={t}
        userEmail={userEmail}
      />
      
      <main className="main-content">
        {currentPage === 'home' && (
          <Generator 
            t={t} 
            language={language}
            canGenerate={canGenerate}
            onGeneration={handleGeneration}
            userEmail={userEmail}
          />
        )}
        {currentPage === 'explore' && (
          <Gallery t={t} language={language} />
        )}
        {currentPage === 'community' && (
          <Community t={t} language={language} userEmail={userEmail} />
        )}
        {currentPage === 'profile' && (
          <Profile t={t} language={language} userEmail={userEmail} />
        )}
      </main>

      {showEmailGate && (
        <EmailGate 
          t={t} 
          onSubmit={handleEmailSubmit}
          onClose={() => setShowEmailGate(false)}
        />
      )}
    </div>
  )
}

export default App
