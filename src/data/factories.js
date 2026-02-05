import { Player } from '../core/Player.js';
import { Team } from '../core/Team.js';
import { League } from '../core/League.js';

function createTeam(name, aiProfile) {
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

export function createLeagues() {
  const superLigTeams = [
    createTeam('Anadolu Yıldızı', 'balanced'),
    createTeam('Kuzey Kartalı', 'aggressive'),
    createTeam('Marmara Gücü', 'balanced'),
    createTeam('Başkent Spor', 'elite'),
    createTeam('Akdeniz FK', 'balanced'),
    createTeam('Doğu Birliği', 'defensive'),
  ];

  const firstLigTeams = [
    createTeam('Ovalar SK', 'balanced'),
    createTeam('Laleşehir', 'defensive'),
    createTeam('Yıldırım 55', 'aggressive'),
    createTeam('Sahil Birlik', 'balanced'),
    createTeam('Demirordu', 'aggressive'),
    createTeam('Vadi FK', 'defensive'),
  ];

  return [new League('Süper Lig', superLigTeams), new League('1. Lig', firstLigTeams)];
}
