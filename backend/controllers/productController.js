import { sql } from "../config/db.js";
import { uploadImage, uploadMultipleImages, deleteImage } from "../utils/uploadImage.js";

// Get all products (public - for marketplace browsing)
export const getProducts = async (req, res) => {
    try {
        const { category, listing_type, min_price, max_price, condition, location, search } = req.query;

        let products;

        // Basic query - get all available products (excluding expired ones)
        // Featured products shown first, then premium user listings (priority placement)
        if (!category && !listing_type && !min_price && !max_price && !condition && !location && !search) {
            products = await sql`
                SELECT 
                    i.*,
                    u.name as seller_name,
                    u.email as seller_email,
                    u.profile_picture as seller_profile_picture,
                    u.is_premium as seller_is_premium
                FROM instruments i
                JOIN userschema u ON i.user_id = u.id
                WHERE i.is_available = true
                AND (i.expires_at IS NULL OR i.expires_at > NOW())
                ORDER BY 
                    CASE WHEN i.is_featured = true AND u.is_premium = true AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW()) THEN 0 ELSE 1 END,
                    CASE WHEN u.is_premium = true AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW()) THEN 0 ELSE 1 END,
                    i.created_at DESC
            `;
        } else {
            // Filtered query (excluding expired listings)
            // Featured products shown first, then premium user listings (priority placement)
            products = await sql`
                SELECT 
                    i.*,
                    u.name as seller_name,
                    u.email as seller_email,
                    u.profile_picture as seller_profile_picture,
                    u.is_premium as seller_is_premium
                FROM instruments i
                JOIN userschema u ON i.user_id = u.id
                WHERE i.is_available = true
                AND (i.expires_at IS NULL OR i.expires_at > NOW())
                ${category ? sql`AND i.category = ${category}` : sql``}
                ${listing_type ? sql`AND i.listing_type = ${listing_type}` : sql``}
                ${condition ? sql`AND i.condition = ${condition}` : sql``}
                ${location ? sql`AND i.location ILIKE ${'%' + location + '%'}` : sql``}
                ${search ? sql`AND (i.name ILIKE ${'%' + search + '%'} OR i.description ILIKE ${'%' + search + '%'})` : sql``}
                ${min_price ? sql`AND (i.sale_price >= ${min_price} OR i.rental_price >= ${min_price})` : sql``}
                ${max_price ? sql`AND (i.sale_price <= ${max_price} OR i.rental_price <= ${max_price})` : sql``}
                ORDER BY 
                    CASE WHEN i.is_featured = true AND u.is_premium = true AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW()) THEN 0 ELSE 1 END,
                    CASE WHEN u.is_premium = true AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW()) THEN 0 ELSE 1 END,
                    i.created_at DESC
            `;
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log("Error getProducts", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get featured products from premium users (public - for homepage)
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await sql`
            SELECT 
                i.*,
                u.name as seller_name,
                u.email as seller_email,
                u.profile_picture as seller_profile_picture,
                u.is_premium as seller_is_premium
            FROM instruments i
            JOIN userschema u ON i.user_id = u.id
            WHERE i.is_available = true
            AND i.is_featured = true
            AND u.is_premium = true
            AND (u.subscription_expires_at IS NULL OR u.subscription_expires_at > NOW())
            AND (i.expires_at IS NULL OR i.expires_at > NOW())
            ORDER BY i.created_at DESC
            LIMIT 12
        `;

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log("Error getFeaturedProducts", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get single product (public)
export const getProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await sql`
            SELECT 
                i.*,
                u.name as seller_name,
                u.email as seller_email,
                u.id as seller_id,
                u.profile_picture as seller_profile_picture,
                u.is_premium as seller_is_premium
            FROM instruments i
            JOIN userschema u ON i.user_id = u.id
            WHERE i.id = ${id}
        `;

        if (product.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Increment view count
        await sql`
            UPDATE instruments SET views = views + 1 WHERE id = ${id}
        `;

        res.status(200).json({ success: true, data: product[0] });
    } catch (error) {
        console.log("Error getProduct", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Subscription limits
const SUBSCRIPTION_LIMITS = {
    free: { maxListings: 3, listingDays: 3 },
    premium: { maxListings: 8, listingDays: 7 }
};

// Create product (authenticated - user must be logged in)
export const createProduct = async (req, res) => {
    const userId = req.userId; // From verifyToken middleware
    const {
        name,
        description,
        category,
        brand,
        image,
        image_url, // Alternative field name
        condition,
        location,
        listing_type,
        sale_price,
        rental_price,
        rental_period
    } = req.body;

    // Validation
    if (!name || !description || !category || !condition || !location || !listing_type) {
        return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    // Validate listing type and prices
    if (listing_type === 'sale' && !sale_price) {
        return res.status(400).json({ success: false, message: "Sale price is required for sale listings" });
    }
    if (listing_type === 'rent' && (!rental_price || !rental_period)) {
        return res.status(400).json({ success: false, message: "Rental price and period are required for rental listings" });
    }
    if (listing_type === 'both' && (!sale_price || !rental_price || !rental_period)) {
        return res.status(400).json({ success: false, message: "Both sale and rental details are required" });
    }

    try {
        // Check user subscription status and listing limits
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Determine if user has active premium subscription
        let isPremium = user[0].is_premium;
        if (isPremium && user[0].subscription_expires_at) {
            if (new Date(user[0].subscription_expires_at) < new Date()) {
                isPremium = false;
                // Update user's premium status
                await sql`
                    UPDATE userschema
                    SET is_premium = FALSE, subscription_expires_at = NULL, updated_at = NOW()
                    WHERE id = ${userId}
                `;
            }
        }

        const limits = isPremium ? SUBSCRIPTION_LIMITS.premium : SUBSCRIPTION_LIMITS.free;

        // Count current active listings
        const listingCount = await sql`
            SELECT COUNT(*) as count
            FROM instruments
            WHERE user_id = ${userId}
                AND is_available = TRUE
                AND (expires_at IS NULL OR expires_at > NOW())
                AND NOT EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.instrument_id = instruments.id AND o.status = 'completed'
                )
        `;

        const currentCount = parseInt(listingCount[0].count);

        if (currentCount >= limits.maxListings) {
            return res.status(400).json({ 
                success: false, 
                message: isPremium 
                    ? `You have reached the maximum of ${limits.maxListings} active listings for premium members`
                    : `You have reached the maximum of ${limits.maxListings} active listings. Upgrade to premium for up to ${SUBSCRIPTION_LIMITS.premium.maxListings} listings!`,
                isPremium,
                currentListings: currentCount,
                maxListings: limits.maxListings
            });
        }

        let productImage = image || image_url || null;
        let productImages = [];

        // Handle file uploads if present
        if (req.files && req.files.length > 0) {
            const uploadedImages = await uploadMultipleImages(req.files);
            productImage = uploadedImages[0]?.url || null;
            productImages = uploadedImages.map(img => img.url);
        }

        // Calculate expires_at based on subscription
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + limits.listingDays);

        const newProduct = await sql`
            INSERT INTO instruments (
                user_id, name, description, category, brand, image, images, 
                condition, location, listing_type, sale_price, rental_price, rental_period, expires_at
            )
            VALUES (
                ${userId}, ${name}, ${description}, ${category}, ${brand || null}, ${productImage}, 
                ${productImages}, ${condition}, ${location}, ${listing_type}, 
                ${sale_price || null}, ${rental_price || null}, ${rental_period || null}, ${expiresAt}
            )
            RETURNING *
        `;

        console.log("New product added:", newProduct[0]);
        res.status(201).json({ success: true, data: newProduct[0] });
    } catch (error) {
        console.log("Error createProduct", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update product (authenticated - only owner can update)
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const {
        name,
        description,
        category,
        brand,
        image,
        images,
        condition,
        location,
        listing_type,
        sale_price,
        rental_price,
        rental_period,
        is_available
    } = req.body;

    try {
        // Check if product exists and belongs to user
        const existingProduct = await sql`
            SELECT * FROM instruments WHERE id = ${id}
        `;

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (existingProduct[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: "You can only update your own listings" });
        }

        // Check if trying to make product available again
        if (is_available === true) {
            // Check if there are any completed orders for this product
            const completedOrders = await sql`
                SELECT id FROM orders 
                WHERE instrument_id = ${id} AND status = 'completed'
                LIMIT 1
            `;

            if (completedOrders.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: "This product has been sold and cannot be listed again" 
                });
            }

            // Also check for completed rentals (if applicable)
            const completedRentals = await sql`
                SELECT id FROM rentals 
                WHERE instrument_id = ${id} AND status = 'completed'
                LIMIT 1
            `;

            // For rentals, we might want to allow re-listing after rental is complete
            // But for sales, once completed, the item is sold
        }

        const updatedProduct = await sql`
            UPDATE instruments
            SET 
                name = ${name || existingProduct[0].name},
                description = ${description || existingProduct[0].description},
                category = ${category || existingProduct[0].category},
                brand = ${brand !== undefined ? brand : existingProduct[0].brand},
                image = ${image || existingProduct[0].image},
                images = ${images || existingProduct[0].images},
                condition = ${condition || existingProduct[0].condition},
                location = ${location || existingProduct[0].location},
                listing_type = ${listing_type || existingProduct[0].listing_type},
                sale_price = ${sale_price !== undefined ? sale_price : existingProduct[0].sale_price},
                rental_price = ${rental_price !== undefined ? rental_price : existingProduct[0].rental_price},
                rental_period = ${rental_period !== undefined ? rental_period : existingProduct[0].rental_period},
                is_available = ${is_available !== undefined ? is_available : existingProduct[0].is_available},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        res.status(200).json({ success: true, data: updatedProduct[0] });
    } catch (error) {
        console.log("Error updateProduct", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Toggle featured status for a product (only premium users, only one product at a time)
export const toggleFeatured = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Check if user is premium
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if premium is active
        let isPremium = user[0].is_premium;
        if (isPremium && user[0].subscription_expires_at) {
            if (new Date(user[0].subscription_expires_at) < new Date()) {
                isPremium = false;
            }
        }

        if (!isPremium) {
            return res.status(403).json({ 
                success: false, 
                message: "Only premium members can feature products. Upgrade to premium to access this feature!" 
            });
        }

        // Check if product exists and belongs to user
        const existingProduct = await sql`
            SELECT * FROM instruments WHERE id = ${id}
        `;

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (existingProduct[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: "You can only feature your own listings" });
        }

        const currentlyFeatured = existingProduct[0].is_featured;

        if (currentlyFeatured) {
            // If already featured, unfeatured it
            await sql`
                UPDATE instruments
                SET is_featured = FALSE, updated_at = NOW()
                WHERE id = ${id}
            `;

            const updatedProduct = await sql`
                SELECT * FROM instruments WHERE id = ${id}
            `;

            return res.status(200).json({ 
                success: true, 
                message: "Product unfeatured successfully",
                data: updatedProduct[0]
            });
        } else {
            // If not featured, first unfeatured any currently featured product by this user
            await sql`
                UPDATE instruments
                SET is_featured = FALSE, updated_at = NOW()
                WHERE user_id = ${userId} AND is_featured = TRUE
            `;

            // Then feature this product
            await sql`
                UPDATE instruments
                SET is_featured = TRUE, updated_at = NOW()
                WHERE id = ${id}
            `;

            const updatedProduct = await sql`
                SELECT * FROM instruments WHERE id = ${id}
            `;

            return res.status(200).json({ 
                success: true, 
                message: "Product featured successfully! This is now your highlighted listing.",
                data: updatedProduct[0]
            });
        }
    } catch (error) {
        console.log("Error toggleFeatured", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Delete product (authenticated - only owner can delete)
export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Check if product exists and belongs to user
        const existingProduct = await sql`
            SELECT * FROM instruments WHERE id = ${id}
        `;

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (existingProduct[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: "You can only delete your own listings" });
        }

        const deletedProduct = await sql`
            DELETE FROM instruments WHERE id = ${id}
            RETURNING *
        `;

        res.status(200).json({ success: true, message: "Product deleted successfully", data: deletedProduct[0] });
    } catch (error) {
        console.log("Error deleteProduct", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get user's own listings (authenticated)
export const getMyListings = async (req, res) => {
    const userId = req.userId;

    try {
        // First, mark any expired listings as unavailable
        await sql`
            UPDATE instruments
            SET 
                is_available = FALSE,
                updated_at = NOW()
            WHERE user_id = ${userId}
                AND expires_at IS NOT NULL
                AND expires_at < NOW()
                AND is_available = TRUE
        `;

        const listings = await sql`
            SELECT 
                i.*,
                CASE WHEN EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.instrument_id = i.id AND o.status = 'completed'
                ) OR EXISTS (
                    SELECT 1 FROM rentals r 
                    WHERE r.instrument_id = i.id AND r.status = 'completed'
                ) THEN true ELSE false END as is_sold,
                CASE WHEN EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.instrument_id = i.id AND o.status IN ('processing', 'shipped')
                ) OR EXISTS (
                    SELECT 1 FROM rentals r 
                    WHERE r.instrument_id = i.id AND r.status = 'active'
                ) THEN true ELSE false END as is_ongoing
            FROM instruments i
            WHERE i.user_id = ${userId}
            ORDER BY i.created_at DESC
        `;

        res.status(200).json({ success: true, data: listings });
    } catch (error) {
        console.log("Error getMyListings", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get listings by specific user (public - for viewing seller's profile)
export const getUserListings = async (req, res) => {
    const { userId } = req.params;

    try {
        const listings = await sql`
            SELECT 
                i.*,
                u.name as seller_name
            FROM instruments i
            JOIN userschema u ON i.user_id = u.id
            WHERE i.user_id = ${userId} AND i.is_available = true
            ORDER BY i.created_at DESC
        `;

        res.status(200).json({ success: true, data: listings });
    } catch (error) {
        console.log("Error getUserListings", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get product categories (public)
export const getCategories = async (req, res) => {
    try {
        const categories = await sql`
            SELECT DISTINCT category FROM instruments WHERE is_available = true
        `;

        res.status(200).json({ success: true, data: categories.map(c => c.category) });
    } catch (error) {
        console.log("Error getCategories", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Upload product images (authenticated - for standalone image upload)
export const uploadProductImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: "No images provided" });
        }

        const uploadedImages = await uploadMultipleImages(req.files);
        
        res.status(200).json({ 
            success: true, 
            data: {
                images: uploadedImages.map(img => img.url),
                mainImage: uploadedImages[0]?.url || null
            }
        });
    } catch (error) {
        console.log("Error uploadProductImages", error);
        res.status(500).json({ success: false, message: "Error uploading images" });
    }
};

// Get dashboard statistics for the logged-in user (seller analytics)
export const getDashboardStats = async (req, res) => {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    // Default to last 7 days if no dates provided
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    try {
        // Total listed products (all products the user has listed)
        const totalListedResult = await sql`
            SELECT COUNT(*) as count FROM instruments WHERE user_id = ${userId}
        `;
        const totalListedProducts = parseInt(totalListedResult[0]?.count || 0);

        // Ongoing listings (products that are available)
        const ongoingListingsResult = await sql`
            SELECT COUNT(*) as count FROM instruments 
            WHERE user_id = ${userId} AND is_available = true
        `;
        const ongoingListings = parseInt(ongoingListingsResult[0]?.count || 0);

        // Total sales revenue (completed orders where user is the seller)
        const totalSalesResult = await sql`
            SELECT COALESCE(SUM(total_price), 0) as total FROM orders 
            WHERE seller_id = ${userId} AND status = 'completed'
        `;
        const totalSales = parseFloat(totalSalesResult[0]?.total || 0);

        // Total rental revenue (completed rentals where user is the owner)
        const totalRentalResult = await sql`
            SELECT COALESCE(SUM(total_price), 0) as total FROM rentals 
            WHERE owner_id = ${userId} AND status = 'completed'
        `;
        const totalRentals = parseFloat(totalRentalResult[0]?.total || 0);

        // Total revenue = sales + rentals
        const totalRevenue = totalSales + totalRentals;

        // Ongoing orders (pending/processing orders where user is the seller)
        const ongoingOrdersResult = await sql`
            SELECT COUNT(*) as count FROM orders 
            WHERE seller_id = ${userId} AND status IN ('pending', 'processing', 'shipped')
        `;
        const ongoingOrders = parseInt(ongoingOrdersResult[0]?.count || 0);

        // Ongoing rentals (active rentals where user is the owner)
        const ongoingRentalsResult = await sql`
            SELECT COUNT(*) as count FROM rentals 
            WHERE owner_id = ${userId} AND status = 'active'
        `;
        const ongoingRentals = parseInt(ongoingRentalsResult[0]?.count || 0);

        // Revenue by day for the selected date range
        const revenueByDayResult = await sql`
            WITH dates AS (
                SELECT generate_series(
                    ${start}::date,
                    ${end}::date,
                    INTERVAL '1 day'
                )::date AS day
            ),
            order_revenue AS (
                SELECT 
                    DATE(created_at) as day,
                    COALESCE(SUM(total_price), 0) as revenue
                FROM orders 
                WHERE seller_id = ${userId} 
                    AND status = 'completed'
                    AND DATE(created_at) >= ${start}::date
                    AND DATE(created_at) <= ${end}::date
                GROUP BY DATE(created_at)
            ),
            rental_revenue AS (
                SELECT 
                    DATE(created_at) as day,
                    COALESCE(SUM(total_price), 0) as revenue
                FROM rentals 
                WHERE owner_id = ${userId} 
                    AND status = 'completed'
                    AND DATE(created_at) >= ${start}::date
                    AND DATE(created_at) <= ${end}::date
                GROUP BY DATE(created_at)
            )
            SELECT 
                dates.day,
                TO_CHAR(dates.day, 'DD-MM-YYYY') as date_formatted,
                COALESCE(o.revenue, 0) + COALESCE(r.revenue, 0) as revenue
            FROM dates
            LEFT JOIN order_revenue o ON dates.day = o.day
            LEFT JOIN rental_revenue r ON dates.day = r.day
            ORDER BY dates.day
        `;

        const revenueByDay = revenueByDayResult.map(row => ({
            date: row.date_formatted,
            fullDate: row.day,
            revenue: parseFloat(row.revenue || 0)
        }));

        res.status(200).json({
            success: true,
            data: {
                totalListedProducts,
                ongoingListings,
                totalRevenue,
                totalSales,
                totalRentals,
                ongoingOrders: ongoingOrders + ongoingRentals,
                revenueByDay
            }
        });
    } catch (error) {
        console.log("Error getDashboardStats", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Renew a listing for 3 more days (authenticated - only owner can renew)
export const renewListing = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {
        // Check if product exists and belongs to user
        const existingProduct = await sql`
            SELECT * FROM instruments WHERE id = ${id}
        `;

        if (existingProduct.length === 0) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (existingProduct[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: "You can only renew your own listings" });
        }

        // Renew the listing: set expires_at to 3 days from NOW (not from current expiry)
        // Also set is_available to true when renewing
        const renewedProduct = await sql`
            UPDATE instruments
            SET 
                expires_at = NOW() + INTERVAL '3 days',
                is_available = TRUE,
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        res.status(200).json({ 
            success: true, 
            message: "Listing renewed for 3 days",
            data: renewedProduct[0] 
        });
    } catch (error) {
        console.log("Error renewListing", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Check and update expired listings (can be called periodically or on fetch)
export const checkExpiredListings = async (userId) => {
    try {
        // Mark listings as unavailable if they've expired
        await sql`
            UPDATE instruments
            SET 
                is_available = FALSE,
                updated_at = NOW()
            WHERE user_id = ${userId}
                AND expires_at < NOW()
                AND is_available = TRUE
        `;
    } catch (error) {
        console.log("Error checking expired listings", error);
    }
};

// Get orders for a seller (authenticated - shows orders where user is the seller)
export const getSellerOrders = async (req, res) => {
    const userId = req.userId;

    try {
        // Get all orders (both purchases and rentals) where the user is the seller/owner
        const orders = await sql`
            SELECT 
                o.id,
                o.instrument_id,
                o.order_type,
                o.quantity,
                o.unit_price,
                o.total_price,
                o.status,
                o.payment_status,
                o.payment_method,
                o.shipping_address,
                o.notes,
                o.created_at,
                i.name as product_name,
                i.image as product_image,
                i.category as product_category,
                u.name as customer_name,
                u.email as customer_email,
                u.profile_picture as customer_profile_picture
            FROM orders o
            JOIN instruments i ON o.instrument_id = i.id
            JOIN userschema u ON o.buyer_id = u.id
            WHERE o.seller_id = ${userId}
            ORDER BY o.created_at DESC
        `;

        // Also get rentals where user is the owner
        const rentals = await sql`
            SELECT 
                r.id,
                r.instrument_id,
                'rental' as order_type,
                1 as quantity,
                r.total_price as unit_price,
                r.total_price,
                r.status,
                'completed' as payment_status,
                'stripe' as payment_method,
                NULL as shipping_address,
                NULL as notes,
                r.created_at,
                r.start_date,
                r.end_date,
                i.name as product_name,
                i.image as product_image,
                i.category as product_category,
                u.name as customer_name,
                u.email as customer_email,
                u.profile_picture as customer_profile_picture
            FROM rentals r
            JOIN instruments i ON r.instrument_id = i.id
            JOIN userschema u ON r.renter_id = u.id
            WHERE r.owner_id = ${userId}
            ORDER BY r.created_at DESC
        `;

        // Combine and sort by date
        const allOrders = [...orders, ...rentals].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        res.status(200).json({ success: true, data: allOrders });
    } catch (error) {
        console.log("Error getSellerOrders", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Get orders for the buyer/renter (their purchases and rentals)
export const getBuyerOrders = async (req, res) => {
    const userId = req.userId;

    try {
        // Get all orders where the user is the buyer
        const orders = await sql`
            SELECT 
                o.id,
                o.instrument_id,
                o.order_type,
                o.quantity,
                o.unit_price,
                o.total_price,
                o.status,
                o.payment_status,
                o.payment_method,
                o.shipping_address,
                o.notes,
                o.created_at,
                i.name as product_name,
                i.image as product_image,
                i.category as product_category,
                i.brand as product_brand,
                u.name as seller_name,
                u.email as seller_email,
                u.profile_picture as seller_profile_picture
            FROM orders o
            JOIN instruments i ON o.instrument_id = i.id
            JOIN userschema u ON o.seller_id = u.id
            WHERE o.buyer_id = ${userId}
            ORDER BY o.created_at DESC
        `;

        // Also get rentals where user is the renter
        const rentals = await sql`
            SELECT 
                r.id,
                r.instrument_id,
                'rental' as order_type,
                1 as quantity,
                r.total_price as unit_price,
                r.total_price,
                r.status,
                'completed' as payment_status,
                'stripe' as payment_method,
                NULL as shipping_address,
                NULL as notes,
                r.created_at,
                r.start_date,
                r.end_date,
                i.name as product_name,
                i.image as product_image,
                i.category as product_category,
                i.brand as product_brand,
                u.name as seller_name,
                u.email as seller_email,
                u.profile_picture as seller_profile_picture
            FROM rentals r
            JOIN instruments i ON r.instrument_id = i.id
            JOIN userschema u ON r.owner_id = u.id
            WHERE r.renter_id = ${userId}
            ORDER BY r.created_at DESC
        `;

        // Combine and sort by date
        const allOrders = [...orders, ...rentals].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );

        res.status(200).json({ success: true, data: allOrders });
    } catch (error) {
        console.log("Error getBuyerOrders", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Update order status (authenticated - only seller can update)
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, type } = req.body; // type can be 'order' or 'rental'
    const userId = req.userId;

    // Statuses that should hide the product from listings
    const hideProductStatuses = ['processing', 'shipped', 'completed'];
    // Statuses that should show the product again
    const showProductStatuses = ['pending', 'cancelled'];

    try {
        if (type === 'rental') {
            // Check if rental exists and belongs to user
            const existingRental = await sql`
                SELECT * FROM rentals WHERE id = ${id} AND owner_id = ${userId}
            `;

            if (existingRental.length === 0) {
                return res.status(404).json({ success: false, message: "Rental not found or unauthorized" });
            }

            const updatedRental = await sql`
                UPDATE rentals
                SET status = ${status}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;

            // Update product availability based on rental status
            const instrumentId = existingRental[0].instrument_id;
            if (hideProductStatuses.includes(status.toLowerCase())) {
                await sql`
                    UPDATE instruments 
                    SET is_available = FALSE, updated_at = NOW() 
                    WHERE id = ${instrumentId}
                `;
            } else if (showProductStatuses.includes(status.toLowerCase())) {
                await sql`
                    UPDATE instruments 
                    SET is_available = TRUE, updated_at = NOW() 
                    WHERE id = ${instrumentId}
                `;
            }

            res.status(200).json({ success: true, data: updatedRental[0] });
        } else {
            // Check if order exists and belongs to user
            const existingOrder = await sql`
                SELECT * FROM orders WHERE id = ${id} AND seller_id = ${userId}
            `;

            if (existingOrder.length === 0) {
                return res.status(404).json({ success: false, message: "Order not found or unauthorized" });
            }

            const updatedOrder = await sql`
                UPDATE orders
                SET status = ${status}, updated_at = NOW()
                WHERE id = ${id}
                RETURNING *
            `;

            // Update product availability based on order status
            const instrumentId = existingOrder[0].instrument_id;
            if (hideProductStatuses.includes(status.toLowerCase())) {
                await sql`
                    UPDATE instruments 
                    SET is_available = FALSE, updated_at = NOW() 
                    WHERE id = ${instrumentId}
                `;
            } else if (showProductStatuses.includes(status.toLowerCase())) {
                await sql`
                    UPDATE instruments 
                    SET is_available = TRUE, updated_at = NOW() 
                    WHERE id = ${instrumentId}
                `;
            }

            res.status(200).json({ success: true, data: updatedOrder[0] });
        }
    } catch (error) {
        console.log("Error updateOrderStatus", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Create order(s) from cart checkout (authenticated)
export const createOrder = async (req, res) => {
    const userId = req.userId;
    const { items, paymentMethod, shippingAddress } = req.body;

    try {
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: "No items provided" });
        }

        const createdOrders = [];

        for (const item of items) {
            const { productId, orderType, quantity, rentalDays, totalPrice } = item;

            // Get the product to find the seller
            const product = await sql`
                SELECT * FROM instruments WHERE id = ${productId}
            `;

            if (product.length === 0) {
                continue; // Skip if product not found
            }

            const sellerId = product[0].user_id;
            const unitPrice = orderType === 'rental' 
                ? parseFloat(product[0].rental_price) 
                : parseFloat(product[0].sale_price);

            if (orderType === 'rental') {
                // Create rental record
                const startDate = new Date();
                const endDate = new Date();
                endDate.setDate(endDate.getDate() + rentalDays);

                const rental = await sql`
                    INSERT INTO rentals (
                        instrument_id, renter_id, owner_id, 
                        start_date, end_date, total_price, status
                    ) VALUES (
                        ${productId}, ${userId}, ${sellerId},
                        ${startDate}, ${endDate}, ${totalPrice}, 'pending'
                    )
                    RETURNING *
                `;
                createdOrders.push({ type: 'rental', data: rental[0] });
            } else {
                // Create order record
                const order = await sql`
                    INSERT INTO orders (
                        instrument_id, buyer_id, seller_id, order_type,
                        quantity, unit_price, total_price, status, 
                        payment_status, payment_method, shipping_address
                    ) VALUES (
                        ${productId}, ${userId}, ${sellerId}, 'sale',
                        ${quantity}, ${unitPrice}, ${totalPrice}, 'pending',
                        ${paymentMethod === 'cod' ? 'pending' : 'paid'}, ${paymentMethod || 'cod'}, ${shippingAddress || ''}
                    )
                    RETURNING *
                `;
                createdOrders.push({ type: 'order', data: order[0] });
            }
        }

        res.status(201).json({ 
            success: true, 
            message: `${createdOrders.length} order(s) placed successfully`,
            data: createdOrders 
        });
    } catch (error) {
        console.log("Error createOrder", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};