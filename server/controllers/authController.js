import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/users.json');

// Helper function to get users from JSON file
const getUsers = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, '[]');
      return [];
    }
    throw error;
  }
};

// Helper function to save users to JSON file
const saveUsers = async (users) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
};

export const register = async (req, res) => {
  try {
    const { username, password, dateOfBirth } = req.body;
    const users = await getUsers();

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists. Please choose another.' 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = {
      _id: Date.now().toString(),
      username,
      password: hashedPassword,
      dateOfBirth,
      status: 'offline',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({ 
      success: true, 
      message: 'Successfully joined the Tarot world!' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // --- Hardcoded Admin Intercept ---
    if (username === 'admin@fate-of-yours.com' && password === 'Admin#2026!') {
      return res.status(200).json({
        success: true,
        message: 'Admin access granted.',
        user: {
          id: 'admin',
          email: username,
          status: 'active',
          isAdmin: true
        }
      });
    }

    const users = await getUsers();

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Account not registered.' 
      });
    }

    const user = users[userIndex];
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Incorrect password.' 
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been banned. Please contact the administrator.' 
      });
    }

    // Update status to active
    user.status = 'active'; 
    users[userIndex] = user;
    await saveUsers(users);

    res.status(200).json({
      success: true,
      message: 'Login successful. Welcome back!',
      user: {
        id: user._id,
        email: user.username, 
        dob: user.dateOfBirth,
        status: user.status,
        isAdmin: false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();
    // Return sanitized users list (without passwords)
    const sanitizedUsers = users.map(u => ({
      id: u._id,
      email: u.username,
      status: u.status,
      joinDate: u.createdAt
    }));
    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await getUsers();
    const userIndex = users.findIndex(u => u._id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[userIndex];
    user.status = user.status === 'banned' ? 'offline' : 'banned';
    users[userIndex] = user;
    await saveUsers(users);

    res.status(200).json({ success: true, status: user.status });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    let users = await getUsers();
    
    const userIndex = users.findIndex(u => u._id === id);
    if (userIndex === -1) {
       return res.status(404).json({ message: 'User not found' });
    }

    const userEmail = users[userIndex].username;

    // Delete user
    users = users.filter(u => u._id !== id);
    await saveUsers(users);

    // Delete associated readings
    const READINGS_FILE = path.join(__dirname, '../data/readings.json');
    try {
      const readingsData = await fs.readFile(READINGS_FILE, 'utf-8');
      let readings = JSON.parse(readingsData);
      readings = readings.filter(r => r.email !== userEmail);
      await fs.writeFile(READINGS_FILE, JSON.stringify(readings, null, 2));
    } catch (readingsErr) {
      // Ignore if readings file doesn't exist
      if (readingsErr.code !== 'ENOENT') {
        console.error('Error deleting user readings:', readingsErr);
      }
    }

    res.status(200).json({ success: true, message: 'User and their readings deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
