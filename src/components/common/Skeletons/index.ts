import AccessorySkeleton from '../../Accessories/AccessorySkeleton';
import BookingSkeleton from '../../Bookings/BookingSkeleton';
import BudgetSkeleton from '../../Budgets/BudgetSkeleton';
import ClientSkeleton from '../../Clients/ClientSkeleton';
import DashboardSkeleton from '../../Dashboard/DashboardSkeleton';
import NotificationSkeleton from '../../Notifications/NotificationSkeleton';
import ReviewSkeleton from '../../Reviews/ReviewSkeleton';
import SkeletonLoader from '../SkeletonLoader';
import withSkeletonLoading from '../withSkeletonLoading';

export {
  AccessorySkeleton,
  BookingSkeleton,
  BudgetSkeleton,
  ClientSkeleton,
  DashboardSkeleton,
  NotificationSkeleton,
  ReviewSkeleton,
  SkeletonLoader,
  withSkeletonLoading,
};

// Tipos de skeleton disponíveis
export type SkeletonType = 
  | 'cards' 
  | 'list' 
  | 'details' 
  | 'form' 
  | 'table' 
  | 'accessory' 
  | 'review' 
  | 'notification' 
  | 'booking' 
  | 'client' 
  | 'budget'; 