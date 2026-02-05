export class MatchEngine {
  static play({ homeTeam, awayTeam, tacticsHome }) {
    const aiStyle = awayTeam.aiProfile;
    const aiPress = aiStyle === 'aggressive' ? 65 : aiStyle === 'balanced' ? 52 : 45;
    const aiTempo = aiStyle === 'aggressive' ? 62 : aiStyle === 'balanced' ? 54 : 47;

    const homeStrength = homeTeam.getPower() + (tacticsHome.press + tacticsHome.tempo + tacticsHome.risk) * 0.05;
    const awayStrength = awayTeam.getPower() + (aiPress + aiTempo) * 0.05;

    const homeGoals = Math.min(6, Math.max(0, Math.round((homeStrength - 55 + Math.random() * 18) / 14)));
    const awayGoals = Math.min(6, Math.max(0, Math.round((awayStrength - 58 + Math.random() * 16) / 14)));

    const events = [];
    const scorersHome = homeTeam.getStartingXI();
    const scorersAway = awayTeam.getStartingXI();

    for (let i = 0; i < homeGoals; i += 1) {
      const player = scorersHome[Math.floor(Math.random() * scorersHome.length)];
      player.registerMatch({ goals: 1, ratingImpact: 0.25 });
      events.push(`${8 + Math.floor(Math.random() * 82)}' ${homeTeam.name}: ${player.name} gol!`);
    }

    for (let i = 0; i < awayGoals; i += 1) {
      const player = scorersAway[Math.floor(Math.random() * scorersAway.length)];
      player.registerMatch({ goals: 1, ratingImpact: 0.2 });
      events.push(`${8 + Math.floor(Math.random() * 82)}' ${awayTeam.name}: ${player.name} gol!`);
    }

    homeTeam.getStartingXI().forEach((player) => {
      if (Math.random() > 0.78) {
        player.registerMatch({ assists: 1, ratingImpact: 0.1 });
      } else {
        player.registerMatch({ ratingImpact: homeGoals >= awayGoals ? 0.04 : -0.05 });
      }
    });

    awayTeam.getStartingXI().forEach((player) => {
      player.registerMatch({ ratingImpact: awayGoals >= homeGoals ? 0.03 : -0.04 });
    });

    events.push(`${12 + Math.floor(Math.random() * 75)}' Taktik savaşı oyunun temposunu belirledi.`);

    return {
      homeGoals,
      awayGoals,
      events: events.sort((a, b) => Number(a.split("'")[0]) - Number(b.split("'")[0])),
    };
  }
}
