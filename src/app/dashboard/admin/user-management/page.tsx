"use client";

import { useState, useEffect } from "react";
import { useAdminProtection } from "@/hooks/useAdminProtection";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { promoteToAdmin, getAllAdmins, UserData } from "@/lib/firebase/auth";
import { getRoleDisplay } from "@/lib/constants/roles";

export default function UserManagement() {
  const { loading } = useAdminProtection();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminUsers, setAdminUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const admins = await getAllAdmins();
        setAdminUsers(admins);
      } catch (error) {
        console.error("Error fetching admins:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Gagal memuat daftar admin",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "Email wajib diisi",
        description: "Masukkan email pengguna yang ingin dijadikan admin",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await promoteToAdmin(email);

      if (success) {
        toast({
          title: "Berhasil",
          description: `${email} telah diubah menjadi admin`,
        });

        // Refresh daftar admin
        const admins = await getAllAdmins();
        setAdminUsers(admins);
        setEmail("");
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: "Pengguna tidak ditemukan",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan saat mengubah role pengguna",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Manajemen Pengguna</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tambah Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Pengguna
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Jadikan Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Admin</CardTitle>
          </CardHeader>
          <CardContent>
            {adminUsers.length > 0 ? (
              <ul className="space-y-2">
                {adminUsers.map((admin) => (
                  <li key={admin.uid} className="p-2 border-b">
                    <div className="font-medium">{admin.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {admin.email}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Role: {getRoleDisplay(admin.role)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Belum ada admin terdaftar</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
