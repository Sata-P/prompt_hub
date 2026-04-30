"use client";

// ไฟล์นี้: หน้าเข้าสู่ระบบ (Login Page)
// ใช้ NextAuth signIn() แบบ Credentials (email + password)
// ตัว LoginForm ถูกห่อด้วย Suspense เพราะเรียกใช้ useSearchParams()

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, Mail, Lock } from "lucide-react";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/component/ui/card";
import { Button } from "@/component/ui/button";
import { Input } from "@/component/ui/input";
import { Label } from "@/component/ui/label";

// ---------------------------------------------------------
// LoginForm — แยกออกมาเป็น component ย่อยเพื่อให้ Suspense
// ห่อ useSearchParams() ได้โดยไม่ทำให้ SSR พัง
// ---------------------------------------------------------
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ตรวจสอบว่ามี query ?registered=true หรือไม่
  // (ส่งมาจากหน้า Signup หลังสมัครสำเร็จ)
  const registered = searchParams.get("registered");

  // State สำหรับ input ฟอร์ม
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State สำหรับ error message และ loading
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------------------------------
  // handleGoogleLogin — รอ implement OAuth ภายหลัง
  // ----------------------------------------
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth login via NextAuth
    // signIn("google", { callbackUrl: "/dashboard" });
  };

  // ----------------------------------------
  // handleLogin — เรียก NextAuth signIn ด้วย credentials
  // ถ้าสำเร็จ → redirect ไป /dashboard
  // ถ้าผิดพลาด → แสดง error message
  // ----------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // ไม่ให้ NextAuth redirect เอง เราจัดการเอง
      });

      if (result?.error) {
        // NextAuth ส่ง error กลับมาใน result.error
        setError(result.error);
      } else {
        // เข้าสู่ระบบสำเร็จ → ไปหน้า dashboard
        router.push("/dashboard");
      }
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      {/* Header: ไอคอน + ชื่อหน้า */}
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <LogIn className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
        <CardDescription>ลงชื่อเข้าใช้ Prompt Hub</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* แจ้งเตือนสีเขียว: แสดงเฉพาะเมื่อมี ?registered=true */}
        {registered && (
          <div className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ
          </div>
        )}

        {/* แสดง error message (ถ้ามี) */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* ฟอร์ม email + password */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* ช่องอีเมล */}
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          {/* ช่องรหัสผ่าน */}
          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่าน</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          {/* ปุ่ม submit — disable ตอนกำลังโหลด */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </CardContent>

      {/* Footer: ลิงก์ไปหน้าสมัครสมาชิก */}
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          ยังไม่มีบัญชี?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">สมัครสมาชิก</Link>
        </p>
      </CardFooter>
    </Card>
  );
}

// ---------------------------------------------------------
// LoginPage — หน้าหลัก export ออกไป
// ห่อ LoginForm ด้วย Suspense เพราะใช้ useSearchParams()
// (Next.js App Router บังคับให้ทำเมื่อ component เรียก hook นี้)
// ---------------------------------------------------------
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* fallback: skeleton animation ขณะโหลด */}
      <Suspense fallback={
        <div className="w-full max-w-md h-96 animate-pulse rounded-xl bg-muted" />
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
