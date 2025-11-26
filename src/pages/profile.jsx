"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../styles/profile.module.css";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [profilePic, setProfilePic] = useState("/default-avatar.png"); // Default image
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const DEFAULT_AVATAR = "/default-avatar.png";

  useEffect(() => {
    const storedUser = localStorage?.getItem("user");
    if (!storedUser) {
      router.push("/");
      return;
    }
    
    try {
      const userData = typeof storedUser === 'string' && storedUser.startsWith('{') 
        ? JSON.parse(storedUser) 
        : storedUser;
      
      setUser(userData);
      fetchUserData(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUser(storedUser);
      fetchUserData(storedUser);
    }
  }, [router]);

  const fetchUserData = async (email) => {
    try {
      const userEmail = typeof email === 'object' ? email.email : email;
      
      console.log('Fetching user data for:', userEmail);
      const response = await fetch('/api/profile/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('User data response:', data);
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          username: data.user?.username || ""
        }));
        // Use user's profile pic if available, otherwise keep default
        setProfilePic(data.user?.profile_pic || DEFAULT_AVATAR);
      } else {
        showMessage(data.message || 'Failed to fetch user data', 'error');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      showMessage('Failed to load profile data: ' + error.message, 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      showMessage('Please select JPEG, PNG, or WebP image', 'error');
      e.target.value = '';
      return;
    }

    // Validate file size (10MB)
    if (file.size > MAX_FILE_SIZE) {
      showMessage(`File size must be less than 10MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`, 'error');
      e.target.value = '';
      return;
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log(`Uploading file: ${file.name}, Size: ${fileSizeMB}MB, Type: ${file.type}`);

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64String = reader.result;
          
          // Show preview immediately
          setProfilePic(base64String);
          
          const response = await fetch('/api/profile/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: base64String,
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size
            }),
          });

          console.log('Upload response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${response.status} - ${errorText}`);
          }

          const data = await response.json();
          console.log('Upload response data:', data);
          
          if (data.success) {
            setProfilePic(data.filePath);
            showMessage('Profile picture updated successfully!', 'success');
            
            // Auto-save the profile picture to database
            await updateProfilePicture(data.filePath);
          } else {
            // Revert to previous image on failure
            fetchUserData(user);
            showMessage(data.message || 'Upload failed', 'error');
          }
        } catch (error) {
          console.error('Upload processing error:', error);
          // Revert to previous image on error
          fetchUserData(user);
          showMessage('Failed to upload profile picture: ' + error.message, 'error');
        } finally {
          setIsUploading(false);
          e.target.value = '';
        }
      };
      
      reader.onerror = () => {
        showMessage('Failed to read file', 'error');
        setIsUploading(false);
        e.target.value = '';
      };
      
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Upload error:', error);
      showMessage('Failed to upload profile picture: ' + error.message, 'error');
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const updateProfilePicture = async (filePath) => {
    try {
      const userEmail = typeof user === 'object' ? user.email : user;
      
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          profile_pic: filePath
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Profile picture saved to database');
      } else {
        console.warn('Profile picture uploaded but not saved to database:', data.message);
      }
    } catch (error) {
      console.error('Error saving profile picture to database:', error);
    }
  };

  const removeProfilePicture = async () => {
    if (profilePic === DEFAULT_AVATAR) {
      showMessage('Already using default profile picture', 'info');
      return;
    }

    setIsUploading(true);
    try {
      const userEmail = typeof user === 'object' ? user.email : user;
      
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          profile_pic: DEFAULT_AVATAR
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setProfilePic(DEFAULT_AVATAR);
        showMessage('Profile picture removed successfully!', 'success');
      } else {
        showMessage(data.message || 'Failed to remove profile picture', 'error');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      showMessage('Failed to remove profile picture: ' + error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      showMessage('Passwords do not match', 'error');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    if (!formData.username.trim()) {
      showMessage('Username cannot be empty', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const userEmail = typeof user === 'object' ? user.email : user;
      
      const updateData = {
        email: userEmail,
        username: formData.username.trim(),
        ...(formData.password && { password: formData.password }),
        ...(profilePic && profilePic !== DEFAULT_AVATAR && { profile_pic: profilePic })
      };

      console.log('Sending update data:', { ...updateData, password: '***' });

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Update response data:', data);

      if (data.success) {
        showMessage('Profile updated successfully!', 'success');
        if (formData.username) {
          localStorage.setItem("username", formData.username);
        }
        setFormData(prev => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
      } else {
        showMessage(data.message || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showMessage('Failed to update profile: ' + error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleBack = () => {
    router.back();
  };

  const getProfilePicUrl = () => {
    if (!profilePic) return DEFAULT_AVATAR;
    if (profilePic.startsWith('http') || profilePic.startsWith('/') || profilePic.startsWith('data:')) {
      return profilePic;
    }
    return `/uploads/${profilePic}`;
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.profileCard}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <button className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>

        <h1>Profile Settings</h1>

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}

        <div className={styles.profileSection}>
          <div className={styles.profilePicture}>
            <img 
              src={getProfilePicUrl()} 
              alt="Profile" 
              className={styles.avatar}
              onError={(e) => {
                e.target.src = DEFAULT_AVATAR;
              }}
            />
            <div className={styles.uploadSection}>
              <div className={styles.uploadButtons}>
                <label htmlFor="profile-upload" className={styles.uploadLabel}>
                  {isUploading ? "Uploading..." : "Change Photo"}
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className={styles.uploadInput}
                />
                
                {profilePic !== DEFAULT_AVATAR && (
                  <button 
                    type="button" 
                    onClick={removeProfilePicture}
                    disabled={isUploading}
                    className={styles.removeButton}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <small style={{ display: 'block', marginTop: '5px', color: '#888' }}>
                Max 10MB • JPEG, PNG, WebP
              </small>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={typeof user === 'object' ? user.email : user}
              disabled
              className={styles.disabledInput}
            />
            <small>Email cannot be changed</small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter new password (min 6 characters)"
              minLength="6"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm new password"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || isUploading}
            className={styles.submitButton}
          >
            {isLoading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}