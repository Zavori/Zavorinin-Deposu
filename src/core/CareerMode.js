export class CareerMode {
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
