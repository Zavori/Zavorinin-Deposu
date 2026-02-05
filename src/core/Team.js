export class Team {
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
    return [...this.players].sort((a, b) => b.rating + b.form - (a.rating + a.form)).slice(0, 11);
  }

  getTopScorer() {
    return [...this.players].sort((a, b) => b.goals - a.goals)[0];
  }

  applyTraining(plan) {
    const gains = this.players.map((player) => player.weeklyTraining(plan));
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
