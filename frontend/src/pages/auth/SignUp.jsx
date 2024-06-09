import React, { useState } from "react";
import XSvg from "../../components/svgs/X";
import { useForm } from "react-hook-form";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { MdRemoveRedEye } from "react-icons/md";
import { IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

function SignUp() {
  const [togglePassword, setTogglePassword] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    getValues: formValues,
  } = useForm({
    defaultValues: {
      email: "",
      username: "",
      fullname: "",
      password: "",
    },
  });

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ username, password, email, fullname }) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, fullname, email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error("Something went wrong");

      navigate("/");
    },
    onSuccess: () => {
      toast.success("Sign up Successful");
    },
    onError: () => {
      toast.error("Sign up failed");
    },
  });

  const submitHandler = () => {
    mutate(formValues());
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    setValue(e.target.name, e.target.value);
  };

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
          <h1 className="text-4xl font-extrabold text-white">Join today.</h1>
          <label className="input input-bordered rounded flex items-center gap-2 w-full">
            <MdEmail />
            <input
              type="text"
              className="grow"
              placeholder="Email"
              onChange={handleInputChange}
              {...register("email", { required: true })}
            />
          </label>
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
            <MdDriveFileRenameOutline />
            <input
              type="text"
              className="grow pr-6"
              placeholder="Full Name"
              onChange={handleInputChange}
              {...register("fullname", { required: true })}
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
            {isPending ? "Loading..." : "Sign Up"}
          </button>
          {isError && (
            <p className="text-red-500 text-center text-md">{error.message}</p>
          )}
          <div className="flex flex-col gap-3">
            <p>Already have an account?</p>
            <Link to="/login">
              <button
                type="submit"
                className="btn bg-white rounded-full w-full text-base text-black hover:bg-gray-400"
              >
                Login
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
