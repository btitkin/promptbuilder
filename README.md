<p align="center">
  <img src="logohorizontal.svg" alt="Prompt Builder Logo" width="480"/>
</p>

<h1 align="center">Prompt Builder</h1>

<p align="center">
  Inteligentna aplikacja internetowa, która przekształca proste opisy w ustrukturyzowane, specyficzne dla modelu prompty dla różnych generatorów obrazów i wideo AI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-blue?logo=tailwind-css" alt="Tailwind CSS">
</p>

## ✨ Wprowadzenie

Prompt Builder to zaawansowane narzędzie przeznaczone dla entuzjastów sztuki AI, deweloperów i inżynierów promptów. Wypełnia lukę między prostym pomysłem a wysokiej jakości, doskonale sformatowanym promptem, oszczędzając czas i maksymalizując potencjał generatywnych modeli AI. Aplikacja inteligentnie zarządza złożoną składnią, parametrami specyficznymi dla modelu i regułami treści, pozwalając Ci skupić się na kreatywności.

**[➡️ Placeholder dla Live Demo](https://your-live-demo-url.com)**



## 🚀 Kluczowe Funkcje

*   **🧠 Inteligentne Generowanie Promptów:** Wykorzystuje potężny model LLM (za pośrednictwem Twojego klucza API) do rozwijania prostych opisów w wiele szczegółowych wariantów promptów.
*   **🤖 Optymalizacja Specyficzna dla Modelu:** Automatycznie formatuje prompty dla szerokiej gamy popularnych modeli AI, w tym modeli opartych na tagach (Stable Diffusion), języku naturalnym (Google Imagen), MidJourney i modeli wideo.
*   **🔧 Zaawansowane Sterowanie:** Dostosuj każdy aspekt za pomocą ustawień dla negatywnych promptów, proporcji obrazu, ziarna (seed) i niestandardowych parametrów.
*   **🎨 Dyrektywy Wysokiego Poziomu:** Używaj intuicyjnych kontrolek dla Stylu (Realistyczny/Anime), atrybutów Postaci (wiek, płeć, pochodzenie etniczne itp.) oraz Reguł Treści (SFW/NSFW).
*   **⚡️ Akceleratory Pracy:**
    *   **Presety:** Szybko dodawaj popularne terminy dla ujęć, póz, lokalizacji i ubrań.
    *   **Fragmenty (Snippets):** Zapisuj i ponownie używaj ulubionych fraz lub złożonych opisów postaci.
    *   **Ulepsz i Losuj:** Użyj AI, aby wzbogacić istniejący pomysł lub wygenerować nowy od podstaw na podstawie Twoich ustawień.
*   **⚖️ Ważenie Promptów:** Łatwo zwiększaj `(słowo:1.1)` lub zmniejszaj `[słowo]` znaczenie zaznaczonego tekstu.
*   **🖼️ Zintegrowane Generowanie Obrazów:** Wyślij gotowy prompt bezpośrednio do generatora obrazów (obsługuje Google Imagen).
*   **🔐 Bezpieczeństwo i Prywatność:** Twoje klucze API są przechowywane wyłącznie w lokalnej pamięci przeglądarki i nigdy nie są wysyłane na żaden serwer.
*   **💾 Import/Eksport:** Zapisz całą konfigurację przestrzeni roboczej do pliku JSON, aby utworzyć kopię zapasową lub udostępnić ją innym.

## 🏁 Pierwsze Kroki

### Wymagania

Potrzebujesz klucza API od obsługiwanego dostawcy modelu językowego (LLM). Ta aplikacja używa LLM do zrozumienia Twoich intencji i generowania ustrukturyzowanych promptów. Zalecany jest Google Gemini (`gemini-2.5-flash`).

### Użycie

1.  **Otwórz Aplikację:** Przejdź do adresu URL wersji demonstracyjnej na żywo.
2.  **Ustaw Swój Klucz API:**
    *   Rozwiń sekcję **Ustawienia API**.
    *   Wybierz swojego dostawcę LLM (np. Google Gemini).
    *   Wklej swój klucz API w pole wejściowe. Aplikacja jest teraz gotowa do użycia.
3.  **Opisz Swój Pomysł:** Wpisz podstawową koncepcję w głównym polu tekstowym (np. "rycerz w lesie").
4.  **Wybierz Model Docelowy:** Wybierz model AI do generowania obrazu/wideo, którego będziesz używać (np. `SDXL`, `Google Imagen4`).
5.  **Generuj:** Kliknij przycisk **Generuj Prompt** i zobacz wyniki!

## 🤖 Obsługiwane Modele

Prompt Builder potrafi generować zoptymalizowane prompty dla następujących modeli:

| Text-to-Image (Język Naturalny) | Text-to-Image (Tagi) | MidJourney   | Modele Wideo |
| ----------------------- | ---------------------- | ------------ | ------------ |
| Google Imagen4          | SDXL                   | MidJourney   | Veo 3        |
| Flux                    | Pony                   |              | SVD          |
| OpenAI (DALL-E)         | Stable Cascade         |              | CogVideoX    |
| Nano Banana             | SD 1.5                 |              | Hunyuan Video|
| Qwen                    | Illustrious            |              | LTXV         |
|                         | ...i więcej            |              | Wan Video    |


## 🛠️ Stos Technologiczny

*   **Framework:** React 19
*   **Język:** TypeScript
*   **Stylowanie:** Tailwind CSS
*   **Integracja AI:** Google Gemini API przez `@google/genai`

## 🤝 Wkład

Wkład jest mile widziany! Zachęcamy do przesyłania pull requestów lub otwierania zgłoszeń (issues) w przypadku błędów, propozycji funkcji lub sugestii.

1.  Sforkuj repozytorium.
2.  Utwórz swoją gałąź funkcji (`git checkout -b feature/AmazingFeature`).
3.  Zatwierdź swoje zmiany (`git commit -m 'Add some AmazingFeature'`).
4.  Wypchnij zmiany do gałęzi (`git push origin feature/AmazingFeature`).
5.  Otwórz Pull Request.

## 📄 Licencja

Ten projekt jest objęty licencją MIT - zobacz plik [LICENSE.md](LICENSE.md), aby uzyskać szczegółowe informacje.
