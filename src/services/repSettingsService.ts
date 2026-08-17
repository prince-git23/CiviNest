/**
 * Community Representative Settings Service
 *
 * Local persistence layer for representative preferences. Uses localStorage so
 * toggles/choices survive reloads. This is the single boundary to replace when a
 * backend settings API is ready — swap `loadSettings` / `saveSettings` internals.
 */

export interface RepNotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export type VisibilityValue = 'public' | 'community' | 'private';

export interface RepPrivacySetting {
  id: string;
  label: string;
  description: string;
  value: VisibilityValue;
}

export interface RepSettings {
  notifications: RepNotificationPreference[];
  privacy: RepPrivacySetting[];
  preferences: {
    defaultLocality: string;
    defaultAnalyticsRange: '30D' | '90D' | 'YTD';
    mapStyle: 'standard' | 'satellite';
  };
}

const STORAGE_KEY = 'civinet_rep_settings';

export const defaultRepSettings: RepSettings = {
  notifications: [
    {
      id: 'issue_updates',
      label: 'Issue Updates',
      description: 'Alerts when community issues change status or priority',
      enabled: true,
    },
    {
      id: 'municipal_responses',
      label: 'Municipal Responses',
      description: 'Notifications when municipal departments respond to community cases',
      enabled: true,
    },
    {
      id: 'community_activity',
      label: 'Community Activity',
      description: 'New confirmations and contributions from residents',
      enabled: true,
    },
    {
      id: 'resolution_updates',
      label: 'Resolution Updates',
      description: 'Updates when issues are resolved, reopened, or verified',
      enabled: false,
    },
  ],
  privacy: [
    {
      id: 'location_sharing',
      label: 'Location Sharing',
      description: 'Share representative ward/locality context on community reports',
      value: 'community',
    },
    {
      id: 'profile_visibility',
      label: 'Profile Visibility',
      description: 'Who can see your representative profile in the community',
      value: 'community',
    },
    {
      id: 'community_data_visibility',
      label: 'Community Data Visibility',
      description: 'Expose aggregated community data to municipal departments',
      value: 'public',
    },
  ],
  preferences: {
    defaultLocality: 'Ward 12, Nagpur',
    defaultAnalyticsRange: '30D',
    mapStyle: 'standard',
  },
};

export function loadSettings(): RepSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultRepSettings);
    const parsed = JSON.parse(raw) as RepSettings;
    if (!parsed || typeof parsed !== 'object') return structuredClone(defaultRepSettings);
    return {
      notifications: parsed.notifications ?? defaultRepSettings.notifications,
      privacy: parsed.privacy ?? defaultRepSettings.privacy,
      preferences: {
        ...defaultRepSettings.preferences,
        ...(parsed.preferences ?? {}),
      },
    };
  } catch {
    return structuredClone(defaultRepSettings);
  }
}

export function saveSettings(settings: RepSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable — settings remain in memory for the session.
  }
}

export const localityOptions = [
  'Ward 12, Nagpur',
  'Ward 14, Nagpur',
  'Dharampeth, Nagpur',
  'Green Valley Residency',
];
