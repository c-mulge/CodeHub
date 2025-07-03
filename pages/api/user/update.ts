import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import clientPromise from '../../../lib/mongodb';
import { hash } from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { name, password } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection('users');
  const update: any = { name };
  if (password) {
    update.password = await hash(password, 10);
  }
  await users.updateOne({ email: session.user.email }, { $set: update });
  return res.status(200).json({ message: 'Profile updated', name, email: session.user.email });
} 