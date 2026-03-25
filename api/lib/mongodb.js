import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
let client
let clientPromise

if (!uri) {
  throw new Error('MONGODB_URI environment variable is not set')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export async function getDb() {
  const client = await clientPromise
  return client.db('paotabs')
}

export default clientPromise
