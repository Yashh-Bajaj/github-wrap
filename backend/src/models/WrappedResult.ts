import mongoose, { Schema, Document } from "mongoose";

export interface WrappedResultDocument extends Document {
  username: string;
  year: number;
  generatedAt: Date;

  source: {
    type: "public";
    note: string;
  };

  insights: {
    activity: {
      totalCommits: number; // Only commits authored by user
      totalContributions?: number; // All contributions (commits + PRs + issues + reviews) - matches calendar total
      commitsPerMonth: Record<string, number>; // Actually all contributions per month (commits + PRs + issues + reviews)
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

const WrappedResultSchema = new Schema<WrappedResultDocument>(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },

    source: {
      type: {
        type: String,
        enum: ["public"],
        required: true,
      },
      note: {
        type: String,
        required: true,
      },
    },

    insights: {
      activity: {
        totalCommits: { type: Number, required: true },
        totalContributions: { type: Number },
        commitsPerMonth: { type: Schema.Types.Mixed, required: true },
        mostActiveMonth: { type: String },
        activeMonthsCount: { type: Number, required: true },
        pullRequests: { type: Number },
        issues: { type: Number}
      },

      repositories: {
        totalPublicRepos: { type: Number, required: true },
        reposCreatedInYear: { type: Number, required: true },
        mostStarredRepo: {
          name: { type: String },
          stars: { type: Number },
        },
      },

      languages: {
        topLanguage: { type: String },
        topLanguageBySize: { type: String },
        languageDistribution: { type: Schema.Types.Mixed, required: true },
        languageSizes: { type: Schema.Types.Mixed },
        languageCount: { type: Number, required: true },
      },

      behavior: {
        weekdayCommits: { type: Number, required: true },
        weekendCommits: { type: Number, required: true },
        dayCommits: { type: Number, required: true },
        nightCommits: { type: Number, required: true },
      },

      profile: {
        accountAge: { type: Number },
        followers: { type: Number, required: true },
        following: { type: Number, required: true },
        hasBio: { type: Boolean, required: true },
        hasCompany: { type: Boolean, required: true },
        hasLocation: { type: Boolean, required: true },
        bio: { type: String },
        company: { type: String },
        location: { type: String },
      },

      advanced: {
        longestStreak: {
          days: { type: Number, required: true },
          startDate: { type: String },
          endDate: { type: String },
        },
        bestDayOfWeek: {
          day: { type: String },
          contributions: { type: Number },
        },
        mostActiveRepository: {
          name: { type: String },
          lastPush: { type: String },
        },
        topics: {
          topTopics: [{
            topic: { type: String },
            count: { type: Number },
          }],
          totalUniqueTopics: { type: Number, required: true },
          topicDistribution: { type: Schema.Types.Mixed },
        },
        licenses: {
          topLicense: { type: String },
          licenseDistribution: { type: Schema.Types.Mixed },
          noLicenseCount: { type: Number, required: true },
          totalLicensed: { type: Number, required: true },
        },
        repositoryGrowth: {
          reposCreatedInYear: { type: Number, required: true },
          totalStarsFromNewRepos: { type: Number, required: true },
          mostStarredNewRepo: {
            name: { type: String },
            stars: { type: Number },
          },
        },
        forkStats: {
          totalForks: { type: Number, required: true },
          averageForksPerRepo: { type: Number, required: true },
          mostForkedRepo: {
            name: { type: String },
            forks: { type: Number },
          },
        },
      },
    },
  },
  {
    timestamps: false,
  }
);

/* Prevent duplicate wrapped generation */
WrappedResultSchema.index({ username: 1, year: 1 }, { unique: true });

export default mongoose.model<WrappedResultDocument>(
  "WrappedResult",
  WrappedResultSchema
);
