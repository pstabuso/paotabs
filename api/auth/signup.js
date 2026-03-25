import bcrypt from 'bcryptjs'
import { getDb } from '../lib/mongodb.js'
import { signToken, cors } from '../lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body || {}
    const { email, password, fullName } = body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const db = await getDb()
    const users = db.collection('users')

    const existing = await users.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      full_name: fullName || '',
      created_at: new Date().toISOString()
    }

    const result = await users.insertOne(user)
    const token = signToken({ id: result.insertedId.toString(), email: user.email })

    return res.status(201).json({
      token,
      user: {
        id: result.insertedId.toString(),
        email: user.email,
        user_metadata: { full_name: user.full_name }
      }
    })
  } catch (err) {
    console.error('signup error:', err.message)
    return res.status(500).json({ error: 'Unable to create account. Please try again.' })
  }
}
