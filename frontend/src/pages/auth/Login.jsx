import React, { useState } from "react";
import XSvg from "../../components/svgs/X";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoPersonSharp } from "react-icons/io5";
import { MdRemoveRedEye } from "react-icons/md";
import { IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";

function Login() {
  const navigate = useNavigate();
  const [togglePassword, setTogglePassword] = useState(false);
  const {
    register,
    getValues: formValues,
    handleSubmit,
    setValue,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isError, isPending } = useMutation({
    mutationFn: async ({ username, password }) => {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Something went wrong");
    },
    onSuccess: () => {
      toast.success("Login Successfull");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: () => {
      toast.error("Login Failed");
    },
  });

  const submitHandler = () => {
    mutate(formValues());
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    setValue(e.target.name, e.target.value);
  };

  if (isPending) {
    return (
      <div className="flex justify-center h-screen items-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center">
        <XSvg className="lg:w-2/3 fill-white flex-1" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          onSubmit={handleSubmit(submitHandler)}
          className="lg:w-2/3  mx-auto md:mx-20 flex gap-4 flex-col"
        >
          <h1 className="text-4xl font-extrabold text-white">Let's Go.</h1>

          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <IoPersonSharp />
            <input
              type="text"
              className="grow pr-6"
              placeholder="Username"
              onChange={handleInputChange}
              {...register("username", { required: true })}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <RiLockPasswordFill />
            <input
              type={`${togglePassword ? "text" : "password"}`}
              className="grow"
              placeholder="Password"
              onChange={handleInputChange}
              {...register("password", { required: true })}
            />
            {togglePassword ? (
              <IoMdEyeOff
                onClick={() => {
                  setTogglePassword(!togglePassword);
                }}
                className="cursor-pointer hover:bg-gray-600 rounded-full"
              />
            ) : (
              <MdRemoveRedEye
                onClick={() => {
                  setTogglePassword(!togglePassword);
                }}
                className="cursor-pointer hover:bg-gray-600 rounded-full"
              />
            )}
          </label>
          <button
            type="submit"
            className="btn bg-blue-500 rounded-full hover:bg-blue-900 text-base"
          >
            {isPending ? "Loading..." : "Login"}
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
