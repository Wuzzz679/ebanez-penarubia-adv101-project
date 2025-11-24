import mysql from "mysql2/promise";

// MySQL connection pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "streetkicks",
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Fetch all shoes
    const [rows] = await db.query("SELECT * FROM shoes ORDER BY created_at DESC");

    return res.status(200).json({ shoes: rows });
  } catch (error) {
    console.error("Error fetching shoes:", error);
    return res.status(500).json({ message: "Failed to fetch shoes" });
  }
}
