import { useEffect, useState } from "react";
import api from "../../api";
import AdminNav from "../../components/AdminNav";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function loadCategories() {
    api.get("/categories").then((res) => setCategories(res.data));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await api.post("/categories", { name: name.trim() });
      setMessage(
        `Added "${res.data.name}". Its picture key for config.js is: ${res.data.slug}`,
      );
      setName("");
      loadCategories();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not add the category");
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl mb-6">Admin</h1>
      <AdminNav />

      <div className="grid lg:grid-cols-2 gap-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-sm space-y-3 self-start"
        >
          <h2 className="text-2xl">Add a category</h2>
          {message && <p className="text-sm">{message}</p>}
          <input
            className="input"
            placeholder="Category name (for example Salwar Suits)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button className="btn btn-primary w-full">Add category</button>
        </form>

        <div>
          <h2 className="text-2xl mb-4">Categories ({categories.length})</h2>
          <div className="space-y-2">
            {categories.map((c) => (
              <div
                key={c.id}
                className="bg-white p-3 rounded-lg shadow-sm flex justify-between text-sm"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-ink/60">key: {c.slug}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
