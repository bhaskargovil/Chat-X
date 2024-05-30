import React, { useState } from "react";
import XSvg from "../../components/svgs/X";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { MdRemoveRedEye } from "react-icons/md";
import { IoMdEyeOff } from "react-icons/io";
import { Link } from "react-router-dom";

function Login() {
  const [togglePassword, setTogglePassword] = useState(false);
  const showPassword = () => {
    setTogglePassword(!togglePassword);
  };
  const [formdata, setFormdata] = useState({
    username: "",
    password: "",
  });

  const submitHandler = (e) => {
    console.log(formdata);
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    setFormdata({ ...formdata, [e.target.name]: [e.target.value] });
  };

  const isError = false;

  return (
    <div className="mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center">
        <XSvg className="lg:w-2/3 fill-white flex-1" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          onSubmit={submitHandler}
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
        >
          <h1 className="text-4xl font-extrabold text-white">Let's Go.</h1>

          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <IoPersonSharp />
            <input
              type="text"
              className="grow pr-6"
              placeholder="Username"
              name="username"
              onChange={handleInputChange}
              value={formdata.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <RiLockPasswordFill />
            <input
              type={`${togglePassword ? "text" : "password"}`}
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formdata.password}
            />
            {togglePassword ? (
              <IoMdEyeOff
                onClick={showPassword}
                className="cursor-pointer hover:bg-gray-600 rounded-full"
              />
            ) : (
              <MdRemoveRedEye
                onClick={showPassword}
                className="cursor-pointer hover:bg-gray-600 rounded-full"
              />
            )}
          </label>
          <button
            type="submit"
            className="btn bg-blue-500 rounded-full hover:bg-blue-900 text-base"
          >
            Login
          </button>
          {isError && (
            <p className="text-red-500 text-center text-md">
              Something went wrong...
            </p>
          )}
          <div>
            <p className="text-white mb-3">Don't have an account?</p>
            <Link to="/signup">
              <button className="btn w-full bg-white text-black rounded-full hover:bg-gray-400 text-base">
                Sign Up
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
