import React from "react";

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary mb-2">
          🎉 Chào mừng, {user?.name}!
        </h1>
        <p className="text-lg text-base-content">
          Đây là giao diện Dashboard dành cho phòng đào tạo
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Total Users</h2>
            <p className="text-3xl font-bold">1,234</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Active Courses</h2>
            <p className="text-3xl font-bold">56</p>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Pending Requests</h2>
            <p className="text-3xl font-bold">23</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
