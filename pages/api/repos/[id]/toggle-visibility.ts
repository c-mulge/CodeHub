import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const { isPublic } = req.body;
  if (!id || typeof id !== 'string' || typeof isPublic !== 'boolean') {
    return res.status(400).json({ message: 'Invalid request' });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');
  const user = await users.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const repos = db.collection('repositories');
  const repo = await repos.findOne({ _id: new ObjectId(id) });
  if (!repo) {
    return res.status(404).json({ message: 'Repository not found' });
  }
  if (repo.ownerId !== user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  await repos.updateOne({ _id: new ObjectId(id) }, { $set: { isPublic } });
  return res.status(200).json({ message: 'Visibility updated', isPublic });
} 