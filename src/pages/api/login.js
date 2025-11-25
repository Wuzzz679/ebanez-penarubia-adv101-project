import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../../lib/db"; 

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ message: "Method not allowed" });

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(400).json({ message: "Invalid email or password" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );

    return res.status(200).json({ 
      message: "Login successful", 
      token, 
      username: user.username,
      email: user.email  
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}