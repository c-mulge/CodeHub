import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid repository ID' });
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

  // Delete all files from DB
  await db.collection('files').deleteMany({ repoId: id });
  // Delete repo from DB
  await repos.deleteOne({ _id: new ObjectId(id) });
  // Delete files from disk
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', id);
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }

  return res.status(200).json({ message: 'Repository deleted' });
} 