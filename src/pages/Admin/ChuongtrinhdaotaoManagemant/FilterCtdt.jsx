import React from "react";

const FilterCtdt = ({
  khoas,
  nganhs,
  nienKhoas,
  selectedKhoa,
  setSelectedKhoa,
  selectedNganh,
  setSelectedNganh,
  selectedNienKhoa,
  setSelectedNienKhoa,
}) => {
  return (
    <div className="grid grid-cols-1 md:gap-4 md:grid-cols-3 gap-2">
      <div>
        <label className="block text-sm font-medium">Khoa</label>
        <select
          className="select select-bordered w-full"
          value={selectedKhoa}
          onChange={(e) => setSelectedKhoa(e.target.value)}
        >
          <option value="">Chọn khoa</option>
          {khoas.map((khoa) => (
            <option key={khoa.MaKhoa} value={khoa.MaKhoa}>
              {khoa.TenKhoa}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Ngành</label>
        <select
          className="select select-bordered w-full"
          value={selectedNganh}
          onChange={(e) => setSelectedNganh(e.target.value)}
        >
          <option value="">Chọn ngành</option>
          {nganhs.map((nganh) => (
            <option key={nganh.MaNganh} value={nganh.MaNganh}>
              {nganh.TenNganh}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Niên khóa</label>
        <select
          className="select select-bordered w-full"
          value={selectedNienKhoa}
          onChange={(e) => setSelectedNienKhoa(e.target.value)}
        >
          <option value="">Chọn niên khóa</option>
          {nienKhoas.map((nk) => (
            <option key={nk} value={nk}>
              {nk}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterCtdt;
