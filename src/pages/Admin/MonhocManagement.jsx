import React, { useEffect, useState } from "react";
import axios from "axios";

const MonhocManagement = () => {
  const [monhocs, setMonhocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonhocs = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const res = await axios.get("http://localhost:3000/api/monhoc", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success) {
          setMonhocs(res.data.data);
        } else {
          console.error("Lỗi lấy dữ liệu:", res.data.message);
        }
      } catch (error) {
        console.error("Lỗi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonhocs();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">
        📚 Quản lý Môn học
      </h1>

      {loading ? (
        <div className="text-lg">Đang tải dữ liệu...</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Mã môn</th>
                  <th>Tên môn</th>
                  <th>Tín chỉ</th>
                  <th>Lý thuyết</th>
                  <th>Bài tập</th>
                  <th>Thực hành</th>
                  <th>Tiết Tự học</th>
                  <th>Ngôn ngữ</th>
                  <th>Tự chọn</th>
                </tr>
              </thead>
              <tbody>
                {monhocs.map((mh) => (
                  <tr key={mh.MaMonHoc}>
                    <td>{mh.MaMonHoc}</td>
                    <td>{mh.TenMonHoc}</td>
                    <td>{mh.SoTinChi}</td>
                    <td>{mh.SoTietLiThuyet}</td>
                    <td>{mh.SoTietBaiTap}</td>
                    <td>{mh.SoTietThucHanh}</td>
                    <td>{mh.SoTietTuHoc}</td>
                    <td>{mh.NgonNguDay}</td>
                    <td>{mh.LaMonTuChon ? "✔️" : "✖️"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonhocManagement;
