export interface ReputationTier {
  id: 'LEGEND' | 'PULL_UP' | 'TRAFFIC_BLAMER' | 'COIN_TOSS' | 'GHOST' | 'ROOKIE';
  title: string;
  tagline: string;
  emoji: string;
  score: number;
  badgeClass: string;
  textClass: string;
}

export function getReputationTier(
  attended: number = 0,
  flaked: number = 0,
  strikes: number = 0
): ReputationTier {
  const total = attended + flaked;

  // New members with less than 2 completed plans
  if (total < 2) {
    return {
      id: 'ROOKIE',
      title: 'Fresh Blood',
      tagline: 'Blank slate. Untested energy. Time to build the streak.',
      emoji: '🐣',
      score: 100,
      badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
      textClass: 'text-purple-400',
    };
  }

  const score = Math.round((attended / total) * 100);

  // Active strikes or severe flaker
  if (strikes > 0 || score < 50) {
    return {
      id: 'GHOST',
      title: 'Professional Ghost',
      tagline: 'Legend says they were once spotted at a cafe in 2024. Proceed with caution.',
      emoji: '👻',
      score,
      badgeClass: 'bg-red-500/15 text-red-400 border-red-500/30',
      textClass: 'text-red-400',
    };
  }

  // 100% Reliable (minimum 3 outings)
  if (score === 100 && attended >= 3) {
    return {
      id: 'LEGEND',
      title: 'Absolute Legend',
      tagline: "Word is bond. If they say they're coming, they're already there.",
      emoji: '👑',
      score,
      badgeClass: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/30',
      textClass: 'text-[#1DB954]',
    };
  }

  // 90% - 99% Reliable
  if (score >= 90) {
    return {
      id: 'PULL_UP',
      title: 'Certified Pull-Up',
      tagline: "Solid as a rock. 9 out of 10 times, they're the first to arrive.",
      emoji: '⚡',
      score,
      badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      textClass: 'text-cyan-400',
    };
  }

  // 75% - 89% Reliable
  if (score >= 75) {
    return {
      id: 'TRAFFIC_BLAMER',
      title: 'Traffic Blamer',
      tagline: 'Will show up, but will definitely blame traffic for being 15 mins late.',
      emoji: '🚗',
      score,
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      textClass: 'text-amber-400',
    };
  }

  // 50% - 74%
  return {
    id: 'COIN_TOSS',
    title: 'Coin Toss',
    tagline: "50/50 chance of a 'sudden family dinner' excuse dropping at 7 PM.",
    emoji: '🎲',
    score,
    badgeClass: 'bg-[#FF5E3A]/15 text-[#FF5E3A] border-[#FF5E3A]/30',
    textClass: 'text-[#FF5E3A]',
  };
}
