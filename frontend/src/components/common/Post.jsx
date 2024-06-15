import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { FcLike } from "react-icons/fc";
import { PostDate } from "../../utils/date";
import { MdModeEdit } from "react-icons/md";

const Post = ({ post }) => {
  const { data: userData } = useQuery({ queryKey: ["authUser"] });
  const [comment, setComment] = useState("");
  const postOwner = post.user;
  const isLiked = post.likes.includes(userData._id);
  const isMyPost = userData._id == post.user._id;
  const formattedDate = PostDate(post.createdAt);
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState({
    state: false,
    commentId: "",
  });

  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/post/delete", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Post couldn't be deleted");
    },
    onSuccess: () => {
      toast.success("Post Deleted Successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: commentOnPost, isPending: isCommenting } = useMutation({
    mutationFn: async (comment) => {
      const res = await fetch("/api/post/comment", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id, text: comment }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Comment couldn't be made");

      const jsondata = await res.json();
      const data = jsondata.data;
      return data;
    },
    onSuccess: () => {
      toast.success("Comment added Successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/post/like", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post._id }),
        credentials: "include",
      });

      const jsonData = await res.json();
      const data = jsonData.data._id;
      return data;
    },
    onSuccess: () => {
      isLiked
        ? toast.success("Post Unliked Successfully")
        : toast.success("Post Liked Successfully");
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      // using the above statement will not lead to good UX, hence instead use this

      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { mutate: commentDeleteHandler, isPending: isDeletingComment } =
    useMutation({
      mutationFn: async (commentId) => {
        const res = await fetch("/api/post/deletecomment", {
          body: JSON.stringify({ commentId, postId: post._id }),
          headers: {
            "Content-Type": "application/json",
          },
          mode: "cors",
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) throw new Error("Couldn't delete post");

        const jsonData = await res.json();
        return jsonData.data;
      },
      onSuccess: () => {
        toast.success("Comment deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
      },
      onError: () => {
        toast.error("Comment couldn't be deleted");
      },
    });

  const { mutate: editCommentHandler, isPending: isEditingComment } =
    useMutation({
      mutationFn: async (comment) => {
        const res = await fetch("/api/post/editcomment", {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            commentId: isEditing.commentId,
            postId: post._id,
            text: comment,
          }),
          mode: "cors",
          method: "POST",
          credentials: "include",
        });

        const jsonData = await res.json();
        return jsonData.data;
      },
    });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e) => {
    e.preventDefault();
    commentOnPost(comment);
  };

  const handleLikePost = () => {
    likePost();
  };

  const handleDeleteComment = (commentId) => {
    commentDeleteHandler(commentId);
  };

  const editComment = () => {
    editCommentHandler(comment);
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullname}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeleting && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}

                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="flex gap-2 items-start justify-between px-2 mb-2"
                      >
                        <div className="flex gap-3">
                          <div className="avatar">
                            <div className="w-10 rounded-full">
                              <img
                                src={
                                  comment.user.profileImg ||
                                  "/avatar-placeholder.png"
                                }
                              />
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-bold">
                                {comment.user.fullname}
                              </span>
                              <span className="text-gray-700 text-sm">
                                @{comment.user.username}
                              </span>
                            </div>
                            <div className="text-sm">{comment.text}</div>
                          </div>
                        </div>
                        <div className="flex gap-10">
                          {(comment.user._id == userData._id || isMyPost) && (
                            <div className="hover: cursor-pointer">
                              {isDeletingComment && (
                                <LoadingSpinner size="sm" />
                              )}
                              {!isDeletingComment && (
                                <FaTrash
                                  onClick={() => {
                                    handleDeleteComment(comment._id);
                                  }}
                                />
                              )}
                            </div>
                          )}
                          {comment.user._id == userData._id && (
                            <div className="hover: cursor-pointer">
                              <MdModeEdit
                                onClick={() => {
                                  setIsEditing({
                                    state: true,
                                    commentId: comment._id,
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={(e) => {
                      isEditing.state ? editComment() : handlePostComment(e);
                    }}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder={
                        isEditing.state
                          ? "Edit the text here..."
                          : "Add a comment..."
                      }
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting || isEditingComment ? (
                        <span className="loading loading-spinner loading-md"></span>
                      ) : (
                        "Post"
                      )}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {!isLiked && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && <FcLike />}
                {isLiking && <LoadingSpinner size="sm" />}

                <span
                  className={`text-sm text-slate-500 group-hover:text-red-500 ${
                    isLiked ? "text-pink-500" : ""
                  }`}
                >
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer hover:border-white" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
