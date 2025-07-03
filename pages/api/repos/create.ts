import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { name, description, isPublic } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Repository name is required' });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');
  const user = await users.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const repos = db.collection('repositories');
  const existingRepo = await repos.findOne({ ownerId: user._id.toString(), name });
  if (existingRepo) {
    return res.status(409).json({ message: 'Repository with this name already exists' });
  }

  const repo = {
    name,
    description: description || '',
    ownerId: user._id.toString(),
    createdAt: new Date(),
    isPublic: !!isPublic,
  };
  await repos.insertOne(repo);
  return res.status(201).json({ message: 'Repository created', repo });
} 