import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios if using it
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, RefreshCw, Plus, CircleDollarSign, ShoppingBag, Star, ExternalLink, Loader2 } from 'lucide-react';
import dotenv from 'dotenv';
dotenv
const PriceTracker = () => {

  const [products, setProducts] = useState([]);
  const [url, setUrl] = useState('');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState();
  const [maxPrice, setMaxPrice] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshingProducts, setRefreshingProducts] = useState({});

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const calculateDiscount = (original, current) => {
    return Math.round(((original - current) / original) * 100);
  };

  const fetchProducts = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const response = await axios.get(`${backendUrl}/api/products`, {
        params: {
          search,
          min_price: minPrice,
          max_price: maxPrice
        }
      });
      setProducts(response.data);
    } catch (err) {
      setError('Error fetching products');
      console.error(err);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if(!url)
    {
      setError('URL cannot be empty');
      setLoading(false);
    return;
    }

    const productExists = products.some(product => product.url === url);
    if (productExists) {
      setError('Product already exists');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/api/products`, { url });
      console.log(response)
      setProducts([...products, response.data]); // Add new product to the list
      setUrl(''); // Clear input
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  const recheckPrice = async (product) => {
    setRefreshingProducts((prev) => ({ ...prev, [product.id]: true }));

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      await axios.post(`${backendUrl}/api/products/recheck`, { url: product.url });
      fetchProducts(); // Refresh the product list to show updated prices
    } catch (err) {
      setError(err.response?.data?.error || 'Error rechecking price');
    } finally {
      setRefreshingProducts((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  useEffect(() => {

    fetchProducts(); // Fetch products on initial load
  }, [search, minPrice, maxPrice]); // Refetch products when filters change

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Flipkart Price Tracker
            </h1>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-gray-100">
                <ShoppingBag className="w-4 h-4 mr-1" />
                {1} Products
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Error Handling Card */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg">
            <p>{error}</p>
          </div>
        )}
        {/* Add Product Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <form onSubmit={addProduct} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter Flipkart product URL"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 min-w-[160px]"
              >
                {loading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
                {loading ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value==''?undefined:e.target.value)}
              placeholder="Min Price"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value==''?undefined:e.target.value)}
              placeholder="Max Price"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
              <div className="p-6 space-y-4">
                {console.log("checking how many times this is called")}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg text-gray-100 line-clamp-2">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-100">
                    {formatPrice(product.current_price)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.ratings}</span>
                    <span className="text-gray-400">({0})</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{product.purchases} Purchases</span>
                  </div>
                </div>

                {/* Price History */}
                {product.price_history.length > 0 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <LineChart data={product.price_history}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:underline"
                  >
                    View on Flipkart <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => recheckPrice(product)}
                    disabled={refreshingProducts[product.id]}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-white transition-colors ${
                      refreshingProducts[product.id] ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {refreshingProducts[product.id] ? (
                      <Loader2 className="animate-spin w-4 h-4" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Recheck Price
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default PriceTracker;
