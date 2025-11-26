import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'PUT') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { email, username, password, profile_pic } = req.body;
    console.log('Updating profile for:', email, 'username:', username, 'has profile_pic:', !!profile_pic);

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    let updateFields = [];
    let updateValues = [];

    // Check if username is being updated
    if (username && username.trim() !== '') {
      // Check if username already exists (excluding current user)
      const [existingUser] = await db.execute(
        'SELECT id FROM users WHERE username = ? AND email != ?',
        [username, email]
      );
      
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Username already exists' 
        });
      }
      
      updateFields.push('username = ?');
      updateValues.push(username);
    }

    // Check if password is being updated
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    // Check if profile picture is being updated
    if (profile_pic && profile_pic.trim() !== '') {
      updateFields.push('profile_pic = ?');
      updateValues.push(profile_pic);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No fields to update' 
      });
    }

    // Add email for WHERE clause
    updateValues.push(email);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE email = ?`;
    console.log('Update query:', query, updateValues);
    
    const [result] = await db.execute(query, updateValues);
    console.log('Update result:', result);

    return res.status(200).json({ 
      success: true,
      message: 'Profile updated successfully',
      updatedFields: updateFields.map(field => field.split(' = ')[0])
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to update profile: ' + error.message 
    });
  }
}