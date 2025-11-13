const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  const { username } = req.query;
  try {
    await client.connect();
    const db = client.db('studentapp');

    if (req.method === 'PUT') {
      const { fullname, newUsername, password, kelas } = req.body;
      const updateData = { fullname, username: newUsername, kelas };
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      await db.collection('users').updateOne({ username }, { $set: updateData });
      res.status(200).json({ success: true });
    } else if (req.method === 'DELETE') {
      await db.collection('users').deleteOne({ username });
      await db.collection('notes').deleteMany({ username });
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
