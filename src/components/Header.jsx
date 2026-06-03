import React from 'react'
import LanguageSelector from './LanguageSelector'

function Header({ currentPage, setCurrentPage, language, setLanguage, t }) {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => setCurrentPage('home')} style={{cursor: 'pointer'}}>
          {t('appName')}
        </div>
        
        <nav className="nav">
          {['home', 'explore', 'community', 'profile'].map(page => (
            <button
              key={page}
              className={`nav-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {t(`nav.${page}`)}
            </button>
          ))}
        </nav>
        
        <LanguageSelector language={language} setLanguage={setLanguage} />
      </div>
    </header>
  )
}

export default Header
