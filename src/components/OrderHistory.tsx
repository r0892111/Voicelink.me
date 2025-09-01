import React from 'react';
import { Package, Calendar, CreditCard } from 'lucide-react';
import { StripeOrder } from '../types/stripe';
import { formatPrice, formatDate } from '../lib/stripe';

interface OrderHistoryProps {
  orders: StripeOrder[];
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-600">
            Your order history will appear here once you make your first purchase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order History</h3>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.order_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900">Order #{order.order_id}</span>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {formatDate(new Date(order.order_date).getTime() / 1000)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {formatPrice(order.amount_total, order.currency)}
                </span>
              </div>
              
              <div className="text-gray-600">
                Payment: {order.payment_status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};