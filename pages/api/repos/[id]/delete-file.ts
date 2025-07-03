import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../../lib/mongodb';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const { filename } = req.body;
  if (!id || typeof id !== 'string' || !filename || typeof filename !== 'string') {
    return res.status(400).json({ message: 'Invalid repository ID or filename' });
  }

  const client = await clientPromise;
  const db = client.db();
  const files = db.collection('files');
  const result = await files.deleteOne({ repoId: id, filename });
  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Delete file from disk
  const filePath = path.join(process.cwd(), 'public', 'uploads', id, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  return res.status(200).json({ message: 'File deleted' });
} 