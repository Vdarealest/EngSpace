import React from "react";
import * as XLSX from "xlsx"; // Import thư viện xlsx

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

export default function RevenueReport({ summary, onExport }) {
  const revenueTotal = summary.revenue?.total || 0;
  const timeline = summary.revenue?.timeline || [];

  // Hàm xử lý xuất Excel ngay tại Client
  const handleExportExcel = () => {
    if (timeline.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    // 1. Chuẩn bị dữ liệu cho Excel (Format lại cho đẹp)
    const excelData = timeline.map((entry) => ({
      "Ngày giao dịch": new Date(entry._id).toLocaleDateString("vi-VN"),
      "Số đơn hàng": entry.count || 1,
      "Doanh thu (VND)": entry.total,
    }));

    // Thêm dòng tổng cộng vào cuối
    excelData.push({
      "Ngày giao dịch": "TỔNG CỘNG",
      "Số đơn hàng": timeline.reduce((acc, curr) => acc + (curr.count || 1), 0),
      "Doanh thu (VND)": revenueTotal,
    });

    // 2. Tạo Worksheet và Workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Tùy chỉnh độ rộng cột (Optional)
    const wscols = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Doanh Thu");

    // 3. Xuất file
    XLSX.writeFile(workbook, `Bao_cao_doanh_thu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <section className="admin-grid">
      <div className="admin-card" data-aos="fade-up">
        <div className="card-head">
          <div>
            <p className="label">Báo cáo tài chính</p>
            <h3>Tổng doanh thu: {formatCurrency(revenueTotal)}</h3>
          </div>
          <div className="d-flex gap-2">
            {/* Nút xuất Excel mới */}
            <button className="btn ghost text-success" onClick={handleExportExcel}>
              <i className="bi bi-file-earmark-excel me-1"></i> Xuất Excel
            </button>
            
            {/* Giữ lại các nút cũ nếu cần */}
            <button className="btn ghost" onClick={() => onExport("pdf")}>
              <i className="bi bi-filetype-pdf me-1"></i> Xuất PDF
            </button>
            <button className="btn ghost" onClick={() => onExport("doc")}>
              <i className="bi bi-filetype-doc me-1"></i> Xuất Word
            </button>
          </div>
        </div>

        {timeline.length > 0 ? (
          <div className="table-responsive mt-3">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Ngày giao dịch</th>
                  <th>Số đơn hàng</th>
                  <th>Doanh thu ngày</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      {new Date(entry._id).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </td>
                    <td>{entry.count || 1} đơn</td>
                    <td className="text-success fw-bold">{formatCurrency(entry.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-clipboard-data display-4 mb-3 d-block"></i>
            <p>Chưa có dữ liệu giao dịch nào được ghi nhận.</p>
          </div>
        )}
      </div>
    </section>
  );
}