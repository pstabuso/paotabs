import { getDb } from '../lib/mongodb.js'
import { getUserFromRequest, cors } from '../lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const payload = getUserFromRequest(req)
  if (!payload) return res.status(401).json({ error: 'Unauthorized' })

  const db = await getDb()
  const col = db.collection('tasks')

  try {
    if (req.method === 'GET') {
      const tasks = await col.find({ user_id: payload.id }).sort({ created_at: -1 }).toArray()
      const mapped = tasks.map(t => ({ ...t, id: t._id.toString(), _id: undefined }))
      return res.status(200).json(mapped)
    }

    if (req.method === 'POST') {
      const task = {
        ...req.body,
        user_id: payload.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const result = await col.insertOne(task)
      return res.status(201).json({ ...task, id: result.insertedId.toString(), _id: undefined })
    }

    res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
}
