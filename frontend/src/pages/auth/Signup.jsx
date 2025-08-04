import React, { useState } from "react";
import { useSignupMutation } from "../../redux/apiSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup({ username, email, password }).unwrap();
      dispatch(setUser({ profile: res.user }));
      navigate("/");
    } catch (err) {
      alert(err?.data?.message || "Signup failed.");
    }
  };

  return (
    <div className="min-h-screen flex w-full justify-center items-center px-4">
      <div className="flex flex-col justify-center items-center p-6 w-full max-w-lg border-4 border-r-8 border-b-8 border-solid border-black bg-white">
        <p className="font-['Kanit'] tracking-wider text-2xl md:text-3xl font-bold mb-4 text-center">
          CREATE ACCOUNT
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-y-4">
          <div className="flex flex-col">
            <label className="text-lg font-semibold font-['Kanit']">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="p-2 border-2 border-r-4 placeholder:text-lg"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold font-['Kanit']">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="p-2 border-2 border-r-4 placeholder:text-lg"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-lg font-semibold font-['Kanit']">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="p-2 border-2 border-r-4 placeholder:text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="font-['Kanit'] text-lg font-bold bg-blue-500 p-2 mt-2 border-2 border-r-4 cursor-pointer hover:bg-blue-600 hover:text-white"
          >
            {isLoading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-4 text-sm md:text-md flex gap-2 font-semibold">
          <p>Already have an account?</p>
          <a className="text-green-600 hover:underline cursor-pointer">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
