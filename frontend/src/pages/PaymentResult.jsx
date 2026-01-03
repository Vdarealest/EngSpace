import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import API from "../api";
import { useAuth } from "../context/AuthContext";

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth(); // Thêm để refresh profile sau thanh toán
  const [status, setStatus] = useState("checking"); // checking | success | failed

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Lấy tất cả tham số trên URL (?vnp_Amount=...) gửi về Backend check
        const params = Object.fromEntries([...searchParams]);
        
        const { data } = await API.get('/payments/vnpay_return', { params });
        
        if (data.status === 'success') {
            setStatus("success");
            // ✅ QUAN TRỌNG: Refresh profile để lấy thông tin plan mới
            try {
              await refreshProfile();
            } catch (err) {
              console.error('Refresh profile error:', err);
            }
            // Tự động chuyển về trang khóa học sau 4s
            setTimeout(() => navigate("/account?tab=courses"), 4000);
        } else {
            setStatus("failed");
        }
      } catch (error) {
        console.error(error);
        setStatus("failed");
      }
    };

    // Chỉ chạy khi có tham số vnp_ResponseCode (tức là từ VNPay trả về)
    if (searchParams.get('vnp_ResponseCode')) {
        verifyPayment();
    } else {
        // Nếu ai đó tự mò vào trang này mà ko có mã giao dịch -> Đá về trang chủ
        navigate("/");
    }
  }, [searchParams, navigate]);

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center py-5" style={{minHeight: '60vh'}}>
      
      {/* TRẠNG THÁI: ĐANG KIỂM TRA */}
      {status === "checking" && (
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status"></div>
            <h3 className="fw-bold">Đang xác thực giao dịch...</h3>
            <p className="text-muted">Vui lòng không tắt trình duyệt.</p>
          </div>
      )}

      {/* TRẠNG THÁI: THÀNH CÔNG */}
      {status === "success" && (
        <div className="text-center text-success animate__animated animate__fadeIn">
          <i className="bi bi-check-circle-fill display-1 text-success"></i>
          <h2 className="mt-3 fw-bold">Thanh toán thành công!</h2>
          <p className="lead text-dark">Giao dịch đã được ghi nhận. Hệ thống đang kích hoạt khóa học cho bạn.</p>
          <p className="small text-muted">Tự động chuyển hướng trong giây lát...</p>
          <Link to="/account?tab=courses" className="btn btn-success mt-3 px-4 rounded-pill">
            Vào học ngay <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      )}

      {/* TRẠNG THÁI: THẤT BẠI */}
      {status === "failed" && (
        <div className="text-center animate__animated animate__fadeIn">
          <i className="bi bi-x-circle-fill display-1 text-danger"></i>
          <h2 className="mt-3 fw-bold text-danger">Thanh toán thất bại</h2>
          <p className="lead text-muted">Giao dịch bị hủy hoặc có lỗi xảy ra trong quá trình xử lý.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Link to="/" className="btn btn-outline-secondary px-4 rounded-pill">
              Về trang chủ
            </Link>
            <Link to="/courses" className="btn btn-primary px-4 rounded-pill">
              Thử lại
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}