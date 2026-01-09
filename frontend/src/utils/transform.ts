import type { WrappedData, BackendWrappedData, Insight } from '../types';

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const fullMonthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const transformBackendData = (backendData: BackendWrappedData): WrappedData => {
  console.log("Transforming backend data:", backendData);
  const { insights, username, year } = backendData;
 // console.log("Backend Insights--------", insights);
 // console.log("The complete backend data ---",backendData)
  // Transform languages from distribution
  const topLanguages = Object.entries(insights.languages.languageDistribution)
    .map(([name, count]) => ({ name, count: count as number }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Transform monthly breakdown
  const monthlyBreakdown = monthNames.map((month, idx) => {
    const fullMonthName = fullMonthNames[idx];
    const contributions = insights.activity.commitsPerMonth[fullMonthName] || 0;
    return { month, contributions };
  });

  // Get insights array with categories
  const insightsArray: Insight[] = [];
  
  // Activity insights
  if (insights.activity.totalCommits > 0) {
    insightsArray.push({
      text: `${insights.activity.totalCommits} commits recorded`,
      category: 'activity',
      emoji: '💪'
    });
  }
  
  if (insights.activity.mostActiveMonth) {
    const mostActiveCommits = insights.activity.commitsPerMonth[insights.activity.mostActiveMonth] || 0;
    insightsArray.push({
      text: `Peak in ${insights.activity.mostActiveMonth} with ${mostActiveCommits} commits`,
      category: 'activity',
      emoji: '🔥'
    });
  }

  if (insights.activity.activeMonthsCount > 0) {
    insightsArray.push({
      text: `Active for ${insights.activity.activeMonthsCount} months this year`,
      category: 'activity',
      emoji: '📅'
    });
  }
  
  // Repository insights
  if (insights.repositories.mostStarredRepo) {
    insightsArray.push({
      text: `"${insights.repositories.mostStarredRepo.name}" is your star repo (${insights.repositories.mostStarredRepo.stars} stars)`,
      category: 'repository',
      emoji: '⭐'
    });
  }

  if (insights.repositories.reposCreatedInYear > 0) {
    insightsArray.push({
      text: `Created ${insights.repositories.reposCreatedInYear} ${insights.repositories.reposCreatedInYear === 1 ? 'repo' : 'repos'} this year`,
      category: 'repository',
      emoji: '🆕'
    });
  }

  if (insights.repositories.totalPublicRepos > 0) {
    insightsArray.push({
      text: `${insights.repositories.totalPublicRepos} public repos on your profile`,
      category: 'repository',
      emoji: '📦'
    });
  }
  
  // Language insights
  if (insights.languages.topLanguage) {
    insightsArray.push({
      text: `${insights.languages.topLanguage} is your main language`,
      category: 'language',
      emoji: '🎨'
    });
  }

  if (insights.languages.languageCount > 0) {
    insightsArray.push({
      text: `Working with ${insights.languages.languageCount} different languages`,
      category: 'language',
      emoji: '🌈'
    });
  }

  // Behavioral insights
  const totalBehaviorCommits = insights.behavior.weekdayCommits + insights.behavior.weekendCommits;
  if (totalBehaviorCommits > 0) {
    const weekdayPercentage = Math.round((insights.behavior.weekdayCommits / totalBehaviorCommits) * 100);
    if (weekdayPercentage > 70) {
      insightsArray.push({
        text: `${weekdayPercentage}% of commits on weekdays - You're dedicated!`,
        category: 'behavior',
        emoji: '💼'
      });
    } else if (weekdayPercentage < 30) {
      insightsArray.push({
        text: `${100 - weekdayPercentage}% of commits on weekends - Living that freelance life!`,
        category: 'behavior',
        emoji: '🎉'
      });
    }
  }

  if (insights.behavior.dayCommits > 0 || insights.behavior.nightCommits > 0) {
    const totalDayNightCommits = insights.behavior.dayCommits + insights.behavior.nightCommits;
    const dayPercentage = Math.round((insights.behavior.dayCommits / totalDayNightCommits) * 100);
    
    if (dayPercentage > 70) {
      insightsArray.push({
        text: 'Morning person! Most commits during daytime',
        category: 'behavior',
        emoji: '☀️'
      });
    } else if (dayPercentage < 30) {
      insightsArray.push({
        text: 'Night owl! Peak coding hours are after dark',
        category: 'behavior',
        emoji: '🌙'
      });
    } else {
      insightsArray.push({
        text: 'Balanced coder! Active both day and night',
        category: 'behavior',
        emoji: '🌓'
      });
    }
  }

  // Consistency insights
  if (insights.activity.totalCommits > 365) {
    insightsArray.push({
      text: 'Almost 1 commit per day - Legendary consistency!',
      category: 'consistency',
      emoji: '🎯'
    });
  } else if (insights.activity.totalCommits > 100) {
    insightsArray.push({
      text: 'Regular contributor - Keep the momentum!',
      category: 'consistency',
      emoji: '🚀'
    });
  } else if (insights.activity.totalCommits > 30) {
    insightsArray.push({
      text: 'Solid contributor - Great progress!',
      category: 'consistency',
      emoji: '💯'
    });
  }

  // Language diversity
  if (insights.languages.languageCount > 5) {
    insightsArray.push({
      text: 'Polyglot developer! Master of many languages!',
      category: 'language',
      emoji: '🎓'
    });
  }

  // Add insights from advanced data
  if (insights.advanced?.longestStreak?.days > 0) {
    insightsArray.push({
      text: `${insights.advanced.longestStreak.days} day streak - Unstoppable!`,
      category: 'consistency',
      emoji: '🔥'
    });
  }

  if (insights.advanced?.bestDayOfWeek) {
    insightsArray.push({
      text: `${insights.advanced.bestDayOfWeek.day} is your power day!`,
      category: 'behavior',
      emoji: '⚡'
    });
  }

  if (insights.advanced?.topics?.topTopics?.length > 0) {
    const topTopic = insights.advanced.topics.topTopics[0];
    insightsArray.push({
      text: `"${topTopic.topic}" is your favorite topic`,
      category: 'repository',
      emoji: '🏷️'
    });
  }

  if (insights.advanced?.forkStats?.mostForkedRepo) {
    insightsArray.push({
      text: `"${insights.advanced.forkStats.mostForkedRepo.name}" got forked ${insights.advanced.forkStats.mostForkedRepo.forks} times!`,
      category: 'repository',
      emoji: '🍴'
    });
  }

  if (insights.advanced?.repositoryGrowth?.mostStarredNewRepo) {
    insightsArray.push({
      text: `New repo "${insights.advanced.repositoryGrowth.mostStarredNewRepo.name}" got ${insights.advanced.repositoryGrowth.mostStarredNewRepo.stars} stars!`,
      category: 'repository',
      emoji: '🌟'
    });
  }

  // Prioritize and limit insights (most important ones)
  const priorityOrder = {
    'consistency': 0,  // Highest priority - consistency achievements are most impressive
    'activity': 1,     // Total commits and peak month
    'behavior': 2,     // Coding habits
    'language': 3,     // Main language
    'repository': 4    // Lowest priority - repos are less personal
  };

  // Sort and limit insights
  const finalSortedInsights = insightsArray.sort((a, b) => {
    const priorityA = priorityOrder[a.category];
    const priorityB = priorityOrder[b.category];
    return priorityA - priorityB;
  }).slice(0, 8); // Limit to max 8 insights

  return {
    username,
    year,
    totalCommits: insights.activity.totalCommits,
    totalContributions: insights.activity.totalContributions || insights.activity.totalCommits,
    totalRepositories: insights.repositories.totalPublicRepos,
    totalStars: insights.repositories.mostStarredRepo?.stars || 0,
    topLanguages,
    topRepositories: insights.repositories.mostStarredRepo 
      ? [{ name: insights.repositories.mostStarredRepo.name, stars: insights.repositories.mostStarredRepo.stars }]
      : [],
    totalPullRequests: insights.activity.pullRequests || 0,
    totalIssues: insights.activity.issues || 0,
    contributionStreak: insights.activity.activeMonthsCount,
    longestStreak: insights.advanced?.longestStreak?.days || 0,
    bestDayOfWeek: insights.advanced?.bestDayOfWeek?.day || null,
    monthlyBreakdown,
    insights: finalSortedInsights,
    profile: {
      accountAge: insights.profile?.accountAge || null,
      followers: insights.profile?.followers || 0,
      following: insights.profile?.following || 0,
      hasBio: insights.profile?.hasBio || false,
      hasCompany: insights.profile?.hasCompany || false,
      hasLocation: insights.profile?.hasLocation || false,
      bio: insights.profile?.bio || null,
      company: insights.profile?.company || null,
      location: insights.profile?.location || null,
    },
    topTopics: insights.advanced?.topics?.topTopics?.slice(0, 5) || [],
    forkStats: {
      totalForks: insights.advanced?.forkStats?.totalForks || 0,
      averageForksPerRepo: insights.advanced?.forkStats?.averageForksPerRepo || 0,
      mostForkedRepo: insights.advanced?.forkStats?.mostForkedRepo || null,
    },
    repositoryGrowth: {
      reposCreatedInYear: insights.advanced?.repositoryGrowth?.reposCreatedInYear || 0,
      totalStarsFromNewRepos: insights.advanced?.repositoryGrowth?.totalStarsFromNewRepos || 0,
      mostStarredNewRepo: insights.advanced?.repositoryGrowth?.mostStarredNewRepo || null,
    },
    mostActiveRepo: insights.advanced?.mostActiveRepository || null,
    licenses: {
      topLicense: insights.advanced?.licenses?.topLicense || null,
      licenseDistribution: insights.advanced?.licenses?.licenseDistribution || {},
      noLicenseCount: insights.advanced?.licenses?.noLicenseCount || 0,
      totalLicensed: insights.advanced?.licenses?.totalLicensed || 0,
    },
  };
};
