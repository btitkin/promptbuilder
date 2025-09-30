// Centralized sanitizer helper for LLM outputs
// Provides a single source of truth used across App and services

// Remove assistant/user labels, markdown, leaked JSON fragments, and common preambles
export function cleanLLMText(text: string): string {
  let t = (text ?? '').toString();

  // Normalize smart quotes to ASCII for easier regex handling
  t = t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");

  // Remove code fences and language hints
  t = t.replace(/^```[a-z]*\s*/gim, '').replace(/\s*```$/gim, '');

  // Remove simple Markdown emphasis (e.g., **Prompt:**, __text__)
  t = t.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1');

  // Remove leading meta prefaces like: "here's a rewritten and enhanced prompt ...:"
  t = t.replace(/^[\s\u200B]*(?:here(?:'s|\s+is)|here\s+are|below\s+is|this\s+is|i\s+(?:have|will|can|am)|as\s+requested|the\s+following|here\s+you\s+go|here\s+you\s+have)\b[^:\n]*:\s*/i, '');

  // Drop leading Prompt labels (and variants): Prompt:, Final Prompt:, Enhanced Prompt:, etc.
  t = t.replace(/^\s*(?:prompt|final\s*prompt|enhanced\s*prompt|negative\s*prompt)\s*(?:[:\-–—]|is)\s*/i, '');

  // If a Prompt label still appears very early, cut everything before it
  const earlyLabel = t.match(/.{0,80}?(?:prompt|final\s*prompt|enhanced\s*prompt|negative\s*prompt)\s*(?:[:\-–—]|is)\s*/i);
  if (earlyLabel && (earlyLabel as any).index !== undefined) {
    t = t.slice(((earlyLabel as any).index as number) + earlyLabel[0].length);
  }

  // Remove common headers/prefixes like Prompt:, Description:, Negative Prompt: at start of lines
  t = t.replace(/^(\s*[""']?\s*(prompt|description|output|final|result|response|negative\s*prompt)\s*:\s*)/gim, '');

  // Strip role/dialogue labels
  t = t.replace(/^\s*(user|assistant|system|camera|photographer|model|human)\s*:\s*/gim, '');

  // Remove leading fillers
  t = t.replace(/^\s*(here(\s+is|\s+are)?|this\s+is|okay,\s*|sure,\s*|alright,\s*|great,\s*)/gim, '');

  // Remove any leftover bold/italic markers
  t = t.replace(/[*_]{1,3}([\w\s,.''""-]+)[*_]{1,3}/g, '$1');

  // Strip wrapping or leading quotes
  t = t.replace(/^[""']\s*/, '');
  t = t.replace(/^[""']|[""']$/g, '');

  // Extra sanitization: strip any inline negativePrompt JSON fragments if model leaked them
  t = t.replace(/\{[^{}]*?negative\s*prompt[^{}]*?\}/gi, '');
  t = t.replace(/[,;]?\s*["'“”]?negative\s*prompt["'“”]?\s*:\s*"[^"]*"/gi, '');
  t = t.replace(/[,;]?\s*["'“”]?negativePrompt["'“”]?\s*:\s*"[^"]*"/gi, '');
  t = t.replace(/[,;]?\s*["'“”]?negative\s*prompt["'“”]?\s*[:=]\s*(\[[^\]]*\]|\{[^}]*\}|`[^`]*`|'[^']*'|"[^"]*"|[^\n\r]*)/gim, '');
  t = t.replace(/[,;]?\s*["'“”]?negativePrompt["'“”]?\s*[:=]\s*(\[[^\]]*\]|\{[^}]*\}|`[^`]*`|'[^']*'|"[^"]*"|[^\n\r]*)/gim, '');

  // Remove obvious scene description wrappers and quote blocks
  t = t.replace(/^\s*\(scene\s+description\)\s*[:\-]?\s*/gim, '');
  t = t.replace(/^\s*>+\s*/gm, '');

  // Remove sentinel markers
  t = t.replace(/<<EOD>>/gi, ' ');
  // Remove echoed instruction tails like "And write nothing after it" or "End with <<EOD>>"
  t = t.replace(/\bend\s+(?:the\s+)?(?:description|paragraph)\s+with\s*<<EOD>>(?:\s+and\s+(?:write\s+)?nothing\s+after\s+it)?[.!]?/gi, ' ');
  t = t.replace(/\b(?:and\s+)?write\s+nothing\s+after\s+it\b[.!]?/gi, ' ');

  // Collapse punctuation/commas
  t = t.replace(/\s*,\s*,+/g, ', ');
  t = t.replace(/\s+\,\s*(?=[\.)])/g, ' ');

  // Deduplicate repeated words like "vintage radios" spam
  // First pass: collapse immediate word repeats
  t = t.replace(/(\b\w+\b)(?:\s*,?\s+\1\b)+/gi, '$1');

  // Second pass: when text is a long comma-separated list, dedupe segments while preserving order
  const commaCount = (t.match(/,/g) || []).length;
  if (commaCount >= 8) {
    const parts = t.split(',').map(p => p.trim()).filter(Boolean);
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase().replace(/[.]+$/g, '');
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(p);
      }
      if (deduped.length >= 60) break;
    }
    t = deduped.join(', ');
  }

  // Collapse extra whitespace
  t = t.replace(/[ \t]+/g, ' ').replace(/\n{2,}/g, '\n').trim();

  // Ensure terminal punctuation for short narrative-like outputs
  const looksNarrative = t.split(/[.!?]/).length >= 2 && commaCount < 12;
  if (looksNarrative && !/[.!?]"?$/.test(t) && t.length > 0) {
    t += '.';
  }

  if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1).trim();
  if (t.startsWith('"') && t.endsWith('"')) t = t.slice(1, -1).trim();

  return t;
}

// Normalize narrative outputs: strip roles, fences, extra instructions, and enforce concise 3–6 sentence target
export function normalizeNarrative(text: string): string {
  let s = cleanLLMText(text ?? '');

  // Remove XML-like tags
  s = s.replace(/<[^>]*>/g, ' ');

  // Remove bracket tokens like [SYS], [/EOD]
  s = s.replace(/\[(?:\/)?(?:SYS|SYSTEM|EOD|INST|INSTR|OOC)\]/gi, '');
  s = s.replace(/\[(?:\/)?[A-Z]{2,10}\]/g, '');

  // Remove sentinel tokens
  s = s.replace(/<<EOD>>/gi, ' ');
  // Remove echoed instruction tails
  s = s.replace(/\bend\s+(?:the\s+)?(?:description|paragraph)\s+with\s*<<EOD>>(?:\s+and\s+(?:write\s+)?nothing\s+after\s+it)?[.!]?/gi, ' ');
  s = s.replace(/\b(?:and\s+)?write\s+nothing\s+after\s+it\b[.!]?/gi, ' ');

  // Drop common instruction echoes
  const instructionLike = [
    /^(please\s+)?create\s+a\s+visual\s+scene\s+description/i,
    /^(please\s+)?write\s+one\s+paragraph/i,
    /^do\s+not\b/i,
    /^describe\s+only\b/i,
    /^(please\s+)?describe\s+(?:the\s+)?scene\b/i,
    /^start\s+(directly|immediately)\b/i,
    /^end\s+the\s+description\b/i,
    /^return\s+only\b/i,
    /^bad\s*:/i,
    /^good\s*:/i,
    /^note\s*:/i
  ];

  // Remove leading instruction sentences inline
  s = s.replace(/^\s*(?:please\s+)?describe\s+(?:the\s+)?scene\b.*?[.!?:]\s*/i, '');
  s = s.replace(/^\s*(?:please\s+)?create\s+a\s+visual\s+scene\s+description\b.*?[.!?:]\s*/i, '');

  s = s
    .split(/\r?\n+/)
    .map(line => line.trim())
    .filter(line => line && !instructionLike.some(rx => rx.test(line)))
    .join(' ');

  // Remove list numbering/bullets
  s = s.replace(/^\s*\(?\d+\)?[.)]\s+/, '');

  // If Scene:/Description: appears, take what follows
  const sceneIdx = s.search(/\b(scene|description)\s*:/i);
  if (sceneIdx >= 0) {
    s = s.slice(s.indexOf(':', sceneIdx) + 1);
  }

  // If pattern USER: ... ASSISTANT: ... exists, take text after USER:
  const userIdx = s.search(/\bUSER:\s*/i);
  if (userIdx >= 0) {
    const afterUser = s.slice(s.indexOf(':', userIdx) + 1).trim();
    if (afterUser && !afterUser.match(/^\s*(ASSISTANT:|\[\/??INST\]|<\/?)/)) {
      s = afterUser;
    }
  }

  // Remove Tags: prefix if present
  s = s.replace(/^\s*tags?\s*:\s*[^\n]*\)\s*[-–—:]?\s*/i, '');

  // Reduce whitespace
  s = s.replace(/\r?\n+/g, ' ').replace(/\s{2,}/g, ' ').trim();

  // Split sentences and drop role/instruction meta like "You are...", "As an..." and Q/A disclaimers
  let sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  sentences = sentences.filter(sent => !/^\s*(you\s+are|as\s+an|assistant|user|system)\b/i.test(sent) && !/\b(question|answer|information)\b/i.test(sent));
  if (sentences.length === 0) {
    sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
  }

  // Cap to 6 sentences to keep outputs concise and aligned with 3–6 sentence target
  if (sentences.length > 6) s = sentences.slice(0, 6).join(' ');
  else s = sentences.join(' ');

  // Ensure terminal punctuation
  if (!/[.!?]"?$/.test(s) && s.length > 0) s += '.';

  // Soft word cap ~180 words to match target range without aggressive truncation
  const words = s.split(/\s+/);
  if (words.length > 190) {
    s = words.slice(0, 185).join(' ');
    if (!/[.!?]"?$/.test(s)) s += '.';
  }

  return s.trim();
}

// Convert noisy/multiline output into a single, comma-separated tag line and dedupe
export function normalizeToTagsLine(text: string, maxTags: number = 45): string {
  let s = cleanLLMText(text);

  // Remove obvious prefixes
  s = s.replace(/^(Here are some|Here's a|Tags:|Image tags:|Prompt:|Description:)\s*/i, '');
  s = s.replace(/^(I'll create|I can suggest|Let me generate).*?:\s*/i, '');

  // Remove explanatory sentences
  s = s.replace(/\b(This prompt|These tags|The image)[^,]*?\./gi, '');

  // Harmonize separators
  s = s.replace(/[;|]/g, ', ');
  s = s.replace(/\r?\n+/g, ', ');

  // Remove list markers
  s = s.replace(/(^|, )\s*(?:\(?\d+\)?[.)]|[-*•])\s+/g, '$1');

  // Normalize quotes/parentheses/backticks
  s = s.replace(/["'`]/g, '');

  // Convert full stops to soft separators when they look like sentence breaks
  s = s.replace(/\.(\s+|$)/g, ', ');

  // Collapse duplicate commas/spaces
  s = s.replace(/\s*,\s*/g, ', ');
  s = s.replace(/(?:,\s*){2,}/g, ', ');

  // Split, trim, dedupe, and cap length
  const parts = s.split(',').map(t => t.trim()).filter(Boolean);
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const p of parts) {
    let tag = p.replace(/\s{2,}/g, ' ').replace(/[.]+$/g, '').trim();
    tag = tag.replace(/^(woman|man|pose|location|clothing|lighting|style|age|build)\s*:?\s*/i, '');
    if (!tag || tag.length < 1) continue;
    const key = tag.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      tags.push(tag);
    }
    if (tags.length >= maxTags) break;
  }

  if (tags.length === 0) {
    return 'portrait, single subject, natural light, shallow depth of field, cinematic lighting, high detail, sharp focus, photorealistic';
  }
  return tags.join(', ');
}