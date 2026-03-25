import { ObjectId } from 'mongodb'
import { getDb } from '../lib/mongodb.js'
import { getUserFromRequest, cors } from '../lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })

  try {
    const db = await getDb()
    const user = await db.collection('users').findOne({ _id: new ObjectId(payload.id) })
    if (!user) return res.status(404).json({ error: 'User not found' })

    res.status(200).json({
      user: { id: user._id.toString(), email: user.email, user_metadata: { full_name: user.full_name } }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
