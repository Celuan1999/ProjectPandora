import { useState } from 'react';

interface DescriptionDropdownProps {
  title: string;
  description: string;
  className?: string;
}

export default function DescriptionDropdown({
  title,
  description,
  className = ""
}: DescriptionDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-gray-100">
          <p className="pt-3 text-gray-700 leading-relaxed">
            {description}
          </p>
        </div>
      )}
    </div>
  );
}
