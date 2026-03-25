import bcrypt from 'bcryptjs'
import { getDb } from '../lib/mongodb.js'
import { signToken, cors } from '../lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body || {}
    const { username, password, fullName } = body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' })
    }
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, and underscores' })
    }

    const db = await getDb()
    const users = db.collection('users')

    const existing = await users.findOne({ username: username.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      full_name: fullName || username,
      created_at: new Date().toISOString()
    }

    const result = await users.insertOne(user)
    const token = signToken({ id: result.insertedId.toString(), username: user.username })

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        username: user.username,
        full_name: user.full_name
      }
    })
  } catch (err) {
    console.error('signup error:', err.message)
    return res.status(500).json({ error: 'Unable to create account. Please try again.' })
  }
}
