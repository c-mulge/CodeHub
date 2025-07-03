import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

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
  const repos = await db.collection('repositories')
    .find({
      isPublic: true,
      name: { $regex: q, $options: 'i' },
    })
    .toArray();

  // Convert ownerIds to ObjectId for user lookup
  const ownerIds = repos.map(r => r.ownerId).filter(Boolean).map(id => new ObjectId(id));
  const users = ownerIds.length > 0
    ? await db.collection('users').find({ _id: { $in: ownerIds } }).toArray()
    : [];
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u.name]));

  const repoList = repos.map(repo => ({
    id: repo._id,
    name: repo.name,
    description: repo.description,
    ownerId: repo.ownerId,
    ownerName: userMap[repo.ownerId] || '',
  }));

  res.status(200).json({ repositories: repoList });
} 