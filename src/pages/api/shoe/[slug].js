import db from "../../../lib/db";

export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    const [rows] = await db.query("SELECT * FROM products WHERE slug = ?", [slug]);
    if (rows.length === 0) return res.status(404).json({ message: "Shoe not found" });

    const shoe = rows[0];
  
    if (typeof shoe.images === "string") shoe.images = JSON.parse(shoe.images);

    res.status(200).json({ shoe });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
