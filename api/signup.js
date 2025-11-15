const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fullname, username, password, kelas } = req.body;

  try {
    if (!uri) {
      console.error("MONGODB_URI environment variable is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    await client.connect();
    const db = client.db('studentapp');

    console.log(`Checking if user exists: ${username}`);
    const existingUser = await db.collection('users').findOne({ username });

    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({ fullname, username, password: hashedPassword, kelas });
    console.log("User created successfully");

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: 'Server error' });
  } finally {
    await client.close();
  }
};
