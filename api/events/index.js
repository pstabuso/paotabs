import { getDb } from '../lib/mongodb.js'
import { getUserFromRequest, cors } from '../lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })

  const db = await getDb()
  const col = db.collection('events')

  try {
    if (req.method === 'GET') {
      const docs = await col.find({ user_id: payload.id }).sort({ event_date: 1 }).toArray()
      return res.status(200).json(docs.map(d => ({ ...d, id: d._id.toString(), _id: undefined })))
    }

    if (req.method === 'POST') {
      const doc = {
        ...req.body,
        user_id: payload.id,
        created_at: new Date().toISOString()
      }
      const result = await col.insertOne(doc)
      return res.status(201).json({ ...doc, id: result.insertedId.toString(), _id: undefined })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
