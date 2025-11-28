import { sql } from "../config/db.js";

// Get all products (public - for marketplace browsing)
export const getProducts = async (req, res) => {
    try {
        const { category, listing_type, min_price, max_price, condition, location, search } = req.query;

        let products;

        // Basic query - get all available products
        if (!category && !listing_type && !min_price && !max_price && !condition && !location && !search) {
            products = await sql`
                SELECT 
                    i.*,
                    u.name as seller_name,
                    u.email as seller_email
                FROM instruments i
                JOIN userschema u ON i.user_id = u.id
                WHERE i.is_available = true
                ORDER BY i.created_at DESC
            `;
        } else {
            // Filtered query
            products = await sql`
                SELECT 
                    i.*,
                    u.name as seller_name,
                    u.email as seller_email
                FROM instruments i
                JOIN userschema u ON i.user_id = u.id
                WHERE i.is_available = true
                ${category ? sql`AND i.category = ${category}` : sql``}
                ${listing_type ? sql`AND i.listing_type = ${listing_type}` : sql``}
                ${condition ? sql`AND i.condition = ${condition}` : sql``}
                ${location ? sql`AND i.location ILIKE ${'%' + location + '%'}` : sql``}
                ${search ? sql`AND (i.name ILIKE ${'%' + search + '%'} OR i.description ILIKE ${'%' + search + '%'})` : sql``}
                ${min_price ? sql`AND (i.sale_price >= ${min_price} OR i.rental_price >= ${min_price})` : sql``}
                ${max_price ? sql`AND (i.sale_price <= ${max_price} OR i.rental_price <= ${max_price})` : sql``}
                ORDER BY i.created_at DESC
            `;
        }

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.log("Error getProducts", error);
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
                u.id as seller_id
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
        images,
        condition,
        location,
        listing_type,
        sale_price,
        rental_price,
        rental_period
    } = req.body;

    // Use image or image_url
    const productImage = image || image_url || null;

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
        const newProduct = await sql`
            INSERT INTO instruments (
                user_id, name, description, category, brand, image, images, 
                condition, location, listing_type, sale_price, rental_price, rental_period
            )
            VALUES (
                ${userId}, ${name}, ${description}, ${category}, ${brand || null}, ${productImage}, 
                ${images || []}, ${condition}, ${location}, ${listing_type}, 
                ${sale_price || null}, ${rental_price || null}, ${rental_period || null}
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
        const listings = await sql`
            SELECT * FROM instruments 
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
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

