const state = {
  season: 1,
  week: 1,
  budget: 50,
  morale: 72,
  power: 78,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
  played: 0,
  won: 0,
  draw: 0,
  lost: 0,
  formation: '4-3-3',
  lastMatch: 'Henüz oynanmadı',
  squad: [
    { name: 'Demir (KL)', rating: 76 },
    { name: 'Eren (DR)', rating: 75 },
    { name: 'Aslan (DC)', rating: 80 },
    { name: 'Mert (DC)', rating: 78 },
    { name: 'Kaan (DL)', rating: 74 },
    { name: 'Sarp (MC)', rating: 79 },
    { name: 'Can (MC)', rating: 77 },
    { name: 'Yiğit (AMC)', rating: 81 },
    { name: 'Bora (RW)', rating: 80 },
    { name: 'Arda (ST)', rating: 82 },
    { name: 'Kerem (LW)', rating: 79 },
  ],
  market: [
    { name: 'Rafael (ST)', rating: 84, cost: 18 },
    { name: 'Hugo (MC)', rating: 82, cost: 14 },
    { name: 'Nordin (CB)', rating: 81, cost: 12 },
    { name: 'Santos (RW)', rating: 80, cost: 11 },
  ],
  table: [
    { team: 'Bizim Takım', o: 0, g: 0, b: 0, m: 0, a: 0, y: 0, p: 0 },
    { team: 'Kuzey FK', o: 0, g: 0, b: 0, m: 0, a: 0, y: 0, p: 0 },
    { team: 'Marmara Spor', o: 0, g: 0, b: 0, m: 0, a: 0, y: 0, p: 0 },
    { team: 'Anka United', o: 0, g: 0, b: 0, m: 0, a: 0, y: 0, p: 0 },
    { team: 'Bozkurt FC', o: 0, g: 0, b: 0, m: 0, a: 0, y: 0, p: 0 },
    { team: 'Yenişehir', o: 0, g: 0, b: 0, m: 0, a: 0, y: 0, p: 0 },
  ],
};

const formations = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'];
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

const seasonLabel = document.getElementById('seasonLabel');
const weekLabel = document.getElementById('weekLabel');
const budgetLabel = document.getElementById('budgetLabel');
const moraleText = document.getElementById('moraleText');
const powerText = document.getElementById('powerText');
const lastMatchText = document.getElementById('lastMatchText');

const formationSelect = document.getElementById('formationSelect');
const pitch = document.getElementById('pitch');
const startingXI = document.getElementById('startingXI');
const marketList = document.getElementById('marketList');
const trainingEffect = document.getElementById('trainingEffect');
const score = document.getElementById('score');
const events = document.getElementById('events');
const tableBody = document.getElementById('tableBody');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

function renderHeader() {
  seasonLabel.textContent = `Sezon ${state.season}`;
  weekLabel.textContent = `Hafta ${state.week}`;
  budgetLabel.textContent = `Bütçe: ₺${state.budget.toFixed(1)}M`;
  moraleText.textContent = state.morale > 75 ? 'Çok Yüksek' : state.morale > 55 ? 'Yüksek' : 'Dalgalı';
  powerText.textContent = state.power.toFixed(0);
  lastMatchText.textContent = state.lastMatch;
}

function renderFormation() {
  formationSelect.innerHTML = formations
    .map((f) => `<option value="${f}" ${f === state.formation ? 'selected' : ''}>${f}</option>`)
    .join('');

  const [def, mid, att] = state.formation.split('-').map(Number);
  pitch.innerHTML = `
    <strong>${state.formation}</strong><br/>
    Savunma: ${def} | Orta Saha: ${mid} | Hücum: ${att}<br/>
    Oyuncu kalite ortalaması: ${(state.squad.reduce((a, b) => a + b.rating, 0) / state.squad.length).toFixed(1)}
  `;

  startingXI.innerHTML = state.squad
    .map((p) => `<li><span>${p.name}</span><strong>${p.rating}</strong></li>`)
    .join('');
}

function renderMarket() {
  marketList.innerHTML = state.market
    .map((p, i) => `
      <li>
        <span>${p.name} (${p.rating}) - ₺${p.cost}M</span>
        <button data-buy="${i}">Satın Al</button>
      </li>`)
    .join('');

  marketList.querySelectorAll('button[data-buy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.buy);
      const player = state.market[idx];
      if (!player) return;
      if (state.budget < player.cost) {
        alert('Bütçe yetersiz!');
        return;
      }
      state.budget -= player.cost;
      state.squad.push({ name: player.name, rating: player.rating });
      state.market.splice(idx, 1);
      state.power = Math.min(95, state.power + 1.5);
      state.morale = Math.min(100, state.morale + 3);
      renderAll();
    });
  });
}

function applyTraining() {
  const physical = Number(document.getElementById('physical').value);
  const tactic = Number(document.getElementById('tactic').value);
  const finishing = Number(document.getElementById('finishing').value);

  const gain = (physical * 0.02 + tactic * 0.025 + finishing * 0.03) / 3;
  state.power = Math.min(99, state.power + gain);
  state.morale = Math.max(45, Math.min(100, state.morale + (tactic - 40) * 0.05));

  trainingEffect.textContent = `Antrenman uygulandı. Güç +${gain.toFixed(2)}, yeni takım gücü ${state.power.toFixed(1)}.`;
  renderHeader();
  renderFormation();
}

function simulateMatch() {
  if (state.week > 10) {
    alert('Sezon tamamlandı! Yeni sezon için sayfayı yenile.');
    return;
  }

  const press = Number(document.getElementById('press').value);
  const tempo = Number(document.getElementById('tempo').value);
  const risk = Number(document.getElementById('risk').value);
  const tacticalImpact = (press + tempo + risk) / 30;

  let home = Math.max(0, Math.round((state.power + tacticalImpact + Math.random() * 12 - 38) / 10));
  let away = Math.max(0, Math.round((70 + Math.random() * 15 - state.power / 1.8) / 10));

  home = Math.min(home, 6);
  away = Math.min(away, 6);

  score.textContent = `Bizim Takım ${home} - ${away} Rakip`;
  events.innerHTML = '';

  const eventCount = 4 + Math.floor(Math.random() * 5);
  const scorers = ['Arda', 'Kerem', 'Bora', 'Yiğit', 'Sarp', 'Rafael'];

  for (let i = 0; i < eventCount; i += 1) {
    const minute = 5 + Math.floor(Math.random() * 86);
    const typeRoll = Math.random();
    let text = '';

    if (typeRoll > 0.7) text = `${minute}' Kritik kurtarış!`;
    else if (typeRoll > 0.45) text = `${minute}' ${scorers[Math.floor(Math.random() * scorers.length)]} şut çekti.`;
    else text = `${minute}' ${scorers[Math.floor(Math.random() * scorers.length)]} gol!`;

    const li = document.createElement('li');
    li.textContent = text;
    events.appendChild(li);
  }

  updateStandings(home, away);

  state.lastMatch = `${home}-${away}`;
  state.week += 1;
  if (state.week > 10) {
    state.season += 1;
    state.week = 1;
  }

  renderAll();
}

function updateStandings(home, away) {
  const us = state.table[0];
  us.o += 1;
  us.a += home;
  us.y += away;
  us.p += home > away ? 3 : home === away ? 1 : 0;
  us.g += home > away ? 1 : 0;
  us.b += home === away ? 1 : 0;
  us.m += home < away ? 1 : 0;

  state.points = us.p;
  state.goalsFor = us.a;
  state.goalsAgainst = us.y;
  state.won = us.g;
  state.draw = us.b;
  state.lost = us.m;
  state.played = us.o;

  for (let i = 1; i < state.table.length; i += 1) {
    const t = state.table[i];
    const randGF = Math.floor(Math.random() * 4);
    const randGA = Math.floor(Math.random() * 4);
    t.o += 1;
    t.a += randGF;
    t.y += randGA;
    t.g += randGF > randGA ? 1 : 0;
    t.b += randGF === randGA ? 1 : 0;
    t.m += randGF < randGA ? 1 : 0;
    t.p += randGF > randGA ? 3 : randGF === randGA ? 1 : 0;
  }

  state.table.sort((a, b) => b.p - a.p || (b.a - b.y) - (a.a - a.y) || b.a - a.a);

  const topRank = state.table.findIndex((t) => t.team === 'Bizim Takım') + 1;
  state.morale += topRank <= 3 ? 2 : -1.5;
  state.morale = Math.max(35, Math.min(100, state.morale));
}

function renderTable() {
  tableBody.innerHTML = state.table
    .map(
      (t, i) => `<tr>
      <td>${i + 1}</td>
      <td>${t.team}</td>
      <td>${t.o}</td>
      <td>${t.g}</td>
      <td>${t.b}</td>
      <td>${t.m}</td>
      <td>${t.a}</td>
      <td>${t.y}</td>
      <td><strong>${t.p}</strong></td>
    </tr>`
    )
    .join('');
}

function renderAll() {
  renderHeader();
  renderFormation();
  renderMarket();
  renderTable();
}

formationSelect.addEventListener('change', () => {
  state.formation = formationSelect.value;
  state.power += Math.random() * 0.6;
  renderAll();
});

document.getElementById('applyTraining').addEventListener('click', applyTraining);
document.getElementById('playMatch').addEventListener('click', simulateMatch);

renderAll();
