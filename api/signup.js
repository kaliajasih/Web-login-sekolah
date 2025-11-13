const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fullname, username, password, kelas } = req.body;
  try {
    await client.connect();
    const db = client.db('studentapp');
    const existingUser = await db.collection('users').findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    await db.collection('users').insertOne({ fullname, username, password, kelas });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
