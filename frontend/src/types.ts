export interface Insight {
  text: string;
  category: 'activity' | 'repository' | 'behavior' | 'language' | 'consistency';
  emoji: string;
}

export interface WrappedData {
  username: string;
  year: number;
  totalCommits: number;
  totalContributions: number; // All contributions (commits + PRs + issues + reviews)
  totalRepositories: number;
  totalStars: number;
  topLanguages: Array<{ name: string; count: number }>;
  topRepositories: Array<{ name: string; stars: number }>;
  totalPullRequests: number;
  totalIssues: number;
  contributionStreak: number;
  longestStreak: number;
  bestDayOfWeek: string | null;
  monthlyBreakdown: Array<{
    month: string;
    contributions: number;
  }>;
  insights: Insight[];
  // New fields
  profile: {
    accountAge: number | null;
    followers: number;
    following: number;
    hasBio: boolean;
    hasCompany: boolean;
    hasLocation: boolean;
    bio?: string | null;
    company?: string | null;
    location?: string | null;
  };
  topTopics: Array<{ topic: string; count: number }>;
  forkStats: {
    totalForks: number;
    averageForksPerRepo: number;
    mostForkedRepo: { name: string; forks: number } | null;
  };
  repositoryGrowth: {
    reposCreatedInYear: number;
    totalStarsFromNewRepos: number;
    mostStarredNewRepo: { name: string; stars: number } | null;
  };
  mostActiveRepo: { name: string; lastPush: string | null } | null;
  licenses: {
    topLicense: string | null;
    licenseDistribution: Record<string, number>;
    noLicenseCount: number;
    totalLicensed: number;
  };
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
      totalContributions?: number;
      commitsPerMonth: Record<string, number>;
      mostActiveMonth: string | null;
      activeMonthsCount: number;
      pullRequests?: number;
      issues?: number;
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
      topLanguageBySize: string | null;
      languageDistribution: Record<string, number>;
      languageSizes: Record<string, number>;
      languageCount: number;
    };
    behavior: {
      weekdayCommits: number;
      weekendCommits: number;
      dayCommits: number;
      nightCommits: number;
    };
    profile: {
      accountAge: number | null;
      followers: number;
      following: number;
      hasBio: boolean;
      hasCompany: boolean;
      hasLocation: boolean;
      bio?: string | null;
      company?: string | null;
      location?: string | null;
    };
    advanced: {
      longestStreak: {
        days: number;
        startDate: string | null;
        endDate: string | null;
      };
      bestDayOfWeek: {
        day: string;
        contributions: number;
      } | null;
      mostActiveRepository: {
        name: string;
        lastPush: string | null;
      } | null;
      topics: {
        topTopics: Array<{ topic: string; count: number }>;
        totalUniqueTopics: number;
        topicDistribution: Record<string, number>;
      };
      licenses: {
        topLicense: string | null;
        licenseDistribution: Record<string, number>;
        noLicenseCount: number;
        totalLicensed: number;
      };
      repositoryGrowth: {
        reposCreatedInYear: number;
        totalStarsFromNewRepos: number;
        mostStarredNewRepo: {
          name: string;
          stars: number;
        } | null;
      };
      forkStats: {
        totalForks: number;
        averageForksPerRepo: number;
        mostForkedRepo: {
          name: string;
          forks: number;
        } | null;
      };
    };
  };
}
