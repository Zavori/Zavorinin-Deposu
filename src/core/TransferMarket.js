import { Player } from './Player.js';

export class TransferMarket {
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
        wage: Math.round(rating * 1200 + Math.random() * 6000),
      });
    });
  }

  isWindowOpen(week) {
    return week <= 6 || (week >= 18 && week <= 22);
  }
}
