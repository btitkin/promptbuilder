# ComfyUI Prompt Builder Node

Integracja Prompt Builder z ComfyUI umożliwiająca generowanie zaawansowanych promptów przy użyciu lokalnych modeli LLM.

## 🚀 Funkcje

- **Lokalne LLM** - Obsługa lokalnych modeli AI (Ollama, Mistral, LM Studio)
- **Generowanie promptów** - Automatyczne tworzenie szczegółowych promptów pozytywnych i negatywnych
- **Style** - Wsparcie dla różnych stylów: photorealistic, anime, artistic
- **Konfigurowalność** - Pełna kontrola nad parametrami generowania
- **Offline** - Działa całkowicie offline z lokalnymi modelami

## 📦 Instalacja

### 1. Przez ComfyUI Manager (Zalecane)
 
  <<<<<<< comfyui-node
1. Otwórz ComfyUI
2. Kliknij "Manager" w menu
3. Wybierz "Install Custom Nodes"
4. Wklej URL: `https://github.com/btitkin/promptbuilder.git`
5. Kliknij "Install"
6. Zrestartuj ComfyUI
=======
**[💻 DESKTOP VERSION - USE WITH YOUR LOCAL LLM! ](https://github.com/btitkin/promptbuilder/tree/local_llm_version)💻**

**[▶️ You can try the PromptBuilder now here, enjoy it! ](https://btitkin.github.io/promptbuilder/)◀️**
>>>>>>> main

### 2. Instalacja manualna

1. Przejdź do folderu `ComfyUI/custom_nodes/`
2. Sklonuj repozytorium:
   ```bash
   git clone https://github.com/btitkin/promptbuilder.git comfyui-promptbuilder-node
   ```
3. Zainstaluj zależności:
   ```bash
   cd comfyui-promptbuilder-node
   pip install -r requirements.txt
   ```
4. Zrestartuj ComfyUI

## 🔧 Konfiguracja lokalnego LLM

### Ollama
```bash
# Instalacja Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pobranie modelu
ollama pull mistral

# Uruchomienie serwera
ollama serve
```

### LM Studio
1. Pobierz i zainstaluj LM Studio
2. Pobierz model (np. Mistral 7B)
3. Uruchom lokalny serwer na porcie 1234

### Inne kompatybilne API
Wszystkie API kompatybilne z OpenAI (LocalAI, text-generation-webui, itp.)

## 🎯 Użytkowanie

### Podstawowe użycie

1. **Dodaj node** - W ComfyUI dodaj node "Prompt Builder (Local LLM)"
2. **Konfiguruj połączenie:**
   - **API URL**: `http://127.0.0.1:1234` (dla LM Studio)
   - **Model Name**: `mistral` lub nazwa twojego modelu
3. **Wprowadź opis**: "A beautiful sunset over mountains"
4. **Wybierz styl**: photorealistic/anime/artistic
5. **Uruchom** - Node wygeneruje enhanced prompty

### Parametry wejściowe

| Parametr | Typ | Domyślna | Opis |
|----------|-----|----------|------|
| `description` | STRING | "A beautiful sunset..." | Podstawowy opis sceny |
| `api_url` | STRING | "http://127.0.0.1:1234" | URL lokalnego API LLM |
| `model_name` | STRING | "dolphin-2.7-mixtral-8x7b" | Nazwa modelu |
| `style_filter` | CHOICE | "photorealistic" | Styl: photorealistic/anime/artistic |
| `num_variations` | INT | 3 | Liczba wariantów (1-10) |
| `api_key` | STRING | "" | Klucz API (opcjonalny) |
| `temperature` | FLOAT | 0.7 | Kreatywność (0.1-2.0) |
| `max_tokens` | INT | 2000 | Maksymalna długość odpowiedzi |

### Wyjścia

- **positive_prompt** - Szczegółowy prompt pozytywny
- **negative_prompt** - Prompt negatywny (elementy do unikania)
- **enhanced_description** - Rozszerzony opis sceny

## 🔗 Przykładowy workflow

```
[Prompt Builder Node] → [CLIP Text Encode] → [KSampler] → [VAE Decode] → [Save Image]
                    ↘ [CLIP Text Encode (Negative)]
```

## ⚙️ Konfiguracja zaawansowana

### Różne modele LLM

**Ollama:**
- URL: `http://127.0.0.1:11434`
- Modele: `mistral`, `llama2`, `codellama`

**LM Studio:**
- URL: `http://127.0.0.1:1234`
- Modele: Dowolny załadowany model

**text-generation-webui:**
- URL: `http://127.0.0.1:5000`
- Tryb: OpenAI API compatibility

### Optymalizacja promptów

**Photorealistic:**
- Dodaje terminy fotograficzne
- Skupia się na oświetleniu i kompozycji
- Zawiera szczegóły techniczne

**Anime:**
- Używa terminologii anime/manga
- Dodaje elementy stylu artystycznego
- Zawiera referencje do designu postaci

**Artistic:**
- Skupia się na ruchach artystycznych
- Dodaje techniki malarskie
- Zawiera elementy estetyczne

## 🐛 Rozwiązywanie problemów

### "Connection Error"
- Sprawdź czy lokalny LLM jest uruchomiony
- Zweryfikuj URL API (http://127.0.0.1:1234)
- Sprawdź czy port nie jest zablokowany

### "API Error 404"
- Sprawdź czy model jest załadowany
- Zweryfikuj nazwę modelu
- Sprawdź czy API endpoint jest poprawny

### "Timeout Error"
- Zwiększ timeout w kodzie node
- Sprawdź wydajność systemu
- Rozważ mniejszy model LLM

### CORS Issues (dla aplikacji webowych)
- Użyj aplikacji desktop (Electron)
- Skonfiguruj proxy w serwerze deweloperskim
- Uruchom LLM z obsługą CORS

## 📋 Wymagania systemowe

- **ComfyUI** - Najnowsza wersja
- **Python** - 3.8+
- **RAM** - Min. 8GB (16GB zalecane dla większych modeli)
- **GPU** - Opcjonalne (dla przyspieszenia LLM)
- **Lokalny LLM** - Ollama/LM Studio/inne

## 🤝 Wsparcie

- **Issues**: [GitHub Issues](https://github.com/btitkin/promptbuilder/issues)
- **Dokumentacja**: [Wiki](https://github.com/btitkin/promptbuilder/wiki)
- **Dyskusje**: [GitHub Discussions](https://github.com/btitkin/promptbuilder/discussions)

## 📄 Licencja

MIT License - Zobacz [LICENSE](LICENSE) dla szczegółów.

## 🙏 Podziękowania

- ComfyUI team za fantastyczną platformę
- Społeczność AI za wsparcie i feedback
- Twórcy lokalnych modeli LLM

---

**Prompt Builder ComfyUI Node** - Generuj lepsze prompty z mocą lokalnych LLM! 🚀
