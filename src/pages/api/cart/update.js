import db from "../../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { cart_id, quantity } = req.body;
  if (!cart_id || !quantity)
    return res.status(400).json({ error: "Missing fields" });

  try {
    await db.query("UPDATE cart SET quantity = ? WHERE id = ?", [quantity, cart_id]);
    res.status(200).json({ message: "Cart updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
