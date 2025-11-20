import { useState } from 'react';

export default function ManageProductPage() {
  const username = 'Username';

  // Mock product data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Legendary Guitar',
      description: 'Lorem ipsum.......',
      price: '$7.5',
      status: 'Listed'
    },
    {
      id: 2,
      name: 'Epic Guitar',
      description: 'Lorem ipsum.......',
      price: '$8.5',
      status: 'Expired'
    }
  ]);

  const handleEdit = (productId) => {
    console.log('Edit product:', productId);
    // Add edit functionality here
  };

  const handleStatusToggle = (productId, currentStatus) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, status: currentStatus === 'Listed' ? 'Expired' : 'Listed' }
        : product
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">

        {/* Main Content */}
        <div className="flex-1">
          {/* Page Header */}
          <div className="px-12 py-8">
            <h1 className="text-2xl mb-8">Manage Products</h1>

            {/* Products Table */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 bg-gray-100 px-6 py-4 border-b border-gray-300">
                <div className="col-span-3">
                  <p className="text-sm">Product Name</p>
                </div>
                <div className="col-span-4">
                  <p className="text-sm">Description</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm">Price</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm">Actions</p>
                </div>
              </div>

              {/* Table Body */}
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 last:border-b-0 items-center"
                >
                  {/* Product Name */}
                  <div className="col-span-3">
                    <p>{product.name}</p>
                  </div>

                  {/* Description */}
                  <div className="col-span-4">
                    <p className="text-gray-600">{product.description}</p>
                  </div>

                  {/* Price */}
                  <div className="col-span-2">
                    <p>{product.price}</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(product.id)}
                      className="px-4 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                    >
                      Edit
                    </button>

                    {/* Status Button */}
                    <button
                      onClick={() => handleStatusToggle(product.id, product.status)}
                      className={`px-4 py-1.5 rounded-md transition-colors text-sm ${
                        product.status === 'Listed'
                          ? 'bg-cyan-400 text-white hover:bg-cyan-500'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {product.status === 'Listed' ? 'Listed' : 'Renew'}
                    </button>
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
