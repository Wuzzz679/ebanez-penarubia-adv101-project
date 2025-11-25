import db from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { cart_id } = req.body;
  if (!cart_id) return res.status(400).json({ error: "Missing cart_id" });

  try {
    await db.query("DELETE FROM cart WHERE id = ?", [cart_id]);
    res.status(200).json({ message: "Item removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
