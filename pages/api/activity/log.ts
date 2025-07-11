import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, type, details } = req.body;
  if (!userId || !type) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const client = await clientPromise;
  const db = client.db();
  await db.collection('activity').insertOne({
    userId,
    type,
    details,
    timestamp: new Date(),
  });
  res.status(201).json({ message: 'Activity logged' });
} 