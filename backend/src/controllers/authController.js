const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const axios = require('axios'); // Cần cài: npm install axios
const User = require('../models/User');

// --- HELPER FUNCTIONS (Đưa lên đầu để tái sử dụng) ---

const genToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  bio: user.bio,
  plan: user.plan,
  planExpiresAt: user.planExpiresAt,
  planActive: user.plan !== 'free' && (!user.planExpiresAt || user.planExpiresAt > new Date()),
});

// --- CONTROLLERS ---

exports.googleLogin = async (req, res) => {
  const { token } = req.body; // Đây là Access Token từ Frontend

  if (!token) {
    return res.status(400).json({ message: "Token không tồn tại" });
  }

  try {
    // 1. Dùng Access Token để lấy thông tin user từ Google API
    // (Lưu ý: Code cũ dùng verifyIdToken sẽ lỗi với useGoogleLogin ở frontend)
    const googleResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const { name, email, picture, sub } = googleResponse.data;

    // 2. Kiểm tra hoặc tạo User
    let user = await User.findOne({ email });

    if (user) {
      // User đã tồn tại -> Cập nhật googleId nếu chưa có
      if (!user.googleId) {
        user.googleId = sub;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // User chưa tồn tại -> Tạo mới
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = await User.create({
        name,
        email,
        password: randomPassword,
        googleId: sub,
        avatar: picture,
        role: "student",
        plan: "free"
      });
    }

    // 3. Trả về kết quả (Sử dụng hàm helper để đồng bộ format)
    res.json({
      success: true,
      token: genToken(user),
      user: formatUser(user)
    });

  } catch (error) {
    console.error("Google Login Error:", error.message);
    res.status(400).json({ message: "Xác thực Google thất bại" });
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  try {
    let exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: 'Email này đã được sử dụng' });

    const user = new User({ name, email, password, role });
    await user.save();

    res.json({ token: genToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Sai email hoặc mật khẩu' });

    res.json({ token: genToken(user), user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  res.json({ user: formatUser(req.user) });
};

exports.updateMe = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'password', 'avatar', 'bio'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== null) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (updates.email && updates.email !== user.email) {
      const exists = await User.findOne({ email: updates.email });
      if (exists && exists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: 'Email đã được sử dụng bởi tài khoản khác' });
      }
      user.email = updates.email;
    }

    if (updates.name) user.name = updates.name;
    if (updates.avatar) user.avatar = updates.avatar;
    if (updates.bio) user.bio = updates.bio;
    if (updates.password) user.password = updates.password;

    await user.save();

    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { plan, durationDays = 30, expiresAt } = req.body;
    const allowedPlans = User.PLAN_TYPES || ['free', 'plus', 'business', 'enterprise'];
    if (!plan || !allowedPlans.includes(plan)) {
      return res.status(400).json({ message: 'Gói dịch vụ không hợp lệ' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.plan = plan;
    if (expiresAt) {
      user.planExpiresAt = new Date(expiresAt);
    } else if (plan === 'free') {
      user.planExpiresAt = null;
    } else {
      const durationMs = Number(durationDays) * 24 * 60 * 60 * 1000;
      const baseDate = user.planExpiresAt && user.planExpiresAt > new Date() ? user.planExpiresAt : new Date();
      user.planExpiresAt = new Date(baseDate.getTime() + durationMs);
    }

    await user.save();
    res.json({ user: formatUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.formatUser = formatUser;