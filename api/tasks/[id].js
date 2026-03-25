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

  const db = await getDb()
  const col = db.collection('tasks')

  try {
    if (req.method === 'PUT') {
      const updates = { ...req.body, updated_at: new Date().toISOString() }
      delete updates.id
      delete updates._id
      delete updates.user_id
      const result = await col.findOneAndUpdate(
        { _id: new ObjectId(id), user_id: payload.id },
        { $set: updates },
        { returnDocument: 'after' }
      )
      if (!result) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ ...result, id: result._id.toString(), _id: undefined })
    }

    if (req.method === 'DELETE') {
      await col.deleteOne({ _id: new ObjectId(id), user_id: payload.id })
      return res.status(200).json({ success: true })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
