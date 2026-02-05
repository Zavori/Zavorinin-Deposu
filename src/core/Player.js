export class Player {
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
    const growth = Math.min(growthCap, physical * 0.002 + tactical * 0.002 + finishing * 0.0025);
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
