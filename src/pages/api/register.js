import bcrypt from "bcryptjs";
import db from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: "Missing fields" });

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }
    if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one uppercase letter" });
  }
    if (!/[a-z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one lowercase letter" });
  }
    if (!/\d/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one number" });
  }

  try {

    const [existingEmail] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingEmail.length > 0)
      return res.status(400).json({ message: "Email already exists" });

 
    const [existingUsername] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUsername.length > 0)
      return res.status(400).json({ message: "Username already taken" });
 

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    return res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}