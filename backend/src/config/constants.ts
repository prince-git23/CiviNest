export const ROLES = {
  CITIZEN: 'CITIZEN',
  MUNICIPAL_OFFICER: 'MUNICIPAL_OFFICER',
  COMMUNITY_REPRESENTATIVE: 'COMMUNITY_REPRESENTATIVE',
  ADMIN: 'ADMIN',
} as const;

export type UserRole = keyof typeof ROLES;

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  CITIZEN: ['report:create', 'report:read', 'report:update', 'map:read', 'community:read'],
  MUNICIPAL_OFFICER: [
    'report:read', 'report:update', 'report:assign',
    'department:read', 'department:update',
    'spatial:read', 'analytics:read',
    'community:read',
  ],
  COMMUNITY_REPRESENTATIVE: [
    'report:read', 'report:create', 'report:update',
    'community:read', 'community:update',
    'aggregation:read', 'analytics:read',
  ],
  ADMIN: [
    'report:read', 'report:update', 'report:delete',
    'department:read', 'department:update', 'department:delete',
    'user:read', 'user:update', 'user:delete',
    'spatial:read', 'analytics:read',
    'community:read', 'community:update',
    'system:read', 'system:update',
  ],
};

export const PASSWORD_MIN_LENGTH = 8;
export const NAME_MIN_LENGTH = 2;
