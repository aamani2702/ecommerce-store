   CREATE TABLE IF NOT EXISTS product_images (
     id SERIAL PRIMARY KEY,
     product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
     url TEXT NOT NULL,
     position INTEGER NOT NULL DEFAULT 0
   );

   CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);