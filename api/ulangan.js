const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  try {
    await client.connect();
    const db = client.db('studentapp');

    if (req.method === 'POST') {
      const { username, score, totalQuestions } = req.body;
      if (!username || score === undefined || !totalQuestions) {
        return res.status(400).json({ error: 'Username, score, and totalQuestions required' });
      }

      await db.collection('results').insertOne({
        username,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        timestamp: new Date()
      });

      const notificationForStudent = `Hai ${username}, kamu mendapat nilai ${Math.round((score / totalQuestions) * 100)}% di ulangan!`;
      const notificationForTeacher = `Murid ${username} menyelesaikan ulangan dengan nilai ${Math.round((score / totalQuestions) * 100)}%.`;

      await db.collection('notifications').insertMany([
        { recipient: username, message: notificationForStudent, type: 'student', timestamp: new Date() },
        { recipient: 'guru', message: notificationForTeacher, type: 'teacher', timestamp: new Date() }
      ]);

      res.status(201).json({ success: true, message: 'Hasil ulangan disimpan dan notifikasi dikirim!' });
    } else if (req.method === 'GET') {
      const { username } = req.query;
      if (!username) return res.status(400).json({ error: 'Username required' });

      const notifications = await db.collection('notifications').find({ recipient: username }).sort({ timestamp: -1 }).toArray();
      res.status(200).json(notifications);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Ulangan API error:', error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
