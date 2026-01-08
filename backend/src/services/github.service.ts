import { gql } from "graphql-request";
import { createGitHubClient } from "../config/github";

const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  throw new Error("GITHUB_TOKEN environment variable is required");
}

const client = createGitHubClient(githubToken);

// GraphQL Queries
const USER_OVERVIEW_QUERY = gql`
  query getUserOverview($userName:String!) {
    user(login: $userName) {
      login
      repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
        totalCount
        nodes {
          name
          stargazerCount
          createdAt
          languages(first: 10) {
            nodes {
              name
            }
          }
        }
      }
    }
  }
`;

const USER_CONTRIBUTIONS_QUERY = gql`
  query getUserContributions($userName:String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalRepositoryContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              weekday
            }
          }
        }
      }
    }
  }
`;

interface RepositoryNode {
  name: string;
  stargazerCount: number;
  createdAt: string;
  languages: {
    nodes: Array<{ name: string }>;
  };
}

interface UserOverviewResponse {
  user: {
    login: string;
    repositories: {
      totalCount: number;
      nodes: RepositoryNode[];
    };
  };
}

interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionsResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalRepositoryContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      totalRepositoriesWithContributedCommits: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Week[];
      };
    };
  };
}

export class GitHubService {
  static async fetchUserOverview(username: string): Promise<UserOverviewResponse> {
    try {
      const data = await client.request<UserOverviewResponse>(USER_OVERVIEW_QUERY, {
        userName: username,
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch user overview for ${username}: ${error}`);
    }
  }

  static async fetchUserContributions(
    username: string,
    year: number
  ): Promise<ContributionsResponse> {
    try {
      const from = new Date(`${year}-01-01T00:00:00Z`).toISOString();
      const to = new Date(`${year}-12-31T23:59:59Z`).toISOString();

      const data = await client.request<ContributionsResponse>(
        USER_CONTRIBUTIONS_QUERY,
        {
          userName: username,
          from,
          to,
        }
      );
      return data;
    } catch (error) {
      throw new Error(
        `Failed to fetch contributions for ${username} (${year}): ${error}`
      );
    }
  }
}
