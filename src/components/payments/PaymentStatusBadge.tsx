import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    
    switch (normalizedStatus) {
      case 'completed':
      case 'success':
      case 'paid':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 hover:bg-green-100',
          icon: CheckCircle,
          label: 'Completed'
        };
      case 'pending':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
          icon: Clock,
          label: 'Pending'
        };
      case 'failed':
      case 'error':
        return {
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 hover:bg-red-100',
          icon: XCircle,
          label: 'Failed'
        };
      case 'refunded':
        return {
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
          icon: RefreshCw,
          label: 'Refunded'
        };
      default:
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
          icon: Clock,
          label: status.charAt(0).toUpperCase() + status.slice(1)
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${textSize} flex items-center gap-1`}
    >
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
};

export default PaymentStatusBadge; 