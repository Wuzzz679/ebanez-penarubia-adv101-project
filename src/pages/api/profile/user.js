import db from '@/lib/db';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed' 
    });
  }

  try {
    const { email } = req.body;
    console.log('Fetching user data for:', email);

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    const [users] = await db.execute(
      'SELECT username, email, profile_pic, created_at FROM users WHERE email = ?',
      [email]
    );

    console.log('Users found:', users.length);

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = users[0];
    console.log('User data:', user);

    return res.status(200).json({ 
      success: true,
      user: {
        username: user.username,
        email: user.email,
        profile_pic: user.profile_pic || null,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch user data: ' + error.message 
    });
  }
}