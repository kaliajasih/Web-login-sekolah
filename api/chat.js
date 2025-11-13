const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  try {
    await client.connect();
    const db = client.db('studentapp');

    if (req.method === 'GET') {
      const messages = await db.collection('chat').find().sort({ timestamp: 1 }).toArray();
      res.status(200).json(messages);
    } else if (req.method === 'POST') {
      const { user, text } = req.body;
      await db.collection('chat').insertOne({ user, text, timestamp: new Date() });
      res.status(201).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
