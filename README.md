# Ultimate Futbol Menajer

Tarayıcıda çalışan temel ama genişletilebilir futbol oyunu çatısı.

## Neler var?
- **Takım & Oyuncu modeli** (`Team`, `Player`)
- **Maç motoru** (`MatchEngine`) ile taktik etkili skor üretimi
- **Lig tablosu yönetimi** (`LeagueTable`) ve puan hesaplama
- **Oyun orkestrasyonu** (`FootballGame`) ile hafta/sezon akışı
- **UI Adaptörü**: domain katmanını HTML arayüzüne bağlayan ince katman

## Mimari yaklaşım
Kod iki katmanda düşünülmüştür:
1. **Domain katmanı**: İş kuralları ve simülasyon (UI bağımsız)
2. **UI katmanı**: DOM render ve event binding

Bu yapı ile ileride:
- farklı ligler,
- oyuncu sözleşmeleri,
- sakatlık/ceza sistemi,
- yapay zekâ takım stratejileri
kolayca eklenebilir.

## Çalıştırma
```bash
python3 -m http.server 8000
```

Sonra tarayıcıdan `http://localhost:8000` adresini açın.
