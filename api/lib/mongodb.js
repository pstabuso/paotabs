import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set')
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 45000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
  tls: true,
}

let clientPromise

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}
clientPromise = global._mongoClientPromise

export async function getDb() {
  const client = await clientPromise
  return client.db('paotabs')
}

// Safe version that returns null instead of throwing
export async function getDbSafe() {
  try {
    const client = await clientPromise
    return client.db('paotabs')
  } catch {
    return null
  }
}

export default clientPromise
