import { useEffect, useState } from 'react';
import { 
    Users, Package, DollarSign, TrendingUp, 
    ShieldCheck, Crown, Trash2, Search,
    ChevronLeft, ChevronRight, AlertCircle, Loader,
    CheckCircle, XCircle, AlertTriangle, X
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}api`
    : "api";

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Search and pagination
    const [userSearch, setUserSearch] = useState('');
    const [listingSearch, setListingSearch] = useState('');
    const [userPage, setUserPage] = useState(1);
    const [listingPage, setListingPage] = useState(1);
    const itemsPerPage = 10;

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        itemName: '',
        type: 'danger', // 'danger' or 'warning'
        onConfirm: null
    });

    const openConfirmModal = (title, message, itemName, onConfirm, type = 'danger') => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            itemName,
            type,
            onConfirm
        });
    };

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const handleConfirm = () => {
        if (confirmModal.onConfirm) {
            confirmModal.onConfirm();
        }
        closeConfirmModal();
    };

    // Check if user is admin
    useEffect(() => {
        if (user && !user.is_admin) {
            navigate('/');
            toast.error('Access denied - Admin only');
        }
    }, [user, navigate]);

    // Fetch admin data
    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setIsLoading(true);
                const [statsRes, usersRes, listingsRes] = await Promise.all([
                    axios.get(`${API_URL}/admin/stats`, { withCredentials: true }),
                    axios.get(`${API_URL}/admin/users`, { withCredentials: true }),
                    axios.get(`${API_URL}/admin/listings`, { withCredentials: true })
                ]);

                setStats(statsRes.data.stats);
                setUsers(usersRes.data.users);
                setListings(listingsRes.data.listings);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setError(err.response?.data?.message || 'Failed to fetch admin data');
                if (err.response?.status === 403) {
                    navigate('/');
                    toast.error('Access denied - Admin only');
                }
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch if user is loaded and is admin
        if (user) {
            if (user.is_admin) {
                fetchAdminData();
            } else {
                setIsLoading(false);
            }
        }
    }, [user, navigate]);

    // Toggle admin status
    const handleToggleAdmin = async (userId) => {
        try {
            const res = await axios.patch(
                `${API_URL}/admin/users/${userId}/toggle-admin`, 
                {}, 
                { withCredentials: true }
            );
            
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, is_admin: res.data.is_admin } : u
            ));
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update admin status');
        }
    };

    // Toggle premium status
    const handleTogglePremium = async (userId) => {
        try {
            const res = await axios.patch(
                `${API_URL}/admin/users/${userId}/toggle-premium`, 
                {}, 
                { withCredentials: true }
            );
            
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, is_premium: res.data.is_premium } : u
            ));
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update premium status');
        }
    };

    // Delete user
    const handleDeleteUser = async (userId, userName) => {
        openConfirmModal(
            'Delete User',
            'Are you sure you want to delete this user? This action cannot be undone and will remove all their listings and data.',
            userName,
            async () => {
                try {
                    await axios.delete(`${API_URL}/admin/users/${userId}`, { withCredentials: true });
                    setUsers(prev => prev.filter(u => u.id !== userId));
                    toast.success('User deleted successfully');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete user');
                }
            }
        );
    };

    // Delete listing
    const handleDeleteListing = async (listingId, listingName) => {
        openConfirmModal(
            'Delete Listing',
            'Are you sure you want to delete this listing? This action cannot be undone.',
            listingName,
            async () => {
                try {
                    await axios.delete(`${API_URL}/admin/listings/${listingId}`, { withCredentials: true });
                    setListings(prev => prev.filter(l => l.id !== listingId));
                    toast.success('Listing deleted successfully');
                } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to delete listing');
                }
            }
        );
    };

    // Filter and paginate users
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );
    const paginatedUsers = filteredUsers.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
    const totalUserPages = Math.ceil(filteredUsers.length / itemsPerPage);

    // Filter and paginate listings
    const filteredListings = listings.filter(l => 
        l.name.toLowerCase().includes(listingSearch.toLowerCase()) ||
        l.seller_name.toLowerCase().includes(listingSearch.toLowerCase())
    );
    const paginatedListings = filteredListings.slice((listingPage - 1) * itemsPerPage, listingPage * itemsPerPage);
    const totalListingPages = Math.ceil(filteredListings.length / itemsPerPage);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                itemName={confirmModal.itemName}
                type={confirmModal.type}
                onConfirm={handleConfirm}
                onCancel={closeConfirmModal}
            />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-10 h-10" />
                        <div>
                            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                            <p className="text-blue-200">Manage users, listings, and platform statistics</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8">
                        {['overview', 'users', 'listings'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-2 border-b-2 font-medium transition-colors capitalize ${
                                    activeTab === tab 
                                        ? 'border-blue-600 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<Users className="w-6 h-6" />}
                                title="Total Users"
                                value={stats.totalUsers}
                                subtitle={`${stats.verifiedUsers} verified`}
                                color="blue"
                            />
                            <StatCard
                                icon={<Crown className="w-6 h-6" />}
                                title="Premium Users"
                                value={stats.premiumUsers}
                                subtitle={`${((stats.premiumUsers / stats.totalUsers) * 100 || 0).toFixed(1)}% of total`}
                                color="yellow"
                            />
                            <StatCard
                                icon={<Package className="w-6 h-6" />}
                                title="Total Listings"
                                value={stats.totalListings}
                                subtitle={`${stats.activeListings} active`}
                                color="green"
                            />
                            <StatCard
                                icon={<DollarSign className="w-6 h-6" />}
                                title="Total Revenue"
                                value={`$${stats.totalRevenue.toLocaleString()}`}
                                subtitle={`${stats.completedOrders} completed orders`}
                                color="purple"
                            />
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Breakdown</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Verified Users</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-green-500 h-2 rounded-full"
                                                    style={{ width: `${(stats.verifiedUsers / stats.totalUsers) * 100 || 0}%` }}
                                                />
                                            </div>
                                            <span className="font-medium text-gray-800">{stats.verifiedUsers}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Premium Users</span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-yellow-500 h-2 rounded-full"
                                                    style={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100 || 0}%` }}
                                                />
                                            </div>
                                            <span className="font-medium text-gray-800">{stats.premiumUsers}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Orders Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Total Orders</span>
                                        <span className="font-medium text-gray-800">{stats.totalOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Completed Orders</span>
                                        <span className="font-medium text-gray-800">{stats.completedOrders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Completion Rate</span>
                                        <span className="font-medium text-green-600">
                                            {((stats.completedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    value={userSearch}
                                    onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={u.profile_picture || '/images/default-avatar.png'} 
                                                            alt={u.name}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{u.name}</div>
                                                            <div className="text-sm text-gray-500">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-wrap gap-2">
                                                        {u.isverified ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                <CheckCircle className="w-3 h-3" /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                <XCircle className="w-3 h-3" /> Unverified
                                                            </span>
                                                        )}
                                                        {u.is_premium && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Crown className="w-3 h-3" /> Premium
                                                            </span>
                                                        )}
                                                        {u.is_admin && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                <ShieldCheck className="w-3 h-3" /> Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div>{u.listing_count} listings</div>
                                                    <div>{u.sales_count} sales</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleToggleAdmin(u.id)}
                                                            disabled={u.id === user.id}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                u.id === user.id 
                                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                                    : u.is_admin 
                                                                        ? 'text-blue-600 hover:bg-blue-50' 
                                                                        : 'text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                            title={u.id === user.id ? "Can't change your own admin status" : u.is_admin ? 'Remove admin' : 'Make admin'}
                                                        >
                                                            <ShieldCheck className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleTogglePremium(u.id)}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                u.is_premium 
                                                                    ? 'text-yellow-600 hover:bg-yellow-50' 
                                                                    : 'text-gray-400 hover:bg-gray-50'
                                                            }`}
                                                            title={u.is_premium ? 'Remove premium' : 'Grant premium (30 days)'}
                                                        >
                                                            <Crown className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                                            disabled={u.id === user.id}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                u.id === user.id 
                                                                    ? 'text-gray-300 cursor-not-allowed' 
                                                                    : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                                                            }`}
                                                            title={u.id === user.id ? "Can't delete yourself" : 'Delete user'}
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalUserPages > 1 && (
                                <div className="px-6 py-4 border-t flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Showing {(userPage - 1) * itemsPerPage + 1} to {Math.min(userPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                            disabled={userPage === 1}
                                            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setUserPage(p => Math.min(totalUserPages, p + 1))}
                                            disabled={userPage === totalUserPages}
                                            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Listings Tab */}
                {activeTab === 'listings' && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="bg-white rounded-xl shadow-sm p-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search listings by name or seller..."
                                    value={listingSearch}
                                    onChange={(e) => { setListingSearch(e.target.value); setListingPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Listings Table */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedListings.map(l => {
                                            const isExpired = new Date(l.expires_at) < new Date();
                                            return (
                                                <tr key={l.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={l.image} 
                                                                alt={l.name}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                            <div>
                                                                <div className="font-medium text-gray-900 max-w-xs truncate">{l.name}</div>
                                                                <div className="text-sm text-gray-500">{l.category}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <img 
                                                                src={l.seller_avatar || '/images/default-avatar.png'} 
                                                                alt={l.seller_name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{l.seller_name}</div>
                                                                <div className="text-xs text-gray-500">{l.seller_email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {l.listing_type === 'sale' 
                                                                ? `฿${parseFloat(l.sale_price).toLocaleString()}`
                                                                : `฿${parseFloat(l.rental_price).toLocaleString()}/${l.rental_period}`
                                                            }
                                                        </div>
                                                        <div className="text-xs text-gray-500 capitalize">{l.listing_type}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-wrap gap-1">
                                                            {l.is_available ? (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Sold</span>
                                                            )}
                                                            {l.is_featured && (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Featured</span>
                                                            )}
                                                            {isExpired && (
                                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Expired</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(l.expires_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            onClick={() => handleDeleteListing(l.id, l.name)}
                                                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                            title="Delete listing"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalListingPages > 1 && (
                                <div className="px-6 py-4 border-t flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Showing {(listingPage - 1) * itemsPerPage + 1} to {Math.min(listingPage * itemsPerPage, filteredListings.length)} of {filteredListings.length} listings
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setListingPage(p => Math.max(1, p - 1))}
                                            disabled={listingPage === 1}
                                            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setListingPage(p => Math.min(totalListingPages, p + 1))}
                                            disabled={listingPage === totalListingPages}
                                            className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({ icon, title, value, subtitle, color }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>
        </div>
    );
}

// Confirmation Modal Component
function ConfirmationModal({ isOpen, title, message, itemName, type, onConfirm, onCancel }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onCancel}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all">
                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Icon */}
                    <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
                        type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                        <AlertTriangle className={`w-7 h-7 ${
                            type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                    </div>

                    {/* Content */}
                    <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                            {message}
                        </p>
                        {itemName && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">
                                    "{itemName}"
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors ${
                                type === 'danger' 
                                    ? 'bg-red-600 hover:bg-red-700' 
                                    : 'bg-yellow-600 hover:bg-yellow-700'
                            }`}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
