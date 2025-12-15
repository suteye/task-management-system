"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { MailIcon } from "lucide-react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        alert("Invalid credentials");
        return;
      }

      const session = await getSession();

      if (session?.user) router.push("/dashboard");
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง");
      console.error("Sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-medium">
            เข้าสู่ระบบ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                อีเมล
              </Label>
              <InputGroup>
                <InputGroupInput 
                    type="text" 
                    placeholder="กรุณากรอกอีเมล"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}                    
                />
                <InputGroupAddon>
                  <MailIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div>
                <Label
                  htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >  รหัสผ่าน
                </Label>
                <InputGroup>
                  <InputGroupInput 
                      type="password" 
                      placeholder="กรุณากรอกรหัสผ่าน"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                </InputGroup>
            </div>
            <Button
                type="submit"
                disabled={loading}
                className="w-full"
            >
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
