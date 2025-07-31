"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Battery, Zap, Sun, Shield } from "lucide-react";
import { Button } from "../components/Button";
import { ProductCard } from "../components/ProductCard";
import { useProductData } from "../helpers/useProductData";
import styles from "./_index.module.css";

export default function HomePage() {
  const { products } = useProductData();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Sustainable Energy Solutions for a Greener Tomorrow</h1>
          <p>
            Discover our range of high-quality batteries, inverters, and solar solutions
            designed to power your life while protecting our planet.
          </p>
          <div className={styles.heroButtons}>
            <Link to="/products">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg">Learn More</Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img
                        src="https://assets.combini.app/58588327-45fa-4136-94ed-f888b2a8b717/642abfaa-c937-4b98-9ff7-329f338085cf.jpg"
            alt="Green Energy Solutions batteries and products"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <h2>Our Product Categories</h2>
        <div className={styles.categoriesGrid}>
          <Link to="/products?category=Two-Wheeler+Batteries" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <Battery />
            </div>
            <h3>Two-Wheeler Batteries</h3>
            <p>Reliable power for your bikes and scooters</p>
          </Link>
          <Link to="/products?category=Four-Wheeler+Batteries" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <Battery />
            </div>
            <h3>Four-Wheeler Batteries</h3>
            <p>Long-lasting batteries for cars and SUVs</p>
          </Link>
          <Link to="/products?category=Inverters" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <Zap />
            </div>
            <h3>Inverters</h3>
            <p>Uninterrupted power supply for your home</p>
          </Link>
          <Link to="/products?category=Solar+PCU" className={styles.categoryCard}>
            <div className={styles.categoryIcon}>
              <Sun />
            </div>
            <h3>Solar PCU</h3>
            <p>Harness solar energy efficiently</p>
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <h2>Featured Products</h2>
          <Link to="/products" className={styles.viewAllLink}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className={styles.productsGrid}>
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              id={product.id.toString()}
              title={product.title}
              image={product.imageUrl || ''}
              category={product.category}
              price={product.price}
              stock={product.stock}
            />
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <h2>Why Choose Green Energy Solutions?</h2>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Shield />
            </div>
            <h3>Quality Guaranteed</h3>
            <p>All our products come with extended warranty and quality assurance</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Sun />
            </div>
            <h3>Eco-Friendly</h3>
            <p>Sustainable solutions that reduce your carbon footprint</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Zap />
            </div>
            <h3>Energy Efficient</h3>
            <p>Products designed to maximize energy efficiency and reduce costs</p>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className={styles.testimonialSection}>
        <h2>What Our Customers Say</h2>
        <div className={styles.testimonial}>
          <p>
            "I've been using the Luminous Solar NXT for over a year now, and it has significantly reduced my electricity bills. The customer service from Green Energy Solutions has been exceptional!"
          </p>
          <div className={styles.testimonialAuthor}>
            <strong>Rajesh Kumar</strong>
            <span>Solar PCU Customer</span>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2>Ready to Switch to Green Energy?</h2>
          <p>Browse our collection of sustainable energy solutions and take the first step towards a greener future.</p>
          <Link to="/products">
            <Button size="lg">Shop Now</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}