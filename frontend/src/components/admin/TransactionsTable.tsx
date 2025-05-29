"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Coins } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Transaction {
  id: number;
  type: "REWARD" | "TRANSFER" | "ADMIN_ADJUSTMENT";
  amount: number;
  timestamp: string;
  description: string;
  fromWallet?: {
    owner: {
      fullName: string;
      studentCode: string;
    };
  };
  toWallet?: {
    owner: {
      fullName: string;
      studentCode: string;
    };
  };
  activity?: {
    id: number;
    name: string;
  };
}

interface TransactionsTableProps {
  transactions: Transaction[];
  studentCode?: string;
}

export function TransactionsTable({ 
  transactions, 
  studentCode 
}: TransactionsTableProps) {
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "timestamp",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div className="whitespace-nowrap">
          {formatDate(row.getValue("timestamp"))}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        let badgeVariant: "default" | "outline" | "secondary" | "destructive" | null = null;
        let icon = null;

        switch (type) {
          case "REWARD":
            badgeVariant = "default";
            icon = <Coins className="h-3 w-3 mr-1" />;
            break;
          case "TRANSFER":
            // If viewing a specific student's transactions, determine if incoming or outgoing
            if (studentCode) {
              const transaction = row.original;
              if (transaction.fromWallet && transaction.fromWallet.owner.studentCode === studentCode) {
                badgeVariant = "destructive";
                icon = <ArrowUpRight className="h-3 w-3 mr-1" />;
              } else {
                badgeVariant = "secondary";
                icon = <ArrowDownLeft className="h-3 w-3 mr-1" />;
              }
            } else {
              badgeVariant = "outline";
              icon = <ArrowUpRight className="h-3 w-3 mr-1" />;
            }
            break;
          case "ADMIN_ADJUSTMENT":
            badgeVariant = "secondary";
            break;
          default:
            badgeVariant = "outline";
        }

        return (
          <Badge variant={badgeVariant} className="flex items-center w-fit">
            {icon}
            {type === "REWARD" ? "Reward" : 
             type === "TRANSFER" ? "Transfer" : 
             type === "ADMIN_ADJUSTMENT" ? "Admin Adjustment" : 
             type}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.getValue("amount") as number;
        const transaction = row.original;
        const isOutgoing = studentCode && 
          transaction.fromWallet && 
          transaction.fromWallet.owner.studentCode === studentCode;
        
        return (
          <div className={`font-medium ${isOutgoing ? "text-red-600" : "text-green-600"}`}>
            {isOutgoing ? "-" : "+"} {amount} VKU
          </div>
        );
      },
      sortingFn: "basic",
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Description" />
      ),
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.getValue("description") || "No description"}
        </div>
      ),
    },
    {
      id: "fromTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From/To" />
      ),
      cell: ({ row }) => {
        const transaction = row.original;
        const type = transaction.type;
        
        if (type === "TRANSFER") {
          return (
            <div>
              <div className="text-sm">
                <span className="text-gray-500 dark:text-gray-400">From: </span>
                {transaction.fromWallet ? (
                  <span title={transaction.fromWallet.owner.fullName}>
                    {transaction.fromWallet.owner.studentCode}
                  </span>
                ) : (
                  "System"
                )}
              </div>
              <div className="text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">To: </span>
                {transaction.toWallet ? (
                  <span title={transaction.toWallet.owner.fullName}>
                    {transaction.toWallet.owner.studentCode}
                  </span>
                ) : (
                  "System"
                )}
              </div>
            </div>
          );
        } else if (type === "REWARD" && transaction.activity) {
          return (
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Activity: </span>
              <span title={transaction.activity.name}>
                {transaction.activity.name}
              </span>
            </div>
          );
        } else {
          return <span className="text-muted-foreground">-</span>;
        }
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      showPagination={true}
    />
  );
} 