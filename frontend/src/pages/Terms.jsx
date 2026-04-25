import { Link } from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Terms() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const prohibitedActivities = [
    "Truy xuất dữ liệu hoặc nội dung một cách có hệ thống",
    "Xuất bản nội dung độc hại",
    "Tham gia vào khung không được phép",
    "Cố gắng truy cập không được phép",
  ];

  return (
    <main className="main terms-page">
      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Điều Khoản</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Trang Chủ</Link></li>
              <li className="current">Điều Khoản</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Terms of Service Section */}
      <section id="terms-of-service" className="terms-of-service section">
        <div className="container" data-aos="fade-up">
          {/* Header */}
          <div className="tos-header text-center" data-aos="fade-up">
            <span className="last-updated">Cập Nhật Lần Cuối: 27 Tháng 2, 2025</span>
            <h2>Điều Khoản Dịch Vụ</h2>
            <p>Vui lòng đọc kỹ những điều khoản dịch vụ này trước khi sử dụng dịch vụ của chúng tôi</p>
          </div>

          {/* Terms Content */}
          <div className="tos-content" data-aos="fade-up" data-aos-delay="200">
            {/* 1. Agreement */}
            <div id="agreement" className="content-section">
              <h3>1. Đồng Ý Với Điều Khoản</h3>
              <p>
                Bằng cách truy cập trang web và dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi những Điều khoản dịch vụ này
                và tất cả các luật pháp và quy định áp dụng. Nếu bạn không đồng ý với bất kỳ điều khoản nào,
                bạn bị cấm sử dụng hoặc truy cập dịch vụ của chúng tôi.
              </p>
              <div className="info-box">
                <i className="bi bi-info-circle"></i>
                <p>Những điều khoản này áp dụng cho tất cả người dùng, khách truy cập và những người khác truy cập hoặc sử dụng dịch vụ của chúng tôi.</p>
              </div>
            </div>

            {/* 2. Intellectual Property */}
            <div id="intellectual-property" className="content-section">
              <h3>2. Quyền Sở Hữu Trí Tuệ</h3>
              <p>
                Dịch vụ của chúng tôi và nội dung, tính năng và chức năng ban đầu của nó thuộc sở hữu của chúng tôi và
                được bảo vệ bởi luật bản quyền quốc tế, nhãn hiệu, bằng sáng chế, bí mật thương mại và các
                luật sở hữu trí tuệ khác.
              </p>
              <ul className="list-items">
                <li>Tất cả nội dung là tài sản độc quyền của chúng tôi</li>
                <li>Bạn không được sao chép hoặc sửa đổi nội dung</li>
                <li>Nhãn hiệu của chúng tôi không được sử dụng mà không có sự cho phép</li>
                <li>Nội dung chỉ dành cho mục đích sử dụng cá nhân, không phục vụ mục đích thương mại</li>
              </ul>
            </div>

            {/* 3. User Accounts */}
            <div id="user-accounts" className="content-section">
              <h3>3. Tài Khoản Người Dùng</h3>
              <p>
                Khi bạn tạo tài khoản với chúng tôi, bạn phải cung cấp thông tin chính xác, đầy đủ và hiện tại. 
                Việc không làm như vậy cấu thành vi phạm Điều khoản, điều này có thể dẫn đến
                việc hủy tài khoản của bạn ngay lập tức.
              </p>
              <div className="alert-box">
                <i className="bi bi-exclamation-triangle"></i>
                <div className="alert-content">
                  <h5>Thông Báo Quan Trọng</h5>
                  <p>Bạn chịu trách nhiệm bảo vệ mật khẩu và tất cả các hoạt động xảy ra dưới tài khoản của bạn.</p>
                </div>
              </div>
            </div>

            {/* 4. Prohibited Activities */}
            <div id="prohibited" className="content-section">
              <h3>4. Hoạt Động Bị Cấm</h3>
              <p>Bạn không được phép truy cập hoặc sử dụng Dịch vụ cho bất kỳ mục đích nào ngoài mục đích chúng tôi cung cấp.</p>
              <div className="prohibited-list">
                {prohibitedActivities.map((item, index) => (
                  <div key={index} className="prohibited-item">
                    <i className="bi bi-x-circle"></i>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Disclaimers */}
            <div id="disclaimer" className="content-section">
              <h3>5. Miễn Trừ Trách Nhiệm</h3>
              <p>Việc sử dụng dịch vụ của chúng tôi là hoàn toàn do bạn chịu. Dịch vụ được cung cấp "NGUYÊN TRẠNG" và "CÓ SẵN" mà không có bảo hành nào, dù là rõ ràng hay ngụ ý.</p>
              <div className="disclaimer-box">
                <p>Chúng tôi không đảm bảo rằng:</p>
                <ul>
                  <li>Dịch vụ sẽ đáp ứng yêu cầu của bạn</li>
                  <li>Dịch vụ sẽ không bị gián đoạn hoặc không có lỗi</li>
                  <li>Kết quả từ việc sử dụng dịch vụ sẽ chính xác</li>
                  <li>Bất kỳ lỗi nào sẽ được sửa chữa</li>
                </ul>
              </div>
            </div>

            {/* 6. Limitation of Liability */}
            <div id="limitation" className="content-section">
              <h3>6. Giới Hạn Trách Nhiệm</h3>
              <p>Trong mọi trường hợp, chúng tôi sẽ không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, phạt, tình cờ, đặc biệt, hệ quả hoặc gương mẫu phát sinh từ hoặc liên quan đến việc sử dụng dịch vụ của bạn.</p>
            </div>

            {/* 7. Indemnification */}
            <div id="indemnification" className="content-section">
              <h3>7. Bảo Hiểm</h3>
              <p>Bạn đồng ý bảo vệ, bồi thường và giữ cho chúng tôi vô hại khỏi và chống lại bất kỳ khiếu nại, trách nhiệm pháp lý, thiệt hại, mất mát và chi phí phát sinh từ việc sử dụng dịch vụ của bạn.</p>
            </div>

            {/* 8. Termination */}
            <div id="termination" className="content-section">
              <h3>8. Chấm Dứt</h3>
              <p>Chúng tôi có thể chấm dứt hoặc tạm ngừng tài khoản của bạn ngay lập tức, mà không cần thông báo trước hoặc chịu trách nhiệm, vì bất kỳ lý do gì, bao gồm nhưng không giới hạn ở việc bạn vi phạm Điều khoản.</p>
            </div>

            {/* 9. Governing Law */}
            <div id="governing-law" className="content-section">
              <h3>9. Luật Điều Chỉnh</h3>
              <p>Những Điều khoản này sẽ được điều chỉnh bởi và được giải thích theo các luật của Việt Nam, không xem xét các quy định xung đột pháp luật của nó.</p>
            </div>

            {/* 10. Changes */}
            <div id="changes" className="content-section">
              <h3>10. Thay Đổi Điều Khoản</h3>
              <p>Chúng tôi bảo lưu quyền sửa đổi hoặc thay thế những Điều khoản này bất kỳ lúc nào. Chúng tôi sẽ thông báo về bất kỳ thay đổi nào bằng cách đăng những Điều khoản mới trên trang này.</p>
              <div className="notice-box">
                <i className="bi bi-bell"></i>
                <p>Bằng cách tiếp tục truy cập hoặc sử dụng dịch vụ của chúng tôi sau những thay đổi đó có hiệu lực, bạn đồng ý bị ràng buộc bởi những điều khoản được sửa đổi.</p>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="tos-contact" data-aos="fade-up" data-aos-delay="300">
            <div className="contact-box">
              <div className="contact-icon">
                <i className="bi bi-envelope"></i>
              </div>
              <div className="contact-content">
                <h4>Câu Hỏi Về Điều Khoản?</h4>
                <p>Nếu bạn có bất kỳ câu hỏi nào về những Điều khoản này, vui lòng liên hệ với chúng tôi.</p>
                <Link to="/contact" className="contact-link">Liên Hệ Hỗ Trợ</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
