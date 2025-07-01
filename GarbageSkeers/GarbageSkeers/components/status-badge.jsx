const StatusBadge = ({ status }) => {
    // Define color schemes for different statuses
    const statusStyles = {
      'on-duty': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        dot: 'bg-green-500',
        label: 'On Duty'
      },
      'off-duty': {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        dot: 'bg-gray-500',
        label: 'Off Duty'
      },
      'on-leave': {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        dot: 'bg-emerald-500',
        label: 'On Leave'
      },
      'suspended': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        dot: 'bg-red-500',
        label: 'Suspended'
      },
      // Default fallback
      'default': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        dot: 'bg-yellow-500',
        label: 'Unknown'
      }
    };
  
    // Get the style for the current status or use default
    const style = statusStyles[status] || statusStyles['default'];
  
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        <span className={`w-2 h-2 mr-1.5 rounded-full ${style.dot}`}></span>
        {style.label}
      </span>
    );
  };
  
  export default StatusBadge;