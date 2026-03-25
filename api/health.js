import { cors } from './lib/auth.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(200).end()

  const checks = {
    env_mongodb: !!process.env.MONGODB_URI,
    env_jwt: !!process.env.JWT_SECRET,
    mongodb_uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'NOT SET',
    node_env: process.env.NODE_ENV || 'not set',
  }

  // Try MongoDB connection
  try {
    const { getDb } = await import('./lib/mongodb.js')
    const db = await getDb()
    const collections = await db.listCollections().toArray()
    checks.mongodb_connected = true
    checks.mongodb_collections = collections.map(c => c.name)
    checks.mongodb_db = db.databaseName
  } catch (err) {
    checks.mongodb_connected = false
    checks.mongodb_error = err.message
    checks.mongodb_error_name = err.name
  }

  return res.status(200).json(checks)
}
