"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const signIn = useAuthStore((state) => state.signIn);

  // Get redirect parameter from URL
  const redirectPath = searchParams.get("redirect") || "/";

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await signIn({
          email: values.email,
          password: values.password,
        });

        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
        });

        // Redirect to the requested page or homepage
        router.push(redirectPath);
        router.refresh();
      } catch (error) {
        console.error("Error signing in:", error);

        let errorMessage = "Terjadi kesalahan saat login. Silakan coba lagi.";

        if (error instanceof FirebaseError) {
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage = "Format email tidak valid.";
              break;
            case "auth/user-not-found":
            case "auth/wrong-password":
              errorMessage = "Email atau kata sandi salah.";
              break;
            case "auth/too-many-requests":
              errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti.";
              break;
          }
        }

        toast({
          variant: "destructive",
          title: "Gagal login",
          description: errorMessage,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Selamat Datang Kembali</h1>
                <p className="text-balance text-muted-foreground">
                  Login ke Akun Bymay Anda
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...formik.getFieldProps("email")}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-sm text-red-500">{formik.errors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Kata Sandi</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-sm text-red-500">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Masuk..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Belum Memiliki Akun?{" "}
                <Link href="/sign-up" className="underline underline-offset-4">
                  Daftar
                </Link>
              </div>
            </div>
          </form>
          <div className="relative h-full hidden bg-muted md:block">
            <Image
              src="https://placehold.co/300x500"
              alt="Login Image"
              className="inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
              fill
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
