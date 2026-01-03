import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseDetails, updateCourseCurriculum } from "../api";

export default function AdminCurriculum() {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Lấy dữ liệu
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await getCourseDetails(slug);
        setCourse(data);
        setCurriculum(data.curriculum || []);
      } catch (error) {
        console.error(error);
        alert("Không thể tải thông tin khóa học!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // --- XỬ LÝ CHƯƠNG (MODULE) ---
  const addModule = () => {
    setCurriculum([...curriculum, { title: "Chương mới", lessons: [] }]);
  };

  const removeModule = (index) => {
    if (window.confirm("Bạn chắc chắn muốn xóa chương này?")) {
      const newCurriculum = [...curriculum];
      newCurriculum.splice(index, 1);
      setCurriculum(newCurriculum);
    }
  };
  const getYoutubeEmbed = (url) => {
    // Regex để bắt ID video từ mọi loại link YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const updateModuleTitle = (index, newTitle) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index].title = newTitle;
    setCurriculum(newCurriculum);
  };

  // --- XỬ LÝ BÀI HỌC (LESSON) ---
  const addLesson = (moduleIndex) => {
    const newCurriculum = [...curriculum];
    newCurriculum[moduleIndex].lessons.push({
      title: "Bài học mới",
      type: "video",
      content: "",
      time: "00:00",
      isPreview: false
    });
    setCurriculum(newCurriculum);
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    const newCurriculum = [...curriculum];
    newCurriculum[moduleIndex].lessons.splice(lessonIndex, 1);
    setCurriculum(newCurriculum);
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const newCurriculum = [...curriculum];
    
    // Nếu đang nhập liệu vào ô content VÀ loại bài học là video -> Tự động chuyển link
    if (field === 'content' && newCurriculum[moduleIndex].lessons[lessonIndex].type === 'video') {
        newCurriculum[moduleIndex].lessons[lessonIndex][field] = getYoutubeEmbed(value);
    } else {
        newCurriculum[moduleIndex].lessons[lessonIndex][field] = value;
    }
    
    setCurriculum(newCurriculum);
  };

  // --- LƯU DỮ LIỆU ---
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCourseCurriculum(course._id, curriculum);
      alert("✅ Đã lưu thành công!");
    } catch (error) {
      console.error(error);
      alert("❌ Lỗi khi lưu dữ liệu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Đang tải...</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
           <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => navigate(-1)}>
             <i className="bi bi-arrow-left"></i> Quay lại
           </button>
           <h2>Soạn bài: {course?.title}</h2>
        </div>
        <button className="btn btn-success" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : <><i className="bi bi-save"></i> Lưu Thay Đổi</>}
        </button>
      </div>

      <div className="accordion" id="editorAccordion">
        {curriculum.map((module, mIdx) => (
          <div className="card mb-3 shadow-sm" key={mIdx}>
            <div className="card-header bg-light d-flex align-items-center gap-2">
              <span className="fw-bold text-muted">#{mIdx + 1}</span>
              <input 
                type="text" 
                className="form-control fw-bold"
                value={module.title}
                onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                placeholder="Tên chương..."
              />
              <button className="btn btn-danger btn-sm" onClick={() => removeModule(mIdx)}>
                <i className="bi bi-trash"></i>
              </button>
            </div>

            <div className="card-body p-0">
              {module.lessons.map((lesson, lIdx) => (
                <div className="p-3 border-bottom row g-2 align-items-center" key={lIdx}>
                  <div className="col-md-3">
                    <div className="input-group">
                       <select 
                          className="form-select" 
                          style={{maxWidth: '90px'}}
                          value={lesson.type}
                          onChange={(e) => updateLesson(mIdx, lIdx, 'type', e.target.value)}
                       >
                         <option value="video">Video</option>
                         <option value="text">Text</option>
                       </select>
                       <input 
                          type="text" 
                          className="form-control" 
                          value={lesson.title}
                          onChange={(e) => updateLesson(mIdx, lIdx, 'title', e.target.value)}
                          placeholder="Tên bài"
                       />
                    </div>
                  </div>
                  <div className="col-md-5">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={lesson.content}
                      onChange={(e) => updateLesson(mIdx, lIdx, 'content', e.target.value)}
                      placeholder={lesson.type === 'video' ? "Link Youtube Embed..." : "Nội dung chữ..."}
                    />
                  </div>
                  <div className="col-md-3 d-flex gap-2">
                     <input 
                        type="text" 
                        className="form-control" 
                        placeholder="05:00"
                        value={lesson.time}
                        onChange={(e) => updateLesson(mIdx, lIdx, 'time', e.target.value)}
                     />
                     <div className="form-check d-flex align-items-center">
                        <input 
                          className="form-check-input me-1" 
                          type="checkbox" 
                          checked={lesson.isPreview}
                          onChange={(e) => updateLesson(mIdx, lIdx, 'isPreview', e.target.checked)}
                        />
                        <label className="form-check-label small">Preview</label>
                     </div>
                  </div>
                  <div className="col-md-1 text-end">
                    <button className="btn btn-outline-danger btn-sm" onClick={() => removeLesson(mIdx, lIdx)}>
                       <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>
              ))}
              <div className="p-3 text-center">
                <button className="btn btn-outline-primary btn-sm w-100" onClick={() => addLesson(mIdx)}>
                  <i className="bi bi-plus-circle"></i> Thêm bài học
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary w-100 py-3 mt-3" onClick={addModule}>
        <i className="bi bi-folder-plus"></i> Thêm Chương Mới
      </button>
    </div>
  );
}