import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Missing search query' });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = await db.collection('users').find({
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
    ],
  }).toArray();
  const repos = await db.collection('repositories').find({ isPublic: true }).toArray();

  const userList = users.map(user => ({
    name: user.name,
    email: user.email,
    repos: repos.filter(r => r.ownerId === user._id.toString()).map(r => ({
      id: r._id,
      name: r.name,
      description: r.description,
    })),
  }));

  res.status(200).json({ users: userList });
} 