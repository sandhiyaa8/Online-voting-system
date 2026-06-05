
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { generateOTP, getOTPExpiry, sendOTPViaSMS, verifyOTP, generateOneTimeKey, getOneTimeKeyExpiry } = require("./utils/otpHelper");

const app = express();


app.use(cors());
app.use(bodyParser.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error:", err));


const User = require("./models/user");
const Candidate = require("./models/candidate");
const Vote = require("./models/vote");


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};


app.post("/register", async (req, res) => {
  try {
    const { name, dob, age, mobile, address, country, state, taluk, username, password } = req.body;

    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return res.status(400).json({ error: "Mobile number already registered" });
    }

    
    const passwordHash = await bcrypt.hash(password, 10);

    
    const newUser = new User({
      fullname: name,
      dob,
      age,
      mobile,
      address,
      country,
      state,
      taluk,
      username,
      passwordHash
    });

    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    // Generate OTP and send to user's mobile
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpVerified = false;
    await user.save();

    // Send OTP to mobile
    const otpSent = await sendOTPViaSMS(user.mobile, otp);
    
    if (!otpSent) {
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    // Return temporary token for OTP verification
    const tempToken = jwt.sign(
      { userId: user._id, username: user.username, otpPending: true },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );

    res.json({
      message: "OTP sent to your registered mobile number",
      tempToken,
      userId: user._id,
      mobile: user.mobile.slice(-4) // Return last 4 digits for display
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// OTP Verification endpoint
app.post("/verify-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ error: "User ID and OTP are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify OTP
    if (!verifyOTP(user.otp, otp, user.otpExpiry)) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP and mark as verified
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = true;
    
    // Generate unique one-time key
    const oneTimeKey = generateOneTimeKey();
    const oneTimeKeyExpiry = getOneTimeKeyExpiry();
    user.oneTimeKey = oneTimeKey;
    user.oneTimeKeyExpiry = oneTimeKeyExpiry;
    user.oneTimeKeyUsed = false;
    
    await user.save();

    // Generate final authentication token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "OTP verified successfully. Login complete!",
      token,
      oneTimeKey,
      user: {
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        taluk: user.taluk
      }
    });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// Resend OTP endpoint
app.post("/resend-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();
    
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    // Send new OTP
    const otpSent = await sendOTPViaSMS(user.mobile, otp);
    
    if (!otpSent) {
      return res.status(500).json({ error: "Failed to send OTP" });
    }

    res.json({
      message: "OTP resent to your mobile number",
      mobile: user.mobile.slice(-4)
    });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// Validate and use one-time key endpoint
app.post("/validate-one-time-key", async (req, res) => {
  try {
    const { userId, oneTimeKey } = req.body;

    if (!userId || !oneTimeKey) {
      return res.status(400).json({ error: "User ID and one-time key are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if one-time key matches
    if (user.oneTimeKey !== oneTimeKey) {
      return res.status(400).json({ error: "Invalid one-time key" });
    }

    // Check if key has already been used
    if (user.oneTimeKeyUsed) {
      return res.status(400).json({ error: "One-time key has already been used" });
    }

    // Check if key has expired
    const now = new Date();
    if (new Date(user.oneTimeKeyExpiry) < now) {
      return res.status(400).json({ error: "One-time key has expired" });
    }

    // Mark key as used
    user.oneTimeKeyUsed = true;
    user.oneTimeKey = null;
    user.oneTimeKeyExpiry = null;
    await user.save();

    res.json({
      message: "One-time key validated successfully",
      verified: true
    });
  } catch (err) {
    console.error("One-Time Key Validation Error:", err);
    res.status(500).json({ error: err.message });
  }
});


// Check one-time key status endpoint
app.post("/check-one-time-key", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check key status
    const hasKey = !!user.oneTimeKey;
    const isUsed = user.oneTimeKeyUsed;
    const now = new Date();
    const isExpired = user.oneTimeKeyExpiry ? new Date(user.oneTimeKeyExpiry) < now : true;

    res.json({
      hasKey,
      isUsed,
      isExpired,
      expiresAt: user.oneTimeKeyExpiry
    });
  } catch (err) {
    console.error("Check One-Time Key Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/candidates/count", async (req, res) => {
  try {
    const count = await Candidate.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Get Candidates Count Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/candidates", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    const candidates = await Candidate.find({ taluk: user.taluk });
    res.json({ candidates });
  } catch (err) {
    console.error("Get Candidates Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/voting-status", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    const hasVoted = user.hasVoted && user.hasVoted.length > 0;
    
    res.json({ hasVoted });
  } catch (err) {
    console.error("Check Voting Status Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.post("/vote", authenticateToken, async (req, res) => {
  try {
    const { candidateId, oneTimeKey } = req.body;

    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Validate one-time key if provided (optional but recommended)
    if (oneTimeKey) {
      if (user.oneTimeKey !== oneTimeKey) {
        return res.status(400).json({ error: "Invalid one-time key" });
      }

      if (user.oneTimeKeyUsed) {
        return res.status(400).json({ error: "One-time key has already been used" });
      }

      const now = new Date();
      if (new Date(user.oneTimeKeyExpiry) < now) {
        return res.status(400).json({ error: "One-time key has expired" });
      }
    }

    
    if (user.hasVoted && user.hasVoted.length > 0) {
      return res.status(400).json({ error: "You have already voted" });
    }

    
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    
    const vote = new Vote({
      userId: user._id,
      electionId: candidate.electionId || new mongoose.Types.ObjectId(),
      candidateId: candidate._id
    });
    await vote.save();

    
    candidate.votes = (candidate.votes || 0) + 1;
    await candidate.save();

    
    user.hasVoted.push({
      electionId: candidate.electionId || vote.electionId,
      date: new Date()
    });

    // Mark one-time key as used if provided
    if (oneTimeKey) {
      user.oneTimeKeyUsed = true;
      user.oneTimeKey = null;
      user.oneTimeKeyExpiry = null;
    }

    await user.save();

    res.json({ message: "Vote cast successfully", candidate: candidate.name });
  } catch (err) {
    console.error("Vote Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/results", async (req, res) => {
  try {
    const candidates = await Candidate.find().populate('electionId');
    const results = candidates.map(candidate => ({
      id: candidate._id,
      name: candidate.name,
      position: candidate.position,
      party: candidate.party,
      taluk: candidate.taluk,
      votes: candidate.votes || 0,
      election: candidate.electionId ? candidate.electionId.name : 'General Election'
    }));
    
    // Sort by votes descending
    results.sort((a, b) => b.votes - a.votes);
    
    res.json({ results });
  } catch (err) {
    console.error("Results Error:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("Online Voting System Backend Running");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
