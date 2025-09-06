import { ProgressDataPoint } from '../../types/Project';

interface ProgressChartProps {
  startDate: string;
  expectedDate: string;
  actualDate: string;
  progressData: ProgressDataPoint[];
}

export default function ProgressChart({
  startDate,
  expectedDate,
  actualDate,
  progressData
}: ProgressChartProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  // Calculate the maximum progress value for scaling
  const maxProgress = Math.max(...progressData.map(point => point.progress), 100);
  
  // Generate SVG path for the line chart
  const generatePath = () => {
    if (progressData.length === 0) return '';
    
    const width = 200;
    const height = 100;
    const padding = 10;
    
    const points = progressData.map((point, index) => {
      const x = padding + (index / (progressData.length - 1)) * (width - 2 * padding);
      const y = height - padding - (point.progress / maxProgress) * (height - 2 * padding);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Percent Complete</h3>
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </div>
      
      {/* Dates */}
      <div className="mb-4 space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Start {formatDate(startDate)}</span>
          <span>Expected {formatDate(expectedDate)}</span>
          <span>Actual {formatDate(actualDate)}</span>
        </div>
      </div>
      
      {/* Chart */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="relative">
          <svg width="200" height="100" className="w-full h-24">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Progress line */}
            <path
              d={generatePath()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {progressData.map((point, index) => {
              const x = 10 + (index / (progressData.length - 1)) * 180;
              const y = 90 - (point.progress / maxProgress) * 80;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="#3b82f6"
                />
              );
            })}
          </svg>
          
          {/* Chart labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Progress ^</span>
            <span>Time →</span>
          </div>
        </div>
      </div>
    </div>
  );
}
