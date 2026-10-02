export type LicenseTier = 'Free' | 'Pro' | 'Business';

export interface LicenseStatus {
  tier: LicenseTier;
  isActive: boolean;
  licenseKey?: string;
  expiresAt?: number;
  features: {
    maxDailyRenders: number;
    maxResolution: '720p' | '1080p' | '4k';
    customWatermark: boolean;
    batchPublishing: boolean;
    voiceCloning: boolean;
  };
}

export class LicenseService {
  private currentStatus: LicenseStatus = {
    tier: 'Pro',
    isActive: true,
    features: {
      maxDailyRenders: 50,
      maxResolution: '4k',
      customWatermark: true,
      batchPublishing: true,
      voiceCloning: true,
    },
  };

  getStatus(): LicenseStatus {
    return this.currentStatus;
  }

  async activateKey(key: string): Promise<{ success: boolean; tier: LicenseTier; error?: string }> {
    if (!key.trim()) return { success: false, tier: 'Free', error: 'Key cannot be blank' };
    this.currentStatus.licenseKey = key;
    this.currentStatus.isActive = true;
    return { success: true, tier: 'Pro' };
  }
}

export const licenseService = new LicenseService();
