import { Link } from "react-router-dom";

export default function About() {
  return (
    <main className="main about-page">
      
      {/* Page Title */}
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">About</h1>

          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Home</Link></li>
              <li className="current">About</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* About Section */}
      <section id="about" className="about section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="200">
              <img
                src="/assets/img/education/education-square-2.webp"
                alt="About Us"
                className="img-fluid rounded-4"
              />
            </div>

            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="300">
              <div className="about-content">
                <span className="subtitle">About Us</span>
                <h2>Kiến tạo Công dân Toàn cầu thông qua Giáo dục Chất lượng</h2>
                <p>
                  EngSpace là nền tảng học tiếng Anh trực tuyến tiên phong, kết hợp công nghệ hiện đại với phương pháp sư phạm chuẩn quốc tế. Chúng tôi tin rằng ngoại ngữ không chỉ là công cụ giao tiếp, mà là chìa khóa mở ra cánh cửa cơ hội sự nghiệp và kết nối thế giới.
                </p>

                <div className="stats-row">
                  <div className="stats-item">
                    <span className="count">15</span>
                    <p>Năm kinh nghiệm đào tạo</p>
                  </div>
                  <div className="stats-item">
                    <span className="count">200+</span>
                    <p>Giảng viên chuyên gia</p>
                  </div>
                  <div className="stats-item">
                    <span className="count">50k+</span>
                    <p>Học viên trên toàn cầu</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Cards */}
          <div className="row mt-5 pt-4">
            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="200">
              <div className="mission-card">
                <div className="icon-box">
                  <i className="bi bi-bullseye"></i>
                </div>
                <h3>Sứ mệnh</h3>
                <p>Xóa bỏ rào cản ngôn ngữ cho người Việt. Chúng tôi cam kết mang đến cơ hội tiếp cận giáo dục tiếng Anh chất lượng cao với chi phí hợp lý cho mọi đối tượng, từ trẻ em đến người đi làm.</p>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="300">
              <div className="mission-card">
                <div className="icon-box">
                  <i className="bi bi-eye"></i>
                </div>
                <h3>Tầm nhìn</h3>
                <p>Trở thành hệ sinh thái EdTech (Công nghệ giáo dục) hàng đầu Đông Nam Á, nơi công nghệ AI và con người hòa quyện để tạo ra lộ trình học tập cá nhân hóa tối ưu nhất.</p>
              </div>
            </div>

            <div className="col-lg-4" data-aos="fade-up" data-aos-delay="400">
              <div className="mission-card">
                <div className="icon-box">
                  <i className="bi bi-award"></i>
                </div>
                <h3>Giá trị cốt lõi</h3>
                <p>Chất lượng - Đổi mới - Tận tâm. Chúng tôi đặt kết quả của học viên làm trọng tâm, không ngừng cải tiến công nghệ và nội dung bài giảng mỗi ngày.</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="row mt-5 pt-3 align-items-center">
            <div className="col-lg-6 order-lg-2" data-aos="fade-up" data-aos-delay="300">
              <div className="achievements">
                <span className="subtitle">Why Choose Us</span>
                <h2>Đổi mới giáo dục vì một tương lai tốt đẹp hơn</h2>
                <p>
                  Khác biệt với các phương pháp truyền thống, EngSpace mang đến trải nghiệm học tập chủ động, linh hoạt và đầy cảm hứng. Hệ thống của chúng tôi biến việc học trở thành niềm vui thay vì áp lực.
                </p>

                <ul className="achievements-list">
                  <li><i className="bi bi-check-circle-fill"></i> Học mọi lúc, mọi nơi trên đa nền tảng (Web/Mobile).</li>
                  <li><i className="bi bi-check-circle-fill"></i> Đội ngũ giáo viên có chứng chỉ TESOL/IELTS 8.0+.</li>
                  <li><i className="bi bi-check-circle-fill"></i> Hệ thống Quiz, Game hóa giúp ghi nhớ từ vựng lâu hơn.</li>
                  <li><i className="bi bi-check-circle-fill"></i> Tư vấn CV và phỏng vấn tiếng Anh cho người đi làm.</li>
                  <li><i className="bi bi-check-circle-fill"></i> Giao diện thân thiện, theo dõi tiến độ học tập Real-time.</li>
                </ul>

                <Link to="/courses" className="btn-explore">
                  Discover More <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            <div className="col-lg-6 order-lg-1" data-aos="fade-up" data-aos-delay="200">
              <div className="about-gallery">
                <div className="row g-3">
                  <div className="col-6">
                    <img src="/assets/img/education/education-1.webp" className="img-fluid rounded-3" />
                  </div>
                  <div className="col-6">
                    <img src="/assets/img/education/students-3.webp" className="img-fluid rounded-3" />
                  </div>
                  <div className="col-12 mt-3">
                    <img src="/assets/img/education/campus-8.webp" className="img-fluid rounded-3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
