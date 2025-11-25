import db from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { user_id, product_id, size, quantity } = req.body;
  if (!user_id || !product_id || !size || !quantity)
    return res.status(400).json({ error: "Missing fields" });

  try {
    await db.query(
      "INSERT INTO cart (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)",
      [user_id, product_id, size, quantity]
    );
    res.status(200).json({ message: "Added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
