"use client";
import { useState } from "react";
import { useRouter } from "next/router";

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const endpoint = isRegister ? "/api/register" : "/api/login";
    const bodyData = isRegister ? { username, email, password } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (isRegister) {
        alert("Registration successful! Please login.");
        setIsRegister(false);
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", data.username); 
        router.push("/home");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app">
      <div className="card">
        <h1 className="logoText">StreetKicks</h1>
        <h2>{isRegister ? "Register" : "Login"}</h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-gradient">
            {isRegister ? "Register" : "Login"}
          </button>
        </form>

        {error && <p style={{ color: "#ff4d4d", fontWeight: "700" }}>{error}</p>}

        <p style={{ marginTop: "1rem" }}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="link" onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}
