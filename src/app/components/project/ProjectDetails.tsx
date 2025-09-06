import { Project, SecurityLevel, ProjectType } from '../../types/Project';
import Dropdown from '../ui/dropdown';
import Button from '../ui/button';

interface ProjectDetailsProps {
  project: Project;
  onSecurityLevelChange: (level: SecurityLevel) => void;
  onProjectTypeChange: (type: ProjectType) => void;
  onRequestAccess: () => void;
}

export default function ProjectDetails({
  project,
  onSecurityLevelChange,
  onProjectTypeChange,
  onRequestAccess
}: ProjectDetailsProps) {
  const securityLevelOptions = Object.values(SecurityLevel).map(level => ({
    value: level,
    label: level
  }));

  const projectTypeOptions = Object.values(ProjectType).map(type => ({
    value: type,
    label: type
  }));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Project Title */}
      <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
      
      {/* Funding Tag */}
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Funding
        </span>
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(project.funding)}
        </span>
      </div>

      {/* Company Name */}
      <div>
        <p className="text-lg text-gray-700">{project.companyName}</p>
      </div>

      {/* Security Level and Project Type Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Security Level
          </label>
          <Dropdown
            options={securityLevelOptions}
            value={project.securityLevel}
            onChange={(value) => onSecurityLevelChange(value as SecurityLevel)}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Type
          </label>
          <Dropdown
            options={projectTypeOptions}
            value={project.projectType}
            onChange={(value) => onProjectTypeChange(value as ProjectType)}
            className="w-full"
          />
        </div>
      </div>

      {/* Request Access Button */}
      <div className="pt-4">
        <Button
          onClick={onRequestAccess}
          className="w-full md:w-auto px-8 py-3 text-base"
        >
          Request Access
        </Button>
      </div>
    </div>
  );
}
