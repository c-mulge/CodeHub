import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../../lib/mongodb';

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
  const files = db.collection('files');
  const repoFiles = await files.find({ repoId: id }).sort({ uploadedAt: -1 }).toArray();
  return res.status(200).json({ files: repoFiles });
} 