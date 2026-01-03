import React, { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { getCourseDetails, getMyEnrollments } from "../api";
import { useAuth } from "../context/AuthContext";

const PLAN_PRIORITY = {
  free: 0,
  plus: 1,
  business: 2,
  enterprise: 3,
};

const CourseLearn = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  
  // State lưu bài học đang xem
  const [activeLesson, setActiveLesson] = useState(null);

  // 1. Fetch thông tin khóa học
  useEffect(() => {
    let ignore = false;
    const fetchCourse = async () => {
      if (!slug) { setLoading(false); return; }
      try {
        const { data } = await getCourseDetails(slug);
        if (!ignore) {
          setCourse(data);
          // Mặc định chọn bài học đầu tiên nếu có
          if (data.curriculum?.[0]?.lessons?.[0]) {
            setActiveLesson(data.curriculum[0].lessons[0]);
          }
        }
      } catch (err) { console.error(err); } 
      finally { if (!ignore) setLoading(false); }
    };
    fetchCourse();
    return () => { ignore = true; };
  }, [slug]);

  // 2. Kiểm tra quyền sở hữu (đã mua chưa)
  useEffect(() => {
    let ignore = false;
    const checkEnrollment = async () => {
      if (!user || !course?._id) return;
      try {
        const { data } = await getMyEnrollments();
        if (ignore) return;
        const owned = data.some(
          (item) => item.course?._id === course._id || item.course?.slug === course.slug
        );
        setEnrolled(owned);
      } catch (err) { console.error(err); }
    };
    checkEnrollment();
    return () => { ignore = true; };
  }, [user, course]);

  // 3. Logic kiểm tra quyền truy cập (Access Control)
  const access = useMemo(() => {
    if (!course || !user) return { unlocked: false };
    const availablePlans = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
    const lowestPlanPriority = availablePlans.length
      ? Math.min(...availablePlans.map((plan) => PLAN_PRIORITY[plan] ?? 99))
      : 99;
    const userPlanRank = PLAN_PRIORITY[user.plan] ?? 0;
    // ✅ Enterprise plan: Unlock tất cả khóa học
    const isEnterprise = user.plan === 'enterprise' && user.planActive;
    const hasPlanAccess = isEnterprise
      ? true // Enterprise unlock tất cả
      : Boolean(user.planActive && userPlanRank > 0) && userPlanRank >= lowestPlanPriority;
    const isFreeCourse = (course.price ?? 0) === 0 && course.allowIndividualPurchase !== false;
    return {
      unlocked: enrolled || hasPlanAccess || isFreeCourse,
      lowestPlan: availablePlans[0],
    };
  }, [course, user, enrolled]);

  if (!user) return <Navigate to={`/courses/${slug || ""}`} replace />;
  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  if (!course) return <div className="text-center py-5">Không tìm thấy khoá học.</div>;

  // Nếu chưa mua -> Hiện màn hình chặn
  if (!access.unlocked) {
    return (
      <main className="main">
        <section className="section">
          <div className="container text-center py-5">
            <i className="bi bi-lock-fill display-1 text-muted"></i>
            <h2 className="mt-3">Nội dung bị khoá</h2>
            <p className="text-muted mb-4">Bạn cần đăng ký khóa học để xem nội dung này.</p>
            <button className="btn btn-primary btn-lg" onClick={() => navigate(`/checkout/${slug}`, { state: { courseId: course._id, course } })}>
              Đăng ký ngay
            </button>
          </div>
        </section>
      </main>
    );
  }

  const curriculum = Array.isArray(course.curriculum) ? course.curriculum : [];

  return (
    <main className="main course-learn-page bg-light" style={{minHeight: '100vh'}}>
      {/* Header nhỏ gọn */}
      <div className="bg-white border-bottom py-2 px-4 d-flex justify-content-between align-items-center shadow-sm sticky-top" style={{zIndex: 1000}}>
        <div className="d-flex align-items-center gap-3">
            <Link to="/account?tab=courses" className="text-dark"><i className="bi bi-arrow-left"></i></Link>
            <h6 className="mb-0 fw-bold text-truncate" style={{maxWidth: '300px'}}>{course.title}</h6>
        </div>
        <div className="small text-muted">
            Tiến độ: 0% {/* Sau này làm tính năng progress sau */}
        </div>
      </div>

      <div className="container-fluid py-4">
        <div className="row g-4">
          
          {/* CỘT TRÁI: MÀN HÌNH PLAYER (Chiếm 8 phần) */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-0">
                    {/* KHUNG VIDEO / NỘI DUNG */}
                    <div className="ratio ratio-16x9 bg-black">
                        {activeLesson ? (
                            activeLesson.type === 'video' ? (
                                <iframe 
                                    src={activeLesson.content} 
                                    title={activeLesson.title} 
                                    allowFullScreen 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                ></iframe>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center bg-white h-100 p-5 overflow-auto">
                                    <div className="prose">
                                        <h3>{activeLesson.title}</h3>
                                        <p style={{whiteSpace: 'pre-line'}}>{activeLesson.content}</p>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="d-flex align-items-center justify-content-center text-white">
                                <p>Chọn bài học bên phải để bắt đầu</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-footer bg-white p-3">
                    <h4 className="h5 mb-1">{activeLesson?.title || "Giới thiệu khoá học"}</h4>
                    <p className="text-muted small mb-0"><i className="bi bi-clock me-1"></i> Cập nhật lần cuối: {new Date(course.updatedAt).toLocaleDateString("vi-VN")}</p>
                </div>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH BÀI HỌC (Chiếm 4 phần) */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100" style={{maxHeight: '85vh'}}>
                <div className="card-header bg-white py-3">
                    <h5 className="mb-0">Nội dung khóa học</h5>
                </div>
                <div className="card-body p-0 overflow-auto custom-scrollbar">
                    <div className="accordion accordion-flush" id="learnAccordion">
                      {curriculum.map((module, index) => (
                        <div className="accordion-item" key={index}>
                          <h2 className="accordion-header">
                            <button 
                                className={`accordion-button ${index === 0 ? "" : "collapsed"} bg-light fw-semibold`} 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target={`#module-${index}`}
                            >
                              {module.title}
                            </button>
                          </h2>
                          <div 
                            id={`module-${index}`} 
                            className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                            data-bs-parent="#learnAccordion"
                          >
                            <div className="accordion-body p-0">
                                {module.lessons?.map((lesson, lIdx) => {
                                    const isActive = activeLesson?._id === lesson._id || activeLesson?.title === lesson.title;
                                    return (
                                        <div 
                                            key={lIdx}
                                            // SỰ KIỆN CLICK ĐỂ CHUYỂN BÀI
                                            onClick={() => setActiveLesson(lesson)}
                                            className={`p-3 border-bottom cursor-pointer lesson-item ${isActive ? "bg-primary-subtle text-primary border-start border-primary border-4" : "hover-bg-light"}`}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="d-flex align-items-center gap-2 overflow-hidden">
                                                    <i className={`bi ${lesson.type === 'video' ? 'bi-play-circle-fill' : 'bi-file-text-fill'} ${isActive ? 'text-primary' : 'text-muted'}`}></i>
                                                    <span className="text-truncate small fw-medium">{lesson.title}</span>
                                                </div>
                                                <span className="badge bg-light text-secondary border fw-normal" style={{fontSize: '10px'}}>{lesson.time}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
};

export default CourseLearn;