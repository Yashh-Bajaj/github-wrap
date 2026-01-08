// Funny and logical quotes based on commit count
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
