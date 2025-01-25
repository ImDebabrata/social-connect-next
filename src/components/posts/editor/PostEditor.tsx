"use client";
import { TextareaComponent } from "@/components/Textarea";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import React, { useState } from "react";
import { useSubmitPostMutation } from "./mutation";

function PostEditor() {
  const { user } = useCurrentSession();
  const [postValue, setPostValue] = useState("");

  const onSubmitPost = useSubmitPostMutation();

  function handleSubmitPost() {
    onSubmitPost.mutate(postValue, {
      onSuccess: () => {
        setPostValue("");
      },
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user?.avatarUrl} className="hidden sm:inline" />
        <TextareaComponent
          value={postValue}
          onChange={(e) => {
            setPostValue(e.target.value);
          }}
        />
      </div>
      <div className="flex justify-end">
        <Button
          className="min-w-20"
          onClick={handleSubmitPost}
          disabled={!postValue.trim()}
        >
          Post
        </Button>
      </div>
    </div>
  );
}

export default PostEditor;
