'use client'

import BriefcaseCard from "./briefcaseCard";
import { useProjects } from "../context/projectContext";

export default function BriefcasesPreview() {
    const { accessibleProjects, loading, error } = useProjects();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-16">
                <h1 className="text-4xl font-bold mb-2">Briefcases Preview</h1>
                <h2 className="text-2xl text-gray-500 mb-8">Explore Projects</h2>
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <span className="ml-2 text-gray-600">Loading projects...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-16">
                <h1 className="text-4xl font-bold mb-2">Briefcases Preview</h1>
                <h2 className="text-2xl text-gray-500 mb-8">Explore Projects</h2>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Error loading projects:</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (accessibleProjects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-16">
                <h1 className="text-4xl font-bold mb-2">Briefcases Preview</h1>
                <h2 className="text-2xl text-gray-500 mb-8">Explore Projects</h2>
                <div className="text-gray-500 text-lg">
                    No projects found. Create your first project to get started!
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-left justify-center py-16 px-16">
            <h1 className="text-4xl font-bold mb-2">Briefcases Preview</h1>
            <h2 className="text-2xl text-gray-500 mb-8">Explore Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accessibleProjects.map((project) => (
                    <BriefcaseCard 
                        key={project.id}
                        title={project.name} 
                        description={`Project created on ${new Date(project.created_at).toLocaleDateString()}`}
                        image={project.image_url || "https://t4.ftcdn.net/jpg/03/32/59/65/360_F_332596535_lAdLhf6KzbW6PWXBWeIFTovTii1drkbT.jpg"}
                        projectId={project.id.toString()}
                    />
                ))}
            </div>
        </div>
    )
}