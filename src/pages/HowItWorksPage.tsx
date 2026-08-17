import React from 'react';
import WorkflowHero from '../components/workflow/WorkflowHero';
import WorkflowTimeline from '../components/workflow/WorkflowTimeline';
import WorkflowCTA from '../components/workflow/WorkflowCTA';

interface HowItWorksPageProps {
  onOpenReportModal: () => void;
  onNavigateToPlatform: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  onOpenReportModal,
  onNavigateToPlatform,
}) => {
  const handleScrollToWorkflow = () => {
    const el = document.getElementById('workflow-timeline');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA]">
      {/* 1. Workflow Hero with 3D Civic Mesh */}
      <WorkflowHero
        onExplorePlatform={onNavigateToPlatform}
        onScrollToWorkflow={handleScrollToWorkflow}
      />

      {/* 2. Timeline with Stages 01 to 08 */}
      <WorkflowTimeline />

      {/* 3. Bottom Workflow CTA */}
      <WorkflowCTA
        onOpenReportModal={onOpenReportModal}
        onExplorePlatform={onNavigateToPlatform}
      />
    </main>
  );
};

export default HowItWorksPage;
