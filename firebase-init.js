// firebase-init.js - 🔥 FIREBASE CONFIGURATION FILE 🔥
// Ye file sab pages mein include hogi

// Firebase Configuration (Aapki di hui values)
const firebaseConfig = {
    apiKey: "AIzaSyCMPUAV50FOsqpyTKY3lioeAgbQvxQzLnM",
    authDomain: "vedanta-d0199.firebaseapp.com",
    projectId: "vedanta-d0199",
    storageBucket: "vedanta-d0199.firebasestorage.app",
    messagingSenderId: "761061711987",
    appId: "1:761061711987:web:d59ff32fd53057c395ca06",
    measurementId: "G-RQMQZVGK75"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

console.log("🔥 Firebase Connected! Project: vedanta-d0199");

// ========== PRODUCTS FUNCTIONS ==========

// Get all active products (for website)
async function getAllProducts() {
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .orderBy('createdAt', 'desc')
            .get();
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        return products;
    } catch (error) {
        console.error("Error getting products:", error);
        return [];
    }
}

// Get product by ID
async function getProductById(productId) {
    try {
        const doc = await db.collection('products').doc(productId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting product:", error);
        return null;
    }
}

// Add product (for admin)
async function addProduct(productData) {
    try {
        const productId = Date.now().toString();
        const product = {
            ...productData,
            id: productId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await db.collection('products').doc(productId).set(product);
        console.log("✅ Product added to Firebase!");
        return { success: true, id: productId };
    } catch (error) {
        console.error("Error adding product:", error);
        return { success: false, error: error.message };
    }
}

// Update product
async function updateProduct(productId, productData) {
    try {
        await db.collection('products').doc(productId).update({
            ...productData,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        return { success: false, error: error.message };
    }
}

// Delete product
async function deleteProduct(productId) {
    try {
        await db.collection('products').doc(productId).delete();
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { success: false, error: error.message };
    }
}

// ========== ORDERS FUNCTIONS ==========

// Add order (when user places order)
async function addOrder(orderData) {
    try {
        const orderId = 'ORD' + Date.now();
        const order = {
            ...orderData,
            orderId: orderId,
            status: 'pending',
            orderDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await db.collection('orders').doc(orderId).set(order);
        console.log("✅ Order saved to Firebase! Order ID:", orderId);
        return { success: true, orderId: orderId };
    } catch (error) {
        console.error("Error adding order:", error);
        return { success: false, error: error.message };
    }
}

// Get all orders (for admin)
async function getAllOrders() {
    try {
        const snapshot = await db.collection('orders')
            .orderBy('orderDate', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (error) {
        console.error("Error getting orders:", error);
        return [];
    }
}

// Update order status (for admin)
async function updateOrderStatus(orderId, newStatus) {
    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
        console.log("✅ Order status updated:", orderId, "->", newStatus);
        return { success: true };
    } catch (error) {
        console.error("Error updating order:", error);
        return { success: false, error: error.message };
    }
}

// Get user orders
async function getUserOrders(userEmail) {
    try {
        const snapshot = await db.collection('orders')
            .where('customerEmail', '==', userEmail)
            .orderBy('orderDate', 'desc')
            .get();
        
        const orders = [];
        snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
        });
        return orders;
    } catch (error) {
        console.error("Error getting user orders:", error);
        return [];
    }
}

console.log("✅ Firebase functions ready!");