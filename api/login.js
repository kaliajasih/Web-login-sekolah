const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI; // Ambil dari environment variable
const client = new MongoClient(uri);

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  try {
    await client.connect();
    const db = client.db('studentapp');
    const user = await db.collection('users').findOne({ username, password });
    if (user) {
      res.status(200).json({ success: true, user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
