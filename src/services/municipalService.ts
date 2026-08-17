import {
  MunicipalDashboardDataset,
  MunicipalIssueItem,
  MunicipalAssignedTeam,
  MunicipalDepartment,
  MunicipalClusterSummary,
} from '../types';
import { defaultMunicipalDashboardData } from '../data/municipalData';

export interface MunicipalIssueFilterParams {
  searchQuery?: string;
  department?: 'all' | MunicipalDepartment;
  status?: 'all' | string;
  priorityMin?: number;
  isOverSlaOnly?: boolean;
  isLowConfidenceOnly?: boolean;
  isReopenedOnly?: boolean;
  sortBy?: 'priority' | 'newest' | 'slaUrgency' | 'confidence' | 'affectedProps' | 'reports';
}

export interface CityAssetSearchResult {
  id: string;
  code: string;
  title: string;
  type: 'issue' | 'cluster' | 'department' | 'infrastructure' | 'sensor';
  category: string;
  location: string;
  status: string;
  meta: string;
}

class MunicipalService {
  private data: MunicipalDashboardDataset = { ...defaultMunicipalDashboardData };

  public getDashboardData(): MunicipalDashboardDataset {
    return { ...this.data };
  }

  public filterIssues(filters: MunicipalIssueFilterParams): MunicipalIssueItem[] {
    let result = [...this.data.issues];

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (issue) =>
          issue.title.toLowerCase().includes(q) ||
          issue.issueCode.toLowerCase().includes(q) ||
          issue.description.toLowerCase().includes(q) ||
          issue.location.address.toLowerCase().includes(q) ||
          issue.location.ward.toLowerCase().includes(q) ||
          issue.location.sector.toLowerCase().includes(q) ||
          issue.department.toLowerCase().includes(q)
      );
    }

    if (filters.department && filters.department !== 'all') {
      result = result.filter((issue) => issue.department === filters.department);
    }

    if (filters.status && filters.status !== 'all') {
      result = result.filter((issue) => issue.status === filters.status);
    }

    if (filters.priorityMin !== undefined && filters.priorityMin > 0) {
      result = result.filter((issue) => issue.priorityScore >= filters.priorityMin!);
    }

    if (filters.isOverSlaOnly) {
      result = result.filter((issue) => issue.isOverSla);
    }

    if (filters.isLowConfidenceOnly) {
      result = result.filter((issue) => issue.isLowConfidence);
    }

    if (filters.isReopenedOnly) {
      result = result.filter((issue) => issue.isReopened);
    }

    // Sorting
    const sort = filters.sortBy || 'priority';
    result.sort((a, b) => {
      if (sort === 'priority') {
        return b.priorityScore - a.priorityScore;
      }
      if (sort === 'slaUrgency') {
        return a.slaRemainingHours - b.slaRemainingHours;
      }
      if (sort === 'confidence') {
        return b.aiConfidence - a.aiConfidence;
      }
      if (sort === 'affectedProps') {
        return b.affectedProperties - a.affectedProperties;
      }
      if (sort === 'reports') {
        return b.reportCount - a.reportCount;
      }
      // 'newest'
      return b.id.localeCompare(a.id);
    });

    return result;
  }

  public assignTeamToIssue(
    issueId: string,
    team: {
      teamName: string;
      leadEngineer: string;
      personnelCount: number;
      contactRadio: string;
      notes?: string;
    }
  ): { success: boolean; updatedIssue?: MunicipalIssueItem } {
    const issueIndex = this.data.issues.findIndex((i) => i.id === issueId);
    if (issueIndex === -1) return { success: false };

    const assigned: MunicipalAssignedTeam = {
      teamId: `team-dispatch-${Date.now()}`,
      teamName: team.teamName,
      leadEngineer: team.leadEngineer,
      personnelCount: team.personnelCount,
      contactRadio: team.contactRadio,
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedArrival: 'Dispatched (ETA ~15m)',
      notes: team.notes || 'Dispatched via Municipal Command Center.',
    };

    const targetIssue = this.data.issues[issueIndex];
    const updatedIssue: MunicipalIssueItem = {
      ...targetIssue,
      status: 'Assigned',
      assignedTeam: assigned,
      timeline: [
        ...(targetIssue.timeline || []),
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Team Dispatched',
          note: `Assigned ${team.teamName} (${team.leadEngineer}, ${team.personnelCount} crew members).`,
          actor: 'Municipal Command Dispatcher',
        },
      ],
    };

    this.data.issues[issueIndex] = updatedIssue;

    // Update department workload
    const deptIndex = this.data.departmentWorkloads.findIndex(
      (d) => d.department === targetIssue.department
    );
    if (deptIndex !== -1) {
      this.data.departmentWorkloads[deptIndex] = {
        ...this.data.departmentWorkloads[deptIndex],
        assignedTeamsCount: this.data.departmentWorkloads[deptIndex].assignedTeamsCount + 1,
        availableTeamsCount: Math.max(0, this.data.departmentWorkloads[deptIndex].availableTeamsCount - 1),
      };
    }

    return { success: true, updatedIssue };
  }

  public searchCityAssets(query: string): CityAssetSearchResult[] {
    if (!query || !query.trim()) return [];
    const q = query.toLowerCase().trim();
    const results: CityAssetSearchResult[] = [];

    // Search issues
    this.data.issues.forEach((issue) => {
      if (
        issue.title.toLowerCase().includes(q) ||
        issue.issueCode.toLowerCase().includes(q) ||
        issue.department.toLowerCase().includes(q) ||
        issue.location.ward.toLowerCase().includes(q)
      ) {
        results.push({
          id: issue.id,
          code: issue.issueCode,
          title: issue.title,
          type: 'issue',
          category: issue.department,
          location: issue.location.ward,
          status: issue.status,
          meta: `Priority ${issue.priorityScore} · ${issue.reportCount} Reports`,
        });
      }
    });

    // Search clusters
    this.data.clusters.forEach((cluster) => {
      if (
        cluster.title.toLowerCase().includes(q) ||
        cluster.clusterCode.toLowerCase().includes(q) ||
        cluster.location.toLowerCase().includes(q)
      ) {
        results.push({
          id: cluster.id,
          code: cluster.clusterCode,
          title: cluster.title,
          type: 'cluster',
          category: cluster.category,
          location: cluster.location,
          status: cluster.status,
          meta: `${cluster.issueCount} Issues · ${cluster.relativeIntensity}% Intensity`,
        });
      }
    });

    // Search departments
    this.data.departmentWorkloads.forEach((dept) => {
      if (dept.department.toLowerCase().includes(q)) {
        results.push({
          id: dept.id,
          code: dept.department.slice(0, 3).toUpperCase(),
          title: `${dept.department} Operations`,
          type: 'department',
          category: dept.department,
          location: 'Central Municipality HQ',
          status: `${dept.utilizationPercentage}% Utilization`,
          meta: `${dept.activeCases} Active Cases · SLA Risk ${dept.slaRisk.toUpperCase()}`,
        });
      }
    });

    return results.slice(0, 8);
  }

  public calculateClusterIntensity(clusters: MunicipalClusterSummary[]): MunicipalClusterSummary[] {
    if (clusters.length === 0) return [];
    const maxCount = Math.max(...clusters.map((c) => c.issueCount), 1);
    return clusters.map((c) => ({
      ...c,
      relativeIntensity: Math.round((c.issueCount / maxCount) * 100),
    }));
  }
}

export const municipalService = new MunicipalService();
