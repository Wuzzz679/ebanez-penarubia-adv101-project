import db from "../../../lib/db";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: "Category slug is required" });

  try {
   
    const [rows] = await db.query(
      "SELECT id, name, slug, price, image FROM products WHERE category = ?",
      [slug.toUpperCase()] 
    );

    if (rows.length === 0) return res.status(404).json({ error: "No shoes found in this category" });

   
    res.status(200).json({ shoes: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error: " + err.message });
  }
}
