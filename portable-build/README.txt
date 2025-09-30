=== Prompt Builder - Portable Version ===

Aplikacja do budowania promptów dla lokalnych modeli LLM (Local Large Language Models).

--- INSTALACJA I URUCHOMIENIE ---

1. WYMAGANIA WSTĘPNE:
   - Windows 10/11 (64-bit)
   - Node.js 20+ (jeśli nie masz, pobierz z: https://nodejs.org/)

2. INSTALACJA ZALEŻNOŚCI (wymagane tylko raz):
   - Uruchom: install-dependencies.bat
   - LUB w PowerShell: .\install-dependencies.ps1
   - Pobierze Electron (~200MB)

3. DODAWANIE MODELI:
   - Skopiuj pliki modeli GGUF do folderu: .\models\
   - Zalecany model: Qwen2.5-7B-Instruct-Q4_K_M.gguf
   - Aplikacja działa też bez modeli, ale funkcje LLM będą niedostępne

4. URUCHOMIENIE:
   - Kliknij: start.bat
   - LUB w PowerShell: .\start.ps1

--- STRUKTURA FOLDERÓW ---

portable-build/
├── assets/           # Zasoby aplikacji React
├── models/           # Tutaj wrzucaj pliki .gguf
├── node_modules/     # Zależności (tworzone automatycznie)
├── index.html        # Główna strona
├── main.js           # Główny proces Electron
├── preload.js        # Skrypt preload Electron
├── package.json      # Konfiguracja projektu
├── start.bat         # Skrypt uruchamiający (Batch)
├── start.ps1         # Skrypt uruchamiający (PowerShell)
├── install-dependencies.bat   # Instalator zależności
└── install-dependencies.ps1   # Instalator zależności

--- WYMAGANIA SYSTEMOWE ---

- System: Windows 10/11 64-bit
- RAM: Minimum 8GB (16GB zalecane dla większych modeli)
- Miejsce na dysku: ~3.3GB (w tym Electron + modele)
- Procesor: Nowoczesny CPU (Intel i5/Ryzen 5 lub lepszy)

--- ROZWIĄZYWANIE PROBLEMÓW ---

1. BRAK ELEKTRONA:
   - Uruchom install-dependencies.bat

2. BRAK MODELI:
   - Skopiuj pliki .gguf do folderu models/
   - Aplikacja uruchomi się bez modeli z ostrzeżeniem

3. BŁĘDY NODE.JS:
   - Zainstaluj Node.js 20+ z https://nodejs.org/

4. WOLNE DZIAŁANIE:
   - Użyj mniejszego modelu (np. 4B zamiast 12B)
   - Zamknij inne aplikacje zużywające RAM

--- INFORMACJE ---

Wersja: 1.0.0 (Portable)
Autor: LocalLLM Prompt Builder Team

UWAGA: Ta wersja jest w pełni przenośna - możesz przenosić cały folder
        portable-build i uruchamiać z dowolnego miejsca.

--- KONTAKT I WSPARCIE ---

W przypadku problemów sprawdź czy:
1. Node.js jest zainstalowany
2. Electron został pobrany (install-dependencies.bat)
3. Modele są w folderze models/

Aplikacja automatycznie wykryje dostępne modele GGUF po uruchomieniu.