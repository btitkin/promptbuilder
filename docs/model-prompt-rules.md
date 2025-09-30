# Model Prompt Writing Rules (System Prompt Guide)

This document defines how to write correct prompts for each supported model based on their configuration. It can be used as a “system prompt” for any LLM that is asked to generate image/video prompts for the app.

Key terms
- syntaxStyle: either “tagged” (comma-separated tags) or “natural” (full sentences).
- supportsBreak: whether the model supports concept separation with the keyword BREAK.
- tagSeparator: separator between tags for tagged syntax.
- qualityTagsLocation: whether baseline quality/style tags are prepended or appended.
- paramStyle: if parameters must be embedded in the text, e.g., MidJourney uses “--ar”, “--seed”. Most other models ignore parameters in text.
- negativePromptStyle: whether to include negative prompt in the text (MidJourney uses “--no”; most others ignore and accept negatives via API).

General rules
1) Always tailor output to the selected model’s syntaxStyle and supportsBreak.
2) Only include parameters or negatives in the text if the model’s configuration requires it.
3) Respect qualityTagsLocation: prepend or append the quality/style tags accordingly.
4) Keep output clean: avoid duplicated separators, trailing commas, and extra whitespace.

Category order
- Tagged syntax order: subject, attributes, action, pose, clothing, location, background, style.
- Natural syntax order: subject, action, pose, clothing, attributes, location, background, style.

SDXL (tagged syntax, supports BREAK)
A) SDXL WITHOUT BREAK
- Use concise, Danbooru-style tags separated by “, ”.
- Follow tagged order above; place quality tags at the beginning (prepend).
- Avoid full sentences; prefer nouns/adjectives/short phrases.
- Example:
  film grain, analog photography, vintage aesthetic, natural lighting, 25-year-old Korean woman, athletic build, tight vinyl minidress, moonlit office window, leaning pose, teasing expression, soft shadows, high-resolution, photography-style image

B) SDXL WITH BREAK
- Use multiple sections separated by the literal token BREAK.
- Section 1 (if qualityTagsLocation=prepend): quality/style tags.
- Section 2+: category groups in tagged order. Inside each section, join items with “, ”. Keep items as short tags, not sentences.
- Example:
  film grain, analog photography, vintage aesthetic, natural lighting
  BREAK
  25-year-old Korean woman, athletic build, tight vinyl minidress
  BREAK
  leaning pose, teasing expression
  BREAK
  moonlit office window, soft shadows, high-resolution

Other SD-like tagged models (no BREAK)
- Models: SD 1.5, AuraFlow, HiDream, Illustrious, Kolors, Lumina, Mochi, NoobAI, PixArt A/E.
- Rules: same as SDXL WITHOUT BREAK.
- Quality tags: prepend; use concise comma-separated tags; avoid sentences.

Pony, Stable Cascade (tagged syntax, supports BREAK)
- Same rules as SDXL WITH BREAK.

MidJourney (natural syntax, unique parameter style)
- Prefix the prompt with “/imagine prompt: ”.
- Write a single natural-language description using short but descriptive phrases (you may still separate phrases with commas).
- Append parameters with double-dash syntax: “--ar <ratio>”, “--seed <number>”.
- Negative prompt is part of parameters using “--no”.
- Quality tags: append.
- Example:
  /imagine prompt: a Korean woman in a vinyl minidress leaning at a moonlit office window, soft shadows, vintage film photography look, analog grain --ar 3:2 --seed 42 --no blurry, bad anatomy

Modern natural-language models (no BREAK)
- Models: Google Imagen4, Flux, Nano Banana, OpenAI (DALL·E family), Qwen.
- Write clear, coherent sentences describing subject, action, scene, lighting, style.
- Avoid BREAK and parameter flags; negatives are handled via API.
- Quality tags: append if used; they can be short phrases at the end.
- Example:
  A 25-year-old Korean woman with an athletic build leans against a moonlit office window. Soft shadows and analog film grain create a vintage photography aesthetic.

Video models (natural syntax, no BREAK)
- Models: Veo 3, CogVideoX, Hunyuan Video, LTXV, SVD, Wan Video.
- Describe scene, camera motion, actions, and atmosphere in natural sentences.
- Do not use BREAK or parameter flags; negatives via API.
- Quality tags: append if necessary; tagSeparator may be a space.
- Example:
  A moonlit office interior where a woman leans against the window; soft shadows and analog grain evoke a vintage film look as the camera slowly dollies forward.

Negative prompts
- MidJourney: include negatives with “--no <tags>” at the end.
- All other models: do not include negatives in the text; supply via API/controls.

Parameters
- MidJourney only: “--ar <ratio>”, “--seed <number>”.
- All other models: ignore parameters in text; set via API/controls.

Quality/style tags placement
- Tagged models (SD-like): prepend.
- Natural and video models: append.

System Prompt Template (for an LLM)
1) Read model config: syntaxStyle, supportsBreak, tagSeparator, qualityTagsLocation, paramStyle, negativePromptStyle.
2) If syntaxStyle=tagged:
   - Produce short comma-separated tags in the tagged order.
   - If supportsBreak=true and BREAK is requested: split into multiple sections with BREAK; keep each section tag-like.
   - Else: produce a single comma-separated sequence.
3) If syntaxStyle=natural:
   - Produce clear, concise sentences in the natural order.
   - Do not use BREAK unless explicitly supported (MidJourney does not).
4) Place quality/style tags according to qualityTagsLocation.
5) Apply parameters/negatives only if paramStyle/negativePromptStyle require them (MidJourney).
6) Ensure clean formatting (no duplicates, no trailing commas, normalized spacing).