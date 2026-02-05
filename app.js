class Player {
  constructor({ id, name, position, age, rating, potential, value, wage }) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.age = age;
    this.rating = rating;
    this.potential = potential;
    this.value = value;
    this.wage = wage;
    this.fitness = 100;
    this.form = 6.8;
    this.goals = 0;
    this.assists = 0;
    this.matches = 0;
  }

  weeklyTraining({ physical, tactical, finishing }) {
    const growthCap = Math.max(0, this.potential - this.rating);
    const growth = Math.min(growthCap, (physical * 0.002 + tactical * 0.002 + finishing * 0.0025));
    this.rating = Math.min(this.potential, this.rating + growth);
    this.fitness = Math.min(100, this.fitness + physical * 0.08 - 2);
    this.form = Math.max(5.5, Math.min(9.5, this.form + (tactical - 50) * 0.004));
    this.value = Math.max(1, this.value + growth * 0.8);
    return growth;
  }

  registerMatch({ goals = 0, assists = 0, ratingImpact = 0 }) {
    this.goals += goals;
    this.assists += assists;
    this.matches += 1;
    this.form = Math.max(5.0, Math.min(10, this.form + ratingImpact));
    this.fitness = Math.max(55, this.fitness - (6 + Math.random() * 7));
  }
}

class Team {
  constructor({ name, budget, morale, formation, aiProfile, players }) {
    this.name = name;
    this.budget = budget;
    this.morale = morale;
    this.formation = formation;
    this.aiProfile = aiProfile;
    this.players = players;
  }

  getPower() {
    const best = this.getStartingXI();
    const avg = best.reduce((sum, p) => sum + p.rating, 0) / best.length;
    const fit = best.reduce((sum, p) => sum + p.fitness, 0) / best.length;
    return avg * 0.75 + fit * 0.15 + this.morale * 0.1;
  }

  getStartingXI() {
    return [...this.players]
      .sort((a, b) => (b.rating + b.form) - (a.rating + a.form))
      .slice(0, 11);
  }

  getTopScorer() {
    return [...this.players].sort((a, b) => b.goals - a.goals)[0];
  }

  applyTraining(plan) {
    const gains = this.players.map((p) => p.weeklyTraining(plan));
    this.morale = Math.max(35, Math.min(100, this.morale + (plan.tactical - 50) * 0.04));
    return gains.reduce((a, b) => a + b, 0) / gains.length;
  }

  tryBuyPlayer(candidate) {
    if (this.budget < candidate.value) return false;
    this.budget -= candidate.value;
    this.players.push(candidate);
    this.morale = Math.min(100, this.morale + 2);
    return true;
  }
}

class League {
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
    const h = this.table.find((r) => r.name === home);
    const a = this.table.find((r) => r.name === away);
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

class TransferMarket {
  constructor() {
    this.pool = [];
    this.refreshPool(1);
  }

  refreshPool(season) {
    const names = ['Valente', 'Bruno', 'Yamada', 'Onyekuru', 'Milos', 'Faruk', 'Timo', 'Elias'];
    const positions = ['ST', 'RW', 'LW', 'CM', 'CB', 'RB', 'LB', 'GK'];
    this.pool = Array.from({ length: 12 }).map((_, i) => {
      const rating = 68 + Math.floor(Math.random() * 18) + Math.min(4, season - 1);
      const potential = Math.min(95, rating + 4 + Math.floor(Math.random() * 7));
      return new Player({
        id: `tm-${season}-${i}`,
        name: `${names[Math.floor(Math.random() * names.length)]} ${i + 1}`,
        position: positions[i % positions.length],
        age: 18 + Math.floor(Math.random() * 15),
        rating,
        potential,
        value: Math.round((rating * 0.28 + potential * 0.12) * 10) / 10,
        wage: Math.round((rating * 1200) + Math.random() * 6000),
      });
    });
  }

  isWindowOpen(week) {
    return week <= 6 || (week >= 18 && week <= 22);
  }
}

class MatchEngine {
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
      const p = scorersHome[Math.floor(Math.random() * scorersHome.length)];
      p.registerMatch({ goals: 1, ratingImpact: 0.25 });
      events.push(`${8 + Math.floor(Math.random() * 82)}' ${homeTeam.name}: ${p.name} gol!`);
    }
    for (let i = 0; i < awayGoals; i += 1) {
      const p = scorersAway[Math.floor(Math.random() * scorersAway.length)];
      p.registerMatch({ goals: 1, ratingImpact: 0.2 });
      events.push(`${8 + Math.floor(Math.random() * 82)}' ${awayTeam.name}: ${p.name} gol!`);
    }

    homeTeam.getStartingXI().forEach((p) => {
      if (Math.random() > 0.78) {
        p.registerMatch({ assists: 1, ratingImpact: 0.1 });
      } else {
        p.registerMatch({ ratingImpact: (homeGoals >= awayGoals ? 0.04 : -0.05) });
      }
    });

    awayTeam.getStartingXI().forEach((p) => p.registerMatch({ ratingImpact: awayGoals >= homeGoals ? 0.03 : -0.04 }));

    events.push(`${12 + Math.floor(Math.random() * 75)}' Taktik savaşı oyunun temposunu belirledi.`);

    return {
      homeGoals,
      awayGoals,
      events: events.sort((a, b) => Number(a.split("'")[0]) - Number(b.split("'")[0])),
    };
  }
}

class CareerMode {
  constructor() {
    this.managerName = 'Mert Hoca';
    this.reputation = 50;
    this.level = 1;
    this.trophies = 0;
    this.careerEvents = ['Kariyer başladı: Yönetim ilk sezon için ilk 4 hedefi verdi.'];
  }

  registerSeasonResult(rank) {
    if (rank <= 3) {
      this.reputation += 8;
      this.level += 1;
      if (rank === 1) this.trophies += 1;
      this.careerEvents.unshift(`Başarılı sezon! Lig sıralaması: ${rank}.`);
    } else {
      this.reputation = Math.max(25, this.reputation - 3);
      this.careerEvents.unshift(`Sezon beklentinin altında tamamlandı (${rank}. sıra).`);
    }
  }
}

class FootballGame {
  constructor() {
    this.season = 1;
    this.week = 1;
    this.maxWeeks = 30;
    this.lastMatch = 'Henüz oynanmadı';

    this.market = new TransferMarket();
    this.career = new CareerMode();

    this.leagues = this.#createLeagues();
    this.userTeam = this.leagues[0].teams.find((t) => t.name === 'Anadolu Yıldızı');
    this.currentOpponent = this.leagues[0].teams.find((t) => t.name !== 'Anadolu Yıldızı');
    this.selectedLeague = this.leagues[0].name;
  }

  #createTeam(name, aiProfile) {
    const positions = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'AM', 'RW', 'ST', 'LW', 'CM', 'CB', 'ST'];
    const players = Array.from({ length: 16 }).map((_, i) => {
      const base = aiProfile === 'elite' ? 76 : aiProfile === 'aggressive' ? 73 : 70;
      const rating = base + Math.floor(Math.random() * 9);
      return new Player({
        id: `${name}-${i}`,
        name: `${name.split(' ')[0]} Oyuncu ${i + 1}`,
        position: positions[i % positions.length],
        age: 18 + Math.floor(Math.random() * 14),
        rating,
        potential: Math.min(95, rating + 6 + Math.floor(Math.random() * 6)),
        value: Math.round((rating * 0.25 + Math.random() * 6) * 10) / 10,
        wage: Math.round(18000 + rating * 1200 + Math.random() * 3000),
      });
    });

    return new Team({
      name,
      budget: 45 + Math.floor(Math.random() * 35),
      morale: 62 + Math.floor(Math.random() * 24),
      formation: '4-3-3',
      aiProfile,
      players,
    });
  }

  #createLeagues() {
    const superLigTeams = [
      this.#createTeam('Anadolu Yıldızı', 'balanced'),
      this.#createTeam('Kuzey Kartalı', 'aggressive'),
      this.#createTeam('Marmara Gücü', 'balanced'),
      this.#createTeam('Başkent Spor', 'elite'),
      this.#createTeam('Akdeniz FK', 'balanced'),
      this.#createTeam('Doğu Birliği', 'defensive'),
    ];

    const firstLigTeams = [
      this.#createTeam('Ovalar SK', 'balanced'),
      this.#createTeam('Laleşehir', 'defensive'),
      this.#createTeam('Yıldırım 55', 'aggressive'),
      this.#createTeam('Sahil Birlik', 'balanced'),
      this.#createTeam('Demirordu', 'aggressive'),
      this.#createTeam('Vadi FK', 'defensive'),
    ];

    return [new League('Süper Lig', superLigTeams), new League('1. Lig', firstLigTeams)];
  }

  getActiveLeague() {
    return this.leagues.find((l) => l.name === this.selectedLeague) || this.leagues[0];
  }

  nextOpponent() {
    const league = this.leagues[0];
    const rivals = league.teams.filter((t) => t.name !== this.userTeam.name);
    this.currentOpponent = rivals[Math.floor(Math.random() * rivals.length)];
  }

  playMatch(tactics) {
    this.nextOpponent();
    const result = MatchEngine.play({ homeTeam: this.userTeam, awayTeam: this.currentOpponent, tacticsHome: tactics });
    this.lastMatch = `${this.userTeam.name} ${result.homeGoals}-${result.awayGoals} ${this.currentOpponent.name}`;

    this.leagues[0].recordMatch(this.userTeam.name, this.currentOpponent.name, result.homeGoals, result.awayGoals);
    this.#simulateAiLeagues();
    this.#updateMorale(result.homeGoals, result.awayGoals);

    this.week += 1;
    if (this.week > this.maxWeeks) {
      this.#endSeason();
    }

    return result;
  }

  #simulateAiLeagues() {
    this.leagues.forEach((league, leagueIdx) => {
      const teams = league.teams;
      for (let i = 0; i < teams.length - 1; i += 2) {
        const home = teams[i];
        const away = teams[i + 1];
        if (leagueIdx === 0 && [home.name, away.name].includes(this.userTeam.name)) continue;
        const hg = Math.floor(Math.random() * 4);
        const ag = Math.floor(Math.random() * 4);
        league.recordMatch(home.name, away.name, hg, ag);
      }
    });
  }

  #updateMorale(hg, ag) {
    this.userTeam.morale = Math.max(30, Math.min(100, this.userTeam.morale + (hg > ag ? 2.5 : hg === ag ? 0.5 : -2)));
  }

  #endSeason() {
    const mainLeague = this.leagues[0];
    const rank = mainLeague.table.findIndex((r) => r.name === this.userTeam.name) + 1;
    this.career.registerSeasonResult(rank);

    this.market.refreshPool(this.season + 1);
    this.season += 1;
    this.week = 1;
    this.leagues = this.#createLeagues();
    this.userTeam = this.leagues[0].teams.find((t) => t.name === 'Anadolu Yıldızı');
    this.currentOpponent = this.leagues[0].teams.find((t) => t.name !== 'Anadolu Yıldızı');
    this.career.careerEvents.unshift(`Yeni sezon başladı: Sezon ${this.season}.`);
  }

  applyTraining(plan) {
    return this.userTeam.applyTraining(plan);
  }

  buyPlayer(playerId) {
    if (!this.market.isWindowOpen(this.week)) return { ok: false, message: 'Transfer dönemi kapalı.' };
    const idx = this.market.pool.findIndex((p) => p.id === playerId);
    if (idx < 0) return { ok: false, message: 'Oyuncu bulunamadı.' };
    const candidate = this.market.pool[idx];
    const success = this.userTeam.tryBuyPlayer(candidate);
    if (!success) return { ok: false, message: 'Bütçe yetersiz.' };
    this.market.pool.splice(idx, 1);
    this.career.careerEvents.unshift(`Yeni transfer: ${candidate.name} (${candidate.position})`);
    return { ok: true, message: 'Transfer tamamlandı.' };
  }
}

const game = new FootballGame();
const formations = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'];

const ui = {
  seasonLabel: document.getElementById('seasonLabel'),
  weekLabel: document.getElementById('weekLabel'),
  budgetLabel: document.getElementById('budgetLabel'),
  moraleText: document.getElementById('moraleText'),
  powerText: document.getElementById('powerText'),
  lastMatchText: document.getElementById('lastMatchText'),
  managerSummary: document.getElementById('managerSummary'),
  seasonObjective: document.getElementById('seasonObjective'),
  formationSelect: document.getElementById('formationSelect'),
  pitch: document.getElementById('pitch'),
  startingXI: document.getElementById('startingXI'),
  playerStatsBody: document.getElementById('playerStatsBody'),
  windowStatus: document.getElementById('windowStatus'),
  marketList: document.getElementById('marketList'),
  trainingEffect: document.getElementById('trainingEffect'),
  score: document.getElementById('score'),
  events: document.getElementById('events'),
  leagueSelect: document.getElementById('leagueSelect'),
  tableBody: document.getElementById('tableBody'),
  careerProfile: document.getElementById('careerProfile'),
  careerTrophies: document.getElementById('careerTrophies'),
  careerEvents: document.getElementById('careerEvents'),
};

function bindTabs() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });
}

function renderHeader() {
  ui.seasonLabel.textContent = `Sezon ${game.season}`;
  ui.weekLabel.textContent = `Hafta ${game.week}/${game.maxWeeks}`;
  ui.budgetLabel.textContent = `Bütçe: ₺${game.userTeam.budget.toFixed(1)}M`;
  ui.moraleText.textContent = game.userTeam.morale > 75 ? 'Çok Yüksek' : game.userTeam.morale > 55 ? 'Yüksek' : 'Dalgalı';
  ui.powerText.textContent = game.userTeam.getPower().toFixed(1);
  ui.lastMatchText.textContent = game.lastMatch;
  ui.managerSummary.textContent = `Menajer ${game.career.managerName} | Seviye ${game.career.level} | İtibar ${game.career.reputation}`;
  ui.seasonObjective.textContent = 'Sezon hedefi: Süper Lig ilk 3 + genç oyuncuların gelişimi.';
}

function renderSquad() {
  ui.formationSelect.innerHTML = formations
    .map((f) => `<option value="${f}" ${f === game.userTeam.formation ? 'selected' : ''}>${f}</option>`)
    .join('');
  const [d, m, a] = game.userTeam.formation.split('-').map(Number);
  ui.pitch.innerHTML = `<strong>${game.userTeam.formation}</strong><br/>Savunma ${d} - Orta saha ${m} - Hücum ${a}<br/>Rakip: ${game.currentOpponent.name}`;

  ui.startingXI.innerHTML = game.userTeam.getStartingXI()
    .map((p) => `<li><span>${p.name} (${p.position})</span><strong>${p.rating.toFixed(1)}</strong></li>`)
    .join('');

  ui.playerStatsBody.innerHTML = [...game.userTeam.players]
    .sort((x, y) => y.rating - x.rating)
    .slice(0, 14)
    .map((p) => `<tr><td>${p.name}</td><td>${p.position}</td><td>${p.rating.toFixed(1)}</td><td>${p.potential}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.form.toFixed(1)}</td></tr>`)
    .join('');
}

function renderMarket() {
  const open = game.market.isWindowOpen(game.week);
  ui.windowStatus.textContent = open ? 'Transfer dönemi AÇIK.' : 'Transfer dönemi kapalı. (Açık haftalar: 1-6, 18-22)';

  ui.marketList.innerHTML = game.market.pool
    .slice(0, 10)
    .map((p) => `<li><span>${p.name} | ${p.position} | OVR ${p.rating} | Pot ${p.potential} | ₺${p.value}M</span><button data-buy="${p.id}">Satın Al</button></li>`)
    .join('');

  ui.marketList.querySelectorAll('button[data-buy]').forEach((button) => {
    button.addEventListener('click', () => {
      const result = game.buyPlayer(button.dataset.buy);
      if (!result.ok) alert(result.message);
      renderAll();
    });
    button.disabled = !open;
  });
}

function renderTable() {
  ui.leagueSelect.innerHTML = game.leagues
    .map((l) => `<option value="${l.name}" ${l.name === game.selectedLeague ? 'selected' : ''}>${l.name}</option>`)
    .join('');

  const league = game.getActiveLeague();
  ui.tableBody.innerHTML = league.table
    .map((r, i) => `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.played}</td><td>${r.won}</td><td>${r.draw}</td><td>${r.lost}</td><td>${r.goalsFor}</td><td>${r.goalsAgainst}</td><td><strong>${r.points}</strong></td></tr>`)
    .join('');
}

function renderCareer() {
  const topScorer = game.userTeam.getTopScorer();
  ui.careerProfile.textContent = `${game.career.managerName} | Seviye ${game.career.level} | İtibar ${game.career.reputation}`;
  ui.careerTrophies.textContent = `Kupa sayısı: ${game.career.trophies} | Takım gol kralı: ${topScorer?.name || '-'} (${topScorer?.goals || 0})`;
  ui.careerEvents.innerHTML = game.career.careerEvents.slice(0, 10).map((e) => `<li>${e}</li>`).join('');
}

function renderAll() {
  renderHeader();
  renderSquad();
  renderMarket();
  renderTable();
  renderCareer();
}

document.getElementById('applyTraining').addEventListener('click', () => {
  const plan = {
    physical: Number(document.getElementById('physical').value),
    tactical: Number(document.getElementById('tactic').value),
    finishing: Number(document.getElementById('finishing').value),
  };
  const gain = game.applyTraining(plan);
  ui.trainingEffect.textContent = `Antrenman uygulandı. Ortalama gelişim +${gain.toFixed(3)} OVR`;
  renderAll();
});

document.getElementById('playMatch').addEventListener('click', () => {
  const tactics = {
    press: Number(document.getElementById('press').value),
    tempo: Number(document.getElementById('tempo').value),
    risk: Number(document.getElementById('risk').value),
  };
  const result = game.playMatch(tactics);
  ui.score.textContent = `${game.userTeam.name} ${result.homeGoals} - ${result.awayGoals} ${game.currentOpponent.name}`;
  ui.events.innerHTML = result.events.map((e) => `<li>${e}</li>`).join('');
  renderAll();
});

ui.formationSelect.addEventListener('change', () => {
  game.userTeam.formation = ui.formationSelect.value;
  renderAll();
});

ui.leagueSelect.addEventListener('change', () => {
  game.selectedLeague = ui.leagueSelect.value;
  renderTable();
});

bindTabs();
renderAll();
