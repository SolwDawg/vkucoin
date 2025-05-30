"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { useAdminAuth } from '@/lib/admin.utils';
import analyticsService, { DashboardAnalytics } from '@/services/analyticsService';
import { StatCard } from '@/components/admin/analytics/StatCard';
import { SimpleChart } from '@/components/admin/analytics/SimpleChart';
import {
  Users,
  GraduationCap,
  Shield,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Coins,
  Activity,
  BarChart3,
  Award,
  Loader2,
} from 'lucide-react';

export default function AnalyticsPage() {
  useAuth({ requireAuth: true });
  const { isAdmin } = useAdminAuth();
  
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await analyticsService.getDashboardAnalytics();
        setAnalytics(data);
      } catch (error: any) {
        console.error('Error fetching analytics:', error);
        setError(error.response?.data?.message || 'Lỗi khi tải dữ liệu thống kê');
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              Bạn không có quyền truy cập trang này.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              Đang tải dữ liệu thống kê...
            </span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-4">
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-gray-600 dark:text-gray-400">
              Không có dữ liệu thống kê.
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { overview, topActivities, monthlyStats, classParticipation, tokenDistribution } = analytics;

  // Helper function to get short Vietnamese month name
  const getShortMonthName = (monthName: string) => {
    // monthName format: "Tháng X YYYY"
    const parts = monthName.split(' ');
    if (parts.length >= 2 && parts[0] === 'Tháng') {
      return `T${parts[1]}`;
    }
    // Fallback to original logic for backward compatibility
    return monthName.split(' ')[0];
  };

  // Prepare chart data
  const monthlyParticipationData = monthlyStats.map(stat => ({
    label: getShortMonthName(stat.monthName),
    value: stat.totalParticipations,
  }));

  const monthlyTokensData = monthlyStats.map(stat => ({
    label: getShortMonthName(stat.monthName),
    value: Number(stat.tokensDistributed),
  }));

  const classParticipationData = classParticipation.slice(0, 10).map(cls => ({
    label: cls.className,
    value: cls.totalParticipations,
    color: '#10B981',
  }));

  const topActivitiesData = topActivities.slice(0, 8).map(activity => ({
    label: activity.activityName.length > 15 
      ? activity.activityName.substring(0, 15) + '...'
      : activity.activityName,
    value: activity.participantCount,
    color: '#8B5CF6',
  }));

  return (
    <AdminLayout>
      <div className="container mx-auto py-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Thống kê & Phân tích
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Tổng quan về hoạt động và hiệu suất của hệ thống VKU Coin
          </p>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng người dùng"
            value={overview.totalUsers}
            icon={Users}
            iconColor="text-blue-500"
            backgroundColor="bg-blue-50 dark:bg-blue-900/20"
            subtitle={`${overview.totalStudents} sinh viên, ${overview.totalAdmins} quản trị`}
          />
          
          <StatCard
            title="Hoạt động"
            value={overview.totalActivities}
            icon={Calendar}
            iconColor="text-green-500"
            backgroundColor="bg-green-50 dark:bg-green-900/20"
            subtitle={`${overview.activeActivities} đang diễn ra`}
          />
          
          <StatCard
            title="Tham gia"
            value={overview.confirmedParticipations}
            icon={CheckCircle}
            iconColor="text-purple-500"
            backgroundColor="bg-purple-50 dark:bg-purple-900/20"
            subtitle={`Tỷ lệ: ${overview.participationRate}%`}
          />
          
          <StatCard
            title="Token phân phối"
            value={`${overview.totalTokensDistributed.toLocaleString()} VKU`}
            icon={Coins}
            iconColor="text-yellow-500"
            backgroundColor="bg-yellow-50 dark:bg-yellow-900/20"
            subtitle={`${overview.totalTransactions} giao dịch`}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart
            data={monthlyParticipationData}
            type="line"
            title="Lượt tham gia theo tháng"
            height={300}
          />
          
          <SimpleChart
            data={monthlyTokensData}
            type="bar"
            title="Token phân phối theo tháng"
            height={300}
            valueSuffix=" VKU"
          />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SimpleChart
            data={topActivitiesData}
            type="bar"
            title="Hoạt động có nhiều người tham gia nhất"
            height={300}
          />
          
          <SimpleChart
            data={classParticipationData}
            type="bar"
            title="Tham gia theo lớp"
            height={300}
          />
        </div>

        {/* Detailed Statistics Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Activities Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Top hoạt động
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Hoạt động</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Đăng ký</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Tham gia</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {topActivities.slice(0, 5).map((activity, index) => (
                    <tr key={activity.activityId} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-gray-900 dark:text-white">
                        <div className="font-medium">{activity.activityName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {activity.rewardCoin} VKU
                        </div>
                      </td>
                      <td className="text-right py-3 text-gray-600 dark:text-gray-400">
                        {activity.registrationCount}
                      </td>
                      <td className="text-right py-3 text-gray-600 dark:text-gray-400">
                        {activity.participantCount}
                      </td>
                      <td className="text-right py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          activity.participationRate >= 80
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : activity.participationRate >= 60
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {activity.participationRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Earners Table */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-500" />
              Top kiếm VKU Coin
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-gray-600 dark:text-gray-400">Sinh viên</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">VKU Coin</th>
                    <th className="text-right py-2 text-gray-600 dark:text-gray-400">Hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  {tokenDistribution.topEarners.slice(0, 5).map((earner, index) => (
                    <tr key={earner.studentId} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3 text-gray-900 dark:text-white">
                        <div className="font-medium">{earner.studentName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {earner.studentCode} - {earner.class}
                        </div>
                      </td>
                      <td className="text-right py-3 font-semibold text-yellow-600 dark:text-yellow-400">
                        {earner.tokenBalance.toLocaleString()} VKU
                      </td>
                      <td className="text-right py-3 text-gray-600 dark:text-gray-400">
                        {earner.participationCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Token Distribution Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
            Phân phối VKU Coin
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {tokenDistribution.totalTokensInCirculation.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tổng VKU trong lưu thông</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tokenDistribution.averageTokensPerUser.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trung bình/sinh viên</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {tokenDistribution.highestBalance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Số dư cao nhất</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {tokenDistribution.lowestBalance.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Số dư thấp nhất</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 