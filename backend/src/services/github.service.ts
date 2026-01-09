import { gql } from "graphql-request";
import { createGitHubClient } from "../config/github";
import dotenv from "dotenv";
dotenv.config();
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  throw new Error("GITHUB_TOKEN environment variable is required");
}

const client = createGitHubClient(githubToken);

// GraphQL Queries with pagination support - Enhanced with maximum data
const USER_REPOSITORIES_PAGINATED_QUERY = gql`
  query getUserRepositories($userName: String!, $cursor: String) {
    user(login: $userName) {
      login
      createdAt
      bio
      company
      location
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(
        first: 100
        after: $cursor
        orderBy: { field: UPDATED_AT, direction: DESC }
        ownerAffiliations: OWNER
      ) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          description
          stargazerCount
          forkCount
          watchers {
            totalCount
          }
          createdAt
          updatedAt
          pushedAt
          isArchived
          isPrivate
          diskUsage
          primaryLanguage {
            name
            color
          }
          languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
          licenseInfo {
            name
            spdxId
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
`;

const USER_CONTRIBUTIONS_QUERY = gql`
  query getUserContributions($userName: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $userName) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalRepositoryContributions
        totalIssueContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        restrictedContributionsCount
        totalRepositoriesWithContributedCommits
        startedAt
        endedAt
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

// Type definitions - Enhanced with maximum data
export interface RepositoryNode {
  name: string;
  description: string | null;
  stargazerCount: number;
  forkCount: number;
  watchers: {
    totalCount: number;
  };
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  isArchived: boolean;
  isPrivate: boolean;
  diskUsage: number | null;
  primaryLanguage: {
    name: string;
    color: string | null;
  } | null;
  languages: {
    totalSize: number;
    edges: Array<{
      size: number;
      node: {
        name: string;
        color: string | null;
      };
    }>;
  };
  licenseInfo: {
    name: string;
    spdxId: string;
  } | null;
  repositoryTopics: {
    nodes: Array<{
      topic: {
        name: string;
      };
    }>;
  };
}

export interface UserOverviewResponse {
  user: {
    login: string;
    createdAt: string;
    bio: string | null;
    company: string | null;
    location: string | null;
    followers: {
      totalCount: number;
    };
    following: {
      totalCount: number;
    };
    repositories: {
      totalCount: number;
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: RepositoryNode[];
    } | null;
  } | null;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface Week {
  contributionDays: ContributionDay[];
}

export interface ContributionsResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalRepositoryContributions: number;
      totalIssueContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      restrictedContributionsCount: number;
      totalRepositoriesWithContributedCommits: number;
      startedAt: string;
      endedAt: string;
      contributionCalendar: {
        totalContributions: number;
        weeks: Week[];
      };
    } | null;
  } | null;
}

export class GitHubService {
  /**
   * Fetch all repositories for a user with pagination
   * This ensures we get complete data even for users with 100+ repositories
   */
  static async fetchUserOverview(username: string): Promise<UserOverviewResponse> {
    try {
      let allRepositories: RepositoryNode[] = [];
      let totalCount = 0;
      let cursor: string | null = null;
      let hasNextPage = true;
      let userProfileData: {
        login: string;
        createdAt: string;
        bio: string | null;
        company: string | null;
        location: string | null;
        followers: { totalCount: number };
        following: { totalCount: number };
      } | null = null;

      // Paginate through all repositories
      while (hasNextPage) {
        type PaginatedResponse = {
          user: {
            login: string;
            createdAt: string;
            bio: string | null;
            company: string | null;
            location: string | null;
            followers: { totalCount: number };
            following: { totalCount: number };
            repositories: {
              totalCount: number;
              pageInfo: {
                hasNextPage: boolean;
                endCursor: string | null;
              };
              nodes: RepositoryNode[];
            } | null;
          } | null;
        };

        const data: PaginatedResponse = await client.request<PaginatedResponse>(
          USER_REPOSITORIES_PAGINATED_QUERY,
          {
            userName: username,
            cursor,
          }
        );

        // Check if user exists
        if (!data.user) {
          throw new Error(`User '${username}' not found on GitHub`);
        }

        // Store user profile data from first page (same for all pages)
        if (!userProfileData) {
          userProfileData = {
            login: data.user.login,
            createdAt: data.user.createdAt,
            bio: data.user.bio,
            company: data.user.company,
            location: data.user.location,
            followers: data.user.followers,
            following: data.user.following,
          };
        }

        // Check if repositories field exists
        if (!data.user.repositories) {
          throw new Error(`Unable to fetch repositories for user '${username}'`);
        }

        const repos: NonNullable<typeof data.user.repositories> = data.user.repositories;
        totalCount = repos.totalCount;
        allRepositories = allRepositories.concat(repos.nodes);
        hasNextPage = repos.pageInfo.hasNextPage;
        cursor = repos.pageInfo.endCursor;

        // Safety limit: prevent infinite loops (max 1000 repos = 10 pages)
        if (allRepositories.length >= 1000) {
          console.warn(
            `Warning: Reached 1000 repository limit for ${username}. Total count: ${totalCount}`
          );
          break;
        }
      }

      const result: UserOverviewResponse = {
        user: {
          login: userProfileData!.login,
          createdAt: userProfileData!.createdAt,
          bio: userProfileData!.bio,
          company: userProfileData!.company,
          location: userProfileData!.location,
          followers: userProfileData!.followers,
          following: userProfileData!.following,
          repositories: {
            totalCount,
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
            nodes: allRepositories,
          },
        },
      };

      console.log(
        `✓ Fetched ${allRepositories.length} repositories (total: ${totalCount}) for ${username}`
      );
      return result;
    } catch (error: any) {
      // Handle GraphQL errors more gracefully
      if (error.response?.errors) {
        const graphqlError = error.response.errors[0];
        if (graphqlError.type === "NOT_FOUND") {
          throw new Error(`User '${username}' not found on GitHub`);
        }
        throw new Error(
          `GitHub API error: ${graphqlError.message || "Unknown error"}`
        );
      }
      throw new Error(
        `Failed to fetch user overview for ${username}: ${error.message || error}`
      );
    }
  }

  /**
   * Fetch user contributions for a specific year
   * Date range is set to cover the entire year in UTC
   */
  static async fetchUserContributions(
    username: string,
    year: number
  ): Promise<ContributionsResponse> {
    try {
      // Use precise date boundaries for the year in UTC
      const from = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)).toISOString();
      const to = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)).toISOString();

      const data = await client.request<ContributionsResponse>(
        USER_CONTRIBUTIONS_QUERY,
        {
          userName: username,
          from,
          to,
        }
      );

      // Validate user exists
      if (!data.user) {
        throw new Error(`User '${username}' not found on GitHub`);
      }

      // Validate contributions collection exists
      if (!data.user.contributionsCollection) {
        throw new Error(
          `Unable to fetch contributions for user '${username}' for year ${year}`
        );
      }

      console.log(
        `✓ Fetched contributions for ${username} (${year}): ${data.user.contributionsCollection.totalCommitContributions} commits`
      );
      return data;
    } catch (error: any) {
      // Handle GraphQL errors more gracefully
      if (error.response?.errors) {
        const graphqlError = error.response.errors[0];
        if (graphqlError.type === "NOT_FOUND") {
          throw new Error(`User '${username}' not found on GitHub`);
        }
        throw new Error(
          `GitHub API error: ${graphqlError.message || "Unknown error"}`
        );
      }
      throw new Error(
        `Failed to fetch contributions for ${username} (${year}): ${error.message || error}`
      );
    }
  }
}
