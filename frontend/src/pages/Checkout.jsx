import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
// Import API instance để gọi các endpoint payments mới
import API, { getCourseById, getCourseDetails, getImageUrl } from "../api";
import { useAuth } from "../context/AuthContext";

// Cấu hình phương thức thanh toán, ưu tiên Chuyển khoản
const defaultPaymentMethods = [
  { id: "bank", label: "Chuyển khoản VietQR", icon: "bi bi-qr-code-scan" },
  { id: "vnpay", label: "Thẻ ATM / VNPay", icon: "bi bi-credit-card" },
];

export default function Checkout() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const locationState = location.state || {};
  
  // Logic lấy thông tin course (giữ nguyên của bạn)
  const preloadedCourse = locationState.course || null;
  const fallbackCourseId = locationState.courseId || preloadedCourse?._id || searchParams.get("courseId");
  const fallbackCourseSlug = locationState.courseSlug || preloadedCourse?.slug || null;
  const courseSlug = slug || searchParams.get("slug") || fallbackCourseSlug || null;
  const courseId = fallbackCourseId || null;

  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  
  const [course, setCourse] = useState(preloadedCourse);
  const [loading, setLoading] = useState(!preloadedCourse);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);

  // State mới cho phần thanh toán QR
  const [paymentStep, setPaymentStep] = useState(1); // 1: Điền thông tin, 2: Quét mã QR
  const [paymentData, setPaymentData] = useState(null); // Dữ liệu QR từ backend trả về

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    paymentMethod: "bank", // Mặc định là Bank
    notes: "",
  });

  useEffect(() => {
    AOS.init({ duration: 600, once: true });
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Logic fetch course (giữ nguyên của bạn)
  useEffect(() => {
    let ignore = false;
    if (!courseSlug && !courseId) {
      setLoading(false);
      setError("Không tìm thấy thông tin khóa học để thanh toán.");
      return () => { ignore = true; };
    }
    // ... (Giữ nguyên logic fetchCourse phức tạp của bạn để đảm bảo không bị lỗi)
    const slugLooksLikeObjectId = Boolean(courseSlug && /^[0-9a-fA-F]{24}$/.test(courseSlug));
    const fetchCourse = async () => {
      setLoading(true); setError(null);
      const attempts = [];
      if (courseSlug) attempts.push(() => getCourseDetails(courseSlug));
      if (courseId) attempts.push(() => getCourseById(courseId));
      else if (courseSlug && slugLooksLikeObjectId) attempts.push(() => getCourseById(courseSlug));

      if (!attempts.length) {
        if (!ignore) { setCourse(null); setError("Không tìm thấy thông tin khóa học."); setLoading(false); }
        return;
      }

      for (const attempt of attempts) {
        try {
          const res = await attempt();
          if (!ignore) { setCourse(res.data); setError(null); }
          return;
        } catch (err) {}
      }
      if (!ignore) { setCourse(null); setError("Không tải được thông tin khóa học."); }
    };
    fetchCourse().finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [courseSlug, courseId]);

  if (authLoading) return <div className="text-center py-5">Checking auth...</div>;
  if (!user) return <Navigate to="/enroll" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // BƯỚC 1: TẠO ĐƠN HÀNG & LẤY MÃ QR
  const handleCreateOrder = async (event) => {
    event.preventDefault();
    if (!course?._id) return;
    
    setProcessing(true);
    setStatus(null);

    try {
      if (formData.paymentMethod === 'vnpay') {
        // --- XỬ LÝ VNPAY ---
        const { data } = await API.post('/payments/create_vnpay', {
            courseId: course._id, // Thêm courseId để backend tìm course và tạo payment record
            amount: course.price,
            orderInfo: `Thanh toan khoa hoc ${course.title}`,
            bankCode: "NCB" // Ngân hàng test mặc định
        });
        
        // Backend trả về link -> Frontend tự chuyển hướng sang VNPay
        if (data.paymentUrl) {
            window.location.href = data.paymentUrl;
        }
      } else {
        // --- XỬ LÝ VIETQR (Code cũ giữ nguyên) ---
        const { data } = await API.post('/payments/create', {
            courseId: course._id,
            amount: course.price,
            plan: null
        });
        setPaymentData(data);
        setPaymentStep(2);
      }
      
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Lỗi tạo thanh toán. Vui lòng thử lại." });
    } finally {
      // Nếu là VNPay thì không tắt processing để nó redirect
      if (formData.paymentMethod !== 'vnpay') {
          setProcessing(false);
      }
    }
  };

  // BƯỚC 2: XÁC NHẬN ĐÃ CHUYỂN KHOẢN
  const handleConfirmPayment = async () => {
    setProcessing(true);
    try {
        const { data } = await API.post('/payments/confirm', { paymentId: paymentData.paymentId });
        
        // ✅ QUAN TRỌNG: Refresh profile để lấy thông tin plan/enrollment mới
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Refresh profile error:', err);
        }
        
        setStatus({
            type: "success",
            message: "Thanh toán thành công! Đang chuyển hướng..."
        });
        
        // Chuyển hướng sau 2s
        setTimeout(() => {
            navigate("/account?tab=courses");
        }, 2000);

    } catch (error) {
        setStatus({ type: "error", message: error.response?.data?.message || "Xác nhận thất bại. Vui lòng thử lại." });
    } finally {
        setProcessing(false);
    }
  };

  const price = course?.price || 0;
  const formattedPrice = price === 0 ? "Miễn phí" : `${price.toLocaleString("vi-VN")} đ`;

  return (
    <main className="main checkout-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Thanh toán khóa học</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li className="current">Checkout</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-3">Đang tải thông tin...</p>
            </div>
          ) : !course ? (
            <div className="alert alert-warning">
              <p>{error || "Không tìm thấy khóa học."}</p>
              <Link to="/courses" className="alert-link">Quay lại danh sách</Link>
            </div>
          ) : (
            <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
              
              {/* --- CỘT TRÁI: FORM HOẶC QR --- */}
              <div className="col-lg-7">
                <div className="card shadow-sm h-100">
                  <div className="card-body p-4">
                    
                    {/* Render UI dựa theo Step */}
                    {paymentStep === 1 ? (
                        // STEP 1: ĐIỀN THÔNG TIN
                        <>
                            <h3 className="h5 mb-4">1. Thông tin thanh toán</h3>
                            {status && <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'}`}>{status.message}</div>}
                            
                            <form onSubmit={handleCreateOrder}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Họ và tên</label>
                                        <input type="text" className="form-control" name="fullName" value={formData.fullName} onChange={handleChange} required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Số điện thoại</label>
                                    <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleChange} placeholder="09xx..." required/>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Phương thức thanh toán</label>
                                    <div className="row g-3">
                                        {defaultPaymentMethods.map((method) => (
                                            <div className="col-md-6" key={method.id}>
                                                <label className={`payment-option ${formData.paymentMethod === method.id ? "active" : ""}`}>
                                                    <input type="radio" name="paymentMethod" value={method.id} checked={formData.paymentMethod === method.id} onChange={handleChange} />
                                                    <i className={`${method.icon} fs-4 me-2`}></i>
                                                    <span>{method.label}</span>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label">Ghi chú (tuỳ chọn)</label>
                                    <textarea className="form-control" rows="2" name="notes" value={formData.notes} onChange={handleChange}></textarea>
                                </div>

                                <button type="submit" className="btn btn-primary w-100 py-3 fw-bold" disabled={processing}>
                                    {processing ? "Đang tạo mã thanh toán..." : "Tiếp tục thanh toán"} <i className="bi bi-arrow-right ms-2"></i>
                                </button>
                            </form>
                        </>
                    ) : (
                        // STEP 2: QUÉT MÃ QR
                        <div className="text-center">
                            <h3 className="h5 mb-3 text-success"><i className="bi bi-check-circle-fill me-2"></i>Đơn hàng đã được tạo!</h3>
                            <p className="text-muted mb-4">Vui lòng mở App Ngân hàng và quét mã QR bên dưới để thanh toán.</p>
                            
                            <div className="qr-container bg-light p-3 rounded d-inline-block border mb-4 position-relative">
                                <img 
                                    src={paymentData?.qrUrl} 
                                    alt="VietQR" 
                                    className="img-fluid" 
                                    style={{maxWidth: '250px'}}
                                />
                                {processing && (
                                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center">
                                        <div className="spinner-border text-primary" role="status"></div>
                                    </div>
                                )}
                            </div>

                            <div className="alert alert-warning text-start d-inline-block w-100" style={{maxWidth: '400px'}}>
                                <p className="mb-1"><strong>Ngân hàng:</strong> {paymentData?.bankInfo?.BANK_ID} - {paymentData?.bankInfo?.ACCOUNT_NAME}</p>
                                <p className="mb-1"><strong>Số tài khoản:</strong> {paymentData?.bankInfo?.ACCOUNT_NO}</p>
                                <p className="mb-1"><strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentData?.amount)}</p>
                                <p className="mb-0"><strong>Nội dung CK:</strong> <span className="badge bg-danger text-white fs-6">{paymentData?.description}</span></p>
                            </div>

                            <div className="d-flex gap-2 mt-3">
                                <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setPaymentStep(1)}>
                                    <i className="bi bi-arrow-left me-1"></i> Quay lại
                                </button>
                                <button className="btn btn-success flex-grow-1 py-2 fw-bold" onClick={handleConfirmPayment} disabled={processing}>
                                    {processing ? "Đang xử lý..." : "Tôi đã chuyển khoản xong"} <i className="bi bi-check-lg ms-1"></i>
                                </button>
                            </div>
                            {status && <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'} mt-3`}>{status.message}</div>}
                        </div>
                    )}

                  </div>
                </div>
              </div>

              {/* --- CỘT PHẢI: THÔNG TIN ĐƠN HÀNG --- */}
              <div className="col-lg-5">
                <div className="card shadow-sm sticky-top" style={{top: '100px'}}>
                  <div className="card-body p-4">
                    <h3 className="h5 mb-4">Tóm tắt đơn hàng</h3>
                    <div className="d-flex gap-3 align-items-center mb-3">
                      <img
                        src={getImageUrl(course.image) }
                        alt={course.title}
                        className="rounded"
                        style={{ width: 80, height: 80, objectFit: "cover" }}
                      />
                      <div>
                        <h6 className="mb-1 line-clamp-2">{course.title}</h6>
                        <small className="text-muted">{course.category || "General"}</small>
                      </div>
                    </div>

                    <hr />
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tạm tính</span>
                      <span>{formattedPrice}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Giảm giá</span>
                      <span>0 đ</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">Tổng cộng</span>
                      <strong className="fs-4 text-primary">{formattedPrice}</strong>
                    </div>

                    <div className="mt-4 pt-3 border-top">
                        <div className="d-flex align-items-start gap-2 text-muted small">
                            <i className="bi bi-shield-check fs-5 text-success"></i>
                            <div>
                                <strong>Thanh toán an toàn</strong>
                                <p className="mb-0">Thông tin được bảo mật và mã hóa SSL.</p>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </main>
  );
}