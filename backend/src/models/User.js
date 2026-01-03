const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const PLAN_TYPES = ['free', 'plus', 'business', 'enterprise'];

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['student','instructor','admin'], default: 'student' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  
  // --- THAY ĐỔI 1: Password trở thành điều kiện ---
  password: { 
    type: String, 
    // Logic: Nếu KHÔNG có googleId (đăng nhập thường) thì BẮT BUỘC phải có password
    // Nếu CÓ googleId (đăng nhập Google) thì password được phép để trống
    required: function() {
      return !this.googleId; 
    }
  },

  // --- THAY ĐỔI 2: Thêm trường googleId ---
  googleId: {
    type: String,
    unique: true, // Không được trùng nhau
    sparse: true  // Quan trọng: Cho phép nhiều user có giá trị null (với user thường)
  },

  avatar: { type: String },
  bio: { type: String },
  plan: { type: String, enum: PLAN_TYPES, default: 'free' },
  planExpiresAt: { type: Date },
}, { timestamps: true });

// hash password
userSchema.pre('save', async function(next) {
  // --- THAY ĐỔI 3: Thêm điều kiện !this.password ---
  // Nếu không sửa password HOẶC password không tồn tại (user Google) thì bỏ qua
  if (!this.isModified('password') || !this.password) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(plain) {
  // Nếu user này không có password (là user Google), trả về false ngay
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.statics.PLAN_TYPES = PLAN_TYPES;

module.exports = mongoose.model('User', userSchema);