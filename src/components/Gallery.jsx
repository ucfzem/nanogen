import React, { useState, useEffect } from 'react'

function Gallery({ t, language }) {
  const [images, setImages] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('nanogen_history') || '[]')
    setImages(history)
  }, [])

  const filteredImages = images.filter(img => {
    if (filter === 'all') return true
    return img.style === filter
  })

  const styles = ['all', 'anime', 'realistic', 'portrait', 'concept', 'fantasy', 'scifi']

  return (
    <div>
      <h2>{t('gallery.title')}</h2>
      
      <div style={{display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap'}}>
        {styles.map(s => (
          <button
            key={s}
            className={`style-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'Tous' : t(`generator.styles.${s}`)}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🖼️</div>
          <p>{t('gallery.empty')}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((img, idx) => (
            <div key={idx} className="gallery-item">
              <img src={img.dataUrl || img.url} alt={img.prompt} />
              <div className="gallery-item-info">
                <div className="gallery-item-prompt">{img.prompt}</div>
                <div className="post-tags">
                  <span className="tag">{t(`generator.styles.${img.style}`)}</span>
                  <span className="tag">{img.ratio}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Gallery
