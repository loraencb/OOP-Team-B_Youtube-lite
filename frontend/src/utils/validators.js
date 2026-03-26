/**
 * Form validation utilities. Returns an error string or null if valid.
 */

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required'
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!re.test(email.trim())) return 'Please enter a valid email address'
  return null
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return null
}

export function validatePasswordConfirm(password, confirm) {
  if (!confirm) return 'Please confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return null
}

export function validateUsername(username) {
  if (!username || !username.trim()) return 'Username is required'
  if (username.trim().length < 3) return 'Username must be at least 3 characters'
  if (username.trim().length > 30) return 'Username must be 30 characters or fewer'
  if (!/^[a-zA-Z0-9_.-]+$/.test(username.trim())) {
    return 'Username can only contain letters, numbers, underscores, dots, and hyphens'
  }
  return null
}

export function validateRequired(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`
  }
  return null
}

export function validateVideoTitle(title) {
  if (!title || !title.trim()) return 'Title is required'
  if (title.trim().length < 3) return 'Title must be at least 3 characters'
  if (title.trim().length > 100) return 'Title must be 100 characters or fewer'
  return null
}

/**
 * Run a set of validators against a form values object.
 * @param {Object} values - form field values
 * @param {Object} rules - { fieldName: validatorFn }
 * @returns {Object} errors - { fieldName: errorString }
 */
export function validateForm(values, rules) {
  const errors = {}
  for (const [field, validate] of Object.entries(rules)) {
    const error = validate(values[field], values)
    if (error) errors[field] = error
  }
  return errors
}
