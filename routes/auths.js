import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      // Check if the user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      // Hash the password
      const saltRounds = 10; // Number of rounds for bcrypt salt
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user instance
      user = new User({ name, email, password: hashedPassword });
      
      // Save the user to the database
      await user.save();
  
      // Generate a JWT token
      const payload = { userId: user.id };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      // Return the token in the response
      res.status(201).json({ token });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = { userId: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// Protected route: Get user profile (example)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select('-password');  // Get user info except password
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
