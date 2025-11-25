import db from "../../../lib/db";

export default async function handler(req, res) {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "Missing user_id" });

  try {
    const [rows] = await db.query(
      `SELECT c.id, c.size, c.quantity, p.name, p.price, p.slug, p.images
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id]
    );

    // parse JSON images
    const cart = rows.map(item => ({
      ...item,
      images: JSON.parse(item.images)
    }));

    res.status(200).json({ cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
