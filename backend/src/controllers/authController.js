const jwt = require('jsonwebtoken');
const { getUserModel } = require('../models/User');
const sessionManager = require('../services/sessionManager');
const thingSpeakService = require('../services/thingSpeakService');

class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      const UserModel = getUserModel();
      const dbType = process.env.DB_TYPE || 'mongodb';

      // Check if user already exists
      let existingUser;
      if (dbType === 'mongodb') {
        existingUser = await UserModel.findOne({ email });
      } else {
        existingUser = await UserModel.findOne({ where: { email } });
      }

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      let user;
      if (dbType === 'mongodb') {
        user = new UserModel({
          name,
          email,
          password,
          role: role || 'operator',
        });
        await user.save();
        user = user.toObject();
      } else {
        user = await UserModel.create({
          name,
          email,
          password,
          role: role || 'operator',
        });
        user = user.toJSON();
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id || user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      delete user.password;

      // Add session and start data fetching if this is the first user
      const userInfo = {
        id: user.id || user._id,
        email: user.email,
        role: user.role
      };
      sessionManager.addSession(token, userInfo);

      if (!thingSpeakService.isFetchingActive()) {
        thingSpeakService.startScheduledFetch();
      }

      return res.status(201).json({
        message: 'User created successfully',
        token,
        user,
      });
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const UserModel = getUserModel();
      const dbType = process.env.DB_TYPE || 'mongodb';

      // Find user
      let user;
      if (dbType === 'mongodb') {
        user = await UserModel.findOne({ email });
      } else {
        user = await UserModel.findOne({ where: { email } });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Convert to plain object
      const userObj = dbType === 'mongodb' ? user.toObject() : user.toJSON();

      // Generate JWT token
      const token = jwt.sign(
        { id: userObj.id || userObj._id, email: userObj.email, role: userObj.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      delete userObj.password;

      // Add session and start data fetching if this is the first user
      const userInfo = {
        id: userObj.id || userObj._id,
        email: userObj.email,
        role: userObj.role
      };
      sessionManager.addSession(token, userInfo);

      if (!thingSpeakService.isFetchingActive()) {
        thingSpeakService.startScheduledFetch();
      }

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: userObj,
      });
    } catch (error) {
      console.error('Login error:', error.message);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  async getProfile(req, res) {
    try {
      return res.status(200).json({ user: req.user });
    } catch (error) {
      console.error('Get profile error:', error.message);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }

  async logout(req, res) {
    try {
      // Get token from header
      const token = req.header('Authorization')?.replace('Bearer ', '');
      
      if (token) {
        sessionManager.removeSession(token);
      }

      return res.status(200).json({ 
        message: 'Logout successful',
        activeSessions: sessionManager.getActiveSessionCount()
      });
    } catch (error) {
      console.error('Logout error:', error.message);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
}

module.exports = new AuthController();
