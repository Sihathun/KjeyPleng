import { useState } from 'react';

export default function OrdersDashboardPage() {
  const username = 'Username';

  // Mock orders data
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderId: 1,
      customerName: 'Sebastian Seamen',
      product: 'Legendary Guitar',
      status: 'Completed'
    },
    {
      id: 2,
      orderId: 2,
      customerName: 'Notch Rizzler',
      product: 'Apple Violin',
      status: 'Ongoing'
    }
  ]);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus }
        : order
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">

        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="px-12 py-8">
            <h1 className="text-2xl mb-8">Order</h1>

            {/* Orders Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 bg-gray-200 px-6 py-4 border-b border-gray-300">
                <div className="col-span-3">
                  <p className="text-sm">Customer Name</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm">Order ID</p>
                </div>
                <div className="col-span-4">
                  <p className="text-sm">Product</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm">Order Status</p>
                </div>
              </div>

              {/* Table Body */}
              {orders.map((order) => (
                <div 
                  key={order.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0 items-center bg-white"
                >
                  {/* Customer Name */}
                  <div className="col-span-3">
                    <p>{order.customerName}</p>
                  </div>

                  {/* Order ID */}
                  <div className="col-span-2">
                    <div className="inline-flex items-center justify-center bg-gray-200 rounded px-3 py-1">
                      <p className="text-sm">{order.orderId}</p>
                    </div>
                  </div>

                  {/* Product */}
                  <div className="col-span-4">
                    <p>{order.product}</p>
                  </div>

                  {/* Order Status Dropdown */}
                  <div className="col-span-3">
                    <div className="relative">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className="w-full appearance-none bg-gray-200 border border-gray-300 rounded px-4 py-2 pr-8 cursor-pointer hover:bg-gray-300 transition-colors text-sm"
                      >
                        <option value="Completed">Completed</option>
                        <option value="Ongoing">Ongoing</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1L6 6L11 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
