import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

const router = express.Router();

// Signup route
// In your route handler (userRoutes.js)
router.post('/submit-form', async (req, res) => {
  console.log('Request body:', req.body);  // Check if password is present
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ message: 'Error saving user data' });
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ 'personalDetails.email': email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.personalDetails.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.personalDetails.email },
      'your_jwt_secret', // Secret key for signing the JWT
      { expiresIn: '1h' } // Token expiration time
    );

    // Send the token as response
    res.json({ token });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user-info', async (req, res) => {
  try {
      const user = await User.findById(req.user.id);  // Assuming req.user.id is the logged-in user's ID
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
});
export default router;
