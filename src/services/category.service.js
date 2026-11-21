const CATEGORIES = [
  { name: 'Graphics & Design', slug: 'graphics-design' },
  { name: 'Programming & Tech', slug: 'programming-tech' },
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Video & Animation', slug: 'video-animation' },
  { name: 'Writing & Translation', slug: 'writing-translation' },
  { name: 'Music & Audio', slug: 'music-audio' },
  { name: 'Business', slug: 'business' },
  { name: 'AI Services', slug: 'ai-services' },
]

export const categoryService = {
  getCategories,
  getCategoryName,
}

function getCategories() {
  return CATEGORIES
}

function getCategoryName(slug) {
  return CATEGORIES.find((category) => category.slug === slug)?.name || slug
}
