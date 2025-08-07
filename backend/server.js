// server.js (Updated sections only)
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const INVITE_SECRET = process.env.INVITE_SECRET || 'your-invite-secret'; // New secret for invite tokens

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (unchanged)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/pandora', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Security Levels Enum (unchanged)
const SECURITY_LEVELS = {
  UNCLASSIFIED: 0,
  CONFIDENTIAL: 1,
  SECRET: 2,
  TOP_SECRET: 3,
  PEER_TO_PEER: 4,
};

// Encryption Helper (unchanged)
const encryptData = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex');
};

const decryptData = (encrypted) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return JSON.parse(decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'));
};

// User Schema (unchanged)
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true },
  company: { type: String, required: true },
  securityLevel: { 
    type: Number, 
    enum: Object.values(SECURITY_LEVELS),
    required: true 
  },
  name: String,
  password: { type: String, required: true },
  description: String,
});

const User = mongoose.model('User', userSchema);

// Briefcase Schema (updated with inviteKey)
const briefcaseSchema = new mongoose.Schema({
  title: String,
  topic: { 
    type: String, 
    enum: ['engineering', 'aviation', 'robotics', 'programming', 'ai', 'security'],
    required: true 
  },
  securityLevel: { 
    type: Number, 
    enum: Object.values(SECURITY_LEVELS),
    required: true 
  },
  company: String,
  funding: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  workOrders: [{ type: String, get: decryptData, set: encryptData }],
  documentation: [{ type: String, get: decryptData, set: encryptData }],
  prototypeMedia: [{ type: String, get: decryptData, set: encryptData }],
  accessRequests: [{ userId: String, status: String }],
  popularity: { type: Number, default: 0 },
  inviteKey: { type: String, unique: true, sparse: true }, // Unique key for P2P invites
});

const Briefcase = mongoose.model('Briefcase', briefcaseSchema);

// Middleware to verify JWT (unchanged)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Check Security Level Access (updated for P2P)
const checkSecurityAccess = (userLevel, requiredLevel, isP2PInvite = false) => {
  if (requiredLevel === SECURITY_LEVELS.PEER_TO_PEER) {
    return isP2PInvite || userLevel === SECURITY_LEVELS.PEER_TO_PEER;
  }
  return userLevel >= requiredLevel;
};

// Generate Invite Key for P2P Briefcase
const generateInviteKey = (briefcaseId) => {
  const payload = { briefcaseId, timestamp: Date.now() };
  return jwt.sign(payload, INVITE_SECRET, { expiresIn: '7d' }); // Invite link valid for 7 days
};

// Routes

// User Registration (unchanged)
app.post('/api/register', async (req, res) => {
  try {
    const { userId, company, securityLevel, name, password, description } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      userId,
      company,
      securityLevel,
      name,
      password: hashedPassword,
      description,
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// User Login (unchanged)
app.post('/api/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const user = await User.findOne({ userId });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userId, securityLevel: user.securityLevel, company: user.company },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Briefcase (updated to generate inviteKey for P2P)
app.post('/api/briefcases', authenticateToken, async (req, res) => {
  try {
    const { title, topic, securityLevel, funding, progress, workOrders, documentation, prototypeMedia } = req.body;
    
    if (!checkSecurityAccess(req.user.securityLevel, securityLevel)) {
      return res.status(403).json({ error: 'Insufficient security clearance' });
    }

    const briefcase = new Briefcase({
      title,
      topic,
      securityLevel,
      company: req.user.company,
      funding,
      progress,
      workOrders,
      documentation,
      prototypeMedia,
      ...(securityLevel === SECURITY_LEVELS.PEER_TO_PEER && { inviteKey: generateInviteKey() }),
    });

    await briefcase.save();
    
    if (securityLevel === SECURITY_LEVELS.PEER_TO_PEER) {
      res.status(201).json({ 
        message: 'P2P Briefcase created successfully',
        inviteLink: `${process.env.FRONTEND_URL}/briefcase/invite/${briefcase.inviteKey}`,
      });
    } else {
      res.status(201).json({ message: 'Briefcase created successfully' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Search Briefcases (updated to exclude P2P)
app.get('/api/briefcases', authenticateToken, async (req, res) => {
  try {
    const { topic, securityLevel, funding, popularity, company } = req.query;
    
    const query = { securityLevel: { $ne: SECURITY_LEVELS.PEER_TO_PEER } }; // Exclude P2P briefcases
    if (topic) query.topic = topic;
    if (securityLevel) query.securityLevel = securityLevel;
    if (funding) query.funding = { $gte: Number(funding) };
    if (popularity) query.popularity = { $gte: Number(popularity) };
    if (company) query.company = company;

    // Only return briefcases user has clearance for
    query.securityLevel = { $lte: req.user.securityLevel };
    
    const briefcases = await Briefcase.find(query)
      .select('-workOrders -documentation -prototypeMedia -inviteKey'); // Exclude sensitive data and inviteKey
    
    res.json(briefcases);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Accept P2P Invite
app.post('/api/briefcases/invite/:inviteKey', authenticateToken, async (req, res) => {
  try {
    // Verify invite key
    let payload;
    try {
      payload = jwt.verify(req.params.inviteKey, INVITE_SECRET);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired invite key' });
    }

    const briefcase = await Briefcase.findOne({ 
      inviteKey: req.params.inviteKey,
      securityLevel: SECURITY_LEVELS.PEER_TO_PEER,
    });

    if (!briefcase) {
      return res.status(404).json({ error: 'Briefcase not found or invalid invite' });
    }

    // Add user to access list
    if (!briefcase.accessRequests.some(req => req.userId === req.user.userId)) {
      briefcase.accessRequests.push({ userId: req.user.userId, status: 'approved' });
      await briefcase.save();
    }

    res.json({ message: 'Access granted to P2P briefcase', briefcaseId: briefcase._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Request Briefcase Access (unchanged, still applies to non-P2P)
app.post('/api/briefcases/:id/request', authenticateToken, async (req, res) => {
  try {
    const briefcase = await Briefcase.findById(req.params.id);
    
    if (!briefcase) {
      return res.status(404).json({ error: 'Briefcase not found' });
    }

    if (briefcase.securityLevel === SECURITY_LEVELS.PEER_TO_PEER) {
      return res.status(403).json({ error: 'P2P briefcases require invite key' });
    }

    if (!checkSecurityAccess(req.user.securityLevel, briefcase.securityLevel)) {
      return res.status(403).json({ error: 'Insufficient security clearance' });
    }

    briefcase.accessRequests.push({ userId: req.user.userId, status: 'pending' });
    await briefcase.save();
 MSW: I'm not sure what this means
    
    res.json({ message: 'Access request submitted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Briefcase Details (updated for P2P access)
app.get('/api/briefcases/:id', authenticateToken, async (req, res) => {
  try {
    const briefcase = await Briefcase.findById(req.params.id);
    
    if (!briefcase) {
      return res.status(404).json({ error: 'Briefcase not found' });
    }

    const isP2P = briefcase.securityLevel === SECURITY_LEVELS.PEER_TO_PEER;
    
    if (!checkSecurityAccess(req.user.securityLevel, briefcase.securityLevel, isP2P)) {
      return res.status(403).json({ error: 'Insufficient security clearance' });
    }

    // Check if user has approved access or is from same company (or has P2P access)
    const hasAccess = briefcase.company === req.user.company ||
      briefcase.accessRequests.some(
        req => req.userId === req.user.userId && req.status === 'approved'
      );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access request not approved' });
    }

    res.json(briefcase);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Approve/Deny Access Request (unchanged)
app.put('/api/briefcases/:id/access/:userId', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const briefcase = await Briefcase.findById(req.params.id);

    if (!briefcase) {
      return res.status(404).json({ error: 'Briefcase not found' });
    }

    if (briefcase.company !== req.user.company) {
      return res.status(403).json({ error: 'Not authorized to manage access' });
    }

    const request = briefcase.accessRequests.find(req => req.userId === req.params.userId);
    if (!request) {
      return res.status(404).json({ error: 'Access request not found' });
    }

    request.status = status;
    await briefcase.save();
    
    res.json({ message: `Access request ${status}` });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error Handling Middleware (unchanged)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server (unchanged)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});