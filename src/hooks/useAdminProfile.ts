"use client";

import { useState, useEffect } from "react";

export function useAdminProfile() {
  const [profile, setProfile] = useState({
    firstName: "Admin",
    lastName: "User",
    email: "admin@school.com",
    phone: "+92 300 1234567",
    address: "Lahore, Pakistan"
  });

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem("admin_profile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }

    // Listen for cross-tab or same-tab changes if we dispatch events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "admin_profile" && e.newValue) {
        setProfile(JSON.parse(e.newValue));
      }
    };
    
    // Custom event listener for same-tab updates
    const handleLocalUpdate = () => {
      const savedLocal = localStorage.getItem("admin_profile");
      if (savedLocal) {
        setProfile(JSON.parse(savedLocal));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profile_updated", handleLocalUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profile_updated", handleLocalUpdate);
    };
  }, []);

  return profile;
}
