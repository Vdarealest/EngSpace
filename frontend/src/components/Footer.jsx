import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="footer" className="footer accent-background">

      <div className="container footer-top">
        <div className="row gy-4">
          <div className="col-lg-5 col-md-12 footer-about">
            <Link to="/" className="logo d-flex align-items-center">
              <span className="sitename">EngSpace</span>
            </Link>
            <p>Nền tảng học tiếng Anh trực tuyến toàn diện, giúp bạn xóa bỏ rào cản ngôn ngữ và mở ra những cơ hội mới trong tương lai.</p>
            <div className="social-links d-flex mt-4">
              <a href="#"><i className="bi bi-twitter-x"></i></a>
              <a href="#"><i className="bi bi-facebook"></i></a>
              <a href="#"><i className="bi bi-instagram"></i></a>
              <a href="#"><i className="bi bi-linkedin"></i></a>
            </div>
          </div>

          <div className="col-lg-2 col-6 footer-links">
            <h4>Useful Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About us</Link></li>
              <li><a href="#">Services</a></li>
              <li><Link to="/terms">Terms of service</Link></li>
              <li><Link to="/privacy">Privacy policy</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-6 footer-links">
            <h4>Our Services</h4>
            <ul>
              <li><a href="#">Luyện thi IELTS</a></li>
              <li><a href="#">Tiếng Anh Giao tiếp</a></li>
              <li><a href="#">Tiếng Anh Doanh nghiệp</a></li>
              <li><a href="#">Ngữ pháp căn bản</a></li>
              <li><a href="#">Luyện thi TOEIC</a></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-12 footer-contact text-center text-md-start">
            <h4>Contact Us</h4>
            <p>Đỗ Mười/331A-331B An Phú Đông 10, An Phú Đông</p>
            <p>Quận 12, Thành phố Hồ Chí Minh</p>
            <p>Việt Nam</p>
            <p className="mt-4"><strong>Phone:</strong> <span>0987654321</span></p>
            <p><strong>Email:</strong> <span>darealest@gmail.com</span></p>
          </div>

        </div>
      </div>

      <div className="container copyright text-center mt-4">
        <p>© <span>Copyright</span> <strong className="px-1 sitename">EngSpace</strong> <span>All Rights Reserved</span></p>
        <div className="credits">
          Designed by <a href="https://bootstrapmade.com/">BootstrapMade</a>
        </div>
      </div>

    </footer>
  );
}


