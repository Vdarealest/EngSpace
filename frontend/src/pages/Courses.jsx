import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { getCourses, getMyEnrollments, getImageUrl } from "../api";
import { useAuth } from "../context/AuthContext";

const DURATION_BUCKETS = {
  under5: (hours) => typeof hours === "number" && hours < 5,
  "5to20": (hours) => typeof hours === "number" && hours >= 5 && hours <= 20,
  "20plus": (hours) => typeof hours === "number" && hours > 20,
};

const PLAN_LABELS = {
  plus: "Plus",
  business: "Business",
  enterprise: "Enterprise", 
};

const PLAN_PRIORITY = {
  free: 0,
  plus: 1,
  business: 2,
  enterprise: 3,
};

// Helper parse thời lượng
const parseDurationHours = (course) => {
  if (!course) return null;
  if (typeof course.durationHours === "number") return course.durationHours;
  const raw = course.details?.Duration || course.duration || course.curriculum?.[0]?.meta || "";
  if (!raw) return null;
  const lower = String(raw).toLowerCase();
  const match = lower.match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  if (Number.isNaN(value)) return null;
  if (lower.includes("week")) return value * 5;
  if (lower.includes("day")) return value * 24;
  if (lower.includes("hour") || lower.includes("h")) return value;
  if (lower.includes("minute") || lower.includes("min")) return value / 60;
  return value;
};

// Component Loading Skeleton (Hiệu ứng chờ)
const CourseSkeleton = () => (
  <div className="col-lg-6 col-md-6 mb-4">
    <div className="course-card border-0 shadow-sm" aria-hidden="true">
      <div className="bg-secondary-subtle" style={{ height: "200px", width: "100%" }}></div>
      <div className="card-body p-3">
        <h5 className="card-title placeholder-glow">
          <span className="placeholder col-6"></span>
        </h5>
        <p className="card-text placeholder-glow">
          <span className="placeholder col-7"></span>
          <span className="placeholder col-4"></span>
          <span className="placeholder col-4"></span>
          <span className="placeholder col-6"></span>
        </p>
        <a href="#" className="btn btn-primary disabled placeholder col-6"></a>
      </div>
    </div>
  </div>
);

export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho bộ lọc
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [levelFilters, setLevelFilters] = useState(["all"]);
  const [durationFilters, setDurationFilters] = useState([]);
  const [priceFilters, setPriceFilters] = useState([]);
  const [planFilters, setPlanFilters] = useState([]);
  
  // States cho khóa học đã sở hữu
  const [ownedCourses, setOwnedCourses] = useState({ ids: new Set(), slugs: new Set() });
  const [loadingOwned, setLoadingOwned] = useState(false);
  const [showPurchasedOnly, setShowPurchasedOnly] = useState(false);

  // 👇 STATE MỚI: PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Số khóa học mỗi trang

  useEffect(() => {
    AOS.init({ duration: 700, once: true });
    let mounted = true;
    getCourses()
      .then((res) => {
        if (mounted) setCourses(res.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  // Lấy danh sách khóa học đã mua
  useEffect(() => {
    let ignore = false;
    if (!user) {
      setOwnedCourses({ ids: new Set(), slugs: new Set() });
      setShowPurchasedOnly(false);
      return;
    }

    const fetchOwned = async () => {
      setLoadingOwned(true);
      try {
        const { data } = await getMyEnrollments();
        if (ignore) return;
        const ids = new Set();
        const slugs = new Set();
        (data || []).forEach((enrollment) => {
          const courseId = enrollment.course?._id || enrollment.courseId || enrollment.course;
          if (courseId) ids.add(String(courseId));
          const courseSlug = enrollment.course?.slug;
          if (courseSlug) slugs.add(courseSlug);
        });
        setOwnedCourses({ ids, slugs });
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setOwnedCourses({ ids: new Set(), slugs: new Set() });
        }
      } finally {
        if (!ignore) setLoadingOwned(false);
      }
    };

    fetchOwned();
    return () => { ignore = true; };
  }, [user]);

  // Reset trang về 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, levelFilters, durationFilters, priceFilters, planFilters, showPurchasedOnly]);

  const categories = useMemo(() => {
    if (!courses.length) return [];
    const counts = courses.reduce((acc, course) => {
      const key = course.category || "Khác";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  }, [courses]);

  // Các hàm toggle filter
  const toggleLevel = useCallback((value) => {
    setLevelFilters((prev) => {
      if (value === "all") return ["all"];
      const withoutAll = prev.filter((item) => item !== "all");
      if (withoutAll.includes(value)) {
        const next = withoutAll.filter((item) => item !== value);
        return next.length ? next : ["all"];
      }
      return [...withoutAll, value];
    });
  }, []);

  const toggleDuration = useCallback((value) => setDurationFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value])), []);
  const togglePrice = useCallback((value) => setPriceFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value])), []);
  const togglePlan = useCallback((value) => setPlanFilters((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value])), []);

  // Logic lọc khóa học
  const filteredCourses = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return courses.filter((course) => {
      const courseId = course?._id ? String(course._id) : null;
      
      // Filter by Ownership
      const matchesOwnership = !showPurchasedOnly || (courseId && ownedCourses.ids.has(courseId)) || (course.slug && ownedCourses.slugs.has(course.slug));
      if (!matchesOwnership) return false;

      // Filter by Category
      const matchesCategory = selectedCategory === "all" || (course.category || "Khác").toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;

      // Filter by Level
      const matchesLevel = levelFilters.includes("all") || levelFilters.includes(course.level);
      if (!matchesLevel) return false;

      // Filter by Duration
      const durationHours = parseDurationHours(course);
      const matchesDuration = !durationFilters.length || durationFilters.some((bucket) => DURATION_BUCKETS[bucket]?.(durationHours));
      if (!matchesDuration) return false;

      // Filter by Price
      const matchesPrice = !priceFilters.length || priceFilters.some((bucket) => {
          if (bucket === "free") return course.price === 0;
          if (bucket === "paid") return course.price > 0;
          return true;
      });
      if (!matchesPrice) return false;

      // Filter by Plan
      const matchesPlan = !planFilters.length || planFilters.some((plan) => (course.availableInPlans || []).includes(plan));
      if (!matchesPlan) return false;

      // Filter by Search Keyword
      if (!keyword) return true;
      const haystack = [course.title, course.description, course.category, course.level, course.instructor?.name].filter(Boolean).join(" ").toLowerCase();
      return keyword.split(/\s+/).every((fragment) => haystack.includes(fragment));
    });
  }, [courses, searchTerm, selectedCategory, levelFilters, durationFilters, priceFilters, planFilters, showPurchasedOnly, ownedCourses]);

  // 👇 LOGIC CẮT DỮ LIỆU ĐỂ PHÂN TRANG
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredCourses, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll lên đầu danh sách khi chuyển trang
    const gridElement = document.querySelector('.courses-grid');
    if(gridElement) gridElement.scrollIntoView({ behavior: 'smooth' });
  };

  const ownedCourseCount = ownedCourses.ids.size || ownedCourses.slugs.size;
  const ownedFilterDisabled = !user || (!loadingOwned && ownedCourseCount === 0);

  return (
    <main className="main courses-page">
      <div className="page-title light-background">
        <div className="container d-lg-flex justify-content-between align-items-center">
          <h1 className="mb-2 mb-lg-0">Khóa học tiếng Anh</h1>
          <nav className="breadcrumbs">
            <ol>
              <li><Link to="/">Trang chủ</Link></li>
              <li className="current">Khóa học tiếng Anh</li>
            </ol>
          </nav>
        </div>
      </div>

      <section id="courses-2" className="courses-2 section">
        <div className="container" data-aos="fade-up" data-aos-delay="100">
          <div className="row">

            {/* FILTERS LEFT */}
            <div className="col-lg-3">
              <div className="course-filters" data-aos="fade-right" data-aos-delay="100">
                <h4 className="filter-title">Lọc khóa học tiếng Anh</h4>
                
                {/* CATEGORY */}
                <div className="filter-group">
                  <h5>Chủ đề</h5>
                  <div className="filter-options category-options">
                    <label className="filter-checkbox">
                      <input type="radio" name="course-category" checked={selectedCategory === "all"} onChange={() => setSelectedCategory("all")} />
                      <span className="checkmark"></span>
                      Tất cả ({courses.length})
                    </label>
                    {categories.map((category) => (
                      <label className="filter-checkbox" key={category.name}>
                        <input type="radio" name="course-category" checked={selectedCategory === category.name} onChange={() => setSelectedCategory(category.name)} />
                        <span className="checkmark"></span>
                        {category.name} ({category.total})
                      </label>
                    ))}
                  </div>
                </div>

                {/* LEVEL */}
                <div className="filter-group">
                  <h5>Trình độ</h5>
                  <div className="filter-options">
                    {["all", "Beginner", "Intermediate", "Advanced"].map(lvl => (
                        <label className="filter-checkbox" key={lvl}>
                            <input type="checkbox" checked={levelFilters.includes(lvl)} onChange={() => toggleLevel(lvl)} />
                            <span className="checkmark"></span>
                            {lvl === 'all' ? 'Tất cả trình độ' : lvl}
                        </label>
                    ))}
                  </div>
                </div>

                {/* DURATION */}
                <div className="filter-group">
                  <h5>Thời lượng</h5>
                  <div className="filter-options">
                    <label className="filter-checkbox"><input type="checkbox" checked={durationFilters.includes("under5")} onChange={() => toggleDuration("under5")} /><span className="checkmark"></span>Dưới 5 giờ</label>
                    <label className="filter-checkbox"><input type="checkbox" checked={durationFilters.includes("5to20")} onChange={() => toggleDuration("5to20")} /><span className="checkmark"></span>5–20 giờ</label>
                    <label className="filter-checkbox"><input type="checkbox" checked={durationFilters.includes("20plus")} onChange={() => toggleDuration("20plus")} /><span className="checkmark"></span>Trên 20 giờ</label>
                  </div>
                </div>

                {/* PRICE */}
                <div className="filter-group">
                  <h5>Học phí</h5>
                  <div className="filter-options">
                    <label className="filter-checkbox"><input type="checkbox" checked={priceFilters.includes("free")} onChange={() => togglePrice("free")} /><span className="checkmark"></span>Miễn phí</label>
                    <label className="filter-checkbox"><input type="checkbox" checked={priceFilters.includes("paid")} onChange={() => togglePrice("paid")} /><span className="checkmark"></span>Có phí</label>
                  </div>
                </div>

                {/* PLAN */}
                <div className="filter-group">
                  <h5>Gói học</h5>
                  <div className="filter-options">
                    {["plus", "business", "enterprise"].map((plan) => (
                      <label className="filter-checkbox" key={plan}>
                        <input type="checkbox" checked={planFilters.includes(plan)} onChange={() => togglePlan(plan)} />
                        <span className="checkmark"></span>
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT CONTENT */}
            <div className="col-lg-9">
              <div className="courses-header" data-aos="fade-left" data-aos-delay="100">
                <div className="search-box">
                  <i className="bi bi-search"></i>
                  <input type="text" placeholder="Tìm theo tên khóa học hoặc từ khóa..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                </div>
                <div className="header-actions d-flex align-items-center gap-3">
                  <button type="button" className={`btn ${showPurchasedOnly ? "btn-primary" : "btn-outline-primary"} d-flex align-items-center gap-2`} onClick={() => !ownedFilterDisabled && setShowPurchasedOnly((prev) => !prev)} disabled={ownedFilterDisabled}>
                    <i className="bi bi-journal-check"></i>
                    {showPurchasedOnly ? "Đang lọc khóa đã mua" : "Khóa đã mua"}
                    {loadingOwned && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                  </button>
                  <div className="sort-dropdown">
                    <select>
                      <option>Mới nhất</option>
                      <option>Giá: Thấp đến Cao</option>
                      <option>Giá: Cao đến Thấp</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* COURSES GRID */}
              <div className="courses-grid" data-aos="fade-up" data-aos-delay="200">
                <div className="row">
                  {loading ? (
                    // Hiển thị Skeleton khi đang tải
                    Array(4).fill(0).map((_, i) => <CourseSkeleton key={i} />)
                  ) : filteredCourses.length === 0 ? (
                    <div className="col-12">
                      <div className="empty-state text-center py-5">
                        <i className="bi bi-inbox fs-1 text-muted"></i>
                        <h4 className="mt-3">Không tìm thấy khóa học phù hợp</h4>
                        <button className="btn btn-outline-primary mt-2" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}>Xóa bộ lọc</button>
                      </div>
                    </div>
                  ) : (
                    // Hiển thị danh sách khóa học (Đã phân trang)
                    currentCourses.map((course) => {
                        const planTags = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
                        const checkoutTarget = course.slug || course._id;
                        const courseId = course?._id ? String(course._id) : null;
                        
                        // ✅ Kiểm tra enrollment (đã mua riêng)
                        const isEnrolled = (courseId && ownedCourses.ids.has(courseId)) || (course.slug && ownedCourses.slugs.has(course.slug));
                        
                        // ✅ Kiểm tra plan access (mua gói)
                        const availablePlans = Array.isArray(course.availableInPlans) ? course.availableInPlans : [];
                        const lowestPlanPriority = availablePlans.length
                          ? Math.min(
                              ...availablePlans.map((plan) =>
                                Number.isFinite(PLAN_PRIORITY[plan]) ? PLAN_PRIORITY[plan] : Number.POSITIVE_INFINITY
                              )
                            )
                          : Number.POSITIVE_INFINITY;
                        const userPlanRank = PLAN_PRIORITY[user?.plan] ?? 0;
                        const hasActivePlan = Boolean(user?.planActive && userPlanRank > 0);
                        // ✅ Enterprise plan: Unlock tất cả khóa học
                        const isEnterprise = user?.plan === 'enterprise' && user?.planActive;
                        const unlockByPlan = isEnterprise
                          ? true // Enterprise unlock tất cả
                          : hasActivePlan && lowestPlanPriority !== Number.POSITIVE_INFINITY
                            ? userPlanRank >= lowestPlanPriority
                            : false;
                        const isFreeCourse = (course.price ?? 0) === 0 && course.allowIndividualPurchase !== false;
                        
                        // ✅ isOwned = đã enroll HOẶC có plan access HOẶC free course
                        const isOwned = isEnrolled || unlockByPlan || isFreeCourse;
                        
                        return (
                        <div className="col-lg-6 col-md-6" key={course._id}>
                          <div className="course-card h-100">
                            <div className="course-image">
                              <img src={getImageUrl(course.image) || "/assets/img/education/courses-3.webp"} className="img-fluid" alt={course.title} onError={(e) => { e.target.src = "/assets/img/education/courses-3.webp"; }} />
                              {course.featured && <div className="course-badge">Featured</div>}
                              <div className="course-price">{course.price === 0 ? "Free" : course.price.toLocaleString() + "đ"}</div>
                            </div>
                            <div className="course-content d-flex flex-column">
                              <div className="course-meta">
                                <span className="category">{course.category || "General"}</span>
                                <span className="level">{course.level}</span>
                              </div>
                              <h3>{course.title}</h3>
                              <p className="flex-grow-1">{course.description}</p>
                              
                              {planTags.length > 0 && (
                                <div className="plan-tags mb-3">
                                  {planTags.map((plan) => (
                                    <span className={`plan-tag plan-${plan}`} key={plan}>#{PLAN_LABELS[plan] || plan}</span>
                                  ))}
                                  {course.allowIndividualPurchase === false && <span className="plan-tag badge-only">Plan only</span>}
                                </div>
                              )}

                              <Link to={`/courses/${course.slug}`} className="btn-course text-center">View Details</Link>
                              {isOwned ? (
                                <Link to={`/courses/${course.slug}/learn`} className="btn btn-success w-100 mt-2">Tiếp tục học</Link>
                              ) : (
                                <Link to={`/checkout/${checkoutTarget}`} state={{ courseId: course._id, courseSlug: course.slug, course }} className="btn btn-outline-primary w-100 mt-2">Đăng ký ngay</Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* PAGINATION LOGIC (Đã cập nhật hoạt động) */}
              {!loading && filteredCourses.length > itemsPerPage && (
                <div className="pagination-wrapper mt-5" data-aos="fade-up" data-aos-delay="300">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        <i className="bi bi-chevron-left"></i>
                      </button>
                    </li>

                    {/* Tạo mảng số trang */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                        <button className="page-link" onClick={() => handlePageChange(number)}>
                          {number}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>
    </main>
  );
}