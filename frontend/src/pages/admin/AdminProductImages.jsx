import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api";
import AdminNav from "../../components/AdminNav";
import ImageManager from "../../components/ImageManager";

export default function AdminProductImages() {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setName(res.data.name))
      .catch(() => setMessage("Product not found"));
    api
      .get(`/products/${id}/images`)
      .then((res) => setImages(res.data.images))
      .catch(() => {});
  }, [id]);

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      await api.put(`/products/${id}/images`, { images });
      setMessage("Images saved");
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not save the images");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-4xl mb-6">Admin</h1>
      <AdminNav />

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <h2 className="text-2xl">Images for: {name}</h2>
        {message && <p className="text-sm">{message}</p>}

        <ImageManager images={images} setImages={setImages} />

        <div className="flex items-center gap-4">
          <button onClick={save} disabled={saving} className="btn btn-primary">
            {saving ? "Saving..." : "Save images"}
          </button>
          <Link to="/admin/products" className="text-sm text-primary underline">
            Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
