import type { WrappedData } from '../types';

// Comprehensive quote system with funny/roasting quotes based on insights
export const getQuoteForData = (data: WrappedData): string => {
  // Priority order: roast low activity, celebrate high activity, then other insights
  
  // ROASTING QUOTES (Low activity)
  if (data.totalCommits === 0) {
    return "🦗 The GitHub void has spoken... and it's deafening silence. Maybe try committing something? 🤔";
  }
  
  if (data.totalCommits < 10) {
    const roasts = [
      "🐣 You're learning! Slowly. Like a penguin on ice. 🧊",
      "🪨 Your commit history is more barren than a desert. Time to water that code garden! 🌵",
      "💤 Wakey wakey! Your GitHub is having a year-long nap! 😴",
      "🦥 Sloth mode activated! At least you're consistent... at being inactive! 🐌"
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  if (data.totalCommits < 50) {
    const roasts = [
      "🌱 Tiny seedling energy! Your code garden is sprouting! 🌿",
      "🐌 You're moving at the speed of... well, a snail. But hey, progress is progress! 🐢",
      "📦 Your commits are rarer than a blue moon. Make it rain code! ☔",
      "🎯 Aiming for the stars but hitting the ground. Keep trying! 🚀"
    ];
    return roasts[Math.floor(Math.random() * roasts.length)];
  }

  // STREAK-BASED QUOTES
  if (data.longestStreak >= 365) {
    return "🔥🔥🔥 365+ DAY STREAK?! You're not human, you're a commit-generating machine! The GitHub gods bow to you! 👑⚡";
  }
  
  if (data.longestStreak >= 100) {
    const streakQuotes = [
      `🔥 ${data.longestStreak} DAY STREAK! You're basically a coding deity now! The streak is longer than most relationships! 💪`,
      `⚡ ${data.longestStreak} days of pure dedication! Your GitHub graph looks like a work of art! 🎨`,
      `💎 ${data.longestStreak} days straight?! You're the definition of consistency! Even your coffee is jealous! ☕`
    ];
    return streakQuotes[Math.floor(Math.random() * streakQuotes.length)];
  }

  if (data.longestStreak >= 30) {
    return `🔥 ${data.longestStreak} day streak! You're building habits that would make James Clear proud! 📚✨`;
  }

  // BEST DAY OF WEEK QUOTES
  if (data.bestDayOfWeek) {
    const dayQuotes: Record<string, string[]> = {
      'Monday': [
        "💼 Monday is your power day! You're the person who actually likes Mondays! (Weird flex but okay) 😎",
        "🌅 Monday warrior! While others are crying, you're committing! Respect! 👏"
      ],
      'Tuesday': [
        "🔥 Tuesday is your jam! You've cracked the code to productivity! 🚀",
        "⚡ Tuesday energy unmatched! You're making the week your playground! 🎮"
      ],
      'Wednesday': [
        "🐪 Hump day? More like JUMP day! You're crushing Wednesdays! 💪",
        "🌊 Wednesday wave rider! You're surfing through the week like a pro! 🏄"
      ],
      'Thursday': [
        "🎯 Thursday is your throne! You're ruling the week from the middle! 👑",
        "⚡ Thursday thunder! You're electrifying the week! ⚡"
      ],
      'Friday': [
        "🎉 Friday is your vibe! While others are checking out, you're checking in (code)! 💻",
        "🔥 Friday fire! You're ending the week with a BANG! 💥"
      ],
      'Saturday': [
        "🎪 Saturday coder! You're the weekend warrior we all aspire to be! 🏆",
        "☕ Saturday commits? You're built different! The grind never stops! 💪"
      ],
      'Sunday': [
        "🙏 Sunday saint! You're coding on the day of rest! The dedication is real! ✨",
        "🌅 Sunday morning commits? You're either a legend or need to touch grass! 🌱"
      ]
    };
    const quotes = dayQuotes[data.bestDayOfWeek] || [`${data.bestDayOfWeek} is your power day! ⚡`];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // COMMIT COUNT QUOTES
  if (data.totalCommits < 100) {
    return "🔥 Now we're cooking! You've got the momentum of a caffeinated squirrel! ☕🐿️";
  }
  
  if (data.totalCommits < 250) {
    return "⚡ Beast mode unlocked! Your commit graph looking thicc and spicy! 💪";
  }
  
  if (data.totalCommits < 500) {
    return "🤖 Are you even human? This commit count screams 'I AM ONE WITH THE CODE'! 👨‍💻";
  }
  
  if (data.totalCommits < 1000) {
    return "🚀 LEGEND STATUS ACHIEVED! Your GitHub profile is basically a lifestyle brand now! 👑";
  }
  
  if (data.totalCommits < 2000) {
    return "💎 ELITE TIER! Honestly, we're not worthy! Your commits have commits! 🙏✨";
  }
  
  if (data.totalCommits < 5000) {
    return "👽 Are you from the future? This commit count defies physics and human limitations! 🌌";
  }
  
  if (data.totalCommits >= 5000) {
    return "🌪️ COMMIT SINGULARITY ACHIEVED! You've transcended the mortal plane of coding! You ARE the algorithm! 🧠⚙️";
  }

  // REPOSITORY-BASED QUOTES
  if (data.repositoryGrowth.reposCreatedInYear === 0 && data.totalRepositories > 0) {
    return "📦 Zero new repos this year? Your existing repos are getting all the love! Relationship goals! 💕";
  }

  if (data.repositoryGrowth.reposCreatedInYear > 20) {
    return `🆕 ${data.repositoryGrowth.reposCreatedInYear} new repos?! You're a repo factory! Quality over quantity though... maybe? 🤔`;
  }

  if (data.forkStats.totalForks === 0 && data.totalRepositories > 5) {
    return "🍴 Zero forks? Your repos are like a secret club... that nobody wants to join! 😅";
  }

  if (data.forkStats.totalForks > 100) {
    return `🍴 ${data.forkStats.totalForks} forks?! Your code is being forked more than a dinner table! People love your work! 🎉`;
  }

  // TOPIC-BASED QUOTES
  if (data.topTopics.length > 0) {
    const topTopic = data.topTopics[0];
    if (topTopic.count > 10) {
      return `🏷️ You're OBSESSED with "${topTopic.topic}"! ${topTopic.count} repos? That's not a hobby, that's a lifestyle! 🔥`;
    }
  }

  // PROFILE-BASED QUOTES
  if (data.profile.followers === 0) {
    return "👻 Zero followers? You're coding in the shadows! Time to step into the spotlight! ✨";
  }

  if (data.profile.followers > 1000) {
    return `👑 ${data.profile.followers} followers?! You're basically GitHub famous! The influencer we didn't know we needed! 🌟`;
  }

  if (!data.profile.hasBio && data.totalCommits > 100) {
    return "📝 No bio but ${data.totalCommits} commits? Your code speaks louder than words! (But maybe add a bio?) 😉";
  }

  // LANGUAGE-BASED QUOTES
  if (data.topLanguages.length === 1) {
    return `🎯 One language to rule them all! "${data.topLanguages[0].name}" is your entire personality! (And we respect that!) 💪`;
  }

  if (data.topLanguages.length > 8) {
    return `🌈 ${data.topLanguages.length} languages?! You're a polyglot legend! Your brain must be a language processor! 🧠`;
  }

  // DEFAULT FALLBACK
  return "✨ Your GitHub journey is unique! Keep coding, keep committing, keep being awesome! 🚀";
};

// Legacy function for backward compatibility
export const getQuoteForCommits = (commitCount: number): string => {
  if (commitCount === 0) {
    return "🦗 The GitHub void has spoken... and it's deafening silence. Maybe try committing something? 🤔";
  }
  if (commitCount < 10) {
    return "🐣 You're learning! Slowly. Like a penguin on ice. 🧊";
  }
  if (commitCount < 50) {
    return "🌱 Tiny seedling energy! Your code garden is sprouting! 🌿";
  }
  if (commitCount < 100) {
    return "🔥 Now we're cooking! You've got the momentum of a caffeinated squirrel! ☕🐿️";
  }
  if (commitCount < 250) {
    return "⚡ Beast mode unlocked! Your commit graph looking thicc and spicy! 💪";
  }
  if (commitCount < 500) {
    return "🤖 Are you even human? This commit count screams 'I AM ONE WITH THE CODE'! 👨‍💻";
  }
  if (commitCount < 1000) {
    return "🚀 LEGEND STATUS ACHIEVED! Your GitHub profile is basically a lifestyle brand now! 👑";
  }
  if (commitCount < 2000) {
    return "💎 ELITE TIER! Honestly, we're not worthy! Your commits have commits! 🙏✨";
  }
  if (commitCount < 5000) {
    return "👽 Are you from the future? This commit count defies physics and human limitations! 🌌";
  }
  return "🌪️ COMMIT SINGULARITY ACHIEVED! You've transcended the mortal plane of coding! You ARE the algorithm! 🧠⚙️";
};

export const getFunnyErrorQuote = (): string => {
  const errorQuotes = [
    "🤷‍♂️ User.exe has stopped responding... Did you try turning it off and on again?",
    "🔍 Houston, we have a problem: This GitHub user exists only in the quantum realm!",
    "💀 Oof! That user is rarer than a working Windows update!",
    "🎪 ERROR 404: GitHub user not found (maybe they're just a legend?)",
    "🚨 RED ALERT! This user might be a mythical creature! Ever seen one in real life?",
    "🌀 BZZZZT! That username caused a singularity in the GitHub space-time continuum!",
    "🪦 RIP to this username's GitHub account... never existed! 💔",
  ];
  return errorQuotes[Math.floor(Math.random() * errorQuotes.length)];
};

export const getPrivateReposMessage = (): string => {
  const messages = [
    "🔐 Psst! Wanna see private repos? Slide into our DMs! We take bribes in the form of coffee ☕",
    "🕵️ Your private repos are like a secret stash of snacks... We can't see 'em without permission! 🍪",
    "🔒 Private repos? That's some Fort Knox energy! Contact us if you want the full tour! 👀",
    "🤐 Those private repos are spicier than our GitHub wrap can handle! Talk to us! 💬",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};
