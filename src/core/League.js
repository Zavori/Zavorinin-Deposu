export class League {
  constructor(name, teams) {
    this.name = name;
    this.teams = teams;
    this.table = this.createTable();
  }

  createTable() {
    return this.teams.map((team) => ({
      name: team.name,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    }));
  }

  recordMatch(home, away, hg, ag) {
    const h = this.table.find((row) => row.name === home);
    const a = this.table.find((row) => row.name === away);
    if (!h || !a) return;

    this.#apply(h, hg, ag);
    this.#apply(a, ag, hg);

    this.table.sort((x, y) => y.points - x.points || (y.goalsFor - y.goalsAgainst) - (x.goalsFor - x.goalsAgainst));
  }

  #apply(row, gf, ga) {
    row.played += 1;
    row.goalsFor += gf;
    row.goalsAgainst += ga;
    if (gf > ga) {
      row.won += 1;
      row.points += 3;
    } else if (gf === ga) {
      row.draw += 1;
      row.points += 1;
    } else {
      row.lost += 1;
    }
  }
}
