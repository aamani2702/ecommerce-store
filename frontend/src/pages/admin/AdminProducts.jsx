import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import AdminNav from "../../components/AdminNav";
import { formatPrice } from "../../utils";

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category_id: "",
  gender: "women",
  fabric: "",
  occasion: "",
  image_url: "",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
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
      await api.post("/products", {
        ...form,
        price: Number(form.price),
        category_id: form.category_id ? Number(form.category_id) : null,
        variants,
      });
      setMessage("Product created");
      setForm(EMPTY_FORM);
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
      <h1 className="text-3xl mb-6">Admin</h1>
      <AdminNav />

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Create form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm space-y-3"
        >
          <h2 className="text-xl">Add a product</h2>
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
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <input
            className="input"
            name="price"
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

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
          <input
            className="input"
            name="image_url"
            placeholder="Image URL"
            value={form.image_url}
            onChange={handleChange}
          />

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
          <h2 className="text-xl mb-4">Products ({products.length})</h2>
          <div className="space-y-2 max-h-[700px] overflow-y-auto">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm"
              >
                <img
                  src={p.image_url}
                  alt=""
                  className="w-12 h-16 object-cover rounded bg-gray-100"
                />
                <div className="flex-1 text-sm">
                  <Link
                    to={`/product/${p.id}`}
                    className="font-medium hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <p className="text-gray-500">
                    {formatPrice(p.price)} · stock {p.total_stock}
                  </p>
                </div>
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
