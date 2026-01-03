const mongoose = require('mongoose');

// 1. Schema BÀI HỌC (Đã nâng cấp)
const lessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    
    // 👇 Đã thêm 'game' vào danh sách enum ở đây
    type: { type: String, enum: ['video', 'text', 'quiz', 'game'], default: 'video' },
    
    // 👇 QUAN TRỌNG: Chứa Link Video hoặc Nội dung văn bản
    content: { type: String }, 
    
    time: { type: String }, // VD: "10:30"
    
    // 👇 QUAN TRỌNG: Cho phép xem thử miễn phí không?
    isPreview: { type: Boolean, default: false }, 
  }
  // ⚠️ Đã bỏ { _id: false } để Mongoose tự tạo ID duy nhất cho mỗi bài học
);

// 2. Schema CHƯƠNG HỌC
const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    meta: { type: String }, // VD: "3 bài học • 45 phút"
    lessons: [lessonSchema],
  }
);

const skillSchema = new mongoose.Schema(
  {
    title: String,
    details: String,
    icon: String,
  },
  { _id: false }
);

const highlightSchema = new mongoose.Schema(
  {
    icon: String,
    label: String,
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    avatar: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    date: String,
    text: String,
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    longDescription: { type: String },
    summary: { type: String },
    price: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    category: { type: String, default: 'General' },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String },
    previewVideo: { type: String },
    studentsCount: { type: Number, default: 0 },
    durationHours: { type: Number, default: 0 },
    skills: [skillSchema],
    requirements: [String],
    
    // 👇 Curriculum chứa danh sách Module -> Lesson
    curriculum: [moduleSchema],
    
    highlights: [highlightSchema],
    details: {
      type: Map,
      of: String,
      default: {},
    },
    availableInPlans: [{ type: String, enum: ['plus', 'business', 'enterprise'] }],
    allowIndividualPurchase: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    reviewCount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);