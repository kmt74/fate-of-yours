import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/readings.json');

// Helper functions
const getReadingsData = async () => {
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

const saveReadingsData = async (readings) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(readings, null, 2));
};

export const addReading = async (req, res) => {
  try {
    const { email, category, question, cards, summary } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const readings = await getReadingsData();
    
    const newReading = {
      id: Date.now().toString(),
      email,
      category: category || 'general',
      question,
      cards,
      summary,
      timestamp: Date.now()
    };

    readings.push(newReading);
    await saveReadingsData(readings);

    res.status(201).json({ success: true, reading: newReading });
  } catch (error) {
    console.error('Add reading error:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const getUserReadings = async (req, res) => {
  try {
    const { email } = req.params;
    const readings = await getReadingsData();
    
    const userReadings = readings.filter(r => r.email === email);
    // Sort descending by timestamp
    userReadings.sort((a, b) => b.timestamp - a.timestamp);
    
    res.status(200).json(userReadings);
  } catch (error) {
    console.error('Get user readings error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getAllReadings = async (req, res) => {
  try {
    const readings = await getReadingsData();
    res.status(200).json(readings);
  } catch (error) {
    console.error('Get all readings error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
