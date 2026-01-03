import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { getQuizzes, getQuizHistory } from '../api';
import { useAuth } from '../context/AuthContext';

const categoryIconMap = {
  Communication: 'bi bi-chat-left-text',
  Career: 'bi bi-briefcase',
  English: 'bi bi-translate',
  'Web Development': 'bi bi-laptop',
  Design: 'bi bi-brush',
  Science: 'bi bi-flask',
  Mathematics: 'bi bi-calculator',
  General: 'bi bi-mortarboard',
};

const HERO_QUIZ_IMAGE = '/assets/img/education/students-9.webp';
const DEFAULT_QUIZ_IMAGE = '/assets/img/education/courses-13.webp';

export default function Quiz() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAllQuizzes, setShowAllQuizzes] = useState(false);

  useEffect(() => {
    console.log('fetchQuizzes running');
    let ignore = false;
    const fetchQuizzes = async () => {
      try {
        const res = await getQuizzes();
        if (!ignore) {
          setQuizzes(res.data);
          console.log('quizzes data', res.data);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setError('Không thể tải danh sách quiz. Vui lòng thử lại sau.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchQuizzes();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    if (!user) {
      setHistory([]);
      return;
    }
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await getQuizHistory();
        if (!ignore) setHistory(data || []);
      } catch (err) {
        if (!ignore) console.error(err);
      } finally {
        if (!ignore) setHistoryLoading(false);
      }
    };
    fetchHistory();
    return () => {
      ignore = true;
    };
  }, [user]);

  const stats = useMemo(() => {
    const quizCount = quizzes.length;
    const historyCount = history.length;
    const completedCount = history.filter((attempt) => (attempt.totalQuestions ?? 0) > 0).length;
    const totalCorrect = history.reduce((sum, attempt) => sum + (attempt.correctAnswers || 0), 0);
    const totalQuestions = history.reduce((sum, attempt) => sum + (attempt.totalQuestions || 0), 0);
    const completionRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const bestScore = history.reduce((max, attempt) => {
      const score = attempt.score ?? 0;
      return score > max ? score : max;
    }, 0);
    const lastQuizTitle = history[0]?.quiz?.title;

    return {
      quizCount,
      historyCount: completedCount,
      completionRate,
      bestScore,
      lastQuizTitle,
    };
  }, [quizzes, history]);

  const visibleQuizzes = useMemo(
    () => (showAllQuizzes ? quizzes : quizzes.slice(0, 3)),
    [quizzes, showAllQuizzes]
  );

  const categories = useMemo(() => {
    const map = new Map();
    quizzes.forEach((quiz) => {
      const key = quiz.category || 'General';
      const count = map.get(key) || 0;
      map.set(key, count + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        icon: categoryIconMap[name] || categoryIconMap.General,
      }))
      .slice(0, 6);
  }, [quizzes]);

  return (
    <main className="main">

      {/* Quiz Hero Section */}
<section id="quiz-hero" className="quiz-hero section light-background overflow-hidden">
  <div className="container position-relative">
    <div className="row align-items-center gy-5">
      {/* Left Content */}
      <div className="col-lg-6" data-aos="fade-right" data-aos-delay="100">
        <div className="hero-text pe-lg-5">
          <span className="badge bg-primary-subtle text-primary rounded-pill mb-3 px-3 py-2 fw-bold">
            <i className="bi bi-stars me-1"></i> Học mà chơi, chơi mà học
          </span>
          <h1 className="display-4 fw-bolder mb-3 text-dark">
            Nâng trình <span className="text-primary position-relative">Tiếng Anh
              <svg className="position-absolute w-100 bottom-0 start-0" style={{height: '10px', zIndex: -1, opacity: 0.3}} viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="#0d6efd" strokeWidth="10" fill="none" />
              </svg>
            </span>
            <br /> qua từng câu hỏi
          </h1>
          <p className="lead text-muted mb-4">
            Kho tàng quiz đa dạng từ giao tiếp, từ vựng đến tiếng Anh công sở. 
            Theo dõi tiến độ và chinh phục bảng xếp hạng ngay hôm nay!
          </p>
          
          <div className="d-flex gap-3 mb-5">
            <Link to="#quizzes" className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm hover-lift">
              <i className="bi bi-play-fill me-1"></i> Khám phá Quiz
            </Link>
            <Link to="#about" className="btn btn-outline-primary btn-lg rounded-pill px-4 hover-lift">
              Tìm hiểu thêm
            </Link>
          </div>

          {/* Stats Box - Giao diện thẻ bài game */}
          <div className="hero-stats-box p-3 rounded-4 bg-white shadow-sm border border-light">
            <div className="row g-3 align-items-center">
              {/* User Info */}
              <div className="col-auto">
                <div className="avatar-circle bg-primary text-white d-flex align-items-center justify-content-center rounded-circle fs-4 fw-bold" style={{width: '50px', height: '50px'}}>
                  {user ? user.name.charAt(0).toUpperCase() : <i className="bi bi-person"></i>}
                </div>
              </div>
              <div className="col">
                <h6 className="mb-0 fw-bold">{user ? `Xin chào, ${user.name}!` : "Chào khách ghé thăm"}</h6>
                <small className="text-muted">{user ? "Sẵn sàng cho thử thách mới?" : "Đăng nhập để lưu thành tích"}</small>
              </div>
              
              {/* Divider trên mobile */}
              <div className="col-12 d-md-none"><hr className="my-1"/></div>

              {/* Stats Counters */}
              <div className="col-md-auto col-12 d-flex gap-4">
                <div className="text-center">
                  <div className="text-primary fw-bolder fs-5">
                    {historyLoading ? <div className="spinner-border spinner-border-sm"></div> : stats.historyCount}
                  </div>
                  <div className="text-muted small" style={{fontSize: '0.75rem'}}>Đã xong</div>
                </div>
                <div className="vr d-none d-md-block opacity-25"></div>
                <div className="text-center">
                  <div className="text-success fw-bolder fs-5">
                    {historyLoading ? <div className="spinner-border spinner-border-sm"></div> : `${stats.completionRate}%`}
                  </div>
                  <div className="text-muted small" style={{fontSize: '0.75rem'}}>Điểm TB</div>
                </div>
              </div>
            </div>

            {/* Last Quiz Alert */}
            {stats.lastQuizTitle && (
              <div className="mt-3 pt-3 border-top">
                <div className="d-flex align-items-center justify-content-between text-muted small">
                  <span><i className="bi bi-clock-history me-1"></i> Gần nhất: <strong>{stats.lastQuizTitle}</strong></span>
                  <span className="badge bg-warning text-dark"><i className="bi bi-trophy-fill"></i> {stats.bestScore}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="col-lg-6" data-aos="fade-left" data-aos-delay="200">
        <div className="hero-image-wrapper position-relative text-center text-lg-end">
          {/* Decorative Elements */}
          <div className="position-absolute top-0 start-0 translate-middle p-4 bg-warning rounded-circle blur-effect" style={{opacity: 0.2, width: '150px', height: '150px', zIndex: -1}}></div>
          <div className="position-absolute bottom-0 end-0 translate-middle p-4 bg-primary rounded-circle blur-effect" style={{opacity: 0.2, width: '200px', height: '200px', zIndex: -1}}></div>
          
          <img src={HERO_QUIZ_IMAGE} alt="Quiz Hero" className="img-fluid rounded-4 shadow-lg position-relative z-1" style={{transform: 'rotate(-2deg)'}} />
          
          {/* Floating Badge */}
          <div className="floating-badge position-absolute bottom-0 start-0 m-4 p-3 bg-white rounded-4 shadow-lg d-flex align-items-center gap-3 animate-float" style={{zIndex: 2, maxWidth: '200px'}}>
            <div className="icon-box bg-success-subtle text-success rounded-circle p-2">
              <i className="bi bi-check-lg fs-4"></i>
            </div>
            <div className="text-start">
              <h6 className="mb-0 fw-bold">1000+</h6>
              <small className="text-muted">Câu hỏi thú vị</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {error && (
        <div className="container">
          <div className="alert alert-danger mt-4">{error}</div>
        </div>
      )}

      {/* Featured Quizzes Section */}
      <section id="featured-quizzes" className="featured-quizzes section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Quiz tiếng Anh nổi bật</h2>
          <p>Ôn luyện tiếng Anh qua các quiz ngắn, phù hợp nhiều trình độ khác nhau.</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row gy-4">
            {loading && (
              <div className="col-12 text-center">
                <p>Đang tải danh sách quiz tiếng Anh...</p>
              </div>
            )}

            {!loading && visibleQuizzes.length === 0 && (
              <div className="col-12 text-center">
                <p>Hiện chưa có quiz nào. Hãy quay lại sau nhé!</p>
              </div>
            )}

            {visibleQuizzes.map((quiz, index) => (
              <div
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={(index + 2) * 100}
                key={quiz._id}
              >
                <div className="quiz-card">
                  <div className="quiz-image">
                    <img
                      src={quiz.image || DEFAULT_QUIZ_IMAGE}
                      alt={quiz.title}
                      className="img-fluid"
                    />
                    <div className={`badge ${index === 0 ? 'featured' : index === 1 ? 'new' : 'certificate'}`}>
                      {index === 0 ? 'Hot' : index === 1 ? 'New' : 'Certificate'}
                    </div>
                  </div>
                  <div className="quiz-content">
                    <h3>
                      <Link to={`/quiz/${quiz.slug}`} className="text-decoration-none text-dark" >{quiz.title}</Link>
                    </h3>
                    <p>{quiz.description}</p>
                    <div className="quiz-stats">
                      <div>
                        <i className="bi bi-people-fill"></i> {quiz.players?.toLocaleString() || 0} người đã làm
                      </div>
                      <div>
                        <i className="bi bi-clock"></i> {quiz.duration || '15 phút'}
                      </div>
                    </div>
                    <Link to={`/quiz/${quiz.slug}`} className="btn-quiz text-decoration-none">
                      Bắt đầu làm quiz
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!showAllQuizzes && quizzes.length > 3 && (
            <div className="more-quizzes text-center" data-aos="fade-up" data-aos-delay="500">
              <button
                type="button"
                className="btn-more text-decoration-none"
                onClick={() => setShowAllQuizzes(true)}
              >
                Xem tất cả quiz
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Quiz Categories Section */}
      <section id="quiz-categories" className="quiz-categories section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Chủ đề quiz</h2>
          <p>Chọn chủ đề luyện tiếng Anh bạn quan tâm.</p>
        </div>
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row g-4">
            {!loading && categories.length === 0 && (
              <div className="col-12 text-center">
                <p>Chưa có chủ đề quiz nào.</p>
              </div>
            )}

            {categories.map((category, index) => (
              <div
                className="col-xl-2 col-lg-3 col-md-4 col-sm-6"
                data-aos="zoom-in"
                data-aos-delay={(index + 1) * 100}
                key={category.name}
              >
                <Link 
                  to={`/quiz?category=${encodeURIComponent(category.name)}`} 
                  className="category-card text-decoration-none text-dark d-block text-center p-4 border rounded shadow-sm h-100" 
                >
                  <div className="category-icon mb-3 text-primary display-6">
                    <i className={category.icon}></i>
                  </div>
                  <h5 className="fw-bold">{category.name}</h5>
                  <span className="text-muted small">{category.count} quiz</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="cta section light-background">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row align-items-center">
            <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
              <div className="cta-content">
                <h2>Thử thách tiếng Anh, nâng trình giao tiếp</h2>
                <p>Làm quiz thường xuyên để ghi nhớ từ vựng, cấu trúc câu và phản xạ tiếng Anh tốt hơn.</p>
                <div className="cta-actions" data-aos="fade-up" data-aos-delay="500">
                  <Link to="/quiz" className="btn btn-primary">Duyệt tất cả quiz</Link>
                  <Link to="/quiz" className="btn btn-outline">Bắt đầu ngay</Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
              <div className="cta-image">
                <img src="/assets/img/education/quiz-cta.webp" alt="Quiz Learning" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

