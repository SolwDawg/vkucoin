"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ChevronLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layouts/DashboardLayout";

export default function StudentRewards() {
  // Protect this route
  const { user, isAuthenticated } = useAuth({
    requireAuth: true,
    redirectTo: "/login",
  });

  if (!user || !isAuthenticated) {
    return null;
  }

  // Sample rewards data
  const rewards = [
    {
      id: 1,
      title: "Điểm danh lớp học",
      description: "Hoàn thành 10 ngày điểm danh liên tiếp",
      tokenAmount: 50,
      isCompleted: true,
      isClaimed: false,
    },
    {
      id: 2,
      title: "Hoàn thành bài tập",
      description: "Nộp tất cả bài tập đúng hạn trong học kỳ này",
      tokenAmount: 100,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 3,
      title: "Xuất sắc học tập",
      description: "Đạt GPA 3.5 trở lên",
      tokenAmount: 200,
      isCompleted: false,
      isClaimed: false,
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Phần thưởng sinh viên</h1>
          <Link
            href="/student"
            className="flex items-center text-sm text-blue-500 hover:underline"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại bảng điều khiển
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {rewards.map((reward) => (
            <Card
              key={reward.id}
              className={reward.isCompleted ? "border-green-200" : ""}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">
                  {reward.title}
                </CardTitle>
                <Award
                  className={`h-5 w-5 ${reward.isCompleted ? "text-green-500" : "text-gray-300"}`}
                />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {reward.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">
                    {reward.tokenAmount} VKU
                  </span>
                  {reward.isCompleted && !reward.isClaimed ? (
                    <Button size="sm">Nhận thưởng</Button>
                  ) : reward.isCompleted && reward.isClaimed ? (
                    <span className="text-sm text-green-500">Đã nhận</span>
                  ) : (
                    <span className="text-sm text-gray-400">Chưa hoàn thành</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
