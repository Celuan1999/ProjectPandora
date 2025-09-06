import { WorkOrder } from '../../types/Project';

interface WorkOrderCardsProps {
  workOrders: WorkOrder[];
}

export default function WorkOrderCards({ workOrders }: WorkOrderCardsProps) {
  const getStatusColor = (status: WorkOrder['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Work Order Progress</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workOrders.map((workOrder) => (
          <div
            key={workOrder.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
          >
            {/* Work Order Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {workOrder.title}
            </h3>
            
            {/* Description */}
            <p className="text-gray-600 mb-4 leading-relaxed">
              {workOrder.description}
            </p>
            
            {/* Assignee */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {workOrder.assignee.avatar ? (
                  <img
                    src={workOrder.assignee.avatar}
                    alt={workOrder.assignee.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    {workOrder.assignee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {workOrder.assignee.name}
                </p>
                <p className="text-xs text-gray-500">
                  {workOrder.assignee.role}
                </p>
              </div>
            </div>
            
            {/* Dates and Status */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {formatDate(workOrder.startDate)} - {formatDate(workOrder.endDate)}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
                  {workOrder.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
