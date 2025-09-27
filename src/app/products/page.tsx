'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "../components/navbar";
import CreateProjectModal from "../components/CreateProjectModal";
import { projectsApi } from '../api/projects';
import { CreateProjectRequest } from '../types/api';
import { useProjects } from '../hooks/useProjects';

export default function ProductsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { projects, loading, error, refetch } = useProjects();
  const router = useRouter();

  const handleCreateProject = async (projectData: CreateProjectRequest) => {
    try {
      // For now, we'll use mock auth data - in a real app, this would come from context
      const mockAuthToken = 'mock-token';
      const mockOrgId = 'mock-org-id';
      
      const response = await projectsApi.createProject(mockAuthToken, mockOrgId, projectData);
      console.log('Project created:', response);
      
      // Refresh projects list using the refetch function from useProjects hook
      await refetch();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleProjectClick = (projectId: number) => {
    router.push(`/project/${projectId}`);
  };


  return (
    <div>
      <div className="container mx-auto px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[var(--custom-black)]">
            Projects
          </h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Create New Project
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Manage your projects and track their progress. Create new projects to get started.
          </p>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Projects</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading projects...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first project.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Your First Project
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors">{project.name}</h3>
                        {project.description && (
                          <p className="text-gray-600 mt-1">{project.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          {project.project_type && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {project.project_type}
                            </span>
                          )}
                          {project.security_level && (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                              {project.security_level}
                            </span>
                          )}
                          {project.budget_amount && (
                            <span>
                              {project.budget_currency} {project.budget_amount.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500 flex items-center gap-2">
                        <div>
                          <p>Created: {new Date(project.created_at).toLocaleDateString()}</p>
                          {project.deadline && (
                            <p>Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
                          )}
                        </div>
                        <svg 
                          className="w-5 h-5 text-gray-400 hover:text-blue-500 transition-colors" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
} 