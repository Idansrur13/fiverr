import { createHandler, HttpError } from '../_lib/http.js'
import { prisma } from '../_lib/prisma.js'
import { ME_SELECT, requireAppUser } from '../_lib/auth.js'

const FULLNAME_MAX_LENGTH = 80
const ABOUT_MAX_LENGTH = 600
const COUNTRY_MAX_LENGTH = 60
const LANGUAGES_MAX_COUNT = 10

export default createHandler({
  async GET(req, res) {
    const user = await requireAppUser(req)
    return res.status(200).json(user)
  },

  async PATCH(req, res) {
    const appUser = await requireAppUser(req)
    const data = getProfileChanges(req.body ?? {})
    const user = await prisma.user.update({
      where: { id: appUser.id },
      data,
      select: ME_SELECT,
    })
    return res.status(200).json(user)
  },
})

function getProfileChanges({ fullname, about, country, languages }) {
  const data = {}

  if (fullname !== undefined) {
    if (typeof fullname !== 'string' || !fullname.trim()) {
      throw new HttpError(400, 'fullname must be a non empty string')
    }
    if (fullname.trim().length > FULLNAME_MAX_LENGTH) {
      throw new HttpError(400, `fullname must be up to ${FULLNAME_MAX_LENGTH} characters`)
    }
    data.fullname = fullname.trim()
  }

  if (about !== undefined) data.about = getOptionalText(about, 'about', ABOUT_MAX_LENGTH)
  if (country !== undefined) data.country = getOptionalText(country, 'country', COUNTRY_MAX_LENGTH)

  if (languages !== undefined) {
    const isValid =
      Array.isArray(languages) &&
      languages.length <= LANGUAGES_MAX_COUNT &&
      languages.every((language) => typeof language === 'string' && language.trim())
    if (!isValid) {
      throw new HttpError(400, `languages must be up to ${LANGUAGES_MAX_COUNT} non empty strings`)
    }
    data.languages = [...new Set(languages.map((language) => language.trim()))]
  }

  return data
}

function getOptionalText(value, field, maxLength) {
  if (value === null) return null
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string or null`)
  if (value.trim().length > maxLength) {
    throw new HttpError(400, `${field} must be up to ${maxLength} characters`)
  }
  return value.trim() || null
}
