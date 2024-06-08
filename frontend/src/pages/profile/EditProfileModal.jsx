import { useQuery, useQueryClient } from "@tanstack/react-query";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useForm } from "react-hook-form";
import { useProfileUpdate } from "../../components/hooks/useProfileUpdate";
import { useState } from "react";
import { MdRemoveRedEye } from "react-icons/md";
import { IoMdEyeOff } from "react-icons/io";

const EditProfileModal = () => {
  const { data: userdata } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    getValues: formValues,
    register,
    setValue,
  } = useForm({
    defaultValues: {
      username: userdata.username,
      fullname: userdata.fullname,
      email: userdata.email,
      currentPassword: "",
      newPassword: "",
      bio: userdata.bio,
      link: userdata.link,
    },
  });

  const { updateDetails, isPending } = useProfileUpdate();

  const [toggleCurrentPassword, setToggleCurrentPassword] = useState();
  const [toggleNewPassword, setToggleNewPassword] = useState();

  const handleInputChange = (e) => {
    e.preventDefault();
    setValue(e.target.name, e.target.value);
  };

  const submitHandler = () => {
    updateDetails(formValues());
    queryClient.invalidateQueries({ queryKey: ["authUser"] });
  };

  return (
    <>
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(submitHandler)}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                {...register("fullname", { required: true })}
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                {...register("username", { required: true })}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                {...register("email", { required: true })}
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                {...register("bio", { required: true })}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="flex-1 input-md input input-bordered border-gray-700 rounded flex items-center">
                <input
                  type={toggleCurrentPassword ? "text" : "password"}
                  placeholder="Current Password"
                  className="grow"
                  {...register("currentPassword", { required: true })}
                  onChange={handleInputChange}
                />
                {toggleCurrentPassword ? (
                  <IoMdEyeOff
                    onClick={() => {
                      setToggleCurrentPassword(!toggleCurrentPassword);
                    }}
                    className="cursor-pointer hover:bg-gray-600 rounded-full"
                  />
                ) : (
                  <MdRemoveRedEye
                    onClick={() => {
                      setToggleCurrentPassword(!toggleCurrentPassword);
                    }}
                    className="cursor-pointer hover:bg-gray-600 rounded-full"
                  />
                )}
              </label>
              <label className="flex-1 input input-md border-gray-700 rounded flex items-center">
                <input
                  type={toggleNewPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="grow"
                  {...register("newPassword", { required: true })}
                  onChange={handleInputChange}
                />
                {toggleNewPassword ? (
                  <IoMdEyeOff
                    onClick={() => {
                      setToggleNewPassword(!toggleNewPassword);
                    }}
                    className="cursor-pointer hover:bg-gray-600 rounded-full"
                  />
                ) : (
                  <MdRemoveRedEye
                    onClick={() => {
                      setToggleNewPassword(!toggleNewPassword);
                    }}
                    className="cursor-pointer hover:bg-gray-600 rounded-full"
                  />
                )}
              </label>
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md"
              {...register("link", { required: true })}
              onChange={handleInputChange}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white">
              {isPending ? <LoadingSpinner size="sm" /> : "Update"}
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};
export default EditProfileModal;
