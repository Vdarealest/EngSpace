import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
// Import API instance
import API from "../api";
import { useAuth } from "../context/AuthContext";

const PLAN_PRICING = {
  plus: {
    name: "EngSpace Plus",
    badge: "Most loved",
    monthly: { price: 290000, durationLabel: "1 tháng", savings: null },
    yearly: { price: 2990000, durationLabel: "12 tháng", savings: "Tiết kiệm 15%" },
  },
  business: {
    name: "EngSpace Business",
    badge: "Đội nhóm",
    monthly: { price: 590000, durationLabel: "1 tháng" },
    yearly: { price: 5990000, durationLabel: "12 tháng", savings: "Tiết kiệm 20%" },
  },
  enterprise: {
    name: "EngSpace Enterprise",
    badge: "Toàn bộ thư viện",
    monthly: { price: 1250000, durationLabel: "1 tháng" },
    yearly: { price: 12990000, durationLabel: "12 tháng", savings: "Ưu đãi 25%" },
  },
};

const PAYMENT_METHODS = [
  { id: "bank", label: "Chuyển khoản VietQR", icon: "bi bi-qr-code-scan" },
  { id: "vnpay", label: "Ví VNPAY / Thẻ ATM", icon: "bi bi-credit-card-2-front" },
];

export default function PlanCheckout() {
  const { plan: planParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState(null);
  
  // State cho luồng thanh toán
  const [paymentStep, setPaymentStep] = useState(1);
  const [paymentData, setPaymentData] = useState(null);
  const [qrImageLoaded, setQrImageLoaded] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    company: "",
    paymentMethod: "bank",
    notes: "",
  });

  const planKey = planParam || "plus";
  const billingCycle = searchParams.get("cycle") === "yearly" ? "yearly" : "monthly";
  const plan = PLAN_PRICING[planKey];

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

  const formattedPrice = useMemo(() => {
    if (!plan) return { raw: 0, label: "0 đ" };
    const value = plan[billingCycle]?.price || 0;
    return {
      raw: value,
      label: value.toLocaleString("vi-VN") + " đ",
    };
  }, [plan, billingCycle]);

  if (!user) return <Navigate to="/enroll" replace />;
  
  if (!plan) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center py-5">
            <p>Không tìm thấy gói học bạn chọn.</p>
            <Link className="btn btn-primary mt-3" to="/pricing">Quay lại bảng giá</Link>
          </div>
        </section>
      </main>
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- BƯỚC 1: TẠO ĐƠN HÀNG ---
  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setStatus(null);
    setProcessing(true);

    try {
        // ==> 1. THANH TOÁN VNPAY
        if (formData.paymentMethod === 'vnpay') {
            const { data } = await API.post('/payments/create_vnpay', {
                plan: planKey,
                billingCycle,
                amount: formattedPrice.raw,
                orderInfo: `Thanh toan goi ${plan.name} (${billingCycle})`,
                bankCode: "NCB"
            });
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            }
        } 
        // ==> 2. THANH TOÁN VIETQR
        else {
            const { data } = await API.post('/payments/create', {
                plan: planKey,
                billingCycle,
                amount: formattedPrice.raw,
            });
            setPaymentData(data);
            setPaymentStep(2); // Chuyển sang hiện QR
        }
    } catch (error) {
      const message = error.response?.data?.message || "Không thể tạo đơn hàng. Vui lòng thử lại.";
      setStatus({ type: "error", message });
    } finally {
        if (formData.paymentMethod !== 'vnpay') setProcessing(false);
    }
  };

  // --- BƯỚC 2: XÁC NHẬN CHUYỂN KHOẢN (VIETQR) ---
  const handleConfirmPayment = async () => {
    setProcessing(true);
    try {
        const { data } = await API.post('/payments/confirm', { paymentId: paymentData.paymentId });
        
        // ✅ QUAN TRỌNG: Refresh profile để lấy thông tin plan mới
        try {
          await refreshProfile();
        } catch (err) {
          console.error('Refresh profile error:', err);
        }
        
        setStatus({
            type: "success",
            message: "Thanh toán thành công! Gói học đã được kích hoạt."
        });
        setTimeout(() => {
            navigate("/account?tab=courses");
        }, 2000);
    } catch (error) {
        setStatus({ type: "error", message: "Xác nhận thất bại. Vui lòng thử lại." });
    } finally {
        setProcessing(false);
    }
  };

  return (
    <main className="main checkout-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Thanh toán gói {plan.name}</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li className="current">Checkout</li>
            </ol>
          </nav>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
            
            {/* --- CỘT TRÁI: FORM & QR --- */}
            <div className="col-lg-7">
              <div className="card shadow-sm h-100">
                <div className="card-body p-4">
                  
                  {paymentStep === 1 ? (
                    // FORM NHẬP THÔNG TIN
                    <>
                        <h3 className="h5 mb-4">Thông tin thanh toán</h3>
                        {status && (
                            <div className={`alert ${status.type === "success" ? "alert-success" : "alert-danger"}`}>
                            {status.message}
                            </div>
                        )}

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
                                <label className="form-label">Công ty (tuỳ chọn)</label>
                                <input type="text" className="form-control" name="company" value={formData.company} onChange={handleChange} placeholder="Tên tổ chức / nhóm" />
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Phương thức thanh toán</label>
                                <div className="row g-3">
                                    {PAYMENT_METHODS.map((method) => (
                                    <div className="col-md-6" key={method.id}>
                                        <label className={`payment-option ${formData.paymentMethod === method.id ? "active" : ""}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value={method.id}
                                            checked={formData.paymentMethod === method.id}
                                            onChange={handleChange}
                                        />
                                        <i className={`${method.icon} fs-4 me-2`}></i>
                                        <span>{method.label}</span>
                                        </label>
                                    </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Ghi chú</label>
                                <textarea className="form-control" rows="2" name="notes" value={formData.notes} onChange={handleChange} placeholder="Ví dụ: xuất hoá đơn VAT..."></textarea>
                            </div>

                            <button type="submit" className="btn btn-primary w-100 py-3" disabled={processing}>
                                {processing ? "Đang xử lý..." : `Thanh toán ${formattedPrice.label}`}
                            </button>
                        </form>
                    </>
                  ) : (
                    // MÃ QR THANH TOÁN
                    <div className="text-center animate__animated animate__fadeIn">
                        <h3 className="h5 mb-3 text-success"><i className="bi bi-check-circle-fill me-2"></i>Đơn hàng đã tạo!</h3>
                        <p className="text-muted mb-4">Vui lòng quét mã QR dưới đây để thanh toán gói <strong>{plan.name}</strong></p>
                        
                        <div className="qr-container bg-white p-3 rounded border mb-4 mx-auto position-relative" style={{maxWidth: '300px', minHeight: '300px'}}>
                            {!qrImageLoaded && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light z-1">
                                    <div className="spinner-border text-primary mb-2" role="status"></div>
                                    <small className="text-muted">Đang tải mã QR...</small>
                                </div>
                            )}
                            <img 
                                src={paymentData?.qrUrl} 
                                alt="VietQR" 
                                className="img-fluid"
                                onLoad={() => setQrImageLoaded(true)}
                                style={{ opacity: qrImageLoaded ? 1 : 0, transition: 'opacity 0.3s ease' }}
                            />
                        </div>

                        <div className="alert alert-warning text-start d-inline-block w-100" style={{maxWidth: '400px'}}>
                            <p className="mb-1"><strong>Ngân hàng:</strong> {paymentData?.bankInfo?.BANK_ID} - {paymentData?.bankInfo?.ACCOUNT_NAME}</p>
                            <p className="mb-1"><strong>Số tài khoản:</strong> {paymentData?.bankInfo?.ACCOUNT_NO}</p>
                            <p className="mb-1"><strong>Số tiền:</strong> {formattedPrice.label}</p>
                            <p className="mb-0"><strong>Nội dung:</strong> <span className="badge bg-danger text-white">{paymentData?.description}</span></p>
                        </div>

                        <div className="d-flex gap-2 mt-3 justify-content-center">
                            <button className="btn btn-outline-secondary" onClick={() => setPaymentStep(1)}>
                                Quay lại
                            </button>
                            <button className="btn btn-success fw-bold px-4" onClick={handleConfirmPayment} disabled={processing}>
                                {processing ? "Đang xử lý..." : "Tôi đã chuyển khoản xong"}
                            </button>
                        </div>
                        {status && <div className={`alert alert-${status.type === 'success' ? 'success' : 'danger'} mt-3`}>{status.message}</div>}
                    </div>
                  )}
                  
                </div>
              </div>
            </div>

            {/* --- CỘT PHẢI: TÓM TẮT --- */}
            <div className="col-lg-5">
              <div className="card shadow-sm sticky-top" style={{top: '100px'}}>
                <div className="card-body p-4">
                  <h3 className="h5 mb-4">Tóm tắt gói đăng ký</h3>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="badge bg-primary-subtle text-primary text-uppercase fw-bold p-2">{plan.badge}</div>
                    <span className="fw-bold fs-5">{plan.name}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                     <span className="text-muted">Chu kỳ:</span>
                     <span className="fw-bold">{plan[billingCycle].durationLabel}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 align-items-center">
                     <span className="text-muted">Giá:</span>
                     <div className="text-end">
                        <div className="display-6 fw-bold text-primary">{formattedPrice.label}</div>
                        {plan[billingCycle].savings && (
                            <small className="text-success fw-bold"><i className="bi bi-tag-fill me-1"></i>{plan[billingCycle].savings}</small>
                        )}
                     </div>
                  </div>
                  
                  <hr />
                  <ul className="list-unstyled text-muted small mb-0">
                    <li className="mb-2"><i className="bi bi-check-circle-fill me-2 text-success"></i>Truy cập không giới hạn thư viện</li>
                    <li className="mb-2"><i className="bi bi-check-circle-fill me-2 text-success"></i>Đồng bộ tiến độ học tập</li>
                    <li><i className="bi bi-check-circle-fill me-2 text-success"></i>Hỗ trợ ưu tiên 24/7</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}