import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  const { mutateAsync: updateDetails, isPending } = useMutation({
    mutationFn: async (formdata) => {
      const res = await fetch("http://localhost:8000/api/user/update", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formdata),
        credentials: "include",
      });

      const data = await res.json();
      console.log(data.data);
      return data.data;
    },
    onSuccess: () => {
      toast.success("User Details Updated");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
      ]);
    },
    onError: () => {
      toast.error("Updating User Details Failed");
    },
  });

  return { updateDetails, isPending };
}
