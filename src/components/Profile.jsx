import React, { useState, useEffect } from 'react'

function Profile({ t, language }) {
  const [history, setHistory] = useState([])
  const [generationCount, setGenerationCount] = useState(0)

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem('nanogen_history') || '[]')
    setHistory(h)
    setGenerationCount(parseInt(localStorage.getItem('nanogen_count') || '0'))
  }, [])

  const clearHistory = () => {
    if (window.confirm('Effacer tout l\'historique ?')) {
      localStorage.removeItem('nanogen_history')
      localStorage.removeItem('nanogen_count')
      setHistory([])
      setGenerationCount(0)
    }
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>{t('profile.title')}</h2>
        {userEmail && (
          <p style={{color: 'var(--text-muted)', marginTop: '0.5rem'}}>
            {userEmail}
          </p>
        )}
        
        <div className="profile-stats">
          <div className="stat">
            <div className="stat-number">{generationCount}</div>
            <div className="stat-label">{t('profile.generations')}</div>
          </div>
          <div className="stat">
            <div className="stat-number">{history.length}</div>
            <div className="stat-label">{t('profile.history')}</div>
          </div>
        </div>
      </div>

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
        <h3>{t('profile.history')}</h3>
        {history.length > 0 && (
          <button className="btn-secondary" onClick={clearHistory}>
            🗑️ {t('profile.clear')}
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p>{t('gallery.empty')}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {history.map((img, idx) => (
            <div key={idx} className="gallery-item">
              <img src={img.dataUrl || img.url} alt={img.prompt} />
              <div className="gallery-item-info">
                <div className="gallery-item-prompt">{img.prompt}</div>
                <div className="post-tags">
                  <span className="tag">{t(`generator.styles.${img.style}`)}</span>
                  <span className="tag">{new Date(img.timestamp).toLocaleDateString(language)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile
