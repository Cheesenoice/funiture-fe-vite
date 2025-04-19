import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Axios instance with token
const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Table for subjects
const ProgramTable = ({ monHocs }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-base-300">
      <table className="table table-zebra w-full">
        <thead className="bg-base-200 text-base font-medium">
          <tr>
            <th>Mã môn</th>
            <th>Tên môn</th>
            <th>Số tín chỉ</th>
            <th>Lý thuyết</th>
            <th>Thực hành</th>
            <th>Ngôn ngữ</th>
          </tr>
        </thead>
        <tbody>
          {monHocs.map((mon) => (
            <tr key={mon.MaMonHoc}>
              <td>{mon.MaMonHoc}</td>
              <td>{mon.TenMonHoc}</td>
              <td>{mon.SoTinChi}</td>
              <td>{mon.SoTietLiThuyet}</td>
              <td>{mon.SoTietThucHanh}</td>
              <td>{mon.NgonNguDay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Chi tiết chương trình đào tạo
const ChitietCtdt = () => {
  const [chuongtrinh, setChuongtrinh] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const groupByHocKy = (chiTiet) => {
    if (!chiTiet || !Array.isArray(chiTiet)) return {};
    const grouped = {};
    chiTiet.forEach((mon) => {
      const kyHoc = mon.MaKyHoc ? `${mon.TenKyHoc} (${mon.MaKyHoc})` : "Chung";
      if (!grouped[kyHoc]) grouped[kyHoc] = [];
      grouped[kyHoc].push(mon);
    });
    return grouped;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const maChuyenNganh = params.get("maChuyenNganh");
    const maKhoa = params.get("maKhoa");
    const maNganh = params.get("maNganh");
    const maNienKhoa = params.get("maNienKhoa");

    const fetchChuongTrinh = async () => {
      setLoading(true);
      try {
        const res = await axiosAuth.get(
          "http://localhost:3000/api/chuongtrinhdaotao",
          {
            params: {
              maKhoa,
              maNganh,
              maChuyenNganh,
              maNienKhoa,
            },
          }
        );
        if (res.data.success) {
          const data = Array.isArray(res.data.data)
            ? res.data.data
            : [res.data.data];
          setChuongtrinh(data);
        } else {
          setChuongtrinh([]);
        }
      } catch (err) {
        console.error("Lỗi lấy chương trình đào tạo:", err);
        setChuongtrinh([]);
      } finally {
        setLoading(false);
      }
    };

    if (maChuyenNganh) {
      fetchChuongTrinh();
    }
  }, [location.search]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 gap-2 text-primary">
        <Loader2 className="animate-spin w-5 h-5" />
        Đang tải chương trình đào tạo...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-primary">
        🎓 Chi tiết chương trình đào tạo
      </h1>

      <div className="mt-6 space-y-6">
        {chuongtrinh.length > 0 ? (
          chuongtrinh.map((item, index) =>
            item.nganh?.map((nganh) =>
              nganh.chuyenNganh?.map((chuyenNganh) => (
                <div
                  key={chuyenNganh.maChuyenNganh}
                  className="bg-primary-content rounded-xl shadow p-6"
                >
                  <h2 className="text-xl font-bold text-primary">
                    {item.tenKhoa || "Khoa không xác định"}
                  </h2>
                  <h3 className="text-lg font-semibold text-secondary mt-4">
                    {nganh.tenNganh}
                  </h3>
                  <h4 className="text-md font-medium mt-2">
                    {chuyenNganh.tenChuyenNganh}
                  </h4>

                  {chuyenNganh.chuongTrinhDaoTao?.length > 0 ? (
                    chuyenNganh.chuongTrinhDaoTao.map((ctdt) => (
                      <div key={ctdt.maChuongTrinh} className="ml-4 mt-4">
                        <p className="bg-base-100 rounded-xl shadow p-6 mb-2">
                          <strong>{ctdt.tenChuongTrinh}</strong> (
                          {ctdt.maChuongTrinh}) – Niên khóa: {ctdt.tenNienKhoa}
                        </p>

                        {ctdt.chiTiet && (
                          <div className="space-y-4">
                            {Object.entries(groupByHocKy(ctdt.chiTiet)).map(
                              ([kyHoc, monHocs]) => (
                                <div key={kyHoc}>
                                  <h5 className="font-semibold text-sm text-gray-500 mb-1">
                                    {kyHoc}
                                  </h5>
                                  <div className="collapse collapse-arrow bg-base-100 shadow mt-2">
                                    <input type="checkbox" />
                                    <div className="collapse-title font-medium text-sm">
                                      🗓️{" "}
                                      <span className="font-semibold">
                                        {kyHoc}
                                      </span>
                                    </div>
                                    <div className="collapse-content">
                                      <div className="overflow-x-auto">
                                        <table className="table table-sm w-full">
                                          <thead>
                                            <tr>
                                              <th>STT</th>
                                              <th>Mã môn</th>
                                              <th>Tên môn</th>
                                              <th>Số TC</th>
                                              <th>Lý thuyết</th>
                                              <th>Thực hành</th>
                                              <th>Ngôn ngữ</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {monHocs.map((mon, idx) => (
                                              <tr key={mon.MaMonHoc}>
                                                <td>{mon.ThuTu ?? idx + 1}</td>
                                                <td>{mon.MaMonHoc}</td>
                                                <td>{mon.TenMonHoc}</td>
                                                <td>{mon.SoTinChi}</td>
                                                <td>{mon.SoTietLiThuyet}</td>
                                                <td>{mon.SoTietThucHanh}</td>
                                                <td>{mon.NgonNguDay}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 ml-2">
                      Không có chương trình đào tạo.
                    </p>
                  )}
                </div>
              ))
            )
          )
        ) : (
          <div className="text-warning">Không có chương trình đào tạo nào.</div>
        )}
      </div>
    </div>
  );
};

export default ChitietCtdt;
