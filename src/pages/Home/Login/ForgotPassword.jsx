// src/pages/Home/ForgotPassword.jsx
import React from "react";

const ForgotPassword = () => {
  return (
    <form className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className="input input-bordered w-full"
          required
        />
      </div>

      <div>
        <button type="submit" className="btn btn-primary w-full">
          Reset Password
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;
