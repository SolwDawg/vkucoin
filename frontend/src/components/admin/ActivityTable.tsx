"use client";

import { Activity } from "@/types/admin";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Coins, Users, ClipboardList, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ActivityTableProps {
  activities: Activity[];
  onDeleteClick: (activity: Activity) => void;
}

export function ActivityTable({ activities, onDeleteClick }: ActivityTableProps) {
  const columns: ColumnDef<Activity>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tên" />
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mô tả" />
      ),
      cell: ({ row }) => (
        <div className="text-gray-500 dark:text-gray-400 truncate max-w-xs">
          {row.getValue("description")}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày bắt đầu" />
      ),
      cell: ({ row }) => (
        <div className="text-gray-500 dark:text-gray-400">
          {formatDate(row.getValue("startDate"))}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "endDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày kết thúc" />
      ),
      cell: ({ row }) => (
        <div className="text-gray-500 dark:text-gray-400">
          {formatDate(row.getValue("endDate"))}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "rewardCoin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Xu thưởng" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Coins className="h-4 w-4 mr-1 text-yellow-500" />
          {row.getValue("rewardCoin")}
        </div>
      ),
      sortingFn: "basic",
    },
    {
      accessorKey: "maxParticipants",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số người tối đa" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Users className="h-4 w-4 mr-1 text-blue-500" />
          {row.getValue("maxParticipants")}
        </div>
      ),
      sortingFn: "basic",
    },
    {
      id: "actions",
      header: "Hành động",
      cell: ({ row }) => {
        const activity = row.original;
        
        return (
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/admin/activities/${activity.id}`}
              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 flex items-center"
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem
            </Link>
            <Link
              href={`/dashboard/admin/activities/edit/${activity.id}`}
              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Sửa
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteClick(activity)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center p-0"
            >
              <Trash className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];
  
  return (
    <DataTable
      columns={columns}
      data={activities}
      showPagination={true}
    />
  );
} 