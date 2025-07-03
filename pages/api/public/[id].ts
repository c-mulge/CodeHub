import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid repository ID' });
  }

  const client = await clientPromise;
  const db = client.db();
  const repos = db.collection('repositories');
  const repo = await repos.findOne({ _id: new ObjectId(id), isPublic: true });
  if (!repo) {
    return res.status(404).json({ message: 'Public repository not found' });
  }
  const files = await db.collection('files').find({ repoId: id }).sort({ uploadedAt: -1 }).toArray();
  return res.status(200).json({ repo, files });
}
