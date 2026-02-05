# Ultimate Futbol Career

Tarayıcıda çalışan kapsamlı futbol oyunu (ligler, AI, transfer, kariyer modu).

## Proje Yapısı

```text
.
├── index.html
├── styles/
│   └── main.css
└── src/
    ├── main.js
    ├── core/
    │   ├── Player.js
    │   ├── Team.js
    │   ├── League.js
    │   ├── TransferMarket.js
    │   ├── MatchEngine.js
    │   ├── CareerMode.js
    │   └── FootballGame.js
    ├── data/
    │   └── factories.js
    └── ui/
        ├── dom.js
        ├── render.js
        └── events.js
```

## Modüller
- **core/**: oyun kuralları ve domain modelleri
- **data/**: takım/lig üretim fabrikaları
- **ui/**: DOM referansları, render katmanı, event bağlayıcıları
- **main.js**: uygulama başlangıç noktası

## Özellikler
- Çoklu lig (Süper Lig + 1. Lig)
- AI takım profilleri (aggressive / balanced / defensive / elite)
- Oyuncu gelişimi (OVR, potansiyel, form, fitness, gol/asist)
- Transfer pazarı + transfer pencere haftaları
- Kariyer modu (itibar, seviye, kupa, kariyer olayları)

## Çalıştırma
```bash
python3 -m http.server 8000
```

Ardından `http://localhost:8000` açın.
