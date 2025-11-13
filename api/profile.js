const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  const { username } = req.query;
  try {
    await client.connect();
    const db = client.db('studentapp');

    if (req.method === 'PUT') { // Update profile
      const { fullname, newUsername, password, kelas } = req.body;
      await db.collection('users').updateOne({ username }, { $set: { fullname, username: newUsername, password, kelas } });
      res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') { // Delete account
      await db.collection('users').deleteOne({ username });
      await db.collection('notes').deleteMany({ username });
      res.status(200).json({ success: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
