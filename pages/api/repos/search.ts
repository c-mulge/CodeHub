import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q } = req.query;
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: 'Missing search query' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Search for public repositories by name or description
    const repositories = await db.collection('repositories').find({
      $and: [
        { isPublic: true }, // Only search public repositories
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).limit(10).toArray(); // Limit to 10 results for performance

    // Get owner information for each repository
    const reposWithOwners = await Promise.all(
      repositories.map(async (repo: any) => {
        const owner = await db.collection('users').findOne({ _id: repo.ownerId });
        return {
          id: repo._id,
          name: repo.name,
          description: repo.description,
          isPublic: repo.isPublic,
          createdAt: repo.createdAt,
          owner: owner ? {
            name: owner.name,
            email: owner.email
          } : null
        };
      })
    );

    res.status(200).json({ repositories: reposWithOwners });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}