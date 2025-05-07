"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  FileSpreadsheet,
  LogOut,
  Home,
  Calendar,
  ListTodo,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <Home className="w-5 h-5 mr-2" />,
    },
    {
      href: "/dashboard/admin/import-users",
      label: "Import Users",
      icon: <FileSpreadsheet className="w-5 h-5 mr-2" />,
    },
    {
      href: "/dashboard/admin/students",
      label: "All Students",
      icon: <Users className="w-5 h-5 mr-2" />,
    },
    {
      href: "/dashboard/admin/manage-users",
      label: "Manage Users",
      icon: <Users className="w-5 h-5 mr-2" />,
    },
    {
      href: "/dashboard/admin/activities",
      label: "Manage Activities",
      icon: <ListTodo className="w-5 h-5 mr-2" />,
    },
    {
      href: "/dashboard/admin/activities/add",
      label: "Add Activity",
      icon: <Calendar className="w-5 h-5 mr-2" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            VKU Coin Admin
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center p-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLogout}
                className="flex w-full items-center p-2 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};
