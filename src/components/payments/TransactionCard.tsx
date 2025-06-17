import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CreditCard, Download, Receipt, User, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { PaymentTransaction } from '@/hooks/usePayments';
import PaymentStatusBadge from './PaymentStatusBadge';

interface TransactionCardProps {
  transaction: PaymentTransaction;
  userRole: 'pet_owner' | 'vet' | 'admin';
  onViewDetails?: (transaction: PaymentTransaction) => void;
  onDownloadReceipt?: (transaction: PaymentTransaction) => void;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  userRole,
  onViewDetails,
  onDownloadReceipt,
}) => {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown Date';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return '';
    }
  };

  const getConsultationType = (type: string) => {
    switch (type) {
      case 'video_call':
      case 'video':
        return 'Video Consultation';
      case 'in_person':
        return 'In-Person Visit';
      case 'chat':
        return 'Chat Consultation';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(transaction.created_at)}
              {transaction.created_at && (
                <span className="text-xs">at {formatTime(transaction.created_at)}</span>
              )}
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(transaction.amount)}
            </div>
          </div>
          <PaymentStatusBadge status={transaction.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Booking Information */}
        {transaction.booking && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-medium">
                {getConsultationType(transaction.booking.consultation_type)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Appointment:</span>
              <span className="font-medium">
                {formatDate(transaction.booking.booking_date)} at {transaction.booking.start_time}
              </span>
            </div>
          </div>
        )}

        {/* Pet Information (for vet and admin views) */}
        {transaction.pet && userRole !== 'pet_owner' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Pet:
            </span>
            <span className="font-medium">
              {transaction.pet.name} ({transaction.pet.type})
            </span>
          </div>
        )}

        {/* Vet Information (for pet owner view) */}
        {transaction.vet && userRole === 'pet_owner' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" />
              Veterinarian:
            </span>
            <span className="font-medium">
              Dr. {transaction.vet.first_name} {transaction.vet.last_name}
            </span>
          </div>
        )}

        {/* Pet Owner Information (for vet view) */}
        {transaction.owner && userRole === 'vet' && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <User className="h-4 w-4" />
              Pet Owner:
            </span>
            <span className="font-medium">
              {transaction.owner.full_name || 'Unknown'}
            </span>
          </div>
        )}

        {/* Payment Method */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            Payment Method:
          </span>
          <span className="font-medium capitalize">
            {transaction.payment_method || 'Card'}
          </span>
        </div>

        {/* Transaction ID */}
        {transaction.provider_payment_id && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID:</span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {transaction.provider_payment_id}
            </span>
          </div>
        )}

        {/* Provider */}
        {transaction.provider && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Provider:</span>
            <Badge variant="outline" className="text-xs">
              {transaction.provider.toUpperCase()}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-4">
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={() => onViewDetails(transaction)}>
            <Receipt className="mr-2 h-4 w-4" />
            View Details
          </Button>
        )}
        
        {onDownloadReceipt && (transaction.status === 'completed' || transaction.status === 'success') && (
          <Button variant="outline" size="sm" onClick={() => onDownloadReceipt(transaction)}>
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        )}

        {userRole === 'admin' && (
          <div className="flex-1" />
        )}
      </CardFooter>
    </Card>
  );
};

export default TransactionCard; 