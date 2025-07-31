import React from "react";
import { Helmet } from "react-helmet";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  console.log("Rendering login page");

  return (
    <>
      <Helmet>
        <title>Login - Green Energy Solutions</title>
        <meta name="description" content="Login to your Green Energy Solutions account to access our sustainable energy products and services." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <div className={styles.header}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>⚡</div>
              <h1 className={styles.companyName}>Green Energy Solutions</h1>
            </div>
            <p className={styles.subtitle}>
              Sign in to access sustainable energy products
            </p>
          </div>
          
          <div className={styles.formContainer}>
            <PasswordLoginForm className={styles.loginForm} />
          </div>
          
          <div className={styles.footer}>
            <p className={styles.footerText}>
              Powering a sustainable future with innovative energy solutions
            </p>
          </div>
        </div>
      </div>
    </>
  );
}