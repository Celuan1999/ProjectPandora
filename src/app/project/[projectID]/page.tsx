'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Project, SecurityLevel, ProjectType, isValidProjectType } from '../../types/Project';
import { Project as ApiProject } from '../../types/api';
import { projectsApi } from '../../api/projects';
import { useUser } from '../../context/userContext';
import ProjectImage from '../../components/project/ProjectImage';
import ProjectDetails from '../../components/project/ProjectDetails';
import ProgressChart from '../../components/project/ProgressChart';
import DescriptionDropdown from '../../components/project/DescriptionDropdown';
import WorkOrderCards from '../../components/project/WorkOrderCards';

// Helper function to map API project to frontend project
const mapApiProjectToFrontend = (apiProject: ApiProject): Project => {
  // For now, we'll create a basic mapping with default values for missing fields
  // In a real app, you might want to fetch additional data or have these fields in the API
  return {
    id: apiProject.id.toString(),
    title: apiProject.name,
    description: apiProject.description || 'No description available',
    funding: apiProject.budget_amount || 0,
    companyName: 'TechCorp Industries', // This would come from org/team data
    securityLevel: apiProject.security_level || 'Unclassified', // This would come from clearance level
    projectType: isValidProjectType(apiProject.project_type || '') 
      ? (apiProject.project_type || 'Engineering') 
      : 'Engineering', // Use provided type if valid, otherwise default to Engineering
    // Note: This now supports any project type from the API, including new ones like "API2"
    imageUrl: 'https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg', // Default image
    startDate: apiProject.created_at.split('T')[0], // Use created_at as start date
    expectedDate: apiProject.deadline || '2025-12-31', // Use deadline as expected date
    actualDate: '2025-12-12', // This would come from completion data
    progressData: [
      // Mock progress data - in a real app, this would come from project tracking
      { date: apiProject.created_at.split('T')[0], progress: 0 },
      { date: '2024-01-15', progress: 25 },
      { date: '2024-06-30', progress: 50 },
      { date: '2025-01-15', progress: 75 },
      { date: '2025-12-12', progress: 90 }
    ],
    workOrders: [
      // Mock work orders - in a real app, this would come from a separate API
      {
        id: '1',
        title: 'Project Initialization',
        description: 'Initial project setup and planning phase.',
        assignee: {
          name: 'Project Manager',
          role: 'Project Lead',
          avatar: undefined
        },
        startDate: apiProject.created_at.split('T')[0],
        endDate: '2024-03-01',
        status: 'completed'
      },
      {
        id: '2',
        title: 'Development Phase',
        description: 'Core development and implementation work.',
        assignee: {
          name: 'Development Team',
          role: 'Engineers',
          avatar: undefined
        },
        startDate: '2024-03-01',
        endDate: '2024-12-31',
        status: 'in-progress'
      }
    ]
  };
};

export default function ProjectDetailPage() {
  const params = useParams();
  const { user, isAuthenticated, loading: userLoading } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (userLoading || !isAuthenticated() || !user?.access_token) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const projectId = params.projectID as string;
        
        // For now, we'll use a placeholder org ID since it's not available in the user context
        // In a real app, you'd get this from the user's organization context
        const orgId = 'default-org-id'; // This should come from user context or URL params
        
        const response = await projectsApi.getProject(
          user.access_token,
          orgId,
          projectId
        );
        const frontendProject = mapApiProjectToFrontend(response.data);
        setProject(frontendProject);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.projectID, user, isAuthenticated, userLoading]);

  const handleSecurityLevelChange = (level: SecurityLevel) => {
    if (project) {
      setProject({ ...project, securityLevel: level });
    }
  };

  const handleProjectTypeChange = (type: string) => {
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

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please log in to view project details.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Project</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
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
