import { TransferMarket } from './TransferMarket.js';
import { CareerMode } from './CareerMode.js';
import { MatchEngine } from './MatchEngine.js';
import { createLeagues } from '../data/factories.js';

export class FootballGame {
  constructor() {
    this.season = 1;
    this.week = 1;
    this.maxWeeks = 30;
    this.lastMatch = 'Henüz oynanmadı';

    this.market = new TransferMarket();
    this.career = new CareerMode();

    this.leagues = createLeagues();
    this.userTeam = this.leagues[0].teams.find((team) => team.name === 'Anadolu Yıldızı');
    this.currentOpponent = this.leagues[0].teams.find((team) => team.name !== this.userTeam.name);
    this.selectedLeague = this.leagues[0].name;
  }

  getActiveLeague() {
    return this.leagues.find((league) => league.name === this.selectedLeague) || this.leagues[0];
  }

  applyTraining(plan) {
    return this.userTeam.applyTraining(plan);
  }

  buyPlayer(playerId) {
    if (!this.market.isWindowOpen(this.week)) return { ok: false, message: 'Transfer dönemi kapalı.' };
    const idx = this.market.pool.findIndex((player) => player.id === playerId);
    if (idx < 0) return { ok: false, message: 'Oyuncu bulunamadı.' };

    const candidate = this.market.pool[idx];
    const success = this.userTeam.tryBuyPlayer(candidate);
    if (!success) return { ok: false, message: 'Bütçe yetersiz.' };

    this.market.pool.splice(idx, 1);
    this.career.careerEvents.unshift(`Yeni transfer: ${candidate.name} (${candidate.position})`);
    return { ok: true, message: 'Transfer tamamlandı.' };
  }

  playMatch(tactics) {
    this.#setNextOpponent();

    const result = MatchEngine.play({
      homeTeam: this.userTeam,
      awayTeam: this.currentOpponent,
      tacticsHome: tactics,
    });

    this.lastMatch = `${this.userTeam.name} ${result.homeGoals}-${result.awayGoals} ${this.currentOpponent.name}`;
    this.leagues[0].recordMatch(this.userTeam.name, this.currentOpponent.name, result.homeGoals, result.awayGoals);

    this.#simulateAiLeagues();
    this.#updateMorale(result.homeGoals, result.awayGoals);

    this.week += 1;
    if (this.week > this.maxWeeks) this.#endSeason();

    return result;
  }

  #setNextOpponent() {
    const rivals = this.leagues[0].teams.filter((team) => team.name !== this.userTeam.name);
    this.currentOpponent = rivals[Math.floor(Math.random() * rivals.length)];
  }

  #simulateAiLeagues() {
    this.leagues.forEach((league, idx) => {
      for (let i = 0; i < league.teams.length - 1; i += 2) {
        const home = league.teams[i];
        const away = league.teams[i + 1];
        if (idx === 0 && [home.name, away.name].includes(this.userTeam.name)) continue;
        league.recordMatch(home.name, away.name, Math.floor(Math.random() * 4), Math.floor(Math.random() * 4));
      }
    });
  }

  #updateMorale(hg, ag) {
    this.userTeam.morale = Math.max(30, Math.min(100, this.userTeam.morale + (hg > ag ? 2.5 : hg === ag ? 0.5 : -2)));
  }

  #endSeason() {
    const rank = this.leagues[0].table.findIndex((r) => r.name === this.userTeam.name) + 1;
    this.career.registerSeasonResult(rank);

    this.market.refreshPool(this.season + 1);
    this.season += 1;
    this.week = 1;

    this.leagues = createLeagues();
    this.userTeam = this.leagues[0].teams.find((team) => team.name === 'Anadolu Yıldızı');
    this.currentOpponent = this.leagues[0].teams.find((team) => team.name !== this.userTeam.name);
    this.selectedLeague = this.leagues[0].name;

    this.career.careerEvents.unshift(`Yeni sezon başladı: Sezon ${this.season}.`);
  }
}
