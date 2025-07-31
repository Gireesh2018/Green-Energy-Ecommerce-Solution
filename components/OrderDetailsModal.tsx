import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import { OrderStatusBadge } from './OrderStatusBadge';
import { Badge } from './Badge';
import { formatCurrency } from '../helpers/formatCurrency';
import { formatDate } from '../helpers/formatDate';
import styles from './OrderDetailsModal.module.css';

type OrderItem = {
  id: number;
  product_id: number | null;
  product_title: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_brand: string | null;
  product_category: string | null;
  product_image_url: string | null;
};

type Customer = {
  id: number;
  email: string;
  display_name: string;
};

type Order = {
  id: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | null;
  total_amount: number;
  payment_status: string | null;
  payment_method: string | null;
  created_at: string | null;
  updated_at: string | null;
  shipping_address: any;
  billing_address: any;
  notes: string | null;
  customer: Customer | null;
  items: OrderItem[];
};

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  open,
  onOpenChange,
}) => {
  console.log('OrderDetailsModal: Rendering modal for order:', order?.id);

  if (!order) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.modalContent}>
        <DialogHeader>
          <DialogTitle>Order Details - #{order.id}</DialogTitle>
          <DialogDescription>
            Complete information about this order
          </DialogDescription>
        </DialogHeader>

        <div className={styles.orderInfo}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Status</label>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Total Amount</label>
              <span className={styles.totalAmount}>
                {formatCurrency(order.total_amount)}
              </span>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Payment Status</label>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'outline'}>
                {order.payment_status || 'Unknown'}
              </Badge>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Payment Method</label>
              <span>{order.payment_method || 'Not specified'}</span>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Created</label>
              <span>{order.created_at ? formatDate(order.created_at) : 'Unknown'}</span>
            </div>

            <div className={styles.infoItem}>
              <label className={styles.infoLabel}>Last Updated</label>
              <span>{order.updated_at ? formatDate(order.updated_at) : 'Unknown'}</span>
            </div>
          </div>

          {order.customer && (
            <div className={styles.customerInfo}>
              <h3 className={styles.sectionTitle}>Customer Information</h3>
              <div className={styles.customerDetails}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Name</label>
                  <span>{order.customer.display_name}</span>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Email</label>
                  <span>{order.customer.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.orderItems}>
            <h3 className={styles.sectionTitle}>Order Items</h3>
            <div className={styles.itemsList}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.orderItem}>
                  <div className={styles.itemImage}>
                    {item.product_image_url ? (
                      <img 
                        src={item.product_image_url} 
                        alt={item.product_title}
                        className={styles.productImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        No Image
                      </div>
                    )}
                  </div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemTitle}>{item.product_title}</h4>
                    {item.product_brand && (
                      <p className={styles.itemBrand}>Brand: {item.product_brand}</p>
                    )}
                    {item.product_category && (
                      <p className={styles.itemCategory}>Category: {item.product_category}</p>
                    )}
                    <div className={styles.itemPricing}>
                      <span className={styles.quantity}>Qty: {item.quantity}</span>
                      <span className={styles.unitPrice}>
                        {formatCurrency(item.unit_price)} each
                      </span>
                      <span className={styles.totalPrice}>
                        Total: {formatCurrency(item.total_price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.notes && (
            <div className={styles.orderNotes}>
              <h3 className={styles.sectionTitle}>Notes</h3>
              <p className={styles.notesText}>{order.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};