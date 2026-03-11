import { Casino, Game } from "./types";

export const CASINOS: Casino[] = [
  {
    id: "stake",
    name: "Stake",
    url: "https://stake.com/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/stake.svg",
    color: "#1475E1",
    offer: "200% deposit match up to $2,000",
    offerShort: "200% up to $2K",
    games: ["plinko", "crash", "mines", "dice", "limbo", "hilo", "keno", "flip"],
    features: ["Provably Fair", "Instant Crypto Payouts", "25M+ Users"],
    termsUrl: "https://stake.com/policies/terms",
    regionNote: "Not available in the UK",
  },
  {
    id: "rollbit",
    name: "Rollbit",
    url: "https://rollbit.com/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/rollbit.svg",
    color: "#FFD700",
    offer: "15% rakeback on all bets",
    offerShort: "15% Rakeback",
    games: ["plinko", "crash", "mines", "dice", "hilo"],
    features: ["Fast Payouts", "Crypto Trading", "NFT Integration"],
    termsUrl: "https://rollbit.com/terms",
  },
  {
    id: "bcgame",
    name: "BC.Game",
    url: "https://bc.game/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/bcgame.svg",
    color: "#27AE60",
    offer: "Spin Lucky Wheel for up to 5 BTC",
    offerShort: "Win up to 5 BTC",
    games: ["plinko", "crash", "mines", "dice", "limbo", "hilo", "keno"],
    features: ["140+ Cryptos", "10K+ Games", "Community Events"],
    termsUrl: "https://bc.game/terms",
  },
  {
    id: "wildio",
    name: "Wild.io",
    url: "https://wild.io/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/wildio.svg",
    color: "#8B5CF6",
    offer: "350% up to $10,000 + 200 free spins",
    offerShort: "350% + 200 Spins",
    games: ["plinko", "crash", "mines", "dice", "limbo"],
    features: ["VIP Program", "4000+ Slots", "Weekly Reload"],
    termsUrl: "https://wild.io/terms",
  },
  {
    id: "jackbit",
    name: "Jackbit",
    url: "https://jackbit.com/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/jackbit.svg",
    color: "#F97316",
    offer: "100 wager-free spins",
    offerShort: "100 Free Spins",
    games: ["plinko", "crash", "mines", "dice", "keno", "flip"],
    features: ["Wager-Free Bonuses", "Fast Payouts", "9000+ Games"],
    termsUrl: "https://jackbit.com/terms",
  },
  {
    id: "coincasino",
    name: "CoinCasino",
    url: "https://coincasino.com/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/coincasino.svg",
    color: "#EC4899",
    offer: "200% welcome bonus + WalletConnect",
    offerShort: "200% Welcome Bonus",
    games: ["plinko", "crash", "mines"],
    features: ["Since 2017", "21+ Cryptos", "Provably Fair"],
    termsUrl: "https://coincasino.com/terms",
  },
  {
    id: "rainbet",
    name: "Rainbet",
    url: "https://rainbet.com/?ref=paperbet&utm_source=paperbet&utm_medium=affiliate",
    logo: "/casinos/rainbet.svg",
    color: "#38BDF8",
    offer: "15% rakeback + rain rewards",
    offerShort: "15% Rakeback",
    games: ["plinko", "crash", "mines", "dice", "limbo", "keno"],
    features: ["Instant Payouts", "Rakeback Rewards", "Community Rain"],
    termsUrl: "https://rainbet.com/terms",
  },
];

export const GAMES: Game[] = [
  {
    id: "plinko",
    name: "Plinko",
    slug: "plinko",
    description:
      "Drop balls through pegs and hit multipliers up to 1,000x. Test risk levels and row configurations.",
    shortDesc: "Drop. Bounce. Multiply.",
    icon: "Triangle",
    color: "#00E5A0",
    available: true,
    rtp: 99,
  },
  {
    id: "crash",
    name: "Crash",
    slug: "crash",
    description:
      "Watch the multiplier rise and cash out before it crashes. Test auto-cashout strategies.",
    shortDesc: "Rise. Cash out. Or crash.",
    icon: "TrendingUp",
    color: "#00B4D8",
    available: true,
    rtp: 99,
  },
  {
    id: "mines",
    name: "Mines",
    slug: "mines",
    description:
      "Reveal tiles on a grid while avoiding hidden mines. The more you reveal, the higher your multiplier.",
    shortDesc: "Reveal. Avoid. Multiply.",
    icon: "Grid3x3",
    color: "#F59E0B",
    available: true,
    rtp: 99,
  },
  {
    id: "hilo",
    name: "HiLo",
    slug: "hilo",
    description:
      "Predict whether the next card is higher or lower. Build cumulative multipliers with each correct guess, or cash out anytime.",
    shortDesc: "Predict. Stack. Cash out.",
    icon: "ArrowUpDown",
    color: "#6366F1",
    available: true,
    rtp: 99,
  },
  {
    id: "dice",
    name: "Dice",
    slug: "dice",
    description:
      "Set your target number, pick Roll Over or Roll Under, and test strategies like Martingale and D'Alembert. The fastest game in crypto casinos.",
    shortDesc: "Set. Roll. Multiply.",
    icon: "Dices",
    color: "#14B8A6",
    available: true,
    rtp: 99,
  },
  {
    id: "limbo",
    name: "Limbo",
    slug: "limbo",
    description:
      "Set a target multiplier, place a bet, and see if the crash point beats your target. Instant results — the fastest game in crypto casinos.",
    shortDesc: "Target. Bet. Instant.",
    icon: "Zap",
    color: "#A855F7",
    available: true,
    rtp: 99,
  },
  {
    id: "keno",
    name: "Keno",
    slug: "keno",
    description:
      "Pick your lucky numbers from a 40-number grid, choose your difficulty level, and see how many match the casino draw. Up to 1,000x on High difficulty.",
    shortDesc: "Pick. Match. Multiply.",
    icon: "Grid3x3",
    color: "#A855F7",
    available: true,
    rtp: 99,
  },
  {
    id: "flip",
    name: "Flip",
    slug: "flip",
    description:
      "Pick Heads or Tails and flip the coin. Win 1.96x, then double or nothing — chain up to 20 flips for a maximum of 1,027,604x.",
    shortDesc: "Pick. Flip. Double.",
    icon: "Coins",
    color: "#F59E0B",
    available: true,
    rtp: 98,
  },
  {
    id: "roulette",
    name: "Roulette Lab",
    slug: "roulette",
    description:
      "Explore 7 free roulette tools: play free, test strategies with Monte Carlo simulation, calculate odds, and understand risk of ruin.",
    shortDesc: "Spin. Analyze. Learn.",
    icon: "Circle",
    color: "#10B981",
    available: true,
    rtp: 97.3,
  },
];

// ---------------------------------------------------------------------------
// Casino → Game RTP mapping (official published RTPs per casino)
// ---------------------------------------------------------------------------

export const CASINO_GAME_RTP: Record<string, Record<string, number>> = {
  stake: {
    plinko: 99, crash: 99, mines: 99, dice: 99, limbo: 99, hilo: 99, keno: 99, flip: 98,
  },
  bcgame: {
    plinko: 99, crash: 99, mines: 99, dice: 99, limbo: 99, hilo: 99, keno: 99,
  },
  rainbet: {
    plinko: 99, crash: 99, mines: 99, dice: 99, limbo: 99, keno: 99,
  },
  rollbit: {
    plinko: 99, crash: 95, mines: 99, dice: 99, hilo: 99,
  },
  wildio: {
    plinko: 97, crash: 97, dice: 97, mines: 97, limbo: 97,
  },
  coincasino: {
    plinko: 99, crash: 99, mines: 99,
  },
};

export const SITE = {
  name: "PaperBet.io",
  tagline: "Test Your Edge",
  url: "https://paperbet.io",
  description:
    "Free crypto casino simulators. Practice Plinko, Crash, Mines strategies risk-free, then discover featured deals at top crypto casinos.",
  disclaimer:
    "18+ | Gambling involves risk. Most players lose money over time. Only bet what you can afford to lose. PaperBet.io is a free simulator for educational purposes. We are not a gambling site. Links to third-party casinos are affiliate links — we may earn a commission at no extra cost to you.",
};
