import React from "react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const Sparkline = ({ points }) => {
  if (!points || points.length === 0) return null;

  // Chuyển mảng số thành mảng object cho Recharts
  const data = points.map((val, index) => ({
    name: `Ngày ${index + 1}`,
    value: val,
  }));

  return (
    <div style={{ width: "100%", height: "200px" }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0d6efd" stopOpacity={0} />
            </linearGradient>
          </defs>
          
          {/* Trục X ẩn (nếu muốn hiện thì bỏ hide) */}
          <XAxis dataKey="name" hide />
          
          <Tooltip 
            formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          
          <Area 
            type="monotone" // Làm mềm đường cong
            dataKey="value" 
            stroke="#0d6efd" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;