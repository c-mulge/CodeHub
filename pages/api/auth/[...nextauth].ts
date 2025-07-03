import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../lib/mongodb";
import { compare } from "bcryptjs";
import { getServerSession } from 'next-auth/next';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const client = await clientPromise;
        const users = client.db().collection("users");
        const user = await users.findOne({ email: credentials?.email });

        if (user && credentials?.password) {
          const isValid = await compare(credentials.password, user.password);
          if (isValid) {
            return { id: user._id.toString(), email: user.email, name: user.name };
          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);