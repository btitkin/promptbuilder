// This file acts as a bridge between the React application and the Electron main process.

// Payload for the main process - simplified and focused
export interface InvokeLLMPayload {
  // Raw combined prompt (TheBloke "USER: ... ASSISTANT:" template)
  prompt: string;

  // Optional generation options
  temperature?: number;
  top_p?: number;
  maxTokens?: number;
  stop?: string[];     // optional stop sequences
}

// Define the shape of the API exposed by preload.js
interface ElectronApi {
  invokeLLM: (task: string, payload: InvokeLLMPayload) => Promise<{ result?: string; error?: string } | string>;
}

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}

// Small helper to detect if Electron preload exposed the API (i.e., running inside Electron)
export function isElectronAvailable(): boolean {
  try {
    const available = typeof window !== 'undefined' && typeof (window as any).electronAPI !== 'undefined';
    // Debug log for portable build
    // eslint-disable-next-line no-console
    console.log('[electronService] isElectronAvailable=', available);
    return available;
  } catch {
    return false;
  }
}

/**
 * Sends a request to the local LLM in the main process.
 * Accepts extended payload (prompt, temperature, stop, etc.) but remains backward-compatible.
 * If running outside Electron, throws an error.
 *
 * @param task - The type of task to perform (e.g., 'custom', 'variations', 'enhance').
 * @param payload - Data for the task. Can include raw `prompt` using TheBloke template, or legacy systemInstruction/userInput.
 * @returns The string result from the LLM.
 * @throws An error if the main process returns an error or if Electron is unavailable.
 */
export async function invokeLLM(task: string, payload: InvokeLLMPayload): Promise<string> {
  if (!isElectronAvailable() || !window.electronAPI?.invokeLLM) {
    throw new Error('Electron API is not available. This app must be run within Electron.');
  }

  // Validate that we have a prompt
  if (!payload.prompt || typeof payload.prompt !== 'string') {
    throw new Error('Prompt is required and must be a string');
  }

  // eslint-disable-next-line no-console
  console.log('[electronService] invokeLLM task=', task, 'payload.stop=', payload.stop);

  const response = await window.electronAPI.invokeLLM(task, payload);

  // Some preload/main implementations may return a plain string instead of an object
  if (typeof response === 'string') {
    return response;
  }

  if (response?.error) {
    throw new Error(response.error);
  }

  if (typeof response?.result === 'string') {
    return response.result;
  }

  throw new Error('Received an invalid response from the local AI process.');
}