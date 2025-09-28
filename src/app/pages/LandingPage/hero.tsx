"use client"
import { useUser } from "@/app/context/userContext";
import { useProjects } from "@/app/context/projectContext";
import ProjectSearchBar from "@/app/components/ProjectSearchBar";

export default function Hero() {
    const { user, isAuthenticated } = useUser();
    const { loading: projectsLoading } = useProjects();

    return (
        <div className="flex flex-col items-center py-32 bg-gray-100">
            <h1 className="text-6xl text-center font-bold pb-2">Project Pandora</h1>
            <h2 className="text-2xl text-gray-500 pb-8">Secured Designs</h2>
            
            {isAuthenticated() ? (
                <div className="text-center">
                    {projectsLoading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-600">Loading projects...</span>
                        </div>
                    ) : (
                        <ProjectSearchBar className="mb-4" />
                    )}
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Please log in to search for projects</p>
                    <a 
                        href="/login" 
                        className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Login
                    </a>
                </div>
            )}
        </div>
    )
}