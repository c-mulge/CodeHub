import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { hash } from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const client = await clientPromise;
  const db = client.db();
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await hash(password, 10);

  await users.insertOne({
    name,
    email,
    password: hashedPassword,
  });

  return res.status(201).json({ message: "User registered successfully" });
}