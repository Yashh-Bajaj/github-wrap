export interface Insight {
  text: string;
  category: 'activity' | 'repository' | 'behavior' | 'language' | 'consistency';
  emoji: string;
}

export interface WrappedData {
  username: string;
  year: number;
  totalCommits: number;
  totalRepositories: number;
  totalStars: number;
  topLanguages: Array<{ name: string; count: number }>;
  topRepositories: Array<{ name: string; stars: number }>;
  totalPullRequests: number;
  totalIssues: number;
  contributionStreak: number;
  monthlyBreakdown: Array<{
    month: string;
    contributions: number;
  }>;
  insights: Insight[];
  quote?: string;
}

// Backend response types
export interface BackendWrappedResponse {
  success: boolean;
  data: BackendWrappedData;
}

export interface BackendWrappedData {
  _id?: string;
  username: string;
  year: number;
  generatedAt: string;
  source: {
    type: string;
    note: string;
  };
  insights: {
    activity: {
      totalCommits: number;
      commitsPerMonth: Record<string, number>;
      mostActiveMonth: string | null;
      activeMonthsCount: number;
    };
    repositories: {
      totalPublicRepos: number;
      reposCreatedInYear: number;
      mostStarredRepo: {
        name: string;
        stars: number;
      } | null;
    };
    languages: {
      topLanguage: string | null;
      languageDistribution: Record<string, number>;
      languageCount: number;
    };
    behavior: {
      weekdayCommits: number;
      weekendCommits: number;
      dayCommits: number;
      nightCommits: number;
    };
  };
}
