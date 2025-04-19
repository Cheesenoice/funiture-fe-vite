import React from "react";

const mockUsers = [
  { id: 1, name: "Nguyễn Văn A", email: "a@example.com", role: "Giảng viên" },
  { id: 2, name: "Trần Thị B", email: "b@example.com", role: "Sinh viên" },
  { id: 3, name: "Lê Văn C", email: "c@example.com", role: "Phòng đào tạo" },
  { id: 4, name: "Lê Văn D", email: "c@example.com", role: "Phòng đào tạo" },
];

const UserManagement = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">
        👥 Quản lý người dùng
      </h1>

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button className="btn btn-sm btn-outline btn-primary mr-2">
                    Sửa
                  </button>
                  <button className="btn btn-sm btn-outline btn-error">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
