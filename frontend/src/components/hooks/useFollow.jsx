import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export const useFollow = () => {
  const queryClient = useQueryClient();
  let followingID;

  const { mutate: follow, isPending } = useMutation({
    mutationFn: async (toBeFollowedUserID) => {
      const res = await fetch("/api/user/follow", {
        mode: "cors",
        method: "POST",
        body: JSON.stringify({ toBeFollowedUserID }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Something went wrong");

      const data = await res.json();

      followingID = toBeFollowedUserID;

      return data.data.notification;
    },
    onSuccess: () => {
      toast.success("Followed Successfully");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
      ]);
    },
    onError: () => {
      throw new Error("Something went wrong");
    },
  });

  return { follow, isPending };
};
