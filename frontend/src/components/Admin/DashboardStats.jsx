import React from "react";
import Sparkline from "../Common/Sparkline";

// Helper format tiền
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

// Helper lấy chữ cái đầu làm Avatar
const getAvatarLabel = (name) => name.split(" ").pop().charAt(0).toUpperCase();

// Helper màu sắc cho Badge trạng thái
const getStatusBadge = (status) => {
  switch (status) {
    case "Mới": return "bg-primary-subtle text-primary";
    case "Đang xử lý": return "bg-warning-subtle text-warning";
    case "Đã phản hồi": return "bg-success-subtle text-success";
    default: return "bg-secondary-subtle text-secondary";
  }
};

const PLACEHOLDER_REVENUE_SERIES = [320, 410, 380, 450, 520, 610, 680];
const TOP_PLANS = [
  { label: "Plus", value: 48, color: "bg-primary" },
  { label: "Business", value: 32, color: "bg-info" },
  { label: "Enterprise", value: 20, color: "bg-warning" },
];
const SAMPLE_CONTACTS = [
  { name: "Minh Anh", subject: "Cần tư vấn gói Business", status: "Mới" },
  { name: "Thanh Tùng", subject: "Hỗ trợ truy cập khóa học", status: "Đang xử lý" },
  { name: "Lan Hương", subject: "Đề xuất nội dung mới", status: "Đã phản hồi" },
];
const QUICK_ACTIONS = [
  { title: "Tạo khóa học", icon: "bi-plus-lg", color: "text-primary", bg: "bg-primary-subtle" },
  { title: "Tạo quiz", icon: "bi-lightning-charge", color: "text-warning", bg: "bg-warning-subtle" },
  { title: "Bài blog mới", icon: "bi-pencil-square", color: "text-info", bg: "bg-info-subtle" },
  { title: "Xuất báo cáo", icon: "bi-filetype-pdf", color: "text-danger", bg: "bg-danger-subtle" },
];

export default function DashboardStats({ summary, loading, onExport }) {
  const revenueTotal = summary.revenue?.total || 0;
  const revenueTimeline = summary.revenue?.timeline || [];
  
  let chartPoints =
    revenueTimeline.length > 0
      ? revenueTimeline.map((entry) => entry.total)
      : PLACEHOLDER_REVENUE_SERIES;

  // Logic lấp đầy dữ liệu để biểu đồ không bị dẹt
  if (revenueTimeline.length > 0) {
    while (chartPoints.length < 7) {
      chartPoints.unshift(0); 
    }
  }

  return (
    <>
      <section className="row g-4 mb-4">
        {/* Card Doanh Thu */}
        <div className="col-lg-8" data-aos="fade-up">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-4 px-4">
              <div>
                <p className="text-muted text-uppercase fw-bold small mb-1">Tổng doanh thu</p>
                <div className="d-flex align-items-baseline gap-2">
                  <h2 className="mb-0 fw-bold text-dark">
                    {loading ? "Đang tải..." : formatCurrency(revenueTotal)}
                  </h2>
                  {!loading && (
                    <span className="badge bg-success-subtle text-success rounded-pill">
                      <i className="bi bi-arrow-up-short"></i> +12.5%
                    </span>
                  )}
                </div>
              </div>
              <button className="btn btn-light btn-sm text-muted" onClick={() => onExport("pdf")}>
                <i className="bi bi-download me-2"></i> Xuất PDF
              </button>
            </div>
            
            <div className="card-body px-0 pb-0">
              <div className="px-2" style={{ height: "180px" }}>
                {/* Truyền thêm props height/style vào Sparkline nếu cần */}
                <Sparkline points={chartPoints} />
              </div>
            </div>

            <div className="card-footer bg-white border-top-0 px-4 pb-4">
              <div className="row g-3">
                {TOP_PLANS.map((plan) => (
                  <div className="col-4" key={plan.label}>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-muted small fw-medium">{plan.label}</span>
                      <span className="fw-bold small">{plan.value}%</span>
                    </div>
                    <div className="progress" style={{ height: "6px" }}>
                      <div
                        className={`progress-bar ${plan.color}`}
                        role="progressbar"
                        style={{ width: `${plan.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card Liên Hệ */}
        <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center pt-4 px-4">
              <div>
                <p className="text-muted text-uppercase fw-bold small mb-1">Hỗ trợ</p>
                <h5 className="mb-0 fw-bold text-dark">Yêu cầu mới</h5>
              </div>
              <span className="badge bg-danger rounded-pill">{summary.pendingContacts || 0}</span>
            </div>
            
            <div className="card-body px-3">
              <div className="list-group list-group-flush">
                {SAMPLE_CONTACTS.map((contact, index) => (
                  <div className="list-group-item border-0 px-2 py-3 d-flex gap-3 align-items-center" key={index}>
                    <div className="avatar-circle flex-shrink-0 bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center rounded-circle" style={{width: '40px', height: '40px'}}>
                      {getAvatarLabel(contact.name)}
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 text-truncate font-weight-bold">{contact.name}</h6>
                        <span className={`badge rounded-pill fw-normal ${getStatusBadge(contact.status)}`} style={{fontSize: '0.7rem'}}>
                          {contact.status}
                        </span>
                      </div>
                      <p className="mb-0 text-muted small text-truncate">{contact.subject}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card-footer bg-white border-0 text-center pb-3">
              <button className="btn btn-link text-decoration-none text-primary btn-sm fw-bold">
                Xem tất cả tin nhắn <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-4" data-aos="fade-up" data-aos-delay="200">
        <h5 className="mb-3 fw-bold text-secondary">Truy cập nhanh</h5>
        <div className="row g-3">
          {QUICK_ACTIONS.map((action, index) => (
            <div className="col-md-3 col-6" key={index}>
              <div className="card shadow-sm border-0 h-100 action-card cursor-pointer" style={{transition: 'all 0.3s'}}>
                <div className="card-body d-flex flex-column align-items-center text-center p-4">
                  <div className={`icon-box mb-3 rounded-circle d-flex align-items-center justify-content-center ${action.bg} ${action.color}`} style={{width: '50px', height: '50px', fontSize: '1.5rem'}}>
                    <i className={`bi ${action.icon}`}></i>
                  </div>
                  <h6 className="card-title mb-0 fw-bold text-dark">{action.title}</h6>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}