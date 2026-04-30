import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// -------------------------------------------------------
// authOptions — การตั้งค่าหลักของ NextAuth
// ใช้ Credentials Provider (email + password)
// เซสชันเก็บแบบ JWT (ไม่ใช้ database session)
// -------------------------------------------------------
export const authOptions: NextAuthOptions = {
  providers: [
    /**
     * CredentialsProvider — รับ email และ password จากฟอร์ม
     * แล้ว verify กับ database
     */
    CredentialsProvider({
      name: "Credentials",
      // กำหนด field ที่ NextAuth จะส่งมาให้ authorize()
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },

      /**
       * authorize() — logic การตรวจสอบตัวตน
       * คืน user object ถ้า login สำเร็จ หรือ throw Error ถ้าไม่ผ่าน
       */
      async authorize(credentials) {
        // ตรวจสอบว่ามีข้อมูลครบ
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // ค้นหา user ในฐานข้อมูลด้วย email
        const user = await prisma.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with that email");
        }

        // เปรียบเทียบรหัสผ่านที่กรอกกับ hash ที่เก็บใน DB
        const checkIsValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!checkIsValid) {
          throw new Error("Invalid password");
        }

        // คืน user object เพื่อให้ NextAuth นำไปสร้าง JWT ต่อ
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  // ใช้ JWT เป็น strategy สำหรับ session (stateless)
  session: {
    strategy: "jwt",
  },

  callbacks: {
    /**
     * jwt() — เรียกทุกครั้งที่มีการสร้าง/อ่าน JWT
     * ครั้งแรก (login): user object ส่งมาด้วย → เพิ่ม id และ role เข้า token
     * ครั้งต่อไป: user จะเป็น undefined → คืน token เดิม
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    /**
     * session() — เรียกทุกครั้งที่ client ขอ session
     * นำ id และ role จาก token มาใส่ใน session.user
     * เพื่อให้ frontend ใช้ได้ผ่าน useSession() / getServerSession()
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role;
      }
      return session;
    },
  },

  // หน้า login custom (แทน default ของ NextAuth)
  pages: {
    signIn: "/login",
  },

  // secret สำหรับ sign/verify JWT — อ่านจาก environment variable
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * getServerAuthSession — helper สำหรับเรียก session ใน Server Component / API Route
 * ใช้แทน getServerSession(authOptions) เพื่อไม่ต้อง import authOptions ซ้ำ
 *
 * ตัวอย่าง:
 *   const session = await getServerAuthSession();
 *   if (!session?.user) return 401;
 */
export const getServerAuthSession = () => getServerSession(authOptions);
