import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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
    const { imageData, fileName } = req.body;
    console.log('Upload request received, filename:', fileName);

    if (!imageData) {
      return res.status(400).json({ 
        success: false,
        message: 'Image data is required' 
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadDir, { recursive: true });
    console.log('Upload directory ready:', uploadDir);

    // Generate unique filename
    const fileExt = fileName ? path.extname(fileName) : '.jpg';
    const uniqueFileName = `profile_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    // Convert base64 to buffer and save
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    await writeFile(filePath, buffer);

    // Return relative path for database storage
    const relativePath = `/uploads/profiles/${uniqueFileName}`;
    console.log('File saved successfully:', relativePath);

    return res.status(200).json({ 
      success: true,
      message: 'File uploaded successfully',
      filePath: relativePath
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to upload file: ' + error.message 
    });
  }
}