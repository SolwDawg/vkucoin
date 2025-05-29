"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Coins, Edit, Eye, Trash, Wallet } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Student {
  id: number;
  studentCode: string;
  fullName: string;
  email: string;
  class: string;
  major: string;
  walletBalance?: number;
  createdAt: string;
}

interface StudentsTableProps {
  students: Student[];
  onDeleteClick?: (student: Student) => void;
}

export function StudentsTable({ students, onDeleteClick }: StudentsTableProps) {
  const columns: ColumnDef<Student>[] = [
    {
      accessorKey: "studentCode",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Student Code" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("studentCode")}</div>
      ),
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Full Name" />
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => (
        <div className="text-gray-500 dark:text-gray-400">
          {row.getValue("email")}
        </div>
      ),
    },
    {
      accessorKey: "class",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Class" />
      ),
    },
    {
      accessorKey: "major",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Major" />
      ),
    },
    {
      accessorKey: "walletBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Balance" />
      ),
      cell: ({ row }) => {
        const balance = row.getValue("walletBalance");
        return balance ? (
          <div className="flex items-center">
            <Coins className="h-4 w-4 mr-1 text-yellow-500" />
            <span>{balance} VKU</span>
          </div>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        );
      },
      sortingFn: "basic",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const student = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/students/edit/${student.studentCode}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/wallet/${student.studentCode}`}>
                  <Wallet className="h-4 w-4 mr-2" />
                  <span>View Wallet</span>
                </Link>
              </DropdownMenuItem>
              {onDeleteClick && (
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-700"
                  onClick={() => onDeleteClick(student)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={students}
      showPagination={true}
    />
  );
} 