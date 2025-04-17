"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

const SignUpSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(3, "Nama terlalu pendek")
    .max(50, "Nama terlalu panjang")
    .required("Nama lengkap wajib diisi"),
  email: Yup.string()
    .email("Format email tidak valid")
    .required("Email wajib diisi"),
  password: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .required("Password wajib diisi"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Password tidak sama")
    .required("Konfirmasi password wajib diisi"),
});

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const signUp = useAuthStore((state) => state.signUp);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: SignUpSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await signUp({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        });

        toast({
          title: "Registrasi berhasil",
          description: "Akun Anda telah dibuat. Silahkan login.",
        });

        router.push("/login");
      } catch (error) {
        console.error("Error signing up:", error);

        let errorMessage =
          "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";

        if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast({
          variant: "destructive",
          title: "Gagal mendaftar",
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Daftar Akun</h1>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...formik.getFieldProps("fullName")}
                />
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-sm text-red-500">
                    {formik.errors.fullName}
                  </p>
                )}
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
                <Label htmlFor="password">Kata Sandi</Label>
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

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Konfirmasi Kata Sandi</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Konfirmasi kata sandi"
                    {...formik.getFieldProps("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {formik.errors.confirmPassword}
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Mendaftar..." : "Daftar"}
              </Button>

              <div className="text-center text-sm">
                Sudah Punya Akun?{" "}
                <Link href="/login" className="underline underline-offset-4">
                  Masuk
                </Link>
              </div>
            </div>
          </form>
          <div className="relative h-full hidden bg-muted md:block">
            <Image
              src="https://placehold.co/300x500"
              alt="Sign Up Image"
              className="inset-0 object-cover dark:brightness-[0.2] dark:grayscale"
              fill
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
