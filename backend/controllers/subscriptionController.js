import { sql } from "../config/db.js";

// Subscription pricing and benefits
const SUBSCRIPTION_PLANS = {
    free: {
        maxListings: 3,
        listingDuration: 3, // days
        hasFeaturedPlacement: false,
        price: 0
    },
    premium: {
        maxListings: 8,
        listingDuration: 7, // days
        hasFeaturedPlacement: true,
        price: 5.00 // per month
    }
};

// Get subscription status
export const getSubscriptionStatus = async (req, res) => {
    try {
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${req.userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const userData = user[0];
        
        // Check if premium subscription has expired
        let isPremium = userData.is_premium;
        if (isPremium && userData.subscription_expires_at) {
            if (new Date(userData.subscription_expires_at) < new Date()) {
                // Subscription expired, update user
                await sql`
                    UPDATE userschema
                    SET is_premium = FALSE, subscription_expires_at = NULL, updated_at = NOW()
                    WHERE id = ${req.userId}
                `;
                isPremium = false;
            }
        }

        // Get current active listing count
        const listingCount = await sql`
            SELECT COUNT(*) as count
            FROM instruments
            WHERE user_id = ${req.userId}
                AND is_available = TRUE
                AND (expires_at IS NULL OR expires_at > NOW())
                AND NOT EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.instrument_id = instruments.id AND o.status = 'completed'
                )
        `;

        const plan = isPremium ? 'premium' : 'free';
        const planDetails = SUBSCRIPTION_PLANS[plan];

        res.status(200).json({
            success: true,
            subscription: {
                plan,
                isPremium,
                expiresAt: isPremium ? userData.subscription_expires_at : null,
                currentListings: parseInt(listingCount[0].count),
                maxListings: planDetails.maxListings,
                listingDuration: planDetails.listingDuration,
                hasFeaturedPlacement: planDetails.hasFeaturedPlacement
            }
        });
    } catch (error) {
        console.log("Error getSubscriptionStatus", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Upgrade to premium subscription
export const upgradeToPremium = async (req, res) => {
    try {
        const { cardNumber, expiryDate, cvv, cardHolder } = req.body;

        // Validate card details
        if (!cardNumber || !expiryDate || !cvv || !cardHolder) {
            return res.status(400).json({ success: false, message: "All card details are required" });
        }

        // Validate card number format (basic validation - 16 digits)
        const cleanCardNumber = cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(cleanCardNumber)) {
            return res.status(400).json({ success: false, message: "Invalid card number format" });
        }

        // Validate expiry date format (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
            return res.status(400).json({ success: false, message: "Invalid expiry date format (use MM/YY)" });
        }

        // Check expiry date is not in the past
        const [month, year] = expiryDate.split('/');
        const expiryDateObj = new Date(2000 + parseInt(year), parseInt(month) - 1);
        if (expiryDateObj < new Date()) {
            return res.status(400).json({ success: false, message: "Card has expired" });
        }

        // Validate CVV (3-4 digits)
        if (!/^\d{3,4}$/.test(cvv)) {
            return res.status(400).json({ success: false, message: "Invalid CVV format" });
        }

        // Get current user
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${req.userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Calculate new subscription end date (1 month from now or extend existing)
        let newExpiresAt;
        const userData = user[0];
        
        if (userData.is_premium && userData.subscription_expires_at && new Date(userData.subscription_expires_at) > new Date()) {
            // Extend existing subscription by 1 month
            newExpiresAt = new Date(userData.subscription_expires_at);
            newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
        } else {
            // New subscription - 1 month from now
            newExpiresAt = new Date();
            newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
        }

        // In a real application, you would process the payment here with Stripe/PayPal
        // For now, we'll just simulate a successful payment

        // Update user to premium
        const updatedUser = await sql`
            UPDATE userschema
            SET 
                is_premium = TRUE,
                subscription_expires_at = ${newExpiresAt},
                updated_at = NOW()
            WHERE id = ${req.userId}
            RETURNING *
        `;

        // Update all existing active listings to have 7-day expiry
        await sql`
            UPDATE instruments
            SET 
                expires_at = NOW() + INTERVAL '7 days',
                updated_at = NOW()
            WHERE user_id = ${req.userId}
                AND is_available = TRUE
                AND (expires_at IS NULL OR expires_at > NOW())
        `;

        res.status(200).json({
            success: true,
            message: "Successfully upgraded to Premium!",
            subscription: {
                plan: 'premium',
                isPremium: true,
                expiresAt: newExpiresAt,
                maxListings: SUBSCRIPTION_PLANS.premium.maxListings,
                listingDuration: SUBSCRIPTION_PLANS.premium.listingDuration,
                hasFeaturedPlacement: SUBSCRIPTION_PLANS.premium.hasFeaturedPlacement
            },
            user: {
                ...updatedUser[0],
                password: undefined
            }
        });
    } catch (error) {
        console.log("Error upgradeToPremium", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Cancel premium subscription (will remain active until expiry)
export const cancelSubscription = async (req, res) => {
    try {
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${req.userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user[0].is_premium) {
            return res.status(400).json({ success: false, message: "You don't have an active premium subscription" });
        }

        // Mark subscription for cancellation (it will remain active until expiry)
        // In a real application, you would cancel the recurring payment here

        res.status(200).json({
            success: true,
            message: `Your premium subscription will remain active until ${new Date(user[0].subscription_expires_at).toLocaleDateString()}. It will not renew after that.`,
            subscription: {
                plan: 'premium',
                isPremium: true,
                expiresAt: user[0].subscription_expires_at,
                willCancel: true
            }
        });
    } catch (error) {
        console.log("Error cancelSubscription", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Check if user can create a new listing
export const canCreateListing = async (req, res) => {
    try {
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${req.userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if premium subscription is still valid
        let isPremium = user[0].is_premium;
        if (isPremium && user[0].subscription_expires_at) {
            if (new Date(user[0].subscription_expires_at) < new Date()) {
                isPremium = false;
            }
        }

        const maxListings = isPremium ? SUBSCRIPTION_PLANS.premium.maxListings : SUBSCRIPTION_PLANS.free.maxListings;

        // Count current active listings
        const listingCount = await sql`
            SELECT COUNT(*) as count
            FROM instruments
            WHERE user_id = ${req.userId}
                AND is_available = TRUE
                AND (expires_at IS NULL OR expires_at > NOW())
                AND NOT EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.instrument_id = instruments.id AND o.status = 'completed'
                )
        `;

        const currentCount = parseInt(listingCount[0].count);
        const canCreate = currentCount < maxListings;

        res.status(200).json({
            success: true,
            canCreate,
            currentListings: currentCount,
            maxListings,
            isPremium,
            listingDuration: isPremium ? SUBSCRIPTION_PLANS.premium.listingDuration : SUBSCRIPTION_PLANS.free.listingDuration
        });
    } catch (error) {
        console.log("Error canCreateListing", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Downgrade to free plan (immediate cancellation)
export const downgradeToFree = async (req, res) => {
    try {
        const user = await sql`
            SELECT id, is_premium, subscription_expires_at
            FROM userschema
            WHERE id = ${req.userId}
            LIMIT 1
        `;

        if (user.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!user[0].is_premium) {
            return res.status(400).json({ success: false, message: "You are already on the free plan" });
        }

        // Downgrade user to free plan immediately
        const updatedUser = await sql`
            UPDATE userschema
            SET 
                is_premium = FALSE,
                subscription_expires_at = NULL,
                updated_at = NOW()
            WHERE id = ${req.userId}
            RETURNING *
        `;

        // Update all existing active listings to have 3-day expiry from now
        await sql`
            UPDATE instruments
            SET 
                expires_at = NOW() + INTERVAL '3 days',
                updated_at = NOW()
            WHERE user_id = ${req.userId}
                AND is_available = TRUE
                AND (expires_at IS NULL OR expires_at > NOW())
        `;

        // Get updated listing count
        const listingCount = await sql`
            SELECT COUNT(*) as count
            FROM instruments
            WHERE user_id = ${req.userId}
                AND is_available = TRUE
                AND (expires_at IS NULL OR expires_at > NOW())
                AND NOT EXISTS (
                    SELECT 1 FROM orders o 
                    WHERE o.instrument_id = instruments.id AND o.status = 'completed'
                )
        `;

        res.status(200).json({
            success: true,
            message: "Successfully downgraded to Free Plan. Your listings now expire after 3 days.",
            subscription: {
                plan: 'free',
                isPremium: false,
                expiresAt: null,
                currentListings: parseInt(listingCount[0].count),
                maxListings: SUBSCRIPTION_PLANS.free.maxListings,
                listingDuration: SUBSCRIPTION_PLANS.free.listingDuration,
                hasFeaturedPlacement: SUBSCRIPTION_PLANS.free.hasFeaturedPlacement
            },
            user: {
                ...updatedUser[0],
                password: undefined
            }
        });
    } catch (error) {
        console.log("Error downgradeToFree", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// Export subscription plans for use in other controllers
export { SUBSCRIPTION_PLANS };
