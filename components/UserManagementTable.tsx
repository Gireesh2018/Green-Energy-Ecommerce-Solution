import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Shield, Mail, Calendar, MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { Button } from "./Button";
import { Badge } from "./Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { postUsersUpdateRole } from "../endpoints/users/update_role_POST.schema";
import { formatDate } from "../helpers/formatDate";
import { useAuth } from "../helpers/useAuth";
import styles from "./UserManagementTable.module.css";

interface UserData {
  id: number;
  email: string;
  displayName: string;
  role: "admin" | "user";
  registrationDate: string | null;
}

interface UserManagementTableProps {
  users: UserData[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const UserManagementTable: React.FC<UserManagementTableProps> = ({
  users,
  isLoading,
  onRefresh,
}) => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "user">("user");
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  console.log("UserManagementTable: Rendering with", users.length, "users");

  const updateRoleMutation = useMutation({
    mutationFn: postUsersUpdateRole,
    onSuccess: (data) => {
      console.log("UserManagementTable: Role update successful:", data);
      queryClient.invalidateQueries({ queryKey: ["users", "list"] });
      setRoleChangeDialogOpen(false);
      setSelectedUser(null);
      onRefresh();
    },
    onError: (error) => {
      console.error("UserManagementTable: Role update failed:", error);
    },
  });

  const handleRoleChange = (user: UserData, role: "admin" | "user") => {
    console.log("UserManagementTable: Initiating role change for user:", user.id, "to role:", role);
    setSelectedUser(user);
    setNewRole(role);
    setRoleChangeDialogOpen(true);
  };

  const confirmRoleChange = () => {
    if (!selectedUser) return;

    console.log("UserManagementTable: Confirming role change for user:", selectedUser.id);
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      newRole: newRole,
    });
  };

  const currentUserId = authState.type === "authenticated" ? authState.user.id : null;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSkeleton}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className={styles.skeletonRow}>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
              <div className={styles.skeletonCell}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={styles.emptyState}>
        <User className={styles.emptyIcon} />
        <h3>No users found</h3>
        <p>No users match your current search criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCell}>User</th>
              <th className={styles.headerCell}>Email</th>
              <th className={styles.headerCell}>Role</th>
              <th className={styles.headerCell}>Registration Date</th>
              <th className={styles.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={styles.dataRow}>
                <td className={styles.dataCell}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className={styles.userDetails}>
                      <span className={styles.userName}>{user.displayName}</span>
                      {currentUserId === user.id && (
                        <span className={styles.currentUserBadge}>You</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className={styles.dataCell}>
                  <div className={styles.emailContainer}>
                    <Mail className={styles.emailIcon} />
                    {user.email}
                  </div>
                </td>
                <td className={styles.dataCell}>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? (
                      <>
                        <Shield className={styles.roleIcon} />
                        Admin
                      </>
                    ) : (
                      <>
                        <User className={styles.roleIcon} />
                        User
                      </>
                    )}
                  </Badge>
                </td>
                <td className={styles.dataCell}>
                  <div className={styles.dateContainer}>
                    <Calendar className={styles.dateIcon} />
                    {user.registrationDate ? formatDate(user.registrationDate) : "N/A"}
                  </div>
                </td>
                <td className={styles.dataCell}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className={styles.actionIcon} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role === "user" ? (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, "admin")}
                          disabled={updateRoleMutation.isPending}
                        >
                          <UserCheck className={styles.menuIcon} />
                          Promote to Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, "user")}
                          disabled={currentUserId === user.id || updateRoleMutation.isPending}
                        >
                          <UserX className={styles.menuIcon} />
                          Demote to User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={roleChangeDialogOpen} onOpenChange={setRoleChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to {newRole === "admin" ? "promote" : "demote"}{" "}
              <strong>{selectedUser?.displayName}</strong> to{" "}
              <strong>{newRole}</strong> role?
              {newRole === "admin" && (
                <span className={styles.warningText}>
                  <br />
                  This will give them full administrative access to the system.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleChangeDialogOpen(false)}
              disabled={updateRoleMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmRoleChange}
              disabled={updateRoleMutation.isPending}
              variant={newRole === "admin" ? "primary" : "destructive"}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};