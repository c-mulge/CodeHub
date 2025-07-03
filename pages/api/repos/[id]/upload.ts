import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from "next-connect";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import clientPromise from '../../../../lib/mongodb';

// Ensure upload directory exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { id } = req.query;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', String(id));
      ensureDir(uploadDir);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    },
  }),
});

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    res.status(501).json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.array('files'));

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

apiRoute.post(async (req: any, res: NextApiResponse) => {
  const { id } = req.query;
  const filesArr = req.files;
  if (!filesArr || !filesArr.length) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const client = await clientPromise;
  const db = client.db();
  const filesCol = db.collection('files');
  const uploadedFiles = [];
  for (const file of filesArr) {
    const sanitizedOriginalName = sanitizeFileName(file.originalname);
    // Check for duplicate
    const exists = await filesCol.findOne({ repoId: id, originalname: sanitizedOriginalName });
    if (exists) {
      continue; // Skip duplicate
    }
    const fileDoc = {
      repoId: id,
      filename: file.filename,
      originalname: sanitizedOriginalName,
      mimetype: file.mimetype,
      size: file.size,
      uploadedAt: new Date(),
    };
    await filesCol.insertOne(fileDoc);
    uploadedFiles.push(fileDoc);
  }
  if (uploadedFiles.length === 0) {
    return res.status(409).json({ message: 'All files are duplicates' });
  }
  res.status(201).json({ message: 'Files uploaded', files: uploadedFiles });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute; 