import React, { useState } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'

function EmailGate({ t, onSubmit, onClose }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !email.includes('@')) {
      setError('Email invalide')
      return
    }

    setIsSubmitting(true)
    setError(null)

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('emails')
          .insert([{ email: email }])
      } catch (err) {
        console.error(err)
      }
    }

    onSubmit(email)
    setIsSubmitting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <h2>{t('emailGate.title')}</h2>
        <p>{t('emailGate.subtitle')}</p>
        
        <div className="modal-benefits">
          {t('emailGate.benefits')}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailGate.email')}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div style={{color: 'var(--error)', marginBottom: '1rem', fontSize: '0.9rem'}}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('emailGate.submit')}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EmailGate
