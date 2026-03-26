// ═══ API ═══
export const API_BASE_URL = '/api'

// ═══ SUBSCRIPTION TIERS ═══
export const TIERS = {
  FREE: 'free',
  MID: 'mid',
  PREMIUM: 'premium',
}

export const TIER_LABELS = {
  [TIERS.FREE]: 'Free',
  [TIERS.MID]: 'Plus',
  [TIERS.PREMIUM]: 'Premium',
}

export const TIER_FEATURES = {
  [TIERS.FREE]: {
    label: 'Free',
    price: 0,
    features: [
      'Access to free videos',
      'Basic progress tracking',
      'Community comments',
      'Standard video quality',
    ],
    limitations: ['Ads shown', 'Limited quiz attempts', 'No offline access'],
    color: 'var(--color-tier-free)',
  },
  [TIERS.MID]: {
    label: 'Plus',
    price: 9.99,
    features: [
      'Everything in Free',
      'Ad-free experience',
      'Unlimited quiz attempts',
      'HD video quality',
      'Download for offline',
      'Priority support',
    ],
    limitations: ['Some premium content locked'],
    color: 'var(--color-tier-mid)',
  },
  [TIERS.PREMIUM]: {
    label: 'Premium',
    price: 19.99,
    features: [
      'Everything in Plus',
      'All premium content unlocked',
      'AI-powered quiz generation',
      '4K video quality',
      'Creator analytics dashboard',
      'Custom learning paths',
      'Completion certificates',
      'Early access to new features',
    ],
    limitations: [],
    color: 'var(--color-tier-premium)',
  },
}

// ═══ USER ROLES ═══
export const ROLES = {
  VIEWER: 'viewer',
  CREATOR: 'creator',
  ADMIN: 'admin',
}

// ═══ VIDEO CATEGORIES ═══
export const CATEGORIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'science', label: 'Science' },
  { value: 'arts', label: 'Arts & Crafts' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'business', label: 'Business' },
  { value: 'language', label: 'Language Learning' },
  { value: 'diy', label: 'DIY & Home Improvement' },
  { value: 'math', label: 'Mathematics' },
  { value: 'music', label: 'Music' },
  { value: 'photography', label: 'Photography' },
  { value: 'writing', label: 'Writing' },
]

// ═══ PAGINATION ═══
export const PAGE_SIZE = 12

// ═══ DEBOUNCE ═══
export const SEARCH_DEBOUNCE_MS = 300

// ═══ VIDEO PLAYER ═══
export const PROGRESS_SAVE_INTERVAL_MS = 5000   // save progress every 5s
export const COMPLETION_THRESHOLD = 0.9          // 90% watched = "completed"

// ═══ QUIZ ═══
// TODO: TEAM DECISION NEEDED
// Quiz generation service: OpenAI GPT-4, Anthropic Claude, or custom?
// For now using mock quiz data structure
export const QUIZ_PASS_SCORE = 70  // 70% to pass

// ═══ LOCAL STORAGE KEYS ═══
export const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'howtoob_sidebar_collapsed',
  THEME: 'howtoob_theme',
}
