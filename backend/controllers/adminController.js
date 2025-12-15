import {sql} from "../config/db.js";

// Get all users for admin dashboard
export const getAllUsers = async (req, res) => {
    try {
        const users = await sql`
            SELECT 
                u.id,
                u.email,
                u.name,
                u.profile_picture,
                u.isverified,
                u.is_premium,
                u.is_admin,
                u.subscription_expires_at,
                u.created_at,
                u.lastlogin,
                COUNT(DISTINCT i.id) as listing_count,
                COUNT(DISTINCT CASE WHEN o.seller_id = u.id THEN o.id END) as sales_count,
                COUNT(DISTINCT CASE WHEN o.buyer_id = u.id THEN o.id END) as purchases_count
            FROM userschema u
            LEFT JOIN instruments i ON u.id = i.user_id
            LEFT JOIN orders o ON u.id = o.seller_id OR u.id = o.buyer_id
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `;

        res.status(200).json({ 
            success: true, 
            users,
            count: users.length
        });
    } catch (error) {
        console.log("Error in getAllUsers:", error);
        res.status(500).json({ success: false, message: "Error fetching users" });
    }
};

// Get all listings for admin dashboard
export const getAllListings = async (req, res) => {
    try {
        const listings = await sql`
            SELECT 
                i.*,
                u.name as seller_name,
                u.email as seller_email,
                u.profile_picture as seller_avatar
            FROM instruments i
            JOIN userschema u ON i.user_id = u.id
            ORDER BY i.created_at DESC
        `;

        res.status(200).json({ 
            success: true, 
            listings,
            count: listings.length
        });
    } catch (error) {
        console.log("Error in getAllListings:", error);
        res.status(500).json({ success: false, message: "Error fetching listings" });
    }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
    try {
        // Get total users
        const [{ count: totalUsers }] = await sql`SELECT COUNT(*) as count FROM userschema`;
        
        // Get verified users
        const [{ count: verifiedUsers }] = await sql`SELECT COUNT(*) as count FROM userschema WHERE isverified = true`;
        
        // Get premium users
        const [{ count: premiumUsers }] = await sql`SELECT COUNT(*) as count FROM userschema WHERE is_premium = true`;
        
        // Get total listings
        const [{ count: totalListings }] = await sql`SELECT COUNT(*) as count FROM instruments`;
        
        // Get active listings (not expired)
        const [{ count: activeListings }] = await sql`SELECT COUNT(*) as count FROM instruments WHERE expires_at > CURRENT_TIMESTAMP AND is_available = true`;
        
        // Get total orders
        const [{ count: totalOrders }] = await sql`SELECT COUNT(*) as count FROM orders`;
        
        // Get completed orders
        const [{ count: completedOrders }] = await sql`SELECT COUNT(*) as count FROM orders WHERE status = 'completed'`;
        
        // Get total revenue (from completed orders)
        const [{ total: totalRevenue }] = await sql`SELECT COALESCE(SUM(total_price), 0) as total FROM orders WHERE status = 'completed'`;

        res.status(200).json({
            success: true,
            stats: {
                totalUsers: parseInt(totalUsers),
                verifiedUsers: parseInt(verifiedUsers),
                premiumUsers: parseInt(premiumUsers),
                totalListings: parseInt(totalListings),
                activeListings: parseInt(activeListings),
                totalOrders: parseInt(totalOrders),
                completedOrders: parseInt(completedOrders),
                totalRevenue: parseFloat(totalRevenue) || 0
            }
        });
    } catch (error) {
        console.log("Error in getAdminStats:", error);
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

// Toggle user admin status
export const toggleUserAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.userId;

        // Can't change own admin status
        if (parseInt(userId) === adminId) {
            return res.status(400).json({ success: false, message: "You cannot change your own admin status" });
        }

        // Get current admin status
        const [user] = await sql`SELECT is_admin FROM userschema WHERE id = ${userId}`;
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle admin status
        const newStatus = !user.is_admin;
        await sql`UPDATE userschema SET is_admin = ${newStatus} WHERE id = ${userId}`;

        res.status(200).json({ 
            success: true, 
            message: `User admin status ${newStatus ? 'granted' : 'revoked'}`,
            is_admin: newStatus
        });
    } catch (error) {
        console.log("Error in toggleUserAdmin:", error);
        res.status(500).json({ success: false, message: "Error updating admin status" });
    }
};

// Toggle user premium status
export const toggleUserPremium = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get current premium status
        const [user] = await sql`SELECT is_premium FROM userschema WHERE id = ${userId}`;
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle premium status
        const newStatus = !user.is_premium;
        
        if (newStatus) {
            // Grant 30 days of premium
            await sql`
                UPDATE userschema 
                SET is_premium = true, 
                    subscription_expires_at = CURRENT_TIMESTAMP + INTERVAL '30 days'
                WHERE id = ${userId}
            `;
        } else {
            await sql`
                UPDATE userschema 
                SET is_premium = false, 
                    subscription_expires_at = NULL
                WHERE id = ${userId}
            `;
        }

        res.status(200).json({ 
            success: true, 
            message: `User premium status ${newStatus ? 'granted (30 days)' : 'revoked'}`,
            is_premium: newStatus
        });
    } catch (error) {
        console.log("Error in toggleUserPremium:", error);
        res.status(500).json({ success: false, message: "Error updating premium status" });
    }
};

// Delete a listing (admin)
export const deleteListing = async (req, res) => {
    try {
        const { listingId } = req.params;

        // Check if listing exists
        const [listing] = await sql`SELECT id FROM instruments WHERE id = ${listingId}`;
        
        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        // Delete the listing
        await sql`DELETE FROM instruments WHERE id = ${listingId}`;

        res.status(200).json({ 
            success: true, 
            message: "Listing deleted successfully"
        });
    } catch (error) {
        console.log("Error in deleteListing:", error);
        res.status(500).json({ success: false, message: "Error deleting listing" });
    }
};

// Delete a user (admin)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const adminId = req.userId;

        // Can't delete yourself
        if (parseInt(userId) === adminId) {
            return res.status(400).json({ success: false, message: "You cannot delete your own account" });
        }

        // Check if user exists
        const [user] = await sql`SELECT id FROM userschema WHERE id = ${userId}`;
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Delete the user (cascade will delete their listings, orders, etc.)
        await sql`DELETE FROM userschema WHERE id = ${userId}`;

        res.status(200).json({ 
            success: true, 
            message: "User deleted successfully"
        });
    } catch (error) {
        console.log("Error in deleteUser:", error);
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
};
