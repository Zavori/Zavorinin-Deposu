/**
 * Ultimate Futbol Menajer - Expandable Game Framework
 * Domain classes are UI-agnostic; UI adapter is at bottom.
 */

class Player {
  constructor({ id, name, position, rating, stamina = 100 }) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.rating = rating;
    this.stamina = stamina;
  }

  train({ physical, tactical, finishing }) {
    const gain = (physical * 0.01 + tactical * 0.012 + finishing * 0.014) / 3;
    this.rating = Math.min(99, this.rating + gain);
    this.stamina = Math.max(60, Math.min(100, this.stamina + physical * 0.02 - 0.5));
    return gain;
  }
}

class Team {
  constructor({ name, players, budget = 50, morale = 70, formation = '4-3-3' }) {
    this.name = name;
    this.players = players;
    this.budget = budget;
    this.morale = morale;
    this.formation = formation;
  }

  get power() {
    const avgRating = this.players.reduce((acc, p) => acc + p.rating, 0) / this.players.length;
    const avgStamina = this.players.reduce((acc, p) => acc + p.stamina, 0) / this.players.length;
    return avgRating * 0.82 + avgStamina * 0.12 + this.morale * 0.06;
  }

  applyTraining(plan) {
    const gains = this.players.map((player) => player.train(plan));
    const avgGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    this.morale = Math.max(35, Math.min(100, this.morale + (plan.tactical - 45) * 0.05));
    return avgGain;
  }

  buyPlayer(candidate) {
    if (this.budget < candidate.cost) return false;
    this.budget -= candidate.cost;
    this.players.push(
      new Player({
        id: `p-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: candidate.name,
        position: candidate.position,
        rating: candidate.rating,
        stamina: 94,
      })
    );
    this.morale = Math.min(100, this.morale + 2);
    return true;
  }
}

class LeagueTable {
  constructor(teamNames) {
    this.rows = teamNames.map((name) => ({
      team: name,
      played: 0,
      won: 0,
      draw: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    }));
  }

  updateResult(homeTeamName, homeGoals, awayTeamName, awayGoals) {
    const home = this.rows.find((r) => r.team === homeTeamName);
    const away = this.rows.find((r) => r.team === awayTeamName);
    if (!home || !away) return;

    this.#applyTeamResult(home, homeGoals, awayGoals);
    this.#applyTeamResult(away, awayGoals, homeGoals);
    this.sort();
  }

  #applyTeamResult(row, gf, ga) {
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

  sort() {
    this.rows.sort(
      (a, b) =>
        b.points - a.points ||
        (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
        b.goalsFor - a.goalsFor
    );
  }
}

class MatchEngine {
  static play({ homeTeam, awayTeam, tactics }) {
    const tacticalBoost = (tactics.press + tactics.tempo + tactics.risk) / 100;
    const homeAttack = homeTeam.power * (0.58 + tacticalBoost * 0.04);
    const awayAttack = awayTeam.power * (0.52 + Math.random() * 0.06);

    const homeGoals = Math.min(6, Math.max(0, Math.round((homeAttack - 38 + Math.random() * 13) / 11)));
    const awayGoals = Math.min(6, Math.max(0, Math.round((awayAttack - 40 + Math.random() * 10) / 12)));

    const minuteEvents = [];
    const pool = homeTeam.players.slice(0, 11).map((p) => p.name.split(' ')[0]);
    const eventCount = 4 + Math.floor(Math.random() * 5);
    for (let i = 0; i < eventCount; i += 1) {
      const minute = 3 + Math.floor(Math.random() * 88);
      const actor = pool[Math.floor(Math.random() * pool.length)] || 'Oyuncu';
      const roll = Math.random();
      const text =
        roll > 0.72
          ? `${minute}' ${actor} kritik müdahale yaptı.`
          : roll > 0.45
            ? `${minute}' ${actor} tehlikeli bir şut denedi.`
            : `${minute}' ${actor} gol pozisyonu yarattı!`;
      minuteEvents.push(text);
    }

    return {
      homeGoals,
      awayGoals,
      events: minuteEvents.sort((a, b) => Number(a.split("'")[0]) - Number(b.split("'")[0])),
    };
  }
}

class FootballGame {
  constructor() {
    this.week = 1;
    this.season = 1;
    this.lastMatch = 'Henüz oynanmadı';

    this.userTeam = new Team({
      name: 'Bizim Takım',
      budget: 50,
      morale: 72,
      formation: '4-3-3',
      players: [
        new Player({ id: 'u1', name: 'Demir Kaleci', position: 'GK', rating: 76 }),
        new Player({ id: 'u2', name: 'Eren Sağbek', position: 'RB', rating: 75 }),
        new Player({ id: 'u3', name: 'Aslan Stoper', position: 'CB', rating: 80 }),
        new Player({ id: 'u4', name: 'Mert Stoper', position: 'CB', rating: 78 }),
        new Player({ id: 'u5', name: 'Kaan Solbek', position: 'LB', rating: 74 }),
        new Player({ id: 'u6', name: 'Sarp Orta', position: 'CM', rating: 79 }),
        new Player({ id: 'u7', name: 'Can Orta', position: 'CM', rating: 77 }),
        new Player({ id: 'u8', name: 'Yiğit Oyun', position: 'AM', rating: 81 }),
        new Player({ id: 'u9', name: 'Bora Kanat', position: 'RW', rating: 80 }),
        new Player({ id: 'u10', name: 'Arda Forvet', position: 'ST', rating: 82 }),
        new Player({ id: 'u11', name: 'Kerem Kanat', position: 'LW', rating: 79 }),
      ],
    });

    this.rivalTeam = new Team({
      name: 'Rakip FC',
      budget: 48,
      morale: 69,
      formation: '4-4-2',
      players: Array.from({ length: 11 }).map((_, i) =>
        new Player({ id: `r${i + 1}`, name: `Rakip Oyuncu ${i + 1}`, position: 'MIX', rating: 72 + (i % 5) })
      ),
    });

    this.market = [
      { id: 'm1', name: 'Rafael Golcü', position: 'ST', rating: 84, cost: 18 },
      { id: 'm2', name: 'Hugo Dinamo', position: 'CM', rating: 82, cost: 14 },
      { id: 'm3', name: 'Nordin Kaya', position: 'CB', rating: 81, cost: 12 },
      { id: 'm4', name: 'Santos Hızlı', position: 'RW', rating: 80, cost: 11 },
    ];

    this.table = new LeagueTable(['Bizim Takım', 'Rakip FC', 'Kuzey FK', 'Marmara Spor', 'Anka United', 'Yenişehir']);
  }

  applyTraining(plan) {
    return this.userTeam.applyTraining(plan);
  }

  buyFromMarket(playerId) {
    const idx = this.market.findIndex((p) => p.id === playerId);
    if (idx < 0) return { ok: false, reason: 'Oyuncu bulunamadı.' };
    const candidate = this.market[idx];
    const ok = this.userTeam.buyPlayer(candidate);
    if (!ok) return { ok: false, reason: 'Bütçe yetersiz.' };
    this.market.splice(idx, 1);
    return { ok: true };
  }

  playWeek(tactics) {
    const result = MatchEngine.play({ homeTeam: this.userTeam, awayTeam: this.rivalTeam, tactics });
    this.lastMatch = `${this.userTeam.name} ${result.homeGoals}-${result.awayGoals} ${this.rivalTeam.name}`;
    this.table.updateResult(this.userTeam.name, result.homeGoals, this.rivalTeam.name, result.awayGoals);

    this.#simulateOtherMatches();

    const rank = this.table.rows.findIndex((r) => r.team === this.userTeam.name) + 1;
    this.userTeam.morale = Math.max(35, Math.min(100, this.userTeam.morale + (rank <= 3 ? 2 : -1)));

    this.week += 1;
    if (this.week > 10) {
      this.week = 1;
      this.season += 1;
    }

    return result;
  }

  #simulateOtherMatches() {
    const names = this.table.rows.map((r) => r.team).filter((name) => ![this.userTeam.name, this.rivalTeam.name].includes(name));
    for (let i = 0; i < names.length - 1; i += 2) {
      const home = names[i];
      const away = names[i + 1];
      const hg = Math.floor(Math.random() * 4);
      const ag = Math.floor(Math.random() * 4);
      this.table.updateResult(home, hg, away, ag);
    }
  }
}

// ------------------- UI Adapter -------------------
const game = new FootballGame();
const formations = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'];

const ui = {
  seasonLabel: document.getElementById('seasonLabel'),
  weekLabel: document.getElementById('weekLabel'),
  budgetLabel: document.getElementById('budgetLabel'),
  moraleText: document.getElementById('moraleText'),
  powerText: document.getElementById('powerText'),
  lastMatchText: document.getElementById('lastMatchText'),
  formationSelect: document.getElementById('formationSelect'),
  pitch: document.getElementById('pitch'),
  startingXI: document.getElementById('startingXI'),
  marketList: document.getElementById('marketList'),
  trainingEffect: document.getElementById('trainingEffect'),
  score: document.getElementById('score'),
  events: document.getElementById('events'),
  tableBody: document.getElementById('tableBody'),
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
  ui.weekLabel.textContent = `Hafta ${game.week}`;
  ui.budgetLabel.textContent = `Bütçe: ₺${game.userTeam.budget.toFixed(1)}M`;
  ui.powerText.textContent = game.userTeam.power.toFixed(1);
  ui.lastMatchText.textContent = game.lastMatch;
  ui.moraleText.textContent = game.userTeam.morale > 75 ? 'Çok Yüksek' : game.userTeam.morale > 55 ? 'Yüksek' : 'Dalgalı';
}

function renderSquad() {
  ui.formationSelect.innerHTML = formations
    .map((f) => `<option value="${f}" ${f === game.userTeam.formation ? 'selected' : ''}>${f}</option>`)
    .join('');

  const [def, mid, att] = game.userTeam.formation.split('-').map(Number);
  ui.pitch.innerHTML = `<strong>${game.userTeam.formation}</strong><br/>Savunma: ${def} | Orta Saha: ${mid} | Hücum: ${att}`;

  ui.startingXI.innerHTML = game.userTeam.players
    .slice(0, 11)
    .map((p) => `<li><span>${p.name} (${p.position})</span><strong>${p.rating.toFixed(1)}</strong></li>`)
    .join('');
}

function renderMarket() {
  ui.marketList.innerHTML = game.market
    .map(
      (p) => `<li><span>${p.name} (${p.position}, ${p.rating}) - ₺${p.cost}M</span><button data-buy="${p.id}">Satın Al</button></li>`
    )
    .join('');

  ui.marketList.querySelectorAll('button[data-buy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const result = game.buyFromMarket(btn.dataset.buy);
      if (!result.ok) {
        alert(result.reason);
      }
      renderAll();
    });
  });
}

function renderTable() {
  ui.tableBody.innerHTML = game.table.rows
    .map(
      (r, i) => `<tr><td>${i + 1}</td><td>${r.team}</td><td>${r.played}</td><td>${r.won}</td><td>${r.draw}</td><td>${r.lost}</td><td>${r.goalsFor}</td><td>${r.goalsAgainst}</td><td><strong>${r.points}</strong></td></tr>`
    )
    .join('');
}

function renderAll() {
  renderHeader();
  renderSquad();
  renderMarket();
  renderTable();
}

ui.formationSelect.addEventListener('change', () => {
  game.userTeam.formation = ui.formationSelect.value;
  renderAll();
});

document.getElementById('applyTraining').addEventListener('click', () => {
  const plan = {
    physical: Number(document.getElementById('physical').value),
    tactical: Number(document.getElementById('tactic').value),
    finishing: Number(document.getElementById('finishing').value),
  };
  const gain = game.applyTraining(plan);
  ui.trainingEffect.textContent = `Antrenman tamamlandı. Ortalama oyuncu gelişimi +${gain.toFixed(2)}.`;
  renderAll();
});

document.getElementById('playMatch').addEventListener('click', () => {
  const tactics = {
    press: Number(document.getElementById('press').value),
    tempo: Number(document.getElementById('tempo').value),
    risk: Number(document.getElementById('risk').value),
  };

  const result = game.playWeek(tactics);
  ui.score.textContent = `${game.userTeam.name} ${result.homeGoals} - ${result.awayGoals} ${game.rivalTeam.name}`;
  ui.events.innerHTML = result.events.map((e) => `<li>${e}</li>`).join('');
  renderAll();
});

bindTabs();
renderAll();
