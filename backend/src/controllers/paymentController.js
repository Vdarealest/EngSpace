const moment = require('moment');
const qs = require('qs');
const crypto = require('crypto');
const vnp_Config = require('../config/vnpay'); // Đảm bảo bạn đã tạo file này ở bước trước

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const User = require('../models/User');

// --- CẤU HÌNH ---
const MY_BANK = {
  BANK_ID: 'TIMO', 
  ACCOUNT_NO: '9021405432357', 
  ACCOUNT_NAME: 'TRAN GIA VY' 
};

const PLAN_PRICING = {
  plus: { monthly: { price: 290000, durationDays: 30 }, yearly: { price: 2990000, durationDays: 365 } },
  business: { monthly: { price: 590000, durationDays: 30 }, yearly: { price: 5990000, durationDays: 365 } },
  enterprise: { monthly: { price: 1250000, durationDays: 30 }, yearly: { price: 12990000, durationDays: 365 } },
};

const DAY_MS = 24 * 60 * 60 * 1000;

// --- HELPER FUNCTIONS ---

// 1. Format User trả về frontend
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  plan: user.plan,
  planExpiresAt: user.planExpiresAt,
});

// 2. Sắp xếp tham số cho VNPay (Bắt buộc)
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) str.push(encodeURIComponent(key));
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// 3. Hàm kích hoạt dịch vụ (Dùng chung cho cả VietQR và VNPay khi thanh toán thành công)
const activateService = async (payment) => {
  console.log(">>> ĐANG KÍCH HOẠT DỊCH VỤ:", {
        User: payment.user,
        Type: payment.type,       // Quan trọng: Nó có phải là 'plan' không?
        PlanName: payment.plan,   // Quan trọng: Nó có là 'plus'/'business' không?
        Billing: payment.billingCycle
    });
    const user = await User.findById(payment.user);
    if (!user) return null;

    // Kích hoạt khóa học
    if (payment.type === 'course' && payment.course) {
        const exists = await Enrollment.findOne({ student: user._id, course: payment.course });
        if (!exists) {
            await Enrollment.create({
                student: user._id,
                course: payment.course,
                pricePaid: payment.amount,
                paymentMethod: payment.method,
                status: 'active',
            });
            await Course.findByIdAndUpdate(payment.course, { $inc: { studentsCount: 1 } });
        }
    }

    // Kích hoạt gói Plan
    if (payment.type === 'plan' && payment.plan) {
        const planConfig = PLAN_PRICING[payment.plan]?.[payment.billingCycle];
        if (planConfig) {
            const now = new Date();
            const baseDate = user.plan === payment.plan && user.planExpiresAt && user.planExpiresAt > now 
                ? user.planExpiresAt 
                : now;
            
            user.plan = payment.plan;
            user.planExpiresAt = new Date(baseDate.getTime() + planConfig.durationDays * DAY_MS);
            await user.save();
        }
    }
    return user;
};

// --- CONTROLLERS ---

// A. PHẦN VIETQR (GIỮ NGUYÊN LOGIC CŨ CỦA BẠN)
// backend/src/controllers/paymentController.js

exports.createPaymentUrl = async (req, res) => {
  try {
    const { courseId, plan, billingCycle = 'monthly' } = req.body;
    let amount = 0;
    let orderDescription = '';
    let type = '';
    
    // Xử lý plan chữ thường để tránh lỗi enum (giống bên VNPay)
    const planKey = plan ? plan.toLowerCase() : null;

    if (courseId) {
      const course = await Course.findById(courseId);
      if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học' });
      
      const exists = await Enrollment.findOne({ student: req.user._id, course: course._id });
      if (exists) return res.status(400).json({ message: 'Bạn đã sở hữu khóa học này rồi.' });
      
      amount = course.price || 0;
      orderDescription = `COURSE ${course.slug ? course.slug.slice(0, 5) : 'CODE'}`;
      type = 'course';
    } else if (planKey) {
      const pricing = PLAN_PRICING[planKey]?.[billingCycle];
      if (!pricing) return res.status(400).json({ message: 'Gói không hợp lệ' });
      amount = pricing.price;
      orderDescription = `PLAN ${planKey.toUpperCase()}`;
      type = 'plan';
    } else {
      return res.status(400).json({ message: 'Thiếu thông tin mua hàng' });
    }

    // Tạo mã đơn hàng
    const orderCode = `${Date.now().toString().slice(-6)}`; 
    const finalDescription = `${orderDescription} ${orderCode}`; 

    const payment = await Payment.create({
      user: req.user._id,
      type,
      course: courseId || undefined,
      plan: planKey || undefined, // Lưu chữ thường
      billingCycle: plan ? billingCycle : undefined,
      amount,
      orderCode: orderCode, 
      status: 'pending',
      method: 'bank_transfer', // Hoặc 'vietqr' tùy bạn
      notes: orderCode,
      metadata: { orderCode }
    });

    const qrUrl = `https://img.vietqr.io/image/${MY_BANK.BANK_ID}-${MY_BANK.ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(finalDescription)}&accountName=${encodeURIComponent(MY_BANK.ACCOUNT_NAME)}`;

    res.json({
      success: true,
      paymentId: payment._id,
      qrUrl,
      amount,
      bankInfo: MY_BANK,
      description: finalDescription
    });

  } catch (err) {
    console.error("VietQR Error:", err); // Xem log này nếu vẫn lỗi
    res.status(500).json({ message: 'Lỗi tạo mã VietQR: ' + err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  const { paymentId } = req.body;
  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    if (payment.status === 'paid') return res.status(400).json({ message: "Đơn hàng đã được thanh toán" });

    payment.status = 'paid';
    await payment.save();

    // Gọi hàm kích hoạt chung
    const updatedUser = await activateService(payment);

    res.json({ success: true, message: "Kích hoạt thành công!", user: formatUser(updatedUser) });
  } catch (err) {
    console.error("Confirm Error:", err);
    res.status(500).json({ message: "Lỗi xác nhận thanh toán" });
  }
};

// B. PHẦN VNPAY (MỚI TÍCH HỢP)
exports.createVNPayUrl = async (req, res) => {
  try {
    const { courseId, plan, billingCycle = 'monthly', bankCode } = req.body;
    let amount = 0;
    let orderInfo = '';
    let type = '';

    // Logic tính tiền (giống VietQR)
    if (courseId) {
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học' });
        amount = course.price || 0;
        orderInfo = `Thanh toan khoa hoc ${course.slug}`;
        type = 'course';
    } else if (plan) {
       const planKey = plan.toLowerCase(); 
       const pricing = PLAN_PRICING[planKey]?.[billingCycle]; 
       
       if (!pricing) return res.status(400).json({ message: 'Gói không hợp lệ' });
       amount = pricing.price;
       orderInfo = `Thanh toan goi ${planKey}`;
       type = 'plan';
    } else {
        return res.status(400).json({ message: 'Thiếu thông tin mua hàng' });
    }

    let ipAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    const orderId = moment(new Date()).format('DDHHmmss');
    
    // Lưu đơn hàng (Pending)
    await Payment.create({
      user: req.user._id,
      type,
      course: courseId || undefined,
      
      plan: plan ? plan.toLowerCase() : undefined, 
      
      billingCycle: plan ? billingCycle : undefined,
      amount: amount,
      orderCode: orderId, 
      status: 'pending',
      method: 'vnpay',
      notes: orderInfo
    });

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = vnp_Config.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = vnp_Config.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = moment(new Date()).format('YYYYMMDDHHmmss');

    if (bankCode) vnp_Params['vnp_BankCode'] = bankCode;

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_Config.vnp_HashSecret);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    
    const paymentUrl = vnp_Config.vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

    res.json({ paymentUrl });

  } catch (err) {
    console.error("VNPay Create Error:", err);
    res.status(500).json({ message: 'Lỗi tạo link VNPay' });
  }
};

exports.vnpayReturn = async (req, res) => {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];
    const orderCode = vnp_Params['vnp_TxnRef'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnp_Config.vnp_HashSecret);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        if (vnp_Params['vnp_ResponseCode'] === '00') {
            const payment = await Payment.findOne({ orderCode: orderCode });
            
            if (!payment) {
                return res.json({ status: 'error', message: 'Order not found' });
            }

            if (payment.status === 'pending') {
                payment.status = 'paid';
                payment.transactionDate = new Date();
                await payment.save();
                
                // Kích hoạt dịch vụ
                await activateService(payment);
            }

            res.json({ status: 'success', message: 'Giao dịch thành công', code: '00' });
        } else {
            res.json({ status: 'error', message: 'Giao dịch thất bại', code: '97' });
        }
    } else {
        res.json({ status: 'error', message: 'Sai chữ ký bảo mật', code: '97' });
    }
};

// C. LỊCH SỬ THANH TOÁN
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(payments);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unable to fetch payments' });
  }
};

// Alias cho các route cũ (nếu còn dùng)
exports.purchaseCourse = exports.createPaymentUrl; 
exports.purchasePlan = exports.createPaymentUrl;