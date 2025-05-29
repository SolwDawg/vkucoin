"use client";

import { Registration } from "@/types/admin";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle, Loader2, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface RegistrationsTableProps {
  registrations: Registration[];
  approvingStudents: string[];
  confirmingStudents: string[];
  onApprove: (registration: Registration) => void;
  onConfirmParticipation: (registration: Registration) => void;
}

export function RegistrationsTable({
  registrations,
  approvingStudents,
  confirmingStudents,
  onApprove,
  onConfirmParticipation,
}: RegistrationsTableProps) {
  const columns: ColumnDef<Registration>[] = [
    {
      accessorKey: "student.studentCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã sinh viên" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.student.studentCode}
        </div>
      ),
    },
    {
      accessorKey: "student.fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Họ và tên" />
      ),
      cell: ({ row }) => (
        <div>
          {row.original.student.fullName}
        </div>
      ),
    },
    {
      accessorKey: "student.class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Lớp" />
      ),
    },
    {
      accessorKey: "registeredAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày đăng ký" />
      ),
      cell: ({ row }) => (
        <div>
          {format(new Date(row.original.registeredAt), "PPp")}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "isApproved",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Trạng thái" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.isApproved ? (
            <Badge
              variant="success"
              className="flex items-center gap-1"
            >
              <CheckCircle className="h-3 w-3" />
              Đã phê duyệt
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="flex items-center gap-1"
            >
              Chờ phê duyệt
            </Badge>
          )}
        </>
      ),
    },
    {
      accessorKey: "isParticipationConfirmed",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tham gia" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.isParticipationConfirmed ? (
            <div>
              <Badge
                variant="success"
                className="flex items-center gap-1 mb-1"
              >
                <Award className="h-3 w-3" />
                Đã tham gia
              </Badge>
              <div className="text-xs text-muted-foreground">
                {row.original.participationConfirmedAt &&
                  format(new Date(row.original.participationConfirmedAt), "PPp")}
              </div>
            </div>
          ) : (
            <Badge
              variant="outline"
              className="flex items-center gap-1"
            >
              Chưa xác nhận
            </Badge>
          )}
        </>
      ),
    },
    {
      accessorKey: "evidenceImageUrl",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bằng chứng" />
      ),
      cell: ({ row }) => (
        <>
          {row.original.evidenceImageUrl ? (
            <Link
              href={row.original.evidenceImageUrl}
              target="_blank"
              className="text-blue-500 hover:underline flex items-center gap-1"
            >
              <LinkIcon className="h-4 w-4" />
              Xem bằng chứng
            </Link>
          ) : (
            <span className="text-muted-foreground">
              Không có bằng chứng
            </span>
          )}
        </>
      ),
    },

  ];

  return (
    <DataTable
      columns={columns}
      data={registrations}
      showPagination={true}
    />
  );
} 