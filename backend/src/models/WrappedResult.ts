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
      totalCommits: number;
      commitsPerMonth: Record<string, number>;
      mostActiveMonth: string | null;
      activeMonthsCount: number;
      pullRequests?: number
      issues?: number
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
        commitsPerMonth: { type: Map, of: Number, required: true },
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
        languageDistribution: { type: Map, of: Number, required: true },
        languageCount: { type: Number, required: true },
      },

      behavior: {
        weekdayCommits: { type: Number, required: true },
        weekendCommits: { type: Number, required: true },
        dayCommits: { type: Number, required: true },
        nightCommits: { type: Number, required: true },
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
