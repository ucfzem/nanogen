import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase'

function Community({ t, language, userEmail }) {
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    setIsLoading(true)
    
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (!error && data) {
          setPosts(data)
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      const localPosts = JSON.parse(localStorage.getItem('nanogen_posts') || '[]')
      setPosts(localPosts)
    }
    
    setIsLoading(false)
  }

  const handlePublish = async () => {
    if (!newPost.trim()) return
    if (!userEmail) {
      alert(t('community.loginRequired'))
      return
    }

    setIsPosting(true)
    
    const post = {
      author: userEmail.split('@')[0],
      email: userEmail,
      content: newPost,
      image_url: null,
      tags: [],
      likes: 0,
      created_at: new Date().toISOString()
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert([post])
          .select()
        
        if (!error && data) {
          setPosts([data[0], ...posts])
          setNewPost('')
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      const localPosts = JSON.parse(localStorage.getItem('nanogen_posts') || '[]')
      const newPostWithId = { ...post, id: Date.now().toString() }
      localPosts.unshift(newPostWithId)
      localStorage.setItem('nanogen_posts', JSON.stringify(localPosts))
      setPosts([newPostWithId, ...posts])
      setNewPost('')
    }
    
    setIsPosting(false)
  }

  const handleLike = async (postId) => {
    if (isSupabaseConfigured()) {
      const post = posts.find(p => p.id === postId)
      if (post) {
        await supabase
          .from('posts')
          .update({ likes: (post.likes || 0) + 1 })
          .eq('id', postId)
        
        setPosts(posts.map(p => 
          p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
        ))
      }
    } else {
      const localPosts = JSON.parse(localStorage.getItem('nanogen_posts') || '[]')
      const updated = localPosts.map(p => 
        p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p
      )
      localStorage.setItem('nanogen_posts', JSON.stringify(updated))
      setPosts(updated)
    }
  }

  return (
    <div className="community-container">
      <h2>{t('community.title')}</h2>
      
      <div className="post-form">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder={t('community.placeholder')}
          style={{
            width: '100%',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            padding: '1rem',
            borderRadius: 'var(--radius)',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit',
            marginBottom: '1rem'
          }}
        />
        <button
          className="btn-primary"
          onClick={handlePublish}
          disabled={isPosting || !newPost.trim()}
        >
          {isPosting ? t('common.loading') : t('community.publish')}
        </button>
      </div>

      {isLoading ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>
          <div className="loading-spinner" style={{margin: '0 auto'}}></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>Soyez le premier à publier !</p>
        </div>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <span className="post-author">@{post.author}</span>
              <span className="post-date">
                {new Date(post.created_at).toLocaleDateString(language)}
              </span>
            </div>
            
            <div className="post-content">{post.content}</div>
            
            {post.image_url && (
              <img src={post.image_url} alt="" className="post-image" />
            )}
            
            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
            )}
            
            <div className="post-actions">
              <button className="action-btn" onClick={() => handleLike(post.id)}>
                ❤️ {post.likes || 0} {t('community.likes')}
              </button>
              <button className="action-btn">
                💬 {t('community.comments')}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Community
