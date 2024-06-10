import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { PostDate } from "../../utils/date";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";
import { MdClear } from "react-icons/md";

const SearchPage = () => {
  const [userEntered, setUserEntered] = useState("");
  const queryClient = useQueryClient();

  const { data: foundUsers, isPending } = useQuery({
    queryKey: ["searchUser"],
    queryFn: async () => {
      const res = await fetch("/api/user/search", {
        method: "POST",
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userEntered }),
      });

      const jsonData = await res.json();
      return jsonData.data;
    },
  });

  const handleInputChange = (e) => {
    setUserEntered(e);
    queryClient.invalidateQueries({ queryKey: ["searchUser"] });
    console.log(foundUsers);
  };

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["searchUser"] });
  }, []);

  return (
    <div className=" min-h-screen bg-black text-white p-5 w-full">
      <div className="mx-auto w-full">
        {/* Search Bar */}
        <div className="flex items-center border border-gray-700 rounded-full p-2 bg-black">
          <FaSearch className="text-gray-400 mx-2" />
          <input
            type="text"
            placeholder="Search for a username"
            className="bg-transparent outline-none text-white placeholder-gray-400 flex-grow"
            value={userEntered}
            onChange={(e) => {
              handleInputChange(e.target.value);
            }}
          />

          <MdClear
            className="text-gray-400 mx-2 hover:cursor-pointer"
            onClick={() => {
              setUserEntered("");
            }}
          />
        </div>

        <div className="flex justify-center mt-5 mb-5">
          {isPending && <LoadingSpinner size="xl" />}
        </div>

        {/* Results */}
        {foundUsers ? (
          foundUsers.map((user) => (
            <Link to={`/profile/${user?.username}`}>
              <div className="mt-5 space-y-4">
                <div className="flex items-center p-4 bg-black rounded-lg border border-gray-700">
                  <img
                    src={user?.profileImage || "/avatar-placeholder.png"}
                    alt="Cover"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h3 className="font-bold">{user?.username}</h3>
                    <p className="text-gray-400">{user?.fullname}</p>
                    <p className="text-gray-400">{PostDate(user?.createdAt)}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-4 bg-red-600 mt-5 text-white rounded-lg text-center">
            No user found with username {userEntered}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
