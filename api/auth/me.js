import { ObjectId } from 'mongodb'
import { getDb } from '../lib/mongodb.js'
import { getUserFromRequest, cors } from '../lib/auth.js'

const FALLBACK_USER = {
  id: 'paotabs-default-user',
  username: 'paotabs',
  full_name: 'Paolo Tabuso',
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })

  // Handle fallback user
  if (payload.id === FALLBACK_USER.id || payload.username === FALLBACK_USER.username) {
    return res.status(200).json({ user: FALLBACK_USER })
  }

  try {
    if (!payload.id || !ObjectId.isValid(payload.id)) {
      return res.status(401).json({ error: 'Invalid session. Please sign in again.' })
    }

    const db = await getDb()
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id) })

    if (!user) {
      return res.status(404).json({ error: 'User not found. Please sign in again.' })
    }

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        username: user.username,
        full_name: user.full_name || user.username
      }
    })
  } catch (err) {
    console.error('me error:', err.message)
    return res.status(500).json({ error: 'Unable to verify session. Please try again.' })
  }
}
