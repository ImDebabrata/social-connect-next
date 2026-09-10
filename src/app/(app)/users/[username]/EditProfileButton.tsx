"use client";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/types";
import React, { useState } from "react";
import EditProfileDialog from "./EditProfileDialog";

interface EditProfileButtonProps {
  user: UserData;
  email?: string | null;
}

function EditProfileButton(props: EditProfileButtonProps) {
  const { user, email } = props;
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <Button variant={"outline"} onClick={() => setShowDialog(true)}>
        Edit Profile
      </Button>
      <EditProfileDialog
        user={user}
        email={email}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  );
}

export default EditProfileButton;
