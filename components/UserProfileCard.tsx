import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, User, Mail, Calendar } from "lucide-react";
import { Button } from "./Button";
import { useAuth, AUTH_QUERY_KEY } from "../helpers/useAuth";
import { postUsersProfileUpdate } from "../endpoints/users/profile/update_POST.schema";
import { formatDate } from "../helpers/formatDate";
import styles from "./UserProfileCard.module.css";

interface UserProfileCardProps {
  className?: string;
}

export const UserProfileCard: React.FC<UserProfileCardProps> = ({ className }) => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    email: "",
    avatarUrl: ""
  });

  console.log("UserProfileCard: Rendering with auth state", authState.type);

  const updateProfileMutation = useMutation({
    mutationFn: postUsersProfileUpdate,
    onSuccess: (data) => {
      console.log("Profile updated successfully:", data);
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Profile update failed:", error);
    }
  });

  if (authState.type !== "authenticated") {
    return null;
  }

  const { user } = authState;

  const handleEditClick = () => {
    console.log("Starting profile edit");
    setEditForm({
      displayName: user.displayName || "",
      email: user.email || "",
      avatarUrl: user.avatarUrl || ""
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log("Saving profile changes:", editForm);
    updateProfileMutation.mutate({
      displayName: editForm.displayName || undefined,
      email: editForm.email || undefined,
      avatarUrl: editForm.avatarUrl || null
    });
  };

  const handleCancel = () => {
    console.log("Cancelling profile edit");
    setIsEditing(false);
    setEditForm({
      displayName: "",
      email: "",
      avatarUrl: ""
    });
  };

  return (
    <div className={`${styles.card} ${className || ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Profile Information</h2>
        {!isEditing && (
          <Button variant="ghost" size="icon-sm" onClick={handleEditClick}>
            <Edit size={16} />
          </Button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.avatarSection}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <User size={32} />
            </div>
          )}
        </div>

        <div className={styles.infoSection}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Display Name</label>
                <input
                  type="text"
                  value={editForm.displayName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                  className={styles.input}
                  placeholder="Enter your name"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className={styles.input}
                  placeholder="Enter your email"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Avatar URL</label>
                <input
                  type="url"
                  value={editForm.avatarUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                  className={styles.input}
                  placeholder="Enter avatar URL"
                />
              </div>

              <div className={styles.editActions}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className={styles.infoDisplay}>
              <div className={styles.infoItem}>
                <User size={16} />
                <span>{user.displayName || "No name set"}</span>
              </div>
              
              <div className={styles.infoItem}>
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
              
              <div className={styles.infoItem}>
                <Calendar size={16} />
                <span>Member since {formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};