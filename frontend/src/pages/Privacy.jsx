import React from "react";

const Privacy = () => {
  return (
    <main className="main privacy-page">

      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Chính Sách Bảo Mật</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><a href="/">Trang Chủ</a></li>
              <li className="current">Chính Sách Bảo Mật</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Privacy Section */}
      <section id="privacy" className="privacy section">
        <div className="container">

          {/* Header */}
          <div className="privacy-header">
            <div className="header-content">
              <div className="last-updated">Ngày Có Hiệu Lực: 27 Tháng 2, 2025</div>
              <h1>Chính Sách Bảo Mật</h1>
              <p>
                Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng, xử lý và tiết lộ thông tin của bạn,
                bao gồm thông tin cá nhân, liên quan đến việc bạn truy cập và sử dụng các dịch vụ của chúng tôi.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="privacy-content">

            <div className="content-section">
              <h2>1. Giới Thiệu</h2>
              <p>
                Khi bạn sử dụng các dịch vụ của chúng tôi, bạn đang tin tưởng chúng tôi với thông tin của bạn. 
                Chúng tôi làm việc chăm chỉ để bảo vệ thông tin của bạn và đặt bạn dưới sự kiểm soát.
              </p>
            </div>

            <div className="content-section">
              <h2>2. Thông Tin Chúng Tôi Thu Thập</h2>

              <h3>2.1 Thông Tin Bạn Cung Cấp</h3>
              <ul>
                <li>Tên và thông tin liên lạc</li>
                <li>Thông tin đăng nhập tài khoản</li>
                <li>Thông tin thanh toán</li>
                <li>Tùy chọn giao tiếp</li>
              </ul>

              <h3>2.2 Thông Tin Tự Động</h3>
              <ul>
                <li>Thông tin thiết bị</li>
                <li>Thông tin nhật ký và sử dụng</li>
                <li>Vị trí nếu được bật</li>
                <li>Loại và cài đặt trình duyệt</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>3. Cách Chúng Tôi Sử Dụng Thông Tin Của Bạn</h2>
              <ul>
                <li>Cung cấp và cá nhân hóa dịch vụ</li>
                <li>Xử lý giao dịch</li>
                <li>Gửi cập nhật</li>
                <li>Duy trì bảo mật</li>
                <li>Phân tích và cải thiện dịch vụ</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>4. Chia Sẻ & Tiết Lộ</h2>
              <h3>4.1 Với Sự Đồng Ý Của Bạn</h3>
              <p>Chúng tôi chỉ chia sẻ thông tin với sự cho phép của bạn.</p>
              <h3>4.2 Vì Lý Do Pháp Lý</h3>
              <p>Chúng tôi có thể chia sẻ thông tin để tuân thủ luật pháp hoặc bảo vệ người dùng.</p>
            </div>

            <div className="content-section">
              <h2>5. Bảo Mật Dữ Liệu</h2>
              <ul>
                <li>Chúng tôi mã hóa dịch vụ bằng SSL</li>
                <li>Xem xét các hoạt động thu thập, lưu trữ và xử lý thông tin</li>
                <li>Hạn chế quyền truy cập vào thông tin cá nhân cho những nhân viên cần thiết</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>6. Quyền Và Lựa Chọn Của Bạn</h2>
              <ul>
                <li>Quyền truy cập thông tin cá nhân</li>
                <li>Quyền sửa đổi thông tin không chính xác</li>
                <li>Quyền yêu cầu xóa</li>
                <li>Quyền hạn chế hoặc phản đối xử lý</li>
              </ul>
            </div>

            <div className="content-section">
              <h2>7. Thay Đổi Chính Sách Này</h2>
              <p>
                Chúng tôi có thể cập nhật Chính sách bảo mật này từ thời gian sang thời gian. 
                Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng Chính sách bảo mật mới trên trang này.
              </p>
              <p>
                Việc bạn tiếp tục sử dụng dịch vụ của chúng tôi sau bất kỳ thay đổi nào cấu thành sự chấp nhận của bạn.
              </p>
            </div>

          </div>

          {/* Contact Section */}
          <div className="privacy-contact">
            <h2>Liên Hệ Với Chúng Tôi</h2>
            <p>Nếu bạn có bất kỳ câu hỏi nào về Chính sách bảo mật này hoặc các hoạt động của chúng tôi, vui lòng liên hệ với chúng tôi:</p>
            <div className="contact-details">
              <p><strong>Email:</strong> hello@engspace.vn</p>
              <p><strong>Địa chỉ:</strong> EngSpace Learning Hub, Online toàn quốc</p>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
};

export default Privacy;
