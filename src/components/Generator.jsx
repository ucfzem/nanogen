import React, { useState, useRef, useEffect } from 'react'

const WORKER_URL = import.meta.env.VITE_WORKER_URL || ''

const STYLE_PROMPTS = {
  realistic: 'professional photography, 8k, dramatic lighting, sharp focus, ',
  anime: 'anime style, studio ghibli, vibrant colors, detailed, ',
  portrait: 'portrait photography, studio lighting, sharp focus, professional, ',
  concept: 'concept art, detailed, epic composition, cinematic lighting, ',
  fantasy: 'fantasy art, magical, ethereal lighting, detailed illustration, ',
  scifi: 'sci-fi, futuristic, cyberpunk, neon lights, highly detailed, ',
  oil: 'oil painting, classical art, rich textures, masterpiece, ',
  watercolor: 'watercolor painting, soft colors, artistic, flowing brushstrokes, ',
  '3d': '3d render, octane render, highly detailed, professional lighting, '
}

function Generator({ t, language }) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [style, setStyle] = useState('realistic')
  const [ratio, setRatio] = useState('1:1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(null)
  const [error, setError] = useState(null)
  const previewRef = useRef(null)

  const styles = ['anime', 'realistic', 'portrait', 'concept', 'fantasy', 'scifi', 'oil', 'watercolor', '3d']
  const ratios = ['1:1', '16:9', '9:16', '4:3']

  const getDimensions = (r) => {
    const map = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '4:3': { width: 1024, height: 768 }
    }
    return map[r] || map['1:1']
  }

  const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  const enhancePrompt = () => {
    if (!prompt.trim()) return
    setIsEnhancing(true)
    const enh = STYLE_PROMPTS[style] || STYLE_PROMPTS.realistic
    setTimeout(() => {
      setPrompt(enh + prompt)
      setIsEnhancing(false)
    }, 800)
  }

  const generateImage = async () => {
    if (!prompt.trim()) return
    if (!WORKER_URL) { setError('WORKER_URL non configurée. Vérifiez les secrets GitHub.'); return }

    setIsGenerating(true)
    setError(null)

    try {
      const fullPrompt = `${STYLE_PROMPTS[style] || ''}${prompt}`
      const dims = getDimensions(ratio)

      const res = await fetch(`${WORKER_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt, width: dims.width, height: dims.height })
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text.slice(0, 200))
      }

      const blob = await res.blob()
      const imageUrl = URL.createObjectURL(blob)
      const dataUrl = await blobToBase64(blob)

      setGeneratedImage({ url: imageUrl, dataUrl, prompt, style, ratio, timestamp: Date.now() })
      setIsGenerating(false)
      const history = JSON.parse(localStorage.getItem('nanogen_history') || '[]')
      history.unshift({ dataUrl, prompt, style, ratio, timestamp: Date.now() })
      localStorage.setItem('nanogen_history', JSON.stringify(history.slice(0, 50)))
    } catch (err) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    const img = generatedImage?.dataUrl || generatedImage?.url
    if (!img) return
    const a = document.createElement('a')
    a.href = img
    a.download = `nanogen-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(prompt)
  }

  const retry = () => {
    setError(null)
    generateImage()
  }

  useEffect(() => {
    const current = generatedImage?.url
    return () => {
      if (current) URL.revokeObjectURL(current)
    }
  }, [generatedImage?.url])

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

        <button
          className="btn-primary"
          onClick={generateImage}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? '⏳ ' + t('common.loading') : '🎨 ' + t('generator.generate')}
        </button>

        {error && (
          <div style={{marginTop: '1rem', textAlign: 'center'}}>
            <p style={{color: 'var(--error)', fontSize: '0.9rem', wordBreak: 'break-word', marginBottom: '0.5rem'}}>
              {error}
            </p>
            <button className="btn-secondary" onClick={retry}>
              🔄 Réessayer
            </button>
          </div>
        )}
      </div>

      <div className="image-preview">
        {isGenerating ? (
          <div className="loading-spinner"></div>
        ) : generatedImage ? (
          <>
            <img
              ref={previewRef}
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
                const img = generatedImage.dataUrl || generatedImage.url
                navigator.share?.({
                  title: 'NanoGen',
                  text: generatedImage.prompt,
                  url: img
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
