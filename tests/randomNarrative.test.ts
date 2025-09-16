import { describe, it, expect } from 'vitest';
import { cleanTextResponse, normalizeNarrative, isJunkOutput } from '../services/customApiService';

describe('Random Narrative normalization', () => {
  it('strips role markers and produces clean prose', () => {
    const raw = `Describe the woman in the scene.\nASSISTANT: The woman in the scene is an 18-year-old European amate\nUSER: She is posing against a weathered wooden background, with a confident look at the camera. The lighting is warm and golden, filtering through nearby foliage, casting soft shadows across her skin and highlighting the natural curves of her pose. <<EOD>>`;
    const cleaned = cleanTextResponse(raw);
    const normalized = normalizeNarrative(cleaned);
    expect(normalized).toBeTruthy();
    expect(normalized.length).toBeGreaterThan(40);
    expect(/USER:|ASSISTANT:|Tags:/i.test(normalized)).toBe(false);
    expect(/[.!?]$/.test(normalized)).toBe(true);
  });

  it('detects junk outputs', () => {
    expect(isJunkOutput('...............')).toBe(true);
    expect(isJunkOutput('***************')).toBe(true);
    expect(isJunkOutput('A coherent sentence with proper words and punctuation.')).toBe(false);
  });

  it('removes leading quote blocks and roles', () => {
    const raw = `> You are a Always answer as If a question does not make any sense.\n> If you don't know the answer to a question, don't share false information.\n(Scene description) A young Japanese woman with a curvy build reclines against weathered wooden steps, her confident gaze meeting the camera.`;
    const cleaned = cleanTextResponse(raw);
    const normalized = normalizeNarrative(cleaned);
    expect(normalized.toLowerCase()).not.toMatch(/^(you are|as an|assistant|user|system)/);
    expect(normalized).not.toContain('(Scene description)');
    expect(normalized).not.toMatch(/^>/m);
    expect(/[.!?]$/.test(normalized)).toBe(true);
  });

  it('keeps the descriptive part after USER: when present', () => {
    const raw = `Describe the scene. ASSISTANT: > Create a visual scene description using these elements: woman, 18s, japanese, curvy build, realistic, amateur, suggestive. ASSISTANT: [/INSTR] USER: A young Japanese woman with a curvy build reclines against weathered wooden steps, her confident gaze meeting the camera.`;
    const cleaned = cleanTextResponse(raw);
    const normalized = normalizeNarrative(cleaned);
    expect(normalized).toMatch(/weathered wooden steps/i);
    expect(/USER:|ASSISTANT:|\[\/?INSTR\]/i.test(normalized)).toBe(false);
  });

  it('removes bracket tokens and instruction echoes', () => {
    const raw = `[/SYS] Please create a visual scene description using these elements: woman, 18s, japanese, curvy build.
Do NOT output tags, lists, or labels.
End the description with <<EOD>>.
[INST] A young Japanese woman with a curvy build reclines against weathered wooden steps, her confident gaze meeting the camera. Warm golden light filters through nearby foliage, casting soft shadows across her skin. [/EOD]`;
    const cleaned = cleanTextResponse(raw);
    const normalized = normalizeNarrative(cleaned);
    expect(normalized).toMatch(/young Japanese woman/i);
    expect(normalized).not.toMatch(/\[(?:\/)?(?:SYS|EOD|INST|INSTR)\]/i);
    expect(normalized).not.toMatch(/Please create|Do NOT|End the description|Return only|Good:|Bad:|Note:/i);
    expect(/[.!?]$/.test(normalized)).toBe(true);
  });

  it('handles Note: meta lines and ensures final punctuation', () => {
    const raw = `Note: This is an example of a tag used to convey instructions.\n> A young Japanese woman with a curvy build reclines against weathered wooden steps, her confident gaze meeting the camera`;
    const cleaned = cleanTextResponse(raw);
    const normalized = normalizeNarrative(cleaned);
    expect(normalized).toMatch(/young Japanese woman/i);
    expect(normalized).not.toMatch(/^note\s*:/i);
    expect(/[.!?]$/.test(normalized)).toBe(true);
  });
  
  it('filters "Describe the scene for me." echoes', () => {
    const raw = `Describe the scene for me.\n> A tranquil lakeside at dusk, golden light shimmering across the water and reeds swaying in a gentle breeze.`;
    const cleaned = cleanTextResponse(raw);
    const normalized = normalizeNarrative(cleaned);
    expect(normalized.toLowerCase()).not.toContain('describe the scene');
    expect(normalized).toMatch(/lakeside|golden light|breeze/i);
    expect(/[.!?]$/.test(normalized)).toBe(true);
  });
});