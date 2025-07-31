import React from "react";
import { Search, Filter, Users } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";
import styles from "./UserSearchAndFilters.module.css";

interface UserSearchAndFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  totalUsers: number;
}

export const UserSearchAndFilters: React.FC<UserSearchAndFiltersProps> = ({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onRefresh,
  isLoading,
  totalUsers,
}) => {
  console.log("UserSearchAndFilters: Rendering with search:", searchQuery, "role filter:", roleFilter);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h2 className={styles.title}>User Management</h2>
          <div className={styles.userCount}>
            <Users className={styles.countIcon} />
            <span>{totalUsers} total users</span>
          </div>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isLoading}
          variant="outline"
          className={styles.refreshButton}
        >
          Refresh
        </Button>
      </div>

      <div className={styles.filtersContainer}>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <Search className={styles.searchIcon} />
            <Input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        <div className={styles.filterContainer}>
          <Filter className={styles.filterIcon} />
          <Select value={roleFilter} onValueChange={onRoleFilterChange}>
            <SelectTrigger className={styles.roleSelect}>
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};