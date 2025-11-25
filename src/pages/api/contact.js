import db from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { fullName, email, contactType, message } = req.body;

    console.log('📨 Received contact form data:', { fullName, email, contactType, message });

    // Validate required fields
    if (!fullName || !email || !message) {
      return res.status(400).json({
        message: 'Full name, email, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Check if user exists in users table
    try {
      const [users] = await db.execute(
        'SELECT email FROM users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(400).json({
          message: 'User not found. Please register an account first.'
        });
      }
    } catch (userError) {
      console.error('❌ Error checking user:', userError);
      // If users table doesn't exist, continue anyway
    }

    // Use fullName as subject
    const subject = `Message from ${fullName}`;
    
    // Set default contact_type to 'general' if not provided
    const finalContactType = contactType || 'general';

    // Save to database
    try {
      const [result] = await db.execute(
        'INSERT INTO contacts (user_email, subject, message, contact_type, status) VALUES (?, ?, ?, ?, ?)',
        [email, subject, message, finalContactType, 'pending']
      );

      console.log('✅ Contact saved to database with ID:', result.insertId);

      return res.status(200).json({ 
        message: 'Contact form submitted successfully!',
        status: 'success',
        contactId: result.insertId
      });

    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        return res.status(500).json({
          message: 'Contacts table not found. Please check your database.'
        });
      }
      
      if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          message: 'User account not found. Please make sure you are registered and logged in with a valid account.'
        });
      }
      
      return res.status(500).json({
        message: 'Failed to save contact to database: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('❌ Contact form error:', error);
    return res.status(500).json({
      message: 'Internal server error: ' + error.message
    });
  }
}