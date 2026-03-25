import bcrypt from 'bcryptjs'
import { getDb } from '../lib/mongodb.js'
import { signToken, cors } from '../lib/auth.js'

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

    const db = await getDb()
    const user = await db.collection('users').findOne({ username: username.toLowerCase().trim() })

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
    return res.status(500).json({ error: 'Unable to sign in. Please try again.' })
  }
}
