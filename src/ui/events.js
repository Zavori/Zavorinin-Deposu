import { renderAll } from './render.js';

export function bindUIEvents(game, ui) {
  bindTabs();

  document.getElementById('applyTraining').addEventListener('click', () => {
    const plan = {
      physical: Number(document.getElementById('physical').value),
      tactical: Number(document.getElementById('tactic').value),
      finishing: Number(document.getElementById('finishing').value),
    };

    const gain = game.applyTraining(plan);
    ui.trainingEffect.textContent = `Antrenman uygulandı. Ortalama gelişim +${gain.toFixed(3)} OVR`;
    renderAll(game, ui);
    bindDynamicEvents(game, ui);
  });

  document.getElementById('playMatch').addEventListener('click', () => {
    const tactics = {
      press: Number(document.getElementById('press').value),
      tempo: Number(document.getElementById('tempo').value),
      risk: Number(document.getElementById('risk').value),
    };

    const result = game.playMatch(tactics);
    ui.score.textContent = `${game.userTeam.name} ${result.homeGoals} - ${result.awayGoals} ${game.currentOpponent.name}`;
    ui.events.innerHTML = result.events.map((event) => `<li>${event}</li>`).join('');

    renderAll(game, ui);
    bindDynamicEvents(game, ui);
  });

  ui.formationSelect.addEventListener('change', () => {
    game.userTeam.formation = ui.formationSelect.value;
    renderAll(game, ui);
    bindDynamicEvents(game, ui);
  });

  ui.leagueSelect.addEventListener('change', () => {
    game.selectedLeague = ui.leagueSelect.value;
    renderAll(game, ui);
    bindDynamicEvents(game, ui);
  });
}

export function bindDynamicEvents(game, ui) {
  ui.marketList.querySelectorAll('button[data-buy]').forEach((button) => {
    button.addEventListener('click', () => {
      const result = game.buyPlayer(button.dataset.buy);
      if (!result.ok) alert(result.message);
      renderAll(game, ui);
      bindDynamicEvents(game, ui);
    });
  });
}

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
