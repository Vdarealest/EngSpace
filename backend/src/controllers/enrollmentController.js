const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.enroll = async (req, res) => {
  const { courseId, pricePaid = 0, paymentMethod } = req.body;
  const studentId = req.user._id;

  // prevent duplicate
  const exists = await Enrollment.findOne({ student: studentId, course: courseId });
  if (exists) return res.status(400).json({ message: 'Already enrolled' });

  const enrollment = new Enrollment({ student: studentId, course: courseId, pricePaid, paymentMethod, status: 'active' });
  await enrollment.save();

  // increment studentsCount
  await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });

  res.status(201).json(enrollment);
};

exports.listMy = async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id }).populate('course');
  res.json(enrollments);
};

// Check enrollment cho 1 course cụ thể - nhanh hơn
exports.checkEnrollment = async (req, res) => {
  try {
    const { courseId, courseSlug } = req.query;
    if (!courseId && !courseSlug) {
      return res.status(400).json({ message: 'Missing courseId or courseSlug' });
    }

    // Tìm course trước nếu có slug
    let course = null;
    if (courseSlug) {
      course = await Course.findOne({ slug: courseSlug }).select('_id');
      if (!course) {
        return res.json({ enrolled: false });
      }
    }

    const targetCourseId = courseId || course?._id;
    if (!targetCourseId) {
      return res.json({ enrolled: false });
    }

    // Chỉ check enrollment, không populate - nhanh hơn nhiều
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: targetCourseId,
      status: { $in: ['active', 'pending'] }
    }).select('_id status');

    res.json({ enrolled: !!enrollment, status: enrollment?.status });
  } catch (err) {
    console.error('Check enrollment error:', err);
    res.status(500).json({ message: err.message });
  }
};