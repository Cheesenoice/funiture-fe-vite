import React, { useState, useEffect } from "react";
// Assuming you might add icons later, like in ProductManagement
// import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa"; // Example icons

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [confirmStatusChange, setConfirmStatusChange] = useState(null);
  const [confirmBulkStatus, setConfirmBulkStatus] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [showAddresses, setShowAddresses] = useState(false);

  // Fetch users from API
  // Using async directly in useEffect or event handlers is common,
  // but useCallback could be used here for consistency if needed.
  const fetchUsers = async () => {
    setLoading(true);
    setError(null); // Reset error before fetch
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken)
        throw new Error("No access token found. Please log in.");

      const response = await fetch("http://localhost:3000/api/v1/listUser", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (result.code === 200) {
        setUsers(result.data);
        // Ensure filtering happens after data is set
        filterUsers(result.data, statusFilter);
      } else {
        // Handle specific error codes if necessary
        throw new Error(result.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]); // Clear users on error
      setFilteredUsers([]); // Clear filtered users on error
    } finally {
      setLoading(false);
    }
  };

  // Filter users by status (Pure function - depends only on inputs)
  const filterUsers = (usersToFilter, status) => {
    if (status === "all") {
      setFilteredUsers(usersToFilter);
    } else {
      setFilteredUsers(usersToFilter.filter((user) => user.status === status));
    }
  };

  // Handle status filter change
  const handleFilterChange = (status) => {
    setStatusFilter(status);
    // Filter the current `users` state, not the already filtered list
    filterUsers(users, status);
  };

  // Handle checkbox selection
  const handleSelectUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // Open confirmation modal for single status change
  const openConfirmStatusModal = (id, currentStatus) => {
    setConfirmStatusChange({
      id,
      newStatus: currentStatus === "active" ? "inactive" : "active",
    });
  };

  // Toggle user status (async operation)
  const toggleUserStatus = async () => {
    if (!confirmStatusChange) return;
    setLoading(true); // Indicate loading for the action
    setError(null); // Clear previous errors
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken)
        throw new Error("No access token found. Please log in.");

      const { id, newStatus } = confirmStatusChange;
      const response = await fetch(
        `http://localhost:3000/api/v1/listUser/changeStatus/${id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const result = await response.json();
      if (result.code === 200) {
        // Update the main users list and re-filter
        setUsers((prev) =>
          prev.map((user) =>
            user._id === id ? { ...user, status: newStatus } : user
          )
        );
        // Important: filter the *updated* users list
        filterUsers(
          users.map((user) =>
            user._id === id ? { ...user, status: newStatus } : user
          ),
          statusFilter
        );
        setConfirmStatusChange(null); // Close modal on success
        setError(null); // Clear error if action was successful after a previous error
      } else {
        throw new Error(result.message || "Failed to change status");
      }
    } catch (err) {
      console.error("Error changing user status:", err);
      setError(err.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Open confirmation modal for bulk status change
  const openConfirmBulkModal = (status) => {
    if (selectedUserIds.length === 0) {
      setError("Vui lòng chọn ít nhất một người dùng");
      return;
    }
    setError(null); // Clear previous errors
    setConfirmBulkStatus(status);
  };

  // Bulk status change (async operation)
  const bulkChangeStatus = async () => {
    if (!confirmBulkStatus || selectedUserIds.length === 0) return;
    setLoading(true); // Indicate loading
    setError(null); // Clear previous errors
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const accessToken = userData.accessToken;
      if (!accessToken)
        throw new Error("No access token found. Please log in.");

      const response = await fetch(
        "http://localhost:3000/api/v1/listUser/change-multi",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ids: selectedUserIds,
            key: "status",
            value: confirmBulkStatus,
          }),
        }
      );
      const result = await response.json();
      if (result.code === 200) {
        // Update the main users list and re-filter
        setUsers((prev) =>
          prev.map((user) =>
            selectedUserIds.includes(user._id)
              ? { ...user, status: confirmBulkStatus }
              : user
          )
        );
        // Important: filter the *updated* users list
        filterUsers(
          users.map((user) =>
            selectedUserIds.includes(user._id)
              ? { ...user, status: confirmBulkStatus }
              : user
          ),
          statusFilter
        );

        setSelectedUserIds([]); // Deselect users after action
        setConfirmBulkStatus(null); // Close modal
        setError(null); // Clear error if action was successful
      } else {
        throw new Error(result.message || "Failed to change status");
      }
    } catch (err) {
      console.error("Error bulk changing user status:", err);
      setError(err.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  // Open view modal
  const openViewModal = (user) => {
    setViewUser(user);
    setShowAddresses(false); // Reset address visibility when opening
  };

  // Toggle display of addresses in view modal
  const toggleAddresses = () => {
    setShowAddresses(!showAddresses);
  };

  // Fetch users on component mount and re-filter if users change
  useEffect(() => {
    fetchUsers();
  }, []); // Fetch only on mount

  // Re-filter whenever the main users list or the filter status changes
  // This is important because fetchUsers and status changes update the 'users' state
  useEffect(() => {
    filterUsers(users, statusFilter);
  }, [users, statusFilter]); // Depend on users and statusFilter

  return (
    <div className="p-4 md:p-6">
      {" "}
      {/* Use padding classes from ProductManagement */}
      <h1 className="text-3xl font-bold text-primary mb-6">
        {" "}
        {/* Use consistent heading style */}
        👥 Quản lý người dùng
      </h1>
      {/* Filter and Bulk Action Bar */}
      {/* Use consistent layout for filters/actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-6 gap-4">
        {/* Status Filter */}
        <div className="form-control w-full md:w-auto md:min-w-[180px]">
          {" "}
          {/* Consistent form control styling */}
          <label className="label pt-0">
            {" "}
            {/* Consistent label styling */}
            <span className="label-text">Lọc theo trạng thái</span>
          </label>
          <select
            className={`select select-bordered w-full ${
              loading ? "select-disabled opacity-70" : ""
            }`}
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            disabled={loading}
          >
            <option value="all">-- Tất cả trạng thái --</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto md:justify-end self-end">
            {" "}
            {/* Align to end */}
            <span className="text-sm opacity-70 hidden md:block">
              {" "}
              {/* Hide count on small screens if gap is tight */}
              {selectedUserIds.length} người dùng đã chọn:
            </span>
            <button
              className="btn btn-sm btn-outline btn-warning"
              onClick={() => openConfirmBulkModal("inactive")}
              disabled={loading || selectedUserIds.length === 0}
            >
              Ngừng hoạt động
            </button>
            <button
              className="btn btn-sm btn-outline btn-success"
              onClick={() => openConfirmBulkModal("active")}
              disabled={loading || selectedUserIds.length === 0}
            >
              Kích hoạt
            </button>
          </div>
        )}
      </div>
      {/* Error Message */}
      {error && (
        <div role="alert" className="alert alert-error shadow-lg mb-4">
          {" "}
          {/* Consistent error styling */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            <strong>Lỗi!</strong> {error}
          </span>{" "}
          {/* Use strong for title */}
        </div>
      )}
      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          {" "}
          {/* Consistent loading styling */}
          <span className="loading loading-spinner loading-lg text-primary"></span>{" "}
          {/* Consistent spinner styling */}
          <p className="ml-3">Đang tải dữ liệu...</p>
        </div>
      )}
      {/* User Table */}
      {!loading && (
        <div className="overflow-x-auto">
          {" "}
          {/* Consistent table container */}
          <table className="table w-full">
            {" "}
            {/* Consistent table styling */}
            <thead className="bg-base-200 text-base-content">
              {" "}
              {/* Consistent table header */}
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="checkbox"
                    onChange={(e) =>
                      setSelectedUserIds(
                        e.target.checked
                          ? filteredUsers.map((user) => user._id)
                          : []
                      )
                    }
                    checked={
                      selectedUserIds.length > 0 && // Only check if some are selected
                      selectedUserIds.length === filteredUsers.length &&
                      filteredUsers.length > 0
                    }
                    // Indeterminate state for partial selection
                    ref={(input) => {
                      if (input) {
                        const isIndeterminate =
                          selectedUserIds.length > 0 &&
                          selectedUserIds.length < filteredUsers.length;
                        input.indeterminate = isIndeterminate;
                      }
                    }}
                    disabled={filteredUsers.length === 0}
                  />
                </th>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Trạng thái</th>
                <th>Xem</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    {users.length === 0
                      ? "Không có người dùng nào."
                      : "Không tìm thấy người dùng phù hợp."}
                  </td>
                </tr>
              )}
              {filteredUsers.map((user, index) => (
                <tr key={user._id} className="hover">
                  {" "}
                  {/* Consistent row hover */}
                  <td>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectedUserIds.includes(user._id)}
                      onChange={() => handleSelectUser(user._id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Use badge for status */}
                    <span
                      className={`badge ${
                        user.status === "active"
                          ? "badge-success"
                          : "badge-ghost"
                      } badge-md`}
                    >
                      {user.status === "active"
                        ? "Hoạt động"
                        : "Ngừng hoạt động"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline btn-info"
                      onClick={() => openViewModal(user)}
                    >
                      Xem
                    </button>
                    {/* Keep status toggle button */}
                    <button
                      className="btn btn-sm btn-outline btn-primary ml-2" // Consistent button styling, add margin
                      onClick={() =>
                        openConfirmStatusModal(user._id, user.status)
                      }
                      disabled={loading}
                    >
                      {user.status === "active" ? "Ngừng" : "Kích"}{" "}
                      {/* Shorter text for button */}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Note: Bulk actions moved up, removed redundant div here */}
      {/* <div className="mt-6 flex justify-end gap-4">...</div> */}
      {/* Confirmation Modal for Single Status Change */}
      {/* Use consistent modal structure and styling */}
      <input
        type="checkbox"
        id="confirm-status-modal"
        className="modal-toggle"
        checked={!!confirmStatusChange}
        onChange={() => setConfirmStatusChange(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Xác nhận thay đổi trạng thái</h3>
          <p className="py-4">
            Bạn có chắc chắn muốn{" "}
            {confirmStatusChange?.newStatus === "active"
              ? "kích hoạt"
              : "Ngừng hoạt động"}{" "}
            người dùng này không?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary" // Consistent button style
              onClick={toggleUserStatus}
              disabled={loading} // Disable during loading
            >
              Xác nhận
            </button>
            <button
              className="btn" // Consistent button style
              onClick={() => setConfirmStatusChange(null)}
              disabled={loading} // Disable during loading
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
      {/* Confirmation Modal for Bulk Status Change */}
      {/* Use consistent modal structure and styling */}
      <input
        type="checkbox"
        id="confirm-bulk-modal"
        className="modal-toggle"
        checked={!!confirmBulkStatus}
        onChange={() => setConfirmBulkStatus(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            Xác nhận thay đổi trạng thái hàng loạt
          </h3>
          <p className="py-4">
            Bạn có chắc chắn muốn đặt trạng thái của {selectedUserIds.length}{" "}
            người dùng thành{" "}
            {confirmBulkStatus === "active" ? "Active" : "Inactive"} không?
          </p>
          <div className="modal-action">
            <button
              className="btn btn-primary" // Consistent button style
              onClick={bulkChangeStatus}
              disabled={loading} // Disable during loading
            >
              Xác nhận
            </button>
            <button
              className="btn" // Consistent button style
              onClick={() => setConfirmBulkStatus(null)}
              disabled={loading} // Disable during loading
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
      {/* View Modal */}
      {/* Use consistent modal structure and styling */}
      <input
        type="checkbox"
        id="view-modal"
        className="modal-toggle"
        checked={!!viewUser}
        onChange={() => setViewUser(null)}
      />
      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4">
            {" "}
            {/* Consistent heading style */}
            Chi tiết người dùng
          </h3>
          {viewUser && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base-content">
              {" "}
              {/* Add text color for consistency */}
              {/* Details structure remains similar */}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Họ tên</span>
                </label>
                <p className="font-medium">{viewUser.fullName}</p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Email</span>
                </label>
                <p className="font-medium">{viewUser.email}</p>
              </div>
              {viewUser.phoneNumber && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">
                      Số điện thoại
                    </span>
                  </label>
                  <p className="font-medium">{viewUser.phoneNumber}</p>
                </div>
              )}
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Trạng thái</span>
                </label>
                <p
                  className={`font-semibold ${
                    viewUser.status === "active"
                      ? "text-success" // Use theme colors
                      : "text-warning" // Use theme colors
                  }`}
                >
                  {viewUser.status === "active"
                    ? "Đang hoạt động"
                    : "Ngừng hoạt động"}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Ngày tạo</span>
                </label>
                <p className="font-medium">
                  {new Date(viewUser.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Ngày cập nhật
                  </span>
                </label>
                <p className="font-medium">
                  {new Date(viewUser.updatedAt).toLocaleString()}
                </p>
              </div>
              {viewUser.googleId && (
                <div className="col-span-1 md:col-span-2">
                  {" "}
                  {/* Google ID might take full width */}
                  <label className="label">
                    <span className="label-text font-semibold">Google ID</span>
                  </label>
                  <p className="font-medium text-sm break-all">
                    {viewUser.googleId}
                  </p>{" "}
                  {/* Add break-all */}
                </div>
              )}
              {viewUser.address && viewUser.address.length > 0 && (
                <div className="col-span-1 md:col-span-2">
                  {" "}
                  {/* Address takes full width */}
                  <div className="flex items-center justify-between">
                    <label className="label">
                      <span className="label-text font-semibold">Địa chỉ</span>
                    </label>
                    {viewUser.address.length > 1 && (
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={toggleAddresses}
                      >
                        {" "}
                        {/* Consistent button style */}
                        {showAddresses ? "Ẩn bớt" : "Xem tất cả"}
                      </button>
                    )}
                  </div>
                  <div>
                    {viewUser.address.map((addr, index) => (
                      <div
                        key={index}
                        className={`mb-2 ${
                          viewUser.address.length > 1 &&
                          !showAddresses &&
                          !addr.isDefault
                            ? "hidden"
                            : ""
                        }`}
                      >
                        <p className="font-medium">
                          {addr.street}, {addr.ward}, {addr.district},{" "}
                          {addr.city}
                          {addr.isDefault && (
                            <span className="badge badge-primary badge-sm ml-2">
                              {" "}
                              {/* Consistent badge style */}
                              Mặc định
                            </span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewUser.avatar && (
                <div className="col-span-1 md:col-span-2 flex justify-center">
                  {" "}
                  {/* Center avatar */}
                  <div className="avatar">
                    <div className="w-24 rounded-full mask mask-circle">
                      {" "}
                      {/* Use mask-circle for consistency */}
                      <img
                        src={viewUser.avatar}
                        alt="Avatar"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.classList.add("hidden");
                        }} // Hide div if img fails
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="modal-action">
            <button
              className="btn" // Consistent button style
              onClick={() => setViewUser(null)}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
