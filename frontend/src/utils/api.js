/**
 * API utility - thin wrappers around fetch() for the HowToob Flask backend.
 * All requests include credentials (session cookies for Flask-Login).
 */

const API_BASE = ''  // Vite proxy handles /auth, /videos, /social, /users → localhost:5000

// Core request helper

async function request(method, path, body = null, isFormData = false) {
  const options = {
    method,
    credentials: 'include',  // send session cookies
    headers: {},
  }

  if (body) {
    if (isFormData) {
      // Let browser set multipart/form-data boundary automatically
      options.body = body
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
  }

  const response = await fetch(`${API_BASE}${path}`, options)

  // Parse JSON regardless of status so error bodies are available
  let data
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    data = await response.json()
  } else {
    data = { message: await response.text() }
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed: ${response.status}`
    throw new Error(message)
  }

  return data
}

// Auth

export const authAPI = {
  register: (username, email, password, role) =>
    request('POST', '/auth/register', { username, email, password, role }),

  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  logout: () =>
    request('POST', '/auth/logout'),

  me: () =>
    request('GET', '/auth/me'),
}

// Videos

export const videosAPI = {
  getFeed: (page = 1, limit = 12, search = null) => {
    const params = new URLSearchParams({ page, limit })
    if (search) params.set('search', search)
    return request('GET', `/videos/feed?${params}`)
  },

  getById: (videoId) =>
    request('GET', `/videos/${videoId}`),

  getStats: (videoId) =>
    request('GET', `/videos/${videoId}/stats`),

  getByCreator: (userId) =>
    request('GET', `/videos/creator/${userId}`),

  upload: (formData) =>
    request('POST', '/videos/upload', formData, true),

  update: (videoId, data) =>
    request('PUT', `/videos/${videoId}`, data),

  delete: (videoId) =>
    request('DELETE', `/videos/${videoId}`),
}

// Social

export const socialAPI = {
  getComments: (videoId) =>
    request('GET', `/social/comments/${videoId}`),

  addComment: (videoId, content) =>
    request('POST', '/social/comments', { video_id: videoId, content }),

  toggleLike: (videoId) =>
    request('POST', '/social/likes/toggle', { video_id: videoId }),

  subscribe: (creatorId) =>
    request('POST', '/social/subscribe', { creator_id: creatorId }),
}

// Users

export const usersAPI = {
  getSubscriptions: (userId) =>
    request('GET', `/users/${userId}/subscriptions`),
}
