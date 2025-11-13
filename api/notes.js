const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  const { username } = req.query;
  try {
    await client.connect();
    const db = client.db('studentapp');

    if (req.method === 'GET') {
      const notes = await db.collection('notes').find({ username }).toArray();
      res.status(200).json(notes);
    } else if (req.method === 'POST') {
      const { text } = req.body;
      await db.collection('notes').insertOne({ username, text });
      res.status(201).json({ success: true });
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      await db.collection('notes').deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
