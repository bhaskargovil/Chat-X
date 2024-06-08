import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, username }) => {
  let POST_ENDPOINT;
  if (feedType == "forYou")
    POST_ENDPOINT = "http://localhost:8000/api/post/allposts";
  if (feedType == "following")
    POST_ENDPOINT = "http://localhost:8000/api/post/allfollowingposts";
  if (feedType == "posts")
    POST_ENDPOINT = `http://localhost:8000/api/post/posts/${username}`;
  if (feedType == "likes")
    POST_ENDPOINT = `http://localhost:8000/api/post/alllikedposts/${username}`;

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(POST_ENDPOINT, {
          mode: "cors",
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const jsonData = await res.json();
        const data = jsonData.data;

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch]);

  return (
    <>
      {isLoading ||
        (isRefetching && (
          <div className="flex flex-col justify-center">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ))}
      {!isLoading && !isRefetching && posts?.length == 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts && (
        <div>
          {posts.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
