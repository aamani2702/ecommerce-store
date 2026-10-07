import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import AdminNav from "../../components/AdminNav";
import ImageManager from "../../components/ImageManager";
import { formatPrice } from "../../utils";

const EMPTY_FORM = {
  name: "",
  description: "",
  details: "",
  price: "",
  mrp: "",
  category_id: "",
  gender: "women",
  fabric: "",
  occasion: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [variantText, setVariantText] = useState("Free Size, Maroon, 10");
  const [message, setMessage] = useState("");

  function loadProducts() {
    api
      .get("/products", { params: { limit: 50 } })
      .then((res) => setProducts(res.data.products));
  }

  useEffect(() => {
    loadProducts();
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    // Each line: Size, Colour, Stock
    const variants = variantText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [size, color, stock] = line.split(",").map((s) => s.trim());
        return { size, color, stock: Number(stock) || 0 };
      });

    try {
      // The first image is the cover and is saved with the product
      const res = await api.post("/products", {
        ...form,
        price: Number(form.price),
        mrp: form.mrp === "" ? null : Number(form.mrp),
        category_id: form.category_id ? Number(form.category_id) : null,
        image_url: images[0] || "",
        variants,
      });

      let note = "Product created";
      // The remaining images are saved as the gallery
      if (images.length > 1) {
        try {
          await api.put(`/products/${res.data.id}/images`, { images });
        } catch {
          note =
            "Product created, but the extra images could not be saved. Use the Images link in the list to add them.";
        }
      }

      setMessage(note);
      setForm(EMPTY_FORM);
      setImages([]);
      loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not create the product");
    }
  }

  async function hideProduct(id) {
    if (!window.confirm("Hide this product from the store?")) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl mb-6">Admin</h1>
      <AdminNav />

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Create form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm space-y-3 self-start"
        >
          <h2 className="text-2xl">Add a product</h2>
          {message && <p className="text-sm">{message}</p>}

          <input
            className="input"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <textarea
            className="input h-24"
            name="description"
            placeholder="Short description"
            value={form.description}
            onChange={handleChange}
          />
          <textarea
            className="input h-28"
            name="details"
            placeholder={
              "Details, one per line (for example):\nFabric: Pure silk\nIncludes: Saree and blouse piece"
            }
            value={form.details}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Selling price"
              value={form.price}
              onChange={handleChange}
              required
            />
            <input
              className="input"
              name="mrp"
              type="number"
              min="0"
              step="0.01"
              placeholder="Original price (optional)"
              value={form.mrp}
              onChange={handleChange}
            />
          </div>
          <p className="text-xs text-ink/60">
            Fill the original price (higher than the selling price) to show a
            sale tag and a struck-through price.
          </p>

          <select
            className="input"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
          >
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            name="gender"
            value={form.gender}
            onChange={handleChange}
          >
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="kids">Kids</option>
            <option value="unisex">Unisex</option>
          </select>

          <input
            className="input"
            name="fabric"
            placeholder="Fabric (Silk, Cotton...)"
            value={form.fabric}
            onChange={handleChange}
          />
          <input
            className="input"
            name="occasion"
            placeholder="Occasion (Wedding, Festive, Casual)"
            value={form.occasion}
            onChange={handleChange}
          />

          <ImageManager images={images} setImages={setImages} />

          <label className="block text-sm">
            Variants, one per line: Size, Colour, Stock
            <textarea
              className="input h-28 mt-1 font-mono text-sm"
              value={variantText}
              onChange={(e) => setVariantText(e.target.value)}
            />
          </label>

          <button className="btn btn-primary w-full">Create product</button>
        </form>

        {/* Product list */}
        <div>
          <h2 className="text-2xl mb-4">Products ({products.length})</h2>
          <div className="space-y-2 max-h-[900px] overflow-y-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
              >
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt=""
                    className="w-12 h-16 object-cover rounded bg-sand"
                  />
                ) : (
                  <div className="w-12 h-16 rounded bg-sand" />
                )}
                <div className="flex-1 text-sm">
                  <Link
                    to={`/product/${p.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <p className="text-ink/60">
                    {formatPrice(p.price)}
                    {p.mrp && Number(p.mrp) > Number(p.price) && (
                      <span className="line-through ml-2">
                        {formatPrice(p.mrp)}
                      </span>
                    )}{" "}
                    · stock {p.total_stock}
                  </p>
                </div>
                <Link
                  to={`/admin/products/${p.id}/images`}
                  className="text-sm text-primary underline"
                >
                  Images
                </Link>
                <button
                  onClick={() => hideProduct(p.id)}
                  className="text-sm text-red-600 underline"
                >
                  Hide
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
