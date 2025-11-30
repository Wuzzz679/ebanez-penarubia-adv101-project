// lib/database.js
import db from './db.js';

// Test database connection and create tables if they don't exist
async function initializeTables() {
  try {
    console.log('🔄 Testing MySQL connection...');
    
    // Test the connection first
    await db.execute('SELECT 1');
    console.log('✅ MySQL connection successful');

    // Create orders table
    const createOrdersTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        product_title VARCHAR(255) NOT NULL,
        product_image TEXT,
        size VARCHAR(50) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        payment_method VARCHAR(100) NOT NULL DEFAULT 'cash',
        customer_address TEXT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'pending'
      )
    `;

    await db.execute(createOrdersTableQuery);
    console.log('✅ Orders table ready with new columns');

    // Create contacts table
    const createContactsTableQuery = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        contact_type VARCHAR(50) DEFAULT 'general',
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
      )
    `;

    await db.execute(createContactsTableQuery);
    console.log('✅ Contacts table ready');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    console.error('💡 Please check:');
    console.error('   1. Is MySQL running?');
    console.error('   2. Does the "streetkicks" database exist?');
    console.error('   3. Are the credentials in db.js correct?');
    throw error; // Re-throw to handle in calling code
  }
}

// Initialize tables when module loads, but handle errors gracefully
initializeTables().catch(error => {
  console.error('Failed to initialize database:', error.message);
});

// Add order to database - FIXED VERSION
async function addOrder(orderData) {
  try {
    // Ensure no undefined values - convert to empty strings or defaults
    const safeOrderData = {
      user_email: orderData.user_email || '',
      product_title: orderData.product_title || 'Unknown Product',
      product_image: orderData.product_image || '',
      size: orderData.size || 'Not specified',
      price: orderData.price ? parseFloat(orderData.price) : 0,
      quantity: orderData.quantity ? parseInt(orderData.quantity) : 1,
      payment_method: orderData.payment_method || 'cash',
      customer_address: orderData.customer_address || '',
      customer_name: orderData.customer_name || '',
      customer_phone: orderData.customer_phone || ''
    };
    
    console.log('🔄 Adding order to database with safe data:', safeOrderData);
    
    const query = `
      INSERT INTO orders 
      (user_email, product_title, product_image, size, price, quantity, payment_method, customer_address, customer_name, customer_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      safeOrderData.user_email, 
      safeOrderData.product_title, 
      safeOrderData.product_image, 
      safeOrderData.size, 
      safeOrderData.price, 
      safeOrderData.quantity,
      safeOrderData.payment_method,
      safeOrderData.customer_address,
      safeOrderData.customer_name,
      safeOrderData.customer_phone
    ]);
    
    console.log('✅ Order added successfully, ID:', result.insertId);
    
    return { id: result.insertId };
  } catch (error) {
    console.error('❌ Error adding order to database:', error.message);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
}

// Get orders by user
async function getOrdersByUser(userEmail) {
  try {
    const query = `SELECT * FROM orders WHERE user_email = ? ORDER BY order_date DESC`;
    console.log('🔄 Fetching orders for user:', userEmail);
    
    const [rows] = await db.execute(query, [userEmail]);
    console.log(`✅ Found ${rows.length} orders for user:`, userEmail);
    
    return rows;
  } catch (error) {
    console.error('❌ Error fetching orders for user:', userEmail, error.message);
    throw error;
  }
}

// Get all orders (for admin purposes)
async function getAllOrders() {
  try {
    const query = `SELECT * FROM orders ORDER BY order_date DESC`;
    console.log('🔄 Fetching all orders...');
    
    const [rows] = await db.execute(query);
    console.log(`✅ Found ${rows.length} total orders`);
    
    return rows;
  } catch (error) {
    console.error('❌ Error fetching all orders:', error.message);
    throw error;
  }
}

// Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const query = `UPDATE orders SET status = ? WHERE id = ?`;
    console.log(`🔄 Updating order ${orderId} status to:`, status);
    
    const [result] = await db.execute(query, [status, orderId]);
    console.log(`✅ Order ${orderId} status updated to:`, status);
    
    return { changes: result.affectedRows };
  } catch (error) {
    console.error('❌ Error updating order status:', error.message);
    throw error;
  }
}

// Contact functions
async function createContact(contactData) {
  try {
    // Add null checks for contact data too
    const safeContactData = {
      user_email: contactData.user_email || '',
      subject: contactData.subject || '',
      message: contactData.message || '',
      contact_type: contactData.contact_type || 'general'
    };
    
    const query = `
      INSERT INTO contacts 
      (user_email, subject, message, contact_type)
      VALUES (?, ?, ?, ?)
    `;
    
    console.log('🔄 Creating contact message:', safeContactData);
    
    const [result] = await db.execute(query, [
      safeContactData.user_email, 
      safeContactData.subject, 
      safeContactData.message, 
      safeContactData.contact_type
    ]);
    
    console.log('✅ Contact message created, ID:', result.insertId);
    
    return { id: result.insertId };
  } catch (error) {
    console.error('❌ Error creating contact message:', error.message);
    throw error;
  }
}

async function getContactsByUser(userEmail) {
  try {
    const query = `SELECT * FROM contacts WHERE user_email = ? ORDER BY created_at DESC`;
    console.log('🔄 Fetching contacts for user:', userEmail);
    
    const [rows] = await db.execute(query, [userEmail]);
    console.log(`✅ Found ${rows.length} contact messages for user:`, userEmail);
    
    return rows;
  } catch (error) {
    console.error('❌ Error fetching contacts for user:', userEmail, error.message);
    throw error;
  }
}

async function getAllContacts() {
  try {
    const query = `SELECT * FROM contacts ORDER BY created_at DESC`;
    console.log('🔄 Fetching all contacts...');
    
    const [rows] = await db.execute(query);
    console.log(`✅ Found ${rows.length} total contact messages`);
    
    return rows;
  } catch (error) {
    console.error('❌ Error fetching all contacts:', error.message);
    throw error;
  }
}

async function updateContactStatus(contactId, status) {
  try {
    const query = `UPDATE contacts SET status = ? WHERE id = ?`;
    console.log(`🔄 Updating contact ${contactId} status to:`, status);
    
    const [result] = await db.execute(query, [status, contactId]);
    console.log(`✅ Contact ${contactId} status updated to:`, status);
    
    return { changes: result.affectedRows };
  } catch (error) {
    console.error('❌ Error updating contact status:', error.message);
    throw error;
  }
}

// Test function to check if database is working
async function testConnection() {
  try {
    await db.execute('SELECT 1');
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export {
  addOrder,
  getOrdersByUser,
  getAllOrders,
  updateOrderStatus,
  testConnection,
  createContact,
  getContactsByUser,
  getAllContacts,
  updateContactStatus
};