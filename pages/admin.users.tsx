import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { getUsersList } from "../endpoints/users/list_GET.schema";
import { UserSearchAndFilters } from "../components/UserSearchAndFilters";
import { UserManagementTable } from "../components/UserManagementTable";
import { UserPagination } from "../components/UserPagination";
import { useDebounce } from "../helpers/useDebounce";
import styles from "./admin.users.module.css";

const USERS_PER_PAGE = 20;

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  console.log("AdminUsersPage: Rendering with page:", currentPage, "search:", debouncedSearchQuery, "role:", roleFilter);

  // Fetch users data with React Query
  const {
    data: usersData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", "list", currentPage, debouncedSearchQuery, roleFilter],
    queryFn: async () => {
      console.log("AdminUsersPage: Fetching users data");
      const params: any = {
        page: currentPage.toString(),
        limit: USERS_PER_PAGE.toString(),
      };

      if (debouncedSearchQuery.trim()) {
        params.search = debouncedSearchQuery.trim();
      }

      const result = await getUsersList(params);
      console.log("AdminUsersPage: Received users data:", result);
      return result;
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  // Filter users by role on the client side if needed
  const filteredUsers = useMemo(() => {
    if (!usersData?.users) return [];
    
    if (roleFilter === "all") {
      return usersData.users;
    }
    
    return usersData.users.filter(user => user.role === roleFilter);
  }, [usersData?.users, roleFilter]);

  const handleSearchChange = (query: string) => {
    console.log("AdminUsersPage: Search query changed:", query);
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleFilterChange = (role: string) => {
    console.log("AdminUsersPage: Role filter changed:", role);
    setRoleFilter(role);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    console.log("AdminUsersPage: Page changed to:", page);
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    console.log("AdminUsersPage: Refreshing users data");
    refetch();
  };

  if (error) {
    console.error("AdminUsersPage: Error loading users:", error);
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <h2>Error Loading Users</h2>
          <p>
            {error instanceof Error 
              ? error.message 
              : "An unexpected error occurred while loading users."}
          </p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>User Management - Green Energy Solutions Admin</title>
        <meta 
          name="description" 
          content="Manage user accounts, roles, and permissions for Green Energy Solutions platform." 
        />
      </Helmet>

      <div className={styles.container}>
        <UserSearchAndFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          roleFilter={roleFilter}
          onRoleFilterChange={handleRoleFilterChange}
          onRefresh={handleRefresh}
          isLoading={isFetching}
          totalUsers={usersData?.pagination.totalUsers || 0}
        />

        <UserManagementTable
          users={filteredUsers}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />

        {usersData?.pagination && (
          <UserPagination
            currentPage={usersData.pagination.currentPage}
            totalPages={usersData.pagination.totalPages}
            totalUsers={usersData.pagination.totalUsers}
            limit={usersData.pagination.limit}
            hasNextPage={usersData.pagination.hasNextPage}
            hasPreviousPage={usersData.pagination.hasPreviousPage}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        )}
      </div>
    </>
  );
}