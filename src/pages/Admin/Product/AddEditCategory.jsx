import React, { useState, useEffect } from "react";

// Assuming you have a list of potential parent categories available in the parent component
// and you pass it down via props.
// The parent component (e.g., CategoryManagement) should filter this list
// to exclude the category being edited and its descendants when in edit mode.

const AddEditCategory = ({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit, // Null for add, category object for edit (using old structure like name, index, parentId)
  parentCategories = [], // List of categories that can be selected as parent
}) => {
  // Updated initial form data structure to match the new API body fields
  const initialFormData = {
    title: "",
    description: "",
    parent_id: "", // Use "" or null for no parent
    thumbnail: "",
    status: "active", // Default status for new category
    position: 0, // Use position instead of index, initialize with 0
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false); // Effect to populate form data when categoryToEdit changes (entering edit mode)

  useEffect(() => {
    if (categoryToEdit) {
      // Map existing category data (old structure) to the new form data structure
      // *** FIX APPLIED HERE: Parse index to ensure position is a number ***
      const initialPosition = parseInt(categoryToEdit.index, 10);

      setFormData({
        title: categoryToEdit.name || "", // Map name to title
        description: categoryToEdit.description || "", // Assuming description might exist, default to empty
        parent_id: categoryToEdit.parentId || "", // Map parentId to parent_id
        thumbnail: categoryToEdit.thumbnail || "", // Assuming thumbnail might exist, default to empty
        status: categoryToEdit.status || "active", // Ensure position is a number or default to 0 if parsing fails (results in NaN)
        position: isNaN(initialPosition) ? 0 : initialPosition,
      });
      setIsEditMode(true);
    } else {
      // Reset for add mode
      setFormData(initialFormData);
      setIsEditMode(false);
    } // Reset error and loading states when modal opens or category changes
    setError(null);
    setLoading(false);
  }, [categoryToEdit, isOpen]); // Depend on categoryToEdit and isOpen // Reset form when modal closes

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormData);
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target; // --- Refined handling specifically for number inputs (like position) --- // This part was mostly correct for *user input*, but the fix in useEffect // ensures the initial value is also correct.

    if (type === "number") {
      // Try converting the value to a number
      const numValue = parseInt(value, 10);
      setFormData({
        ...formData, // If conversion results in NaN (empty string, non-numeric), set to 0
        [name]: isNaN(numValue) ? 0 : numValue,
      });
    } // --- Standard handling for other input types ---
    else if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } // --- Standard handling for text, textarea, select, etc. ---
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData || !userData.accessToken) {
        throw new Error("No access token found. Please log in.");
      }

      const url = isEditMode
        ? `http://localhost:3000/api/v1/product-category/edit/${categoryToEdit.id}`
        : "http://localhost:3000/api/v1/product-category/create";

      const method = isEditMode ? "PATCH" : "POST"; // Prepare the data payload matching the *new* API body structure

      const payload = {
        title: formData.title,
        description: formData.description,
        parent_id: formData.parent_id === "" ? null : formData.parent_id, // Send null if no parent selected
        thumbnail: formData.thumbnail,
        status: formData.status, // This will now correctly be a number thanks to the fix in useEffect and handleInputChange
        position: formData.position,
      }; // Basic validation (add more as needed)

      if (!payload.title) {
        throw new Error("Tiêu đề danh mục là bắt buộc.");
      } // Note: Backend validation should also catch required fields.
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json", // Specify content type
          // Consider adding Authorization header if using JWT/Bearer token
          // 'Authorization': `Bearer ${userData.accessToken}`,
        },
        body: JSON.stringify(payload),
        credentials: "include", // Make sure this is needed and handled server-side
      });

      const result = await response.json();

      if (result.code === 200) {
        onSuccess(); // Notify parent component to refresh data
        onClose(); // Close the modal
      } else {
        // Improved error handling to display backend message if available
        const errorMessage =
          result.message ||
          result.error?.message ||
          `Failed to ${isEditMode ? "update" : "create"} category`;
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("API Error:", err);
      setError(err.message || "Đã xảy ra lỗi khi thao tác danh mục.");
    } finally {
      setLoading(false);
    }
  }; // Don't render the modal content if not open

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal modal-open">
           {" "}
      <div className="modal-box relative">
               {" "}
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
          disabled={loading}
        >
                    ✕        {" "}
        </button>
               {" "}
        <h3 className="font-bold text-lg">
                    {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}   
             {" "}
        </h3>
               {" "}
        <div className="py-4">
                   {" "}
          {error && (
            <div role="alert" className="alert alert-error mb-4">
                           {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                               {" "}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                             {" "}
              </svg>
                            <span>{error}</span>           {" "}
            </div>
          )}
                   {" "}
          <form onSubmit={handleSubmit}>
                        {/* Title */}           {" "}
            <div className="form-control mb-4">
                           {" "}
              <label className="label">
                               {" "}
                <span className="label-text">Tiêu đề Danh Mục</span>           
                 {" "}
              </label>
                           {" "}
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề danh mục"
                className="input input-bordered w-full"
                required
                disabled={loading}
              />
                         {" "}
            </div>
                        {/* Description */}           {" "}
            <div className="form-control mb-4">
                           {" "}
              <label className="label">
                                <span className="label-text">Mô tả</span>       
                     {" "}
              </label>
                           {" "}
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả danh mục"
                className="textarea textarea-bordered w-full"
                disabled={loading}
              />
                         {" "}
            </div>
                        {/* Thumbnail */}           {" "}
            <div className="form-control mb-4">
                           {" "}
              <label className="label">
                               {" "}
                <span className="label-text">Thumbnail URL</span>             {" "}
              </label>
                           {" "}
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleInputChange}
                placeholder="Nhập URL thumbnail"
                className="input input-bordered w-full"
                disabled={loading}
              />
                         {" "}
            </div>
                        {/* Position */}           {" "}
            <div className="form-control mb-4">
                           {" "}
              <label className="label">
                               {" "}
                <span className="label-text">Thứ tự (Position)</span>           
                 {" "}
              </label>
                           {" "}
              <input
                type="number"
                name="position"
                value={formData.position} // This should now always be a number or 0
                onChange={handleInputChange}
                className="input input-bordered w-full"
                disabled={loading}
                min="0" // Good practice for number inputs
              />
                         {" "}
            </div>
                        {/* Status */}           {" "}
            <div className="form-control mb-4">
                           {" "}
              <label className="label">
                                <span className="label-text">Trạng thái</span> 
                           {" "}
              </label>
                           {" "}
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                required
                disabled={loading}
              >
                                <option value="active">Kích hoạt</option>       
                        <option value="inactive">Ngừng hoạt động</option>       
                     {" "}
              </select>
                         {" "}
            </div>
                        {/* Parent Category */}           {" "}
            <div className="form-control mb-4">
                           {" "}
              <label className="label">
                                <span className="label-text">Danh mục cha</span>
                             {" "}
              </label>
                           {" "}
              <select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                disabled={loading}
              >
                               {" "}
                <option value="">-- Chọn danh mục cha (Không có) --</option>   
                            {/* Render parent categories */}               {" "}
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                                        {cat.name}                 {" "}
                  </option>
                ))}
                             {" "}
              </select>
                         {" "}
            </div>
                        {/* Submit Button */}           {" "}
            <div className="modal-action">
                           {" "}
              <button
                type="submit"
                className={`btn btn-primary ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                               {" "}
                {loading
                  ? isEditMode
                    ? "Đang cập nhật..."
                    : "Đang thêm..."
                  : isEditMode
                  ? "Cập nhật"
                  : "Thêm mới"}
                             {" "}
              </button>
                           {" "}
              <button
                type="button" // Use type="button" to prevent form submission
                className="btn"
                onClick={onClose}
                disabled={loading}
              >
                                Hủy              {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </form>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default AddEditCategory;
