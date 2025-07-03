import type { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-pics');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'));
  },
});

const upload = multer({ storage });

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, _req, res) {
    res.status(501).json({ error: `Upload error: ${error.message}` });
  },
  onNoMatch(_req, res) {
    res.status(405).json({ error: `Method Not Allowed` });
  },
});

apiRoute.use(upload.single('profilePic'));

apiRoute.post((req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `/uploads/profile-pics/${req.file.filename}`;
  res.status(200).json({ url });
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apiRoute; 