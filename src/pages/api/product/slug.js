import db from "@/lib/db";

export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) return res.status(400).json({ error: "Missing slug" });

  try {
   
    const [products] = await db.query("SELECT * FROM products WHERE slug = ?", [slug]);
    if (products.length === 0) return res.status(404).json({ error: "Product not found" });

    const product = products[0];

    const [images] = await db.query("SELECT url FROM product_images WHERE product_id = ?", [product.id]);
    product.images = images.map(img => img.url);

    res.status(200).json({ shoe: product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
