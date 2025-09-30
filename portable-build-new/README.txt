=== PROMPT BUILDER - PORTABLE VERSION ===

To jest przenośna wersja aplikacji Prompt Builder, która nie wymaga instalacji.

=== URUCHAMIANIE ===

1. Kliknij dwukrotnie na plik "start.bat" aby uruchomić aplikację
   LUB
2. Kliknij prawym przyciskiem na "start.ps1" → "Uruchom za pomocą PowerShell"
   LUB
3. Otwórz terminal w tym folderze i wpisz: npm start

=== WYMAGANIA ===

- Windows 10/11 (64-bit)
- Minimum 8GB RAM (16GB zalecane dla modeli LLM)
- Około 4-5GB wolnego miejsca na dysku
- Node.js (zostanie automatycznie sprawdzony przy pierwszym uruchomieniu)

=== STRUKTURA FOLDERÓW ===

- assets/         - Zasoby aplikacji React (CSS, JS)
- models/         - Modele LLM (pliki .gguf)
- node_modules/   - Zależności Node.js i Electron (po instalacji)
- main.js         - Główny plik Electron
- preload.js      - Skrypt preload Electron
- package.json    - Konfiguracja projektu
- start.bat       - Skrypt uruchamiający (Windows Batch)
- start.ps1       - Skrypt uruchamiający (PowerShell)
- install-dependencies.bat - Instalacja zależności (Batch)
- install-dependencies.ps1 - Instalacja zależności (PowerShell)
- index.html      - Główny plik HTML aplikacji
- logo.svg        - Logo aplikacji

=== MODELE LLM ===

Aplikacja zawiera model Qwen2.5-7B-Instruct-Q4_K_M w folderze models/.
Możesz dodać własne modele w formacie .gguf do folderu models/.

Zalecane modele:
- Qwen2.5-7B-Instruct-Q4_K_M.gguf (dołączony)
- Llama-3.2-1B-Instruct-Q4_K_M.gguf (mniejszy, szybszy)
- Gemma-2-9B-It-Q4_K_M.gguf (większy, dokładniejszy)

=== PIERWSZA INSTALACJA ===

Przy pierwszym uruchomieniu:
1. Uruchom install-dependencies.bat lub install-dependencies.ps1
2. Poczekaj na zakończenie instalacji zależności
3. Uruchom aplikację używając start.bat lub start.ps1

=== ROZWIĄZYWANIE PROBLEMÓW ===

1. Jeśli aplikacja się nie uruchamia:
   - Sprawdź czy masz zainstalowany Node.js
   - Uruchom: install-dependencies.bat
   - Sprawdź czy masz wystarczająco RAM-u

2. Jeśli brakuje modelu LLM:
   - Skopiuj plik .gguf do folderu models/
   - Upewnij się, że plik nie jest uszkodzony

3. Jeśli aplikacja działa wolno:
   - Zamknij inne aplikacje
   - Sprawdź czy masz wystarczająco RAM-u
   - Użyj mniejszego modelu (np. 1B zamiast 7B)

4. Jeśli występują błędy JavaScript:
   - Sprawdź czy wszystkie pliki zostały skopiowane
   - Uruchom ponownie install-dependencies.bat

=== FUNKCJE ===

- Generowanie promptów dla AI
- Lokalne modele LLM (bez internetu)
- Predefiniowane kategorie i style
- Historia promptów
- Eksport/import ustawień
- Interfejs w języku polskim

=== KONTAKT ===

Autor: btitkin
Wersja: 1.0.0
Data: 2025

=== LICENCJA ===

Zobacz plik LICENSE w głównym katalogu projektu.