import WrappedResult, { WrappedResultDocument } from "../models/WrappedResult";
import { GitHubService } from "./github.service";

interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface Repository {
  name: string;
  stargazerCount: number;
  createdAt: string;
  languages: {
    nodes: Array<{ name: string }>;
  };
}

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

    // 3. Compute insights
    const insights = this.computeInsights(userOverview, contributions, year);

    // 4. Store in MongoDB
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
  private static computeInsights(userOverview: any, contributions: any, year: number) {
    const contribData = contributions.user.contributionsCollection;
    const repos = userOverview.user.repositories.nodes;

    // Activity insights
    const activity = this.computeActivity(contribData, year);

    // Repository insights
    const repositories = this.computeRepositories(repos, year);

    // Language insights
    const languages = this.computeLanguages(repos);

    // Behavior insights
    const behavior = this.computeBehavior(contribData);

    return {
      activity,
      repositories,
      languages,
      behavior,
    };
  }

  /**
   * Compute activity metrics
   */
  private static computeActivity(contribData: any, year: number) {
    const weeks: Week[] = contribData.contributionCalendar.weeks;
    const commitsPerMonth: Record<string, number> = {};
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
      commitsPerMonth[month] = 0;
      monthCounts[month] = 0;
    });

    // Aggregate commits by month
    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        const date = new Date(day.date);

        // Only count contributions that fall into the requested year
        if (date.getFullYear() !== year) return;

        const monthName = months[date.getMonth()];
        commitsPerMonth[monthName] += day.contributionCount;
        if (day.contributionCount > 0) {
          monthCounts[monthName] = 1; // Mark as active
        }
      });
    });

    // Find most active month
    let mostActiveMonth: string | null = null;
    let maxCommits = 0;
    for (const [month, commits] of Object.entries(commitsPerMonth)) {
      if ((commits as number) > maxCommits) {
        maxCommits = commits as number;
        mostActiveMonth = month;
      }
    }

    const activeMonthsCount = Object.values(monthCounts).filter((v) => v === 1).length;

    return {
      totalCommits: contribData.totalCommitContributions,
      commitsPerMonth,
      mostActiveMonth,
      activeMonthsCount,
    };
  }

  /**
   * Compute repository insights
   */
  private static computeRepositories(repos: Repository[], year: number) {
    const yearStart = new Date(`${year}-01-01`);
    const yearEnd = new Date(`${year}-12-31`);

    const reposCreatedInYear = repos.filter((repo: Repository) => {
      const createdAt = new Date(repo.createdAt);
      return createdAt >= yearStart && createdAt <= yearEnd;
    }).length;

    // Find the repository with the highest stargazer count (don't assume input is sorted)
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
      totalPublicRepos: repos.length,
      reposCreatedInYear,
      mostStarredRepo,
    };
  }

  /**
   * Compute language distribution
   */
  private static computeLanguages(repos: Repository[]) {
    const languageDistribution: Record<string, number> = {};

    repos.forEach((repo: Repository) => {
      repo.languages.nodes.forEach((lang: { name: string }) => {
        if (lang.name) {
          languageDistribution[lang.name] =
            (languageDistribution[lang.name] || 0) + 1;
        }
      });
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
   * Compute behavior patterns (weekday/weekend, day/night)
   */
  private static computeBehavior(contribData: any) {
    const weeks: Week[] = contribData.contributionCalendar.weeks;
    let weekdayCommits = 0;
    let weekendCommits = 0;
    let dayCommits = 0; // 6 AM - 6 PM (rough estimate based on typical patterns)
    let nightCommits = 0; // 6 PM - 6 AM (rough estimate)

    weeks.forEach((week: Week) => {
      week.contributionDays.forEach((day: ContributionDay) => {
        // GitHub calendar day objects don't always include a weekday field reliably,
        // so compute it from the date string.
        const date = new Date(day.date);
        const weekday = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

        if (weekday === 0 || weekday === 6) {
          weekendCommits += day.contributionCount;
        } else {
          weekdayCommits += day.contributionCount;
        }

        // Simplified estimate: assume ~60% day, ~40% night. Use rounding for better totals.
        dayCommits += Math.round(day.contributionCount * 0.6);
        nightCommits += Math.round(day.contributionCount * 0.4);
      });
    });

    return {
      weekdayCommits,
      weekendCommits,
      dayCommits,
      nightCommits,
    };
  }
}
