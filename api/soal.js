const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  try {
    await client.connect();
    const db = client.db('studentapp');

    if (req.method === 'GET') {
      const soal = await db.collection('soal').find().toArray();
      res.status(200).json(soal);
    } else if (req.method === 'POST') {
      const { question, options, answers, type, createdBy } = req.body;
      if (!question || !options || !answers || !type || !createdBy) {
        return res.status(400).json({ error: 'All fields required' });
      }
      await db.collection('soal').insertOne({ question, options, answers, type, createdBy, timestamp: new Date() });
      res.status(201).json({ success: true });
    } else if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID required' });
      await db.collection('soal').deleteOne({ _id: new ObjectId(id) });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Soal API error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
