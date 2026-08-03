export function getRoundLabels(teamsCount) {
  const totalRounds = Math.log2(teamsCount);
  const labels = [];
  for (let i = 0; i < totalRounds; i++) {
    const remaining = totalRounds - i;
    if (remaining === 1) labels.push("Final");
    else if (remaining === 2) labels.push("Semi Final");
    else if (remaining === 3) labels.push("Quarter Final");
    else labels.push(`Round ${i + 1}`);
  }
  return labels;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateBracket(teams) {
  const shuffled = shuffle(teams);
  const roundLabels = getRoundLabels(shuffled.length);
  const matches = [];

  roundLabels.forEach((roundName, rIndex) => {
    const matchesInRound = shuffled.length / Math.pow(2, rIndex + 1);
    for (let m = 0; m < matchesInRound; m++) {
      matches.push({
        id: `r${rIndex}-m${m}`,
        round: roundName,
        roundIndex: rIndex,
        matchIndex: m,
        teamA: rIndex === 0 ? shuffled[m * 2]?.name : null,
        teamB: rIndex === 0 ? shuffled[m * 2 + 1]?.name : null,
        scoreA: null,
        scoreB: null,
        time: null,
        isDone: false,
        isLive: false,
      });
    }
  });

  return { rounds: roundLabels, matches };
}

export function advanceWinner(tournament, matchId, scoreA, scoreB) {
  const matches = tournament.matches.map((m) => (m.id === matchId ? { ...m, scoreA, scoreB, isDone: true, isLive: false } : m));
  const match = matches.find((m) => m.id === matchId);
  const winner = scoreA > scoreB ? match.teamA : match.teamB;
  const isFinal = match.round === tournament.rounds[tournament.rounds.length - 1];

  let updatedMatches = matches;
  if (!isFinal) {
    const nextRoundIndex = match.roundIndex + 1;
    const nextMatchIndex = Math.floor(match.matchIndex / 2);
    const slot = match.matchIndex % 2 === 0 ? "teamA" : "teamB";
    const nextMatchId = `r${nextRoundIndex}-m${nextMatchIndex}`;
    updatedMatches = matches.map((m) => (m.id === nextMatchId ? { ...m, [slot]: winner } : m));
  }

  return {
    ...tournament,
    matches: updatedMatches,
    status: isFinal ? "completed" : "live",
    champion: isFinal ? { teamName: winner } : tournament.champion,
  };
}

export function computeTimeline(tournament) {
  const teamsCount = tournament.teams?.length ?? 0;
  const hasMatches = tournament.matches?.length > 0;

  return [
    { label: "التسجيل مفتوح", done: true, active: tournament.status === "registration" },
    {
      label: `توليد جدول المباريات (${teamsCount}/${tournament.maxTeams} فرق)`,
      done: hasMatches,
      active: !hasMatches && teamsCount >= tournament.maxTeams,
    },
    { label: "بداية البطولة", done: tournament.status === "live" || tournament.status === "completed", active: tournament.status === "ready" },
    { label: "النهائي", done: tournament.status === "completed", active: tournament.status === "live" },
  ];
}
