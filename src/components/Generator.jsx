import React, { useState } from 'react'

const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY || ''
const REPLICATE_TOKEN = import.meta.env.VITE_REPLICATE_TOKEN || ''

const hasApiKey = () => REPLICATE_API_KEY || REPLICATE_TOKEN

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

  const getDimensions = (r) => {
    const map = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1280, height: 720 },
      '9:16': { width: 720, height: 1280 },
      '4:3': { width: 1024, height: 768 }
    }
    return map[r] || map['1:1']
  }

  const enhancePrompt = () => {
    if (!prompt.trim()) return
    setIsEnhancing(true)
    const enh = STYLE_PROMPTS[style] || STYLE_PROMPTS.realistic
    setTimeout(() => {
      setPrompt(enh + prompt)
      setIsEnhancing(false)
    }, 800)
  }

  const generateWithReplicate = async (fullPrompt) => {
    const dims = getDimensions(ratio)
    const apiKey = REPLICATE_API_KEY || REPLICATE_TOKEN

    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          prompt: fullPrompt,
          go_fast: true,
          num_outputs: 1,
          aspect_ratio: ratio,
          output_format: 'webp',
        }
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.detail || `API error ${response.status}`)
    }

    const prediction = await response.json()

    // Poll until complete
    let result = prediction
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1000))
      const res = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      result = await res.json()
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Generation failed')
    }

    const imageUrl = result.output?.[0] || result.output
    if (!imageUrl) throw new Error('No image in response')
    return imageUrl
  }

  const generateImage = async () => {
    if (!prompt.trim() || !canGenerate()) return

    setIsGenerating(true)
    setError(null)

    try {
      const fullPrompt = `${STYLE_PROMPTS[style] || ''}${prompt}`

      if (hasApiKey()) {
        const imageUrl = await generateWithReplicate(fullPrompt)
        saveImage(imageUrl)
      } else {
        setError('Configurez une clé Replicate (gratuite) dans Settings > Environment Variables > VITE_REPLICATE_API_KEY')
        setIsGenerating(false)
      }
    } catch (err) {
      setError(err.message)
      setIsGenerating(false)
    }
  }

  const saveImage = (imageUrl) => {
    const img = new Image()
    img.onload = () => {
      setGeneratedImage({ url: imageUrl, prompt, style, ratio, timestamp: Date.now() })
      setIsGenerating(false)
      onGeneration()
      const history = JSON.parse(localStorage.getItem('nanogen_history') || '[]')
      history.unshift({ url: imageUrl, prompt, style, ratio, timestamp: Date.now() })
      localStorage.setItem('nanogen_history', JSON.stringify(history.slice(0, 50)))
    }
    img.onerror = () => {
      setError("L'image générée n'a pas pu être chargée.")
      setIsGenerating(false)
    }
    img.src = imageUrl
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
