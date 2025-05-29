"use client";

import { useEffect, useState } from "react";
import { adminService } from "@/services/admin.service";
import { Student } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2, Users, Coins } from "lucide-react";
import { format } from "date-fns";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/lib/admin.utils";
import { toast } from "sonner";

export default function StudentsPage() {
  // Use auth hook to ensure only authenticated users can access this page
  useAuth({ requireAuth: true });
  // Check for admin role
  useAdminAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStudents() {
    try {
      setIsLoading(true);
      setError(null);

      const studentsData = await adminService.getAllStudents();
      setStudents(studentsData);
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Không thể tải danh sách sinh viên. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <AdminLayout>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p>Đang tải sinh viên...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-2 text-destructive">
            <XCircle size={32} />
            <p>{error}</p>
            <Button
              variant="outline"
              onClick={() => fetchStudents()}
              className="mt-2"
            >
              Thử lại
            </Button>
          </div>
        </div>
      ) : (
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Tất cả sinh viên</h1>
          </div>

          {students.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                Không tìm thấy sinh viên nào.
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Danh sách sinh viên</CardTitle>
                <CardDescription>
                  Tổng số {students.length} sinh viên
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã sinh viên</TableHead>
                      <TableHead>Họ và tên</TableHead>
                      <TableHead>Lớp</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ngày sinh</TableHead>
                      <TableHead>Ví</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.studentCode}>
                        <TableCell className="font-medium">
                          {student.studentCode}
                        </TableCell>
                        <TableCell>{student.fullName}</TableCell>
                        <TableCell>
                          {student.class ? (
                            <Badge variant="outline">{student.class}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Chưa phân công</span>
                          )}
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {format(new Date(student.dateOfBirth), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Coins className="h-3 w-3" />
                              {student.walletBalance} VKU
                            </Badge>
                            {student.walletAddress && (
                              <span className="text-xs text-muted-foreground">
                                {student.walletAddress.slice(0, 6)}...{student.walletAddress.slice(-4)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
