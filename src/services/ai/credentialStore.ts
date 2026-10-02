// Secure Credential Storage Layer
// Ensures API keys are never leaked to logs, project JSON, React state dumps, or plain storage.

class CredentialStore {
  // In-memory isolated secret vault for the active session
  private memoryVault: Map<string, string> = new Map();

  async setCredential(providerId: string, apiKey: string): Promise<void> {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      this.memoryVault.delete(providerId);
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Dispatch to Electron secure safeStorage IPC
        try {
          await (window.electronAPI as unknown as { credentials?: { set: (id: string, key: string) => Promise<void> } })
            .credentials?.set(providerId, '');
        } catch {
          // ignore
        }
      }
      return;
    }

    this.memoryVault.set(providerId, trimmed);

    // If running in Electron, persist to OS keychain/safeStorage via IPC
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await (window.electronAPI as unknown as { credentials?: { set: (id: string, key: string) => Promise<void> } })
          .credentials?.set(providerId, trimmed);
      } catch {
        // fallback to memory vault
      }
    }
  }

  async getCredential(providerId: string): Promise<string | null> {
    // Check in-memory session vault
    if (this.memoryVault.has(providerId)) {
      return this.memoryVault.get(providerId)!;
    }

    // In Electron, request decrypt from safeStorage
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const val = await (window.electronAPI as unknown as { credentials?: { get: (id: string) => Promise<string | null> } })
          .credentials?.get(providerId);
        if (val) {
          this.memoryVault.set(providerId, val);
          return val;
        }
      } catch {
        // fallback
      }
    }

    // Fallback: check environment variable for development if available
    if (providerId === 'google' && typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) {
      return process.env.GEMINI_API_KEY;
    }

    return null;
  }

  async hasCredential(providerId: string): Promise<boolean> {
    const key = await this.getCredential(providerId);
    return Boolean(key && key.length > 0);
  }

  async getMaskedCredential(providerId: string): Promise<string> {
    const key = await this.getCredential(providerId);
    if (!key || key.length === 0) return '';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 3)}••••••••${key.slice(-4)}`;
  }

  async deleteCredential(providerId: string): Promise<void> {
    this.memoryVault.delete(providerId);
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await (window.electronAPI as unknown as { credentials?: { delete: (id: string) => Promise<void> } })
          .credentials?.delete(providerId);
      } catch {
        // ignore
      }
    }
  }
}

export const credentialStore = new CredentialStore();
