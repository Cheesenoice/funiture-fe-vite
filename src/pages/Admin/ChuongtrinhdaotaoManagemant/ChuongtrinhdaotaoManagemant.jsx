import React, { useEffect, useState } from "react";
import axios from "axios";
import FilterCtdt from "./FilterCtdt";
import { useNavigate } from "react-router-dom";
import { Loader2, ChevronRight } from "lucide-react";

// Axios instance with token
const axiosAuth = axios.create();
axiosAuth.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// List programs by hierarchy
const ProgramList = ({
  chuongtrinh,
  loading,
  groupByHocKy,
  selectedKhoa,
  selectedNganh,
  selectedChuyenNganh,
  selectedNienKhoa,
}) => {
  const navigate = useNavigate(); // Khởi tạo useNavigate

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 gap-2 text-primary">
        <Loader2 className="animate-spin w-5 h-5" />
        Đang tải chương trình đào tạo...
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {chuongtrinh.length > 0
        ? chuongtrinh.map((item, index) => {
            if (!item.maKhoa && item.MaChuongTrinh) {
              return (
                <div
                  key={index}
                  className="bg-primary-content rounded-xl p-4 shadow"
                >
                  <h2 className="text-lg font-semibold">
                    {item.TenChuongTrinh} ({item.MaChuongTrinh})
                  </h2>
                </div>
              );
            }

            return (
              <div
                key={item.maKhoa || index}
                className="bg-primary-content rounded-xl shadow p-6"
              >
                <h2 className="text-xl font-bold text-primary">
                  {item.tenKhoa || "Khoa không xác định"}
                </h2>

                {item.nganh?.length > 0 ? (
                  item.nganh.map((nganh) => (
                    <div key={nganh.maNganh} className="ml-4 mt-4 space-y-2">
                      <h3 className="text-lg font-semibold text-secondary">
                        {nganh.tenNganh}
                      </h3>

                      {nganh.chuyenNganh?.length > 0 ? (
                        nganh.chuyenNganh.map((chuyenNganh) => (
                          <div
                            key={chuyenNganh.maChuyenNganh}
                            className="ml-4 space-y-2"
                          >
                            <h4 className="text-md font-medium">
                              {chuyenNganh.tenChuyenNganh}
                            </h4>

                            {chuyenNganh.chuongTrinhDaoTao?.length > 0 ? (
                              chuyenNganh.chuongTrinhDaoTao.map((ctdt) => (
                                <div key={ctdt.maChuongTrinh} className="ml-4">
                                  <p
                                    className="bg-base-100 rounded-xl shadow p-6 mb-2 cursor-pointer flex justify-between items-center"
                                    onClick={() =>
                                      navigate(
                                        `/admin/chitiet-ctdt?maChuyenNganh=${chuyenNganh.maChuyenNganh}&maKhoa=${selectedKhoa}&maNganh=${selectedNganh}&maNienKhoa=${selectedNienKhoa}`
                                      )
                                    }
                                  >
                                    <span>
                                      <strong>{ctdt.tenChuongTrinh}</strong> (
                                      {ctdt.maChuongTrinh}) – Niên khóa:{" "}
                                      {ctdt.tenNienKhoa}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-500 ml-2">
                                Không có chương trình đào tạo.
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="ml-2 text-sm text-gray-500">
                          Không có chuyên ngành.
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="ml-2 text-sm text-gray-500">Không có ngành.</p>
                )}
              </div>
            );
          })
        : (selectedKhoa ||
            selectedNganh ||
            selectedChuyenNganh ||
            selectedNienKhoa) && (
            <div className="text-warning">
              Không có chương trình đào tạo nào.
            </div>
          )}
    </div>
  );
};

// Main Management Component
const ChuongtrinhdaotaoManagement = () => {
  const [khoas, setKhoas] = useState([]);
  const [nganhs, setNganhs] = useState([]);
  const [chuyenNganhs, setChuyenNganhs] = useState([]);
  const [selectedKhoa, setSelectedKhoa] = useState("");
  const [selectedNganh, setSelectedNganh] = useState("");
  const [selectedChuyenNganh, setSelectedChuyenNganh] = useState("");
  const [selectedNienKhoa, setSelectedNienKhoa] = useState("");
  const [chuongtrinh, setChuongtrinh] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cache, setCache] = useState({}); // Thêm cache để lưu dữ liệu đã prefetch

  const nienKhoas = ["D20", "D21", "D22", "D23"];

  // Hàm fetch dữ liệu với caching
  const fetchChuongTrinh = async (params, isPrefetch = false) => {
    const cacheKey = JSON.stringify(params);
    if (cache[cacheKey]) {
      if (!isPrefetch) setChuongtrinh(cache[cacheKey]);
      return cache[cacheKey];
    }

    try {
      const res = await axiosAuth.get(
        "http://localhost:3000/api/chuongtrinhdaotao",
        { params }
      );
      if (res.data.success) {
        const data = Array.isArray(res.data.data)
          ? res.data.data
          : [res.data.data];
        setCache((prev) => ({ ...prev, [cacheKey]: data }));
        if (!isPrefetch) setChuongtrinh(data);
        return data;
      } else {
        if (!isPrefetch) setChuongtrinh([]);
        return [];
      }
    } catch (err) {
      console.error("Lỗi lấy chương trình đào tạo:", err);
      if (!isPrefetch) setChuongtrinh([]);
      return [];
    }
  };

  // Hàm prefetch dữ liệu cho các lựa chọn khác
  const prefetchData = async () => {
    const prefetchPromises = [];

    // Prefetch cho các niên khóa khác
    nienKhoas.forEach((nienKhoa) => {
      if (nienKhoa !== selectedNienKhoa) {
        const params = {
          maKhoa: selectedKhoa,
          maNganh: selectedNganh,
          maChuyenNganh: selectedChuyenNganh,
          maNienKhoa: nienKhoa,
        };
        prefetchPromises.push(fetchChuongTrinh(params, true));
      }
    });

    // Prefetch cho các chuyên ngành khác nếu đã chọn ngành
    if (selectedNganh) {
      chuyenNganhs.forEach((cn) => {
        if (cn.MaChuyenNganh !== selectedChuyenNganh) {
          const params = {
            maKhoa: selectedKhoa,
            maNganh: selectedNganh,
            maChuyenNganh: cn.MaChuyenNganh,
            maNienKhoa: selectedNienKhoa,
          };
          prefetchPromises.push(fetchChuongTrinh(params, true));
        }
      });
    }

    // Prefetch cho các ngành khác nếu đã chọn khoa
    if (selectedKhoa) {
      nganhs.forEach((nganh) => {
        if (nganh.MaNganh !== selectedNganh) {
          const params = {
            maKhoa: selectedKhoa,
            maNganh: nganh.MaNganh,
            maChuyenNganh: "",
            maNienKhoa: selectedNienKhoa,
          };
          prefetchPromises.push(fetchChuongTrinh(params, true));
        }
      });
    }

    await Promise.all(prefetchPromises);
  };

  useEffect(() => {
    const fetchKhoas = async () => {
      try {
        const res = await axiosAuth.get("http://localhost:3000/api/khoa");
        if (res.data.success) setKhoas(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy khoa:", err);
      }
    };
    fetchKhoas();
  }, []);

  useEffect(() => {
    const fetchNganhs = async () => {
      if (!selectedKhoa) return;
      try {
        const res = await axiosAuth.get(
          `http://localhost:3000/api/nganh?khoa=${selectedKhoa}`
        );
        if (res.data.success) setNganhs(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy ngành:", err);
      }
    };
    fetchNganhs();
    setSelectedNganh("");
    setChuyenNganhs([]);
    setSelectedChuyenNganh("");
  }, [selectedKhoa]);

  useEffect(() => {
    const fetchChuyenNganhs = async () => {
      if (!selectedNganh) return;
      try {
        const res = await axiosAuth.get(
          `http://localhost:3000/api/chuyennganh?nganh=${selectedNganh}`
        );
        if (res.data.success) setChuyenNganhs(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy chuyên ngành:", err);
      }
    };
    fetchChuyenNganhs();
    setSelectedChuyenNganh("");
  }, [selectedNganh]);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (selectedKhoa) params.maKhoa = selectedKhoa;
    if (selectedNganh) params.maNganh = selectedNganh;
    if (selectedChuyenNganh) params.maChuyenNganh = selectedChuyenNganh;
    if (selectedNienKhoa) params.maNienKhoa = selectedNienKhoa;

    fetchChuongTrinh(params).finally(() => setLoading(false));

    // Gọi prefetch sau khi fetch chính hoàn tất
    prefetchData();
  }, [selectedKhoa, selectedNganh, selectedChuyenNganh, selectedNienKhoa]);

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

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-primary">
        🎓 Chương trình đào tạo
      </h1>

      <FilterCtdt
        khoas={khoas}
        nganhs={nganhs}
        chuyenNganhs={chuyenNganhs}
        nienKhoas={nienKhoas}
        selectedKhoa={selectedKhoa}
        setSelectedKhoa={setSelectedKhoa}
        selectedNganh={selectedNganh}
        setSelectedNganh={setSelectedNganh}
        selectedChuyenNganh={selectedChuyenNganh}
        setSelectedChuyenNganh={setSelectedChuyenNganh}
        selectedNienKhoa={selectedNienKhoa}
        setSelectedNienKhoa={setSelectedNienKhoa}
      />

      <ProgramList
        chuongtrinh={chuongtrinh}
        loading={loading}
        groupByHocKy={groupByHocKy}
        selectedKhoa={selectedKhoa}
        selectedNganh={selectedNganh}
        selectedChuyenNganh={selectedChuyenNganh}
        selectedNienKhoa={selectedNienKhoa}
      />
    </div>
  );
};

export default ChuongtrinhdaotaoManagement;
