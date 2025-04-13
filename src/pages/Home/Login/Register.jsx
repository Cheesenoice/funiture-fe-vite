// src/pages/Home/Register.jsx
import React from "react";

const Register = () => {
  return (
    <form className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          className="input input-bordered w-full"
          required
        />
      </div>

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

      <div className="form-control">
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="input input-bordered w-full"
          required
        />
      </div>

      <div>
        <button type="submit" className="btn btn-primary w-full">
          Register
        </button>
      </div>
    </form>
  );
};

export default Register;
