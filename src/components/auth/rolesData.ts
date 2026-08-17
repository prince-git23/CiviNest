import { UserRoleConfig } from '../../types';

export const USER_ROLES: UserRoleConfig[] = [
  {
    id: 'resident',
    label: 'CITIZEN ACCESS',
    title: 'Resident',
    description: 'Report issues, support concerns, track resolutions.',
    perspectiveBadge: 'Resident Signal Focus',
    perspectiveHeadline: 'Your individual voice enters the system.',
    defaultEmail: 'resident.ward4@civinest.org',
    accessScope: 'Report submission, local neighborhood updates & resolution tracking',
    cameraPosition: [-7, 6.5, 9.5],
    cameraTarget: [-4.5, 1.2, 3.5],
  },
  {
    id: 'community_rep',
    label: 'COMMUNITY ACCESS',
    title: 'Community Representative',
    description: 'Coordinate concerns, understand local patterns.',
    perspectiveBadge: 'Cluster Synthesis Focus',
    perspectiveHeadline: 'Community-level patterns become visible.',
    defaultEmail: 'rep.district7@civinest.org',
    accessScope: 'Neighborhood cluster oversight & cross-corroboration review',
    cameraPosition: [-4, 11, 8],
    cameraTarget: [-1.5, 1.8, 0.5],
  },
  {
    id: 'municipal_officer',
    label: 'MUNICIPAL ACCESS',
    title: 'Municipal Officer',
    description: 'Review intelligence, prioritize issues, assign departments.',
    perspectiveBadge: 'Municipal Hub Focus',
    perspectiveHeadline: 'Actionable intelligence reaches government.',
    defaultEmail: 'officer.dispatch@civinest.gov',
    accessScope: 'Department work-order routing, SLA dispatching & resolution auditing',
    cameraPosition: [5.5, 7.5, 6],
    cameraTarget: [0, 2.0, 0],
  },
  {
    id: 'admin',
    label: 'SYSTEM ACCESS',
    title: 'Administrator',
    description: 'Manage users, workflows, and system configuration.',
    perspectiveBadge: 'System Overview Grid',
    perspectiveHeadline: 'System-wide civic infrastructure.',
    defaultEmail: 'sysadmin@civinest.org',
    accessScope: 'Full telemetry, AI pipeline parameters & cryptographically auditable trails',
    cameraPosition: [16, 18, 18],
    cameraTarget: [0, 1.2, 0],
  },
];

export const NEUTRAL_CAMERA: { position: [number, number, number]; target: [number, number, number] } = {
  position: [14, 16, 16],
  target: [0, 1.5, 0],
};
