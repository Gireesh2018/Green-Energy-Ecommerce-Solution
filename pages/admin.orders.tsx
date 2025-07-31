import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Eye, 
  Edit, 
  Search, 
  Filter, 
  Calendar,
  User,
  Package,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/Dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/DropdownMenu';
import { getOrdersList } from '../endpoints/orders/list_GET.schema';
import { postUpdateStatus } from '../endpoints/orders/update_status_POST.schema';
import { formatCurrency } from '../helpers/formatCurrency';
import { formatDate } from '../helpers/formatDate';
import styles from './admin.orders.module.css';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

type Order = {
  id: number;
  status: OrderStatus | null;
  total_amount: number;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string | null;
  updated_at: string | null;
  shipping_address: any;
  billing_address: any;
  notes: string | null;
  customer: {
    id: number;
    email: string;
    display_name: string;
  } | null;
  items: Array<{
    id: number;
    product_id: number | null;
    product_title: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product_brand: string | null;
    product_category: string | null;
    product_image_url: string | null;
  }>;
};

const ORDERS_QUERY_KEY = ['admin', 'orders'] as const;

export default function AdminOrdersPage() {
  console.log('AdminOrdersPage: Rendering admin orders page');

  // State for filters and pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');

  const queryClient = useQueryClient();

  // Fetch orders with filters
  const {
    data: ordersData,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: [...ORDERS_QUERY_KEY, currentPage, statusFilter, startDate, endDate],
    queryFn: () => getOrdersList({
      page: currentPage.toString(),
      limit: '20',
      ...(statusFilter !== 'all' && { status: statusFilter as OrderStatus }),
      ...(startDate && { start_date: startDate }),
      ...(endDate && { end_date: endDate }),
    }),
    staleTime: 30000, // 30 seconds
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      postUpdateStatus({ orderId, status }),
    onSuccess: () => {
      console.log('AdminOrdersPage: Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      setStatusUpdateModalOpen(false);
      setSelectedOrder(null);
    },
    onError: (error) => {
      console.error('AdminOrdersPage: Failed to update order status:', error);
    },
  });

  const handleViewDetails = (order: Order) => {
    console.log('AdminOrdersPage: Opening details for order:', order.id);
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    console.log('AdminOrdersPage: Opening status update for order:', order.id);
    setSelectedOrder(order);
    setNewStatus(order.status || 'pending');
    setStatusUpdateModalOpen(true);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder) return;
    
    console.log('AdminOrdersPage: Updating order status:', selectedOrder.id, newStatus);
    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      status: newStatus,
    });
  };

  const handlePageChange = (page: number) => {
    console.log('AdminOrdersPage: Changing to page:', page);
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (status: string) => {
    console.log('AdminOrdersPage: Changing status filter to:', status);
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (start: string, end: string) => {
    console.log('AdminOrdersPage: Changing date filter:', start, end);
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    console.log('AdminOrdersPage: Clearing all filters');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (error) {
    console.error('AdminOrdersPage: Error loading orders:', error);
    return (
      <AdminLayout>
        <div className={styles.errorContainer}>
          <h1>Error Loading Orders</h1>
          <p>Failed to load orders. Please try again.</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  return (
    <>
      <Helmet>
        <title>Orders Management - Green Energy Solutions Admin</title>
        <meta name="description" content="Manage customer orders, view order details, and update order status" />
      </Helmet>

      <AdminLayout>
        <div className={styles.pageContainer}>
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>Orders Management</h1>
              <p className={styles.pageDescription}>
                View and manage customer orders, update status, and track order details
              </p>
            </div>
          </div>

          {/* Filters Section */}
          <div className={styles.filtersSection}>
            <div className={styles.filtersRow}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Status</label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className={styles.filterSelect}>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateFilterChange(e.target.value, endDate)}
                  className={styles.dateInput}
                />
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateFilterChange(startDate, e.target.value)}
                  className={styles.dateInput}
                />
              </div>

              <Button 
                variant="outline" 
                onClick={clearFilters}
                className={styles.clearFiltersButton}
              >
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Orders Table */}
          <div className={styles.tableContainer}>
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}>
                  <Package className={styles.loadingIcon} />
                  <p>Loading orders...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}>
                <Package className={styles.emptyIcon} />
                <h3>No Orders Found</h3>
                <p>No orders match your current filters.</p>
              </div>
            ) : (
              <>
                <div className={styles.tableWrapper}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Items</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className={styles.tableRow}>
                          <td className={styles.orderIdCell}>
                            #{order.id}
                          </td>
                          <td className={styles.customerCell}>
                            {order.customer ? (
                              <div className={styles.customerInfo}>
                                <span className={styles.customerName}>
                                  {order.customer.display_name}
                                </span>
                                <span className={styles.customerEmail}>
                                  {order.customer.email}
                                </span>
                              </div>
                            ) : (
                              <span className={styles.noCustomer}>No customer</span>
                            )}
                          </td>
                          <td>
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className={styles.totalCell}>
                            {formatCurrency(order.total_amount)}
                          </td>
                          <td>
                            <Badge 
                              variant={order.payment_status === 'paid' ? 'default' : 'outline'}
                            >
                              {order.payment_status || 'Unknown'}
                            </Badge>
                          </td>
                          <td className={styles.itemsCell}>
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </td>
                          <td className={styles.dateCell}>
                            {order.created_at ? formatDate(order.created_at) : 'Unknown'}
                          </td>
                          <td>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon-sm">
                                  <MoreHorizontal />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                  <Eye className={styles.menuIcon} />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                                  <Edit className={styles.menuIcon} />
                                  Update Status
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.total_pages > 1 && (
                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Showing {((pagination.current_page - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.current_page * pagination.limit, pagination.total_count)} of{' '}
                      {pagination.total_count} orders
                    </div>
                    <div className={styles.paginationControls}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page - 1)}
                        disabled={!pagination.has_previous || isFetching}
                      >
                        <ChevronLeft />
                        Previous
                      </Button>
                      <span className={styles.pageInfo}>
                        Page {pagination.current_page} of {pagination.total_pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(pagination.current_page + 1)}
                        disabled={!pagination.has_next || isFetching}
                      >
                        Next
                        <ChevronRight />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          open={detailsModalOpen}
          onOpenChange={setDetailsModalOpen}
        />

        {/* Status Update Modal */}
        <Dialog open={statusUpdateModalOpen} onOpenChange={setStatusUpdateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change the status of order #{selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>

            <div className={styles.statusUpdateContent}>
              <div className={styles.currentStatus}>
                <label className={styles.statusLabel}>Current Status:</label>
                <OrderStatusBadge status={selectedOrder?.status ?? null} />
              </div>

              <div className={styles.newStatusSelect}>
                <label className={styles.statusLabel}>New Status:</label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setStatusUpdateModalOpen(false)}
                disabled={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                disabled={updateStatusMutation.isPending || newStatus === selectedOrder?.status}
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AdminLayout>
    </>
  );
}