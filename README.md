# Ultimate Futbol Career

Tarayıcıda çalışan kapsamlı futbol oyunu prototipi.

## İçerik
- **Lig sistemi (çoklu lig):** Süper Lig ve 1. Lig tabloları
- **AI takımlar:** Takım profiline göre (aggressive / balanced / defensive / elite) maç davranışı
- **Oyuncu istatistikleri:** OVR, potansiyel, form, fitness, gol/asist, yaş, değer
- **Transfer sistemi:** Haftaya bağlı açık/kapalı transfer pencereleri + piyasa havuzu
- **Kariyer modu:** menajer seviye/itibar, sezon sonuçlarına göre gelişim, kariyer olay akışı
- **Genişletilebilir mimari:** `Player`, `Team`, `League`, `TransferMarket`, `MatchEngine`, `CareerMode`, `FootballGame`

## Mimarinin özeti
- **Domain katmanı:** oyunun bütün kurallarını yönetir.
- **UI adaptörü:** sadece render ve event-binding yapar.

Bu sayede kulüp ekonomisi, altyapı akademisi, sakatlık, sözleşme pazarlığı gibi özellikler kolayca eklenebilir.

## Çalıştırma
```bash
python3 -m http.server 8000
```

Ardından:
- `http://localhost:8000`
