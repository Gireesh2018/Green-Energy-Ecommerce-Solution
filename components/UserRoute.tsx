import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { AuthLoadingState } from "./AuthLoadingState";
import styles from "./UserRoute.module.css";

interface UserRouteProps {
  children: React.ReactNode;
  className?: string;
}

export const UserRoute: React.FC<UserRouteProps> = ({ children, className }) => {
  const { authState } = useAuth();
  const location = useLocation();

  console.log("UserRoute: Authentication state check", {
    type: authState.type,
    pathname: location.pathname,
  });

  if (authState.type === "loading") {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <AuthLoadingState title="Verifying access..." />
      </div>
    );
  }

  if (authState.type === "unauthenticated") {
    console.log("UserRoute: Redirecting unauthenticated user to login", {
      from: location.pathname,
      errorMessage: authState.errorMessage,
    });
    
    // Redirect to login with the current location as state so we can redirect back after login
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // User is authenticated (either regular user or admin)
  console.log("UserRoute: Access granted", {
    userId: authState.user.id,
    userRole: authState.user.role,
    pathname: location.pathname,
  });

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {children}
    </div>
  );
};