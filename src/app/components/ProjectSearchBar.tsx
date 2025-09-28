"use client"
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjects } from '@/app/context/projectContext';
import { useToast } from '@/app/context/toastContext';
import Button from '@/app/components/ui/button';

interface ProjectSearchBarProps {
  className?: string;
}

export default function ProjectSearchBar({ className = "" }: ProjectSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<{ id: number; name: string; description?: string | null; hasAccess: boolean }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { searchProjects, grantAccess, loading: projectsLoading } = useProjects();
  const { showToast } = useToast();

  // Debounced search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      const searchResults = searchProjects(searchTerm, 10);
      setResults(searchResults);
      setShowResults(searchResults.length > 0);
      setSelectedIndex(-1);
    }, 150); // Reduced debounce time since we're searching locally

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchProjects]);

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? results.length - 1 : prev - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleProjectClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleProjectClick = async (project: { id: number; name: string; description?: string | null; hasAccess: boolean }) => {
    if (project.hasAccess) {
      // Navigate to project page
      router.push(`/project/${project.id}`);
    } else {
      // Request access
      try {
        await grantAccess(project.id);
        showToast('Access request submitted successfully!', 'success');
        // Clear search and close dropdown
        setSearchTerm('');
        setResults([]);
        setShowResults(false);
      } catch (error) {
        console.error('Access request error:', error);
        showToast('Failed to request access. Please try again.', 'error');
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-4xl ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search for projects..."
          className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {projectsLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 left-1/2 transform -translate-x-1/2 w-full min-w-[600px] mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((project, index) => (
            <div
              key={project.id}
              className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex ? 'bg-blue-50' : ''
              } ${index === results.length - 1 ? 'border-b-0' : ''}`}
              onClick={() => handleProjectClick(project)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                  )}
                </div>
                <div className="ml-4">
                  {project.hasAccess ? (
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-2 py-1"
                      onClick={() => handleProjectClick(project)}
                    >
                      View
                    </Button>
                  ) : (
                    <Button 
                      className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-2 py-1"
                      onClick={() => handleProjectClick(project)}
                    >
                      Request Access
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && searchTerm.trim() && !projectsLoading && (
        <div className="absolute z-50 left-1/2 transform -translate-x-1/2 w-full min-w-[600px] mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="px-4 py-3 text-center text-gray-500">
            No projects found matching "{searchTerm}"
          </div>
        </div>
      )}
    </div>
  );
}
