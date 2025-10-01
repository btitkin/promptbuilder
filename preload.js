const { contextBridge, ipcRenderer } = require('electron');

console.log('🔍 DEBUG: Preload script loading...');

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Invokes the main process LLM handler.
   * @param {string} task - The name of the task (e.g., 'custom', 'variations', 'enhance', 'random').
   * @param {object} payload - The data required for the task.
   *   Required fields:
   *     - prompt: string                 // pre-formatted prompt (TheBloke USER/ASSISTANT template)
   *   Optional fields:
   *     - temperature?: number           // generation temperature (default: 0.6)
   *     - top_p?: number                // nucleus sampling (default: 0.9)
   *     - maxTokens?: number            // max tokens to generate (default: 256)
   *     - stop?: string[]               // stop sequences (default: ['USER:', 'ASSISTANT:'])
   * @returns {Promise<object|string>} A promise that resolves with { result } or a string, or { error } on failure.
   */
  invokeLLM: (task, payload) => {
    console.log('🔍 DEBUG: invokeLLM called with task:', task);
    if (payload?.prompt) {
      console.log('🔍 DEBUG: Using raw prompt with length:', String(payload.prompt).length);
    }
    return ipcRenderer.invoke('llm-request', { task, payload });
  },
  
  /**
   * Checks the status of the local GGUF model
   * @returns {Promise<object>} Model status information
   */
  checkModelStatus: () => {
    console.log('🔍 DEBUG: Checking local model status');
    return ipcRenderer.invoke('check-model-status');
  },
  /**
   * Subscribe to IPC events from the main process.
   * Returns an unsubscribe function.
   */
  on: (channel, listener) => {
    const wrapped = (_event, data) => listener(data);
    ipcRenderer.on(channel, wrapped);
    return () => ipcRenderer.removeListener(channel, wrapped);
  }
});

console.log('🔍 DEBUG: electronAPI exposed to main world');