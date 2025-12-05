"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/auth.module.css"; 

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

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
        localStorage.setItem("user", data.email);
        localStorage.setItem("username", data.username);
        router.push("/home");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check password strength
  const checkPasswordStrength = (pass) => {
    const checks = {
      length: pass.length >= 6,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass)
    };
    return checks;
  };

  const passwordChecks = checkPasswordStrength(password);

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.logoText}>StreetKicks</h1>
        <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>

        <form className={styles.authForm} onSubmit={handleSubmit}>
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
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Show password requirements only on register */}
            {isRegister && (
              <div className={styles.passwordRequirements}>
                <p>Password must have:</p>
                <ul>
                  <li className={passwordChecks.length ? styles.met : ""}>
                    At least 6 characters
                  </li>
                  <li className={passwordChecks.uppercase ? styles.met : ""}>
                    One uppercase letter
                  </li>
                  <li className={passwordChecks.lowercase ? styles.met : ""}>
                    One lowercase letter
                  </li>
                  <li className={passwordChecks.number ? styles.met : ""}>
                    One number
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button 
            type="submit" 
            className={`${styles.authButton} ${loading ? styles.submitting : ""}`}
            disabled={loading}
          >
            {loading ? "Processing..." : (isRegister ? "Create Account" : "Login")}
          </button>
        </form>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <p className={styles.toggleText}>
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <span 
            className={styles.link} 
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setUsername("");
              setEmail("");
              setPassword("");
            }}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}