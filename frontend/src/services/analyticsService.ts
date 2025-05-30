import { http } from '@/lib/http-client';

export interface OverviewStatistics {
  totalUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalActivities: number;
  activeActivities: number;
  completedActivities: number;
  totalRegistrations: number;
  confirmedParticipations: number;
  totalTokensDistributed: number;
  totalTransactions: number;
  participationRate: number;
  averageTokensPerActivity: number;
}

export interface ActivityStat {
  activityId: number;
  activityName: string;
  registrationCount: number;
  participantCount: number;
  rewardCoin: number;
  startDate: string;
  endDate: string;
  status: string;
  participationRate: number;
}

export interface MonthlyStat {
  year: number;
  month: number;
  monthName: string;
  newUsers: number;
  activitiesCreated: number;
  totalParticipations: number;
  tokensDistributed: number;
}

export interface ClassParticipation {
  className: string;
  studentCount: number;
  totalParticipations: number;
  averageParticipationsPerStudent: number;
  totalTokensEarned: number;
}

export interface TopEarner {
  studentId: string;
  studentName: string;
  studentCode: string;
  class: string;
  tokenBalance: number;
  participationCount: number;
}

export interface TokenDistribution {
  totalTokensInCirculation: number;
  averageTokensPerUser: number;
  highestBalance: number;
  lowestBalance: number;
  topEarners: TopEarner[];
}

export interface DashboardAnalytics {
  overview: OverviewStatistics;
  topActivities: ActivityStat[];
  monthlyStats: MonthlyStat[];
  classParticipation: ClassParticipation[];
  tokenDistribution: TokenDistribution;
}

const analyticsService = {
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return await http.get('/analytics/dashboard');
  },

  async getOverviewStatistics(): Promise<OverviewStatistics> {
    return await http.get('/analytics/overview');
  },

  async getTopActivities(limit: number = 10): Promise<ActivityStat[]> {
    return await http.get(`/analytics/activities/top?limit=${limit}`);
  },

  async getMonthlyStats(months: number = 12): Promise<MonthlyStat[]> {
    return await http.get(`/analytics/monthly?months=${months}`);
  },

  async getClassParticipationStats(): Promise<ClassParticipation[]> {
    return await http.get('/analytics/classes');
  },

  async getTokenDistribution(): Promise<TokenDistribution> {
    return await http.get('/analytics/tokens');
  },
};

export default analyticsService; 