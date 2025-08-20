// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const INVITE_SECRET = process.env.INVITE_SECRET || 'your-invite-secret';

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(cors());
app.use(express.json());

const SECURITY_LEVELS = {
  UNCLASSIFIED: 0,
  CONFIDENTIAL: 1,
  SECRET: 2,
  TOP_SECRET: 3,
  PEER_TO_PEER: 4,
};

const encryptData = (data) => {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return cipher.update(JSON.stringify(data), 'utf8', 'hex') + cipher.final('hex');
};

const decryptData = (encrypted) => {
  const decipher = crypto.createDecipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
  return JSON.parse(decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8'));
};

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const checkSecurityAccess = (userLevel, requiredLevel, isP2PInvite = false) => {
  if (requiredLevel === SECURITY_LEVELS.PEER_TO_PEER) {
    return isP2PInvite || userLevel === SECURITY_LEVELS.PEER_TO_PEER;
  }
  return userLevel >= requiredLevel;
};

const generateInviteKey = (briefcaseId) => {
  const payload = { briefcaseId, timestamp: Date.now() };
  return jwt.sign(payload, INVITE_SECRET, { expiresIn: '7d' });
};

// Register Route
app.post('/api/register', async (req, res) => {
  try {
    const { userId, company, securityLevel, name, password, description } = req.body;
    if (!userId || !company || securityLevel < 0 || securityLevel > 4 || !name || !password) {
      return res.status(400).json({ error: 'All fields are required and securityLevel must be 0-4' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, userId, company, securityLevel, name, password: hashedPassword, description }]);
    if (error) throw error;
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { userId, password } = req.body;
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single();
    if (error || !users) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!(await bcrypt.compare(password, users.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: users.userId, securityLevel: users.securityLevel, company: users.company },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create Briefcase
app.post('/api/briefcases', authenticateToken, async (req, res) => {
  try {
    const { title, topic, securityLevel, funding, progress, workOrders, documentation, prototypeMedia } = req.body;
    if (!title || !topic || securityLevel < 0 || securityLevel > 4) {
      return res.status(400).json({ error: 'Title, topic, and valid securityLevel are required' });
    }
    if (!checkSecurityAccess(req.user.securityLevel, securityLevel)) {
      return res.status(403).json({ error: 'Insufficient security clearance' });
    }
    const inviteKey = securityLevel === SECURITY_LEVELS.PEER_TO_PEER ? generateInviteKey(crypto.randomUUID()) : null;
    const { data, error } = await supabase
      .from('briefcases')
      .insert([{
        id: crypto.randomUUID(),
        title,
        topic,
        securityLevel,
        company: req.user.company,
        funding: funding || 0,
        progress: progress || 0,
        workOrders: workOrders ? workOrders.map(encryptData) : [],
        documentation: documentation ? documentation.map(encryptData) : [],
        prototypeMedia: prototypeMedia ? prototypeMedia.map(encryptData) : [],
        accessRequests: [],
        popularity: 0,
        inviteKey,
      }]);
    if (error) throw error;
    res.status(201).json({
      message: securityLevel === SECURITY_LEVELS.PEER_TO_PEER
        ? 'P2P Briefcase created successfully'
        : 'Briefcase created successfully',
      ...(inviteKey && { inviteLink: `${process.env.FRONTEND_URL}/briefcase/invite/${inviteKey}` }),
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get Briefcases
app.get('/api/briefcases', authenticateToken, async (req, res) => {
  try {
    const { topic, securityLevel, funding, popularity, company } = req.query;
    let query = supabase
      .from('briefcases')
      .select('id, title, topic, securityLevel, company, funding, progress, popularity')
      .neq('securityLevel', SECURITY_LEVELS.PEER_TO_PEER)
      .lte('securityLevel', req.user.securityLevel);
    if (topic) query = query.eq('topic', topic);
    if (securityLevel) query = query.eq('securityLevel', securityLevel);
    if (funding) query = query.gte('funding', Number(funding));
    if (popularity) query = query.gte('popularity', Number(popularity));
    if (company) query = query.eq('company', company);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Request Briefcase Access
app.post('/api/briefcases/:id/request', authenticateToken, async (req, res) => {
  try {
    const { data: briefcase, error } = await supabase
      .from('briefcases')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error || !briefcase) {
      return res.status(404).json({ error: 'Briefcase not found' });
    }
    if (briefcase.securityLevel === SECURITY_LEVELS.PEER_TO_PEER) {
      return res.status(403).json({ error: 'P2P briefcases require invite key' });
    }
    if (!checkSecurityAccess(req.user.securityLevel, briefcase.securityLevel)) {
      return res.status(403).json({ error: 'Insufficient security clearance' });
    }
    const accessRequests = briefcase.accessRequests || [];
    accessRequests.push({ userId: req.user.userId, status: 'pending' });
    const { error: updateError } = await supabase
      .from('briefcases')
      .update({ accessRequests })
      .eq('id', req.params.id);
    if (updateError) throw updateError;
    res.json({ message: 'Access request submitted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});