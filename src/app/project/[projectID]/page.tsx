'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Project, SecurityLevel, ProjectType } from '../../types/Project';
import ProjectImage from '../../components/project/ProjectImage';
import ProjectDetails from '../../components/project/ProjectDetails';
import ProgressChart from '../../components/project/ProgressChart';
import DescriptionDropdown from '../../components/project/DescriptionDropdown';
import WorkOrderCards from '../../components/project/WorkOrderCards';

// Mock data - replace with actual API call
const mockProject: Project = {
  id: '1',
  title: 'Advanced Bi-Pedal Drone',
  description: 'Entailed are the various methods in which we have constructed this device for use with the corporation.',
  funding: 500000,
  companyName: 'TechCorp Industries',
  securityLevel: SecurityLevel.SECRET,
  projectType: ProjectType.ENGINEERING,
  imageUrl: 'https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg',
  startDate: '2021-03-02',
  expectedDate: '2023-08-07',
  actualDate: '2025-12-12',
  progressData: [
    { date: '2021-03-02', progress: 0 },
    { date: '2021-06-15', progress: 15 },
    { date: '2021-09-30', progress: 25 },
    { date: '2022-01-15', progress: 40 },
    { date: '2022-05-20', progress: 35 },
    { date: '2022-08-10', progress: 50 },
    { date: '2023-02-15', progress: 65 },
    { date: '2023-06-30', progress: 70 },
    { date: '2024-01-15', progress: 80 },
    { date: '2024-06-30', progress: 85 },
    { date: '2025-01-15', progress: 90 },
    { date: '2025-12-12', progress: 95 }
  ],
  workOrders: [
    {
      id: '1',
      title: 'Adjustment to Frame',
      description: 'Frame is to small to account for internal components, extension is needed for the prototype.',
      assignee: {
        name: 'Joe Daryl',
        role: 'Head Engineer',
        avatar: undefined
      },
      startDate: '2022-05-23',
      endDate: '2022-07-15',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Updated Control System',
      description: 'Unexpected control glitch led to safety concerns into integrating AI, overhaul is needed for release.',
      assignee: {
        name: 'Wei Fong',
        role: 'Lead AI Manager',
        avatar: undefined
      },
      startDate: '2023-08-07',
      endDate: '2024-02-15',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Aerodynamic Refinement',
      description: 'Recent test results deemed insufficient for final release, requires refinement to reduce air drag.',
      assignee: {
        name: 'Mike Hunt',
        role: 'Overseer',
        avatar: undefined
      },
      startDate: '2025-05-08',
      endDate: '2025-12-31',
      status: 'in-progress'
    }
  ]
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchProject = async () => {
      setLoading(true);
      // In a real app, you would fetch from your API using the projectID
      // const response = await fetch(`/api/projects/${params.projectID}`);
      // const data = await response.json();
      
      // For now, use mock data
      setTimeout(() => {
        setProject(mockProject);
        setLoading(false);
      }, 500);
    };

    fetchProject();
  }, [params.projectID]);

  const handleSecurityLevelChange = (level: SecurityLevel) => {
    if (project) {
      setProject({ ...project, securityLevel: level });
    }
  };

  const handleProjectTypeChange = (type: ProjectType) => {
    if (project) {
      setProject({ ...project, projectType: type });
    }
  };

  const handleRequestAccess = () => {
    // Implement request access logic
    alert('Access request submitted!');
  };

  const handleFavoriteToggle = () => {
    // Implement favorite toggle logic
    console.log('Favorite toggled');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Project Image and Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Image */}
            <ProjectImage
              imageUrl={project.imageUrl}
              title={project.title}
              onFavoriteToggle={handleFavoriteToggle}
            />

            {/* Project Details */}
            <ProjectDetails
              project={project}
              onSecurityLevelChange={handleSecurityLevelChange}
              onProjectTypeChange={handleProjectTypeChange}
              onRequestAccess={handleRequestAccess}
            />

            {/* Description Dropdown */}
            <DescriptionDropdown
              title="Documentation Description"
              description={project.description}
            />
          </div>

          {/* Right Column - Progress Chart */}
          <div className="lg:col-span-1">
            <ProgressChart
              startDate={project.startDate}
              expectedDate={project.expectedDate}
              actualDate={project.actualDate}
              progressData={project.progressData}
            />
          </div>
        </div>

        {/* Work Order Progress Section */}
        <div className="mt-12">
          <WorkOrderCards workOrders={project.workOrders} />
        </div>
      </div>
    </div>
  );
}
