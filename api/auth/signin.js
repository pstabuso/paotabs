import bcrypt from 'bcryptjs'
import { getDb } from '../lib/mongodb.js'
import { signToken, cors } from '../lib/auth.js'

// Hardcoded fallback user — always works even if MongoDB is down
const FALLBACK_USER = {
  username: 'paotabs',
  // bcrypt hash of 'paotabs123'
  password: '$2a$10$FALLBACK',
  rawPassword: 'paotabs123',
  full_name: 'Paolo Tabuso',
  id: 'paotabs-default-user',
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body || {}
    const { username, password } = body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }

    const normalizedUsername = username.toLowerCase().trim()

    // Check fallback user first
    if (normalizedUsername === FALLBACK_USER.username && password === FALLBACK_USER.rawPassword) {
      const token = signToken({ id: FALLBACK_USER.id, username: FALLBACK_USER.username })
      return res.status(200).json({
        token,
        user: {
          id: FALLBACK_USER.id,
          username: FALLBACK_USER.username,
          full_name: FALLBACK_USER.full_name,
        }
      })
    }

    // Try MongoDB
    const db = await getDb()
    const user = await db.collection('users').findOne({ username: normalizedUsername })

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = signToken({ id: user._id.toString(), username: user.username })

    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        full_name: user.full_name || user.username
      }
    })
  } catch (err) {
    console.error('signin error:', err.message)

    // If MongoDB failed but user is the fallback, still let them in
    const body = req.body || {}
    if (body.username?.toLowerCase().trim() === FALLBACK_USER.username && body.password === FALLBACK_USER.rawPassword) {
      const token = signToken({ id: FALLBACK_USER.id, username: FALLBACK_USER.username })
      return res.status(200).json({
        token,
        user: {
          id: FALLBACK_USER.id,
          username: FALLBACK_USER.username,
          full_name: FALLBACK_USER.full_name,
        }
      })
    }

    return res.status(500).json({ error: 'Unable to sign in. Please try again.' })
  }
}
