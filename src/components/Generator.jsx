import React, { useState } from 'react'

function Generator({ t, language, canGenerate, onGeneration }) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [ratio, setRatio] = useState('1:1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)

  const styles = ['anime', 'realistic', 'portrait', 'concept', 'fantasy', 'scifi', 'oil', 'watercolor', '3d']
  const ratios = ['1:1', '16:9', '9:16', '4:3']

  const ratioDimensions = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '4:3': { width: 1024, height: 768 }
  }

  const enhancePrompt = async () => {
    if (!prompt.trim()) return
    setIsEnhancing(true)
    
    const enhancements = {
      fr: {
        realistic: "ultra realistic, 8k, professional photography, dramatic lighting, ",
        anime: "anime style, studio ghibli, vibrant colors, detailed, ",
        portrait: "portrait photography, studio lighting, sharp focus, professional, ",
        concept: "concept art, detailed, epic composition, cinematic, ",
        fantasy: "fantasy art, magical, ethereal lighting, detailed illustration, ",
        scifi: "sci-fi, futuristic, cyberpunk, neon lights, detailed, ",
        oil: "oil painting, classical art, rich textures, masterpiece, ",
        watercolor: "watercolor painting, soft colors, artistic, flowing, ",
        "3d": "3d render, octane render, detailed, professional, "
      }
    }

    const langEnhancements = enhancements[language] || enhancements.fr
    const enhancement = langEnhancements[style] || langEnhancements.realistic
    
    setTimeout(() => {
      setPrompt(enhancement + prompt)
      setIsEnhancing(false)
    }, 1000)
  }

  const generateImage = async () => {
    if (!prompt.trim() || !canGenerate()) return
    
    setIsGenerating(true)
    setError(null)
    
    try {
      const dims = ratioDimensions[ratio]
      const fullPrompt = `${prompt}, ${style} style`
      
      const seed = Math.floor(Math.random() * 1000000)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true`
      
      const img = new Image()
      img.onload = () => {
        setGeneratedImage({
          url: imageUrl,
          prompt: prompt,
          style: style,
          ratio: ratio,
          timestamp: Date.now()
        })
        setIsGenerating(false)
        onGeneration()
        
        const history = JSON.parse(localStorage.getItem('nanogen_history') || '[]')
        history.unshift({
          url: imageUrl,
          prompt: prompt,
          style: style,
          ratio: ratio,
          timestamp: Date.now()
        })
        localStorage.setItem('nanogen_history', JSON.stringify(history.slice(0, 50)))
      }
      
      img.onerror = () => {
        setError('Erreur lors de la génération. Veuillez réessayer.')
        setIsGenerating(false)
      }
      
      img.src = imageUrl
      
    } catch (err) {
      setError('Erreur: ' + err.message)
      setIsGenerating(false)
    }
  }

  const downloadImage = async () => {
    if (!generatedImage) return
    
    try {
      const response = await fetch(generatedImage.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nanogen-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      window.open(generatedImage.url, '_blank')
    }
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt)
  }

  return (
    <div className="generator">
      <div className="generator-form">
        <h2>{t('generator.title')}</h2>
        
        <div className="form-group">
          <label>{t('generator.prompt')}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t('generator.prompt')}
            disabled={isGenerating}
          />
          <button 
            className="btn-secondary" 
            onClick={enhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            style={{marginTop: '0.5rem', width: '100%'}}
          >
            {isEnhancing ? t('generator.enhancing') : `✨ ${t('generator.enhance')}`}
          </button>
        </div>

        <div className="form-group">
          <label>{t('generator.negative')}</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder={t('generator.negativePlaceholder')}
            disabled={isGenerating}
          />
        </div>

        <div className="form-group">
          <label>{t('generator.style')}</label>
          <div className="style-grid">
            {styles.map(s => (
              <button
                key={s}
                className={`style-btn ${style === s ? 'active' : ''}`}
                onClick={() => setStyle(s)}
                disabled={isGenerating}
              >
                {t(`generator.styles.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>{t('generator.ratio')}</label>
          <div className="style-grid">
            {ratios.map(r => (
              <button
                key={r}
                className={`style-btn ${ratio === r ? 'active' : ''}`}
                onClick={() => setRatio(r)}
                disabled={isGenerating}
              >
                {t(`generator.ratios.${r}`)}
              </button>
            ))}
          </div>
        </div>

        {!canGenerate() && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error)',
            padding: '1rem',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            color: 'var(--error)'
          }}>
            ⚠️ Limite atteinte. Inscrivez-vous pour continuer.
          </div>
        )}

        <button
          className="btn-primary"
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim() || !canGenerate()}
        >
          {isGenerating ? '⏳ ' + t('common.loading') : '🎨 ' + t('generator.generate')}
        </button>

        {error && (
          <div style={{color: 'var(--error)', marginTop: '1rem', textAlign: 'center'}}>
            {error}
          </div>
        )}
      </div>

      <div className="image-preview">
        {isGenerating ? (
          <div className="loading-spinner"></div>
        ) : generatedImage ? (
          <>
            <img 
              src={generatedImage.url} 
              alt="Generated" 
              className="preview-image"
            />
            <div className="preview-actions">
              <button className="btn-secondary" onClick={downloadImage}>
                📥 {t('generator.download')}
              </button>
              <button className="btn-secondary" onClick={copyPrompt}>
                📋 {t('common.copy')}
              </button>
              <button className="btn-secondary" onClick={() => {
                navigator.share?.({
                  title: 'NanoGen',
                  text: generatedImage.prompt,
                  url: generatedImage.url
                })
              }}>
                🔗 {t('common.share')}
              </button>
            </div>
          </>
        ) : (
          <div className="preview-placeholder">
            <div style={{fontSize: '4rem', marginBottom: '1rem'}}>🎨</div>
            <p>{t('generator.title')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Generator
