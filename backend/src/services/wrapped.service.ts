import WrappedResult, { WrappedResultDocument } from "../models/WrappedResult";
import {
  GitHubService,
  UserOverviewResponse,
  ContributionsResponse,
  RepositoryNode,
  ContributionDay,
  Week,
} from "./github.service";

export class WrappedService {
  /**
   * Main method to get or generate wrapped stats
   */
  static async getWrapped(
    username: string,
    year: number
  ): Promise<WrappedResultDocument> {
    // 1. Check if already exists in MongoDB
    const cached = await WrappedResult.findOne({ username, year });
    if (cached) {
      console.log(`✓ Cache hit for ${username} (${year})`);
      return cached;
    }

    console.log(`↓ Fetching GitHub data for ${username}...`);

    // 2. Fetch from GitHub
    const [userOverview, contributions] = await Promise.all([
      GitHubService.fetchUserOverview(username),
      GitHubService.fetchUserContributions(username, year),
    ]);
    // 3. Validate data before computing insights
    if (!userOverview.user?.repositories) {
      throw new Error(`Unable to fetch repository data for ${username}`);
    }
    if (!contributions.user?.contributionsCollection) {
      throw new Error(`Unable to fetch contribution data for ${username} (${year})`);
    }

    // 4. Compute insights
    const insights = this.computeInsights(userOverview, contributions, year);

    // 5. Store in MongoDB
    const wrapped = new WrappedResult({
      username,
      year,
      generatedAt: new Date(),
      source: {
        type: "public",
        note: "Data fetched from public GitHub API",
      },
      insights,
    });

    await wrapped.save();
    console.log(`✓ Wrapped result generated and saved for ${username} (${year})`);

    return wrapped;
  }

  /**
   * Compute insights from raw GitHub data
   */
  private static computeInsights(
    userOverview: UserOverviewResponse,
    contributions: ContributionsResponse,
    year: number
  ) {
    // Type guards - these should never fail due to validation above, but TypeScript needs them
    if (!userOverview.user?.repositories || !contributions.user?.contributionsCollection) {
      throw new Error("Invalid data structure for computing insights");
    }

    const contribData = contributions.user.contributionsCollection;
    const repos = userOverview.user.repositories.nodes;
    const totalReposCount = userOverview.user.repositories.totalCount;

    // Activity insights
    const activity = this.computeActivity(contribData, year);

    // Repository insights (use totalCount from API, not repos.length)
    const repositories = this.computeRepositories(repos, totalReposCount, year);

    // Language insights (enhanced with sizes)
    const languages = this.computeLanguages(repos);

    // Behavior insights
    const behavior = this.computeBehavior(contribData);

    // User profile insights
    const profile = this.computeProfile(userOverview);

    // Additional advanced insights
    const advanced = this.computeAdvancedInsights(repos, contribData, year);

    return {
      activity,
      repositories,
      languages,
      behavior,
      profile,
      advanced,
    };
  }

  /**
   * Compute activity metrics
   * Note: contributionCalendar includes ALL contributions (commits, PRs, issues, reviews)
   * while totalCommitContributions only counts commits. We use calendar data for consistency.
   */
  private static computeActivity(
    contribData: ContributionsResponse["user"]["contributionsCollection"],
    year: number
  ) {
    const weeks: Week[] = contribData.contributionCalendar.weeks;
    const contributionsPerMonth: Record<string, number> = {};
    const monthCounts: Record<string, number> = {};

    // Initialize months
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    months.forEach((month) => {
      contributionsPerMonth[month] = 0;
      monthCounts[month] = 0;
    });

    // Aggregate contributions by month from calendar
    // Note: contributionCount includes ALL types (commits, PRs, issues, reviews)
    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        const date = new Date(day.date);

        // Only count contributions that fall into the requested year
        if (date.getFullYear() !== year) return;

        const monthName = months[date.getMonth()];
        contributionsPerMonth[monthName] += day.contributionCount;
        if (day.contributionCount > 0) {
          monthCounts[monthName] = 1; // Mark as active
        }
      });
    });

    // Find most active month
    let mostActiveMonth: string | null = null;
    let maxContributions = 0;
    for (const [month, contributions] of Object.entries(contributionsPerMonth)) {
      if ((contributions as number) > maxContributions) {
        maxContributions = contributions as number;
        mostActiveMonth = month;
      }
    }

    const activeMonthsCount = Object.values(monthCounts).filter((v) => v === 1).length;

    // Verify: Sum of monthly contributions should match calendar total
    const sumOfMonthlyContributions = Object.values(contributionsPerMonth).reduce(
      (sum, count) => sum + count,
      0
    );
    const calendarTotal = contribData.contributionCalendar.totalContributions;
    
    // If there's a mismatch, log a warning
    // This can happen due to timezone differences or edge cases
    if (Math.abs(sumOfMonthlyContributions - calendarTotal) > 1) {
      console.warn(
        `Warning: Monthly contributions sum (${sumOfMonthlyContributions}) doesn't match calendar total (${calendarTotal}) for year ${year}.`
      );
    }

    return {
      // totalCommits: Only commits authored by the user
      totalCommits: contribData.totalCommitContributions,
      // totalContributions: All contribution types (commits + PRs + issues + reviews)
      // This matches what's shown on GitHub profile and in the contribution calendar
      // The sum of commitsPerMonth should approximately equal this value
      totalContributions: calendarTotal,
      pullRequests: contribData.totalPullRequestContributions,
      issues: contribData.totalIssueContributions,
      // commitsPerMonth: Actually all contributions per month (commits + PRs + issues + reviews)
      // This matches the GitHub contribution calendar visualization
      // Note: The sum of these values will be higher than totalCommits because it includes
      // all contribution types, not just commits
      commitsPerMonth: contributionsPerMonth,
      mostActiveMonth,
      activeMonthsCount,
    };
  }

  /**
   * Compute repository insights
   * @param repos - Array of repository nodes (may be paginated, use totalCount for accurate total)
   * @param totalReposCount - Total count from GraphQL API (accurate count)
   * @param year - Year to filter repos created in
   */
  private static computeRepositories(
    repos: RepositoryNode[],
    totalReposCount: number,
    year: number
  ) {
    // Use UTC dates to match contribution query date handling
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const reposCreatedInYear = repos.filter((repo: RepositoryNode) => {
      const createdAt = new Date(repo.createdAt);
      return createdAt >= yearStart && createdAt <= yearEnd;
    }).length;

    // Find the repository with the highest stargazer count from fetched repos
    // Note: This finds the most starred repo from the fetched set (up to 1000 most recently updated).
    // For users with many repos, the absolute most starred repo might not be included if it's old/inactive.
    // This is a reasonable trade-off as we prioritize recently active repositories.
    let mostStarredRepo = null;
    if (repos.length > 0) {
      const top = repos.reduce((prev, curr) =>
        (curr.stargazerCount || 0) > (prev.stargazerCount || 0) ? curr : prev
      , repos[0]);

      mostStarredRepo = {
        name: top.name,
        stars: top.stargazerCount || 0,
      };
    }

    return {
      totalPublicRepos: totalReposCount, // Use accurate total from API
      reposCreatedInYear,
      mostStarredRepo,
    };
  }

  /**
   * Compute language distribution with sizes (bytes)
   * Note: This is based on fetched repositories. For users with 1000+ repos,
   * this may not include all languages, but should cover the most active repos.
   */
  private static computeLanguages(repos: RepositoryNode[]) {
    const languageDistribution: Record<string, number> = {};

    repos.forEach((repo: RepositoryNode) => {
      // Use primary language if available
      if (repo.primaryLanguage?.name) {
        const langName = repo.primaryLanguage.name;
        languageDistribution[langName] = (languageDistribution[langName] || 0) + 1;
      }

      // Also track by language sizes from edges
    
    });

    const topLanguage = Object.entries(languageDistribution).length > 0
      ? Object.entries(languageDistribution).sort((a, b) => b[1] - a[1])[0][0]
      : null;

  
    return {
      topLanguage,
      languageDistribution,
      languageCount: Object.keys(languageDistribution).length,
    };
  }

  /**
   * Compute behavior patterns (weekday/weekend)
   * Note: GitHub GraphQL API does not provide time-of-day information for commits.
   * Day/night splits are removed as they cannot be accurately determined from available data.
   */
  private static computeBehavior(
    contribData: ContributionsResponse["user"]["contributionsCollection"]
  ) {
    const weeks: Week[] = contribData.contributionCalendar.weeks;
    let weekdayCommits = 0;
    let weekendCommits = 0;

    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        // Compute weekday from date string (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const date = new Date(day.date);
        const weekday = date.getDay();

        if (weekday === 0 || weekday === 6) {
          // Sunday (0) or Saturday (6)
          weekendCommits += day.contributionCount;
        } else {
          // Monday through Friday
          weekdayCommits += day.contributionCount;
        }
      });
    });

    return {
      weekdayCommits,
      weekendCommits,
      // Removed dayCommits and nightCommits as GitHub API doesn't provide time-of-day data
      // These fields are kept for backward compatibility but set to 0
      dayCommits: 0,
      nightCommits: 0,
    };
  }

  /**
   * Compute user profile insights
   */
  private static computeProfile(userOverview: UserOverviewResponse) {
    if (!userOverview.user) {
      return {
        accountAge: null,
        followers: 0,
        following: 0,
        hasBio: false,
        hasCompany: false,
        hasLocation: false,
      };
    }

    const user = userOverview.user;
    const accountCreated = new Date(user.createdAt);
    const now = new Date();
    const accountAgeYears = Math.floor(
      (now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );

    return {
      accountAge: accountAgeYears,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      hasBio: !!user.bio,
      hasCompany: !!user.company,
      hasLocation: !!user.location,
      bio: user.bio,
      company: user.company,
      location: user.location,
    };
  }

  /**
   * Compute advanced insights: streaks, best day, most active repo, topics, licenses, etc.
   */
  private static computeAdvancedInsights(
    repos: RepositoryNode[],
    contribData: ContributionsResponse["user"]["contributionsCollection"],
    year: number
  ) {
    // Longest contribution streak
    const streak = this.computeLongestStreak(contribData, year);

    // Best day of week
    const bestDay = this.computeBestDayOfWeek(contribData);

    // Most active repository (by recent pushes)
    const mostActiveRepo = this.computeMostActiveRepo(repos, year);

    // Repository topics analysis
    const topics = this.computeTopics(repos);

    // License distribution
    const licenses = this.computeLicenses(repos);

    // Repository growth (stars gained in year - approximate)
    const repoGrowth = this.computeRepoGrowth(repos, year);

    // Fork activity
    const forkStats = this.computeForkStats(repos);

    return {
      longestStreak: streak,
      bestDayOfWeek: bestDay,
      mostActiveRepository: mostActiveRepo,
      topics,
      licenses,
      repositoryGrowth: repoGrowth,
      forkStats,
    };
  }

  /**
   * Compute longest contribution streak in the year
   */
  private static computeLongestStreak(
    contribData: ContributionsResponse["user"]["contributionsCollection"],
    year: number
  ): { days: number; startDate: string | null; endDate: string | null } {
    const weeks: Week[] = contribData.contributionCalendar.weeks;
    let longestStreak = 0;
    let currentStreak = 0;
    let streakStart: string | null = null;
    let longestStreakStart: string | null = null;
    let longestStreakEnd: string | null = null;

    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        const date = new Date(day.date);
        if (date.getFullYear() !== year) return;

        if (day.contributionCount > 0) {
          if (currentStreak === 0) {
            streakStart = day.date;
          }
          currentStreak++;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            longestStreakStart = streakStart;
            longestStreakEnd = day.date;
          }
        } else {
          currentStreak = 0;
          streakStart = null;
        }
      });
    });

    return {
      days: longestStreak,
      startDate: longestStreakStart,
      endDate: longestStreakEnd,
    };
  }

  /**
   * Compute best day of week by total contributions
   */
  private static computeBestDayOfWeek(
    contribData: ContributionsResponse["user"]["contributionsCollection"]
  ): { day: string; contributions: number } | null {
    const weeks: Week[] = contribData.contributionCalendar.weeks;
    const dayContributions: Record<number, number> = {
      0: 0, // Sunday
      1: 0, // Monday
      2: 0, // Tuesday
      3: 0, // Wednesday
      4: 0, // Thursday
      5: 0, // Friday
      6: 0, // Saturday
    };

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        const date = new Date(day.date);
        const weekday = date.getDay();
        dayContributions[weekday] += day.contributionCount;
      });
    });

    let bestDay = 0;
    let maxContributions = 0;
    for (const [day, contributions] of Object.entries(dayContributions)) {
      if (contributions > maxContributions) {
        maxContributions = contributions;
        bestDay = parseInt(day, 10);
      }
    }

    return {
      day: dayNames[bestDay],
      contributions: maxContributions,
    };
  }

  /**
   * Find most active repository (by recent push activity in the year)
   */
  private static computeMostActiveRepo(
    repos: RepositoryNode[],
    year: number
  ): { name: string; lastPush: string | null } | null {
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    const yearEnd = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    let mostActive: RepositoryNode | null = null;
    let latestPush: Date | null = null;

    repos.forEach((repo: RepositoryNode) => {
      if (repo.pushedAt) {
        const pushedAt = new Date(repo.pushedAt);
        if (pushedAt >= yearStart && pushedAt <= yearEnd) {
          if (!latestPush || pushedAt > latestPush) {
            latestPush = pushedAt;
            mostActive = repo;
          }
        }
      }
    });

    return mostActive
      ? {
          name: mostActive.name,
          lastPush: mostActive.pushedAt,
        }
      : null;
  }

  /**
   * Compute repository topics distribution
   */
  private static computeTopics(repos: RepositoryNode[]) {
    const topicDistribution: Record<string, number> = {};

    repos.forEach((repo: RepositoryNode) => {
      repo.repositoryTopics.nodes.forEach((topicNode) => {
        const topicName = topicNode.topic.name;
        topicDistribution[topicName] = (topicDistribution[topicName] || 0) + 1;
      });
    });

    const topTopics = Object.entries(topicDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic, count]) => ({ topic, count }));

    return {
      topTopics,
      totalUniqueTopics: Object.keys(topicDistribution).length,
      topicDistribution,
    };
  }

  /**
   * Compute license distribution
   */
  private static computeLicenses(repos: RepositoryNode[]) {
    const licenseDistribution: Record<string, number> = {};
    let noLicenseCount = 0;

    repos.forEach((repo: RepositoryNode) => {
      if (repo.licenseInfo) {
        const licenseName = repo.licenseInfo.name || repo.licenseInfo.spdxId || "Unknown";
        licenseDistribution[licenseName] = (licenseDistribution[licenseName] || 0) + 1;
      } else {
        noLicenseCount++;
      }
    });

    const topLicense = Object.entries(licenseDistribution).length > 0
      ? Object.entries(licenseDistribution).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    return {
      topLicense,
      licenseDistribution,
      noLicenseCount,
      totalLicensed: Object.values(licenseDistribution).reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Compute repository growth metrics (approximate stars gained in year)
   */
  private static computeRepoGrowth(repos: RepositoryNode[], year: number) {
    const yearStart = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
    
    // Repos created in the year
    const reposCreatedInYear = repos.filter((repo: RepositoryNode) => {
      const createdAt = new Date(repo.createdAt);
      return createdAt >= yearStart;
    });

    const totalStarsFromNewRepos = reposCreatedInYear.reduce(
      (sum, repo) => sum + repo.stargazerCount,
      0
    );

    // Most starred repo created in the year
    const mostStarredNewRepo = reposCreatedInYear.length > 0
      ? reposCreatedInYear.reduce((prev, curr) =>
          curr.stargazerCount > prev.stargazerCount ? curr : prev
        , reposCreatedInYear[0])
      : null;

    return {
      reposCreatedInYear: reposCreatedInYear.length,
      totalStarsFromNewRepos,
      mostStarredNewRepo: mostStarredNewRepo
        ? {
            name: mostStarredNewRepo.name,
            stars: mostStarredNewRepo.stargazerCount,
          }
        : null,
    };
  }

  /**
   * Compute fork statistics
   */
  private static computeForkStats(repos: RepositoryNode[]) {
    const totalForks = repos.reduce((sum, repo) => sum + repo.forkCount, 0);
    const mostForkedRepo = repos.length > 0
      ? repos.reduce((prev, curr) =>
          curr.forkCount > prev.forkCount ? curr : prev
        , repos[0])
      : null;

    return {
      totalForks,
      averageForksPerRepo: repos.length > 0 ? totalForks / repos.length : 0,
      mostForkedRepo: mostForkedRepo
        ? {
            name: mostForkedRepo.name,
            forks: mostForkedRepo.forkCount,
          }
        : null,
    };
  }
}
