const FORMATIONS = ['4-3-3', '4-2-3-1', '3-5-2', '4-4-2'];

export function renderAll(game, ui) {
  renderHeader(game, ui);
  renderSquad(game, ui);
  renderMarket(game, ui);
  renderTable(game, ui);
  renderCareer(game, ui);
}

function renderHeader(game, ui) {
  ui.seasonLabel.textContent = `Sezon ${game.season}`;
  ui.weekLabel.textContent = `Hafta ${game.week}/${game.maxWeeks}`;
  ui.budgetLabel.textContent = `Bütçe: ₺${game.userTeam.budget.toFixed(1)}M`;
  ui.moraleText.textContent = game.userTeam.morale > 75 ? 'Çok Yüksek' : game.userTeam.morale > 55 ? 'Yüksek' : 'Dalgalı';
  ui.powerText.textContent = game.userTeam.getPower().toFixed(1);
  ui.lastMatchText.textContent = game.lastMatch;
  ui.managerSummary.textContent = `Menajer ${game.career.managerName} | Seviye ${game.career.level} | İtibar ${game.career.reputation}`;
  ui.seasonObjective.textContent = 'Sezon hedefi: Süper Lig ilk 3 + genç oyuncuların gelişimi.';
}

function renderSquad(game, ui) {
  ui.formationSelect.innerHTML = FORMATIONS
    .map((f) => `<option value="${f}" ${f === game.userTeam.formation ? 'selected' : ''}>${f}</option>`)
    .join('');

  const [d, m, a] = game.userTeam.formation.split('-').map(Number);
  ui.pitch.innerHTML = `<strong>${game.userTeam.formation}</strong><br/>Savunma ${d} - Orta saha ${m} - Hücum ${a}<br/>Rakip: ${game.currentOpponent.name}`;

  ui.startingXI.innerHTML = game.userTeam
    .getStartingXI()
    .map((p) => `<li><span>${p.name} (${p.position})</span><strong>${p.rating.toFixed(1)}</strong></li>`)
    .join('');

  ui.playerStatsBody.innerHTML = [...game.userTeam.players]
    .sort((x, y) => y.rating - x.rating)
    .slice(0, 14)
    .map(
      (p) =>
        `<tr><td>${p.name}</td><td>${p.position}</td><td>${p.rating.toFixed(1)}</td><td>${p.potential}</td><td>${p.goals}</td><td>${p.assists}</td><td>${p.form.toFixed(1)}</td></tr>`
    )
    .join('');
}

function renderMarket(game, ui) {
  const open = game.market.isWindowOpen(game.week);
  ui.windowStatus.textContent = open ? 'Transfer dönemi AÇIK.' : 'Transfer dönemi kapalı. (Açık haftalar: 1-6, 18-22)';

  ui.marketList.innerHTML = game.market.pool
    .slice(0, 10)
    .map(
      (p) =>
        `<li><span>${p.name} | ${p.position} | OVR ${p.rating} | Pot ${p.potential} | ₺${p.value}M</span><button data-buy="${p.id}">Satın Al</button></li>`
    )
    .join('');

  ui.marketList.querySelectorAll('button[data-buy]').forEach((button) => {
    button.disabled = !open;
  });
}

function renderTable(game, ui) {
  ui.leagueSelect.innerHTML = game.leagues
    .map((league) => `<option value="${league.name}" ${league.name === game.selectedLeague ? 'selected' : ''}>${league.name}</option>`)
    .join('');

  const league = game.getActiveLeague();
  ui.tableBody.innerHTML = league.table
    .map(
      (r, i) =>
        `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.played}</td><td>${r.won}</td><td>${r.draw}</td><td>${r.lost}</td><td>${r.goalsFor}</td><td>${r.goalsAgainst}</td><td><strong>${r.points}</strong></td></tr>`
    )
    .join('');
}

function renderCareer(game, ui) {
  const topScorer = game.userTeam.getTopScorer();
  ui.careerProfile.textContent = `${game.career.managerName} | Seviye ${game.career.level} | İtibar ${game.career.reputation}`;
  ui.careerTrophies.textContent = `Kupa sayısı: ${game.career.trophies} | Takım gol kralı: ${topScorer?.name || '-'} (${topScorer?.goals || 0})`;
  ui.careerEvents.innerHTML = game.career.careerEvents.slice(0, 10).map((e) => `<li>${e}</li>`).join('');
}
