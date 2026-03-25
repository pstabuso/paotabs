import { ObjectId } from 'mongodb'
import { getDb } from '../lib/mongodb.js'
import { getUserFromRequest, cors } from '../lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query
  if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid ID' })

  try {
    if (req.method === 'DELETE') {
      const db = await getDb()
      await db.collection('events').deleteOne({ _id: new ObjectId(id), user_id: payload.id })
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
