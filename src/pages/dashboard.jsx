"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
    } else {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <div className="app">
      <div className="card">
        <h1>Welcome, {user}!</h1>
        <p>You are now logged in.</p>
        <button className="btn-gradient" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
