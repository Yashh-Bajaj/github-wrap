import { GraphQLClient } from "graphql-request";

const endpoint = "https://api.github.com/graphql";

export const createGitHubClient = (token: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};
