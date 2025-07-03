import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');
  const user = await users.findOne({ email: session.user.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json({ name: user.name, email: user.email });
} 