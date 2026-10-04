import { useState } from "react";
import api from "../api";

const MAX_IMAGES = 10;

// Shows a list of image links, lets the admin upload several photos,
// add a link, choose the cover (first image) and remove images.
export default function ImageManager({ images, setImages }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlText, setUrlText] = useState("");

  async function handleFiles(e) {
    const files = Array.from(e.target.files);
    e.target.value = ""; // lets the admin choose the same file again later
    if (files.length === 0) return;

    if (images.length + files.length > MAX_IMAGES) {
      setError(`A product can have at most ${MAX_IMAGES} images`);
      return;
    }

    setError("");
    setUploading(true);
    const uploaded = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      try {
        const res = await api.post("/uploads", formData);
        uploaded.push(res.data.url);
      } catch (err) {
        setError(
          `${file.name}: ${err.response?.data?.message || "Upload failed"}`,
        );
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  }

  function addUrl() {
    const url = urlText.trim();
    if (!/^https?:\/\//i.test(url)) {
      setError("Paste a full link starting with https://");
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setError(`A product can have at most ${MAX_IMAGES} images`);
      return;
    }
    setError("");
    setImages((prev) => [...prev, url]);
    setUrlText("");
  }

  function removeImage(index) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function makeCover(index) {
    setImages((prev) => [prev[index], ...prev.filter((_, i) => i !== index)]);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        Product images (the first one is the cover)
      </p>

      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFiles}
        className="text-sm"
      />
      {uploading && (
        <p className="text-sm text-ink/70">Uploading... please wait</p>
      )}

      <div className="flex gap-2">
        <input
          className="input text-sm"
          placeholder="Or paste an image link (https://...)"
          value={urlText}
          onChange={(e) => setUrlText(e.target.value)}
        />
        <button
          type="button"
          onClick={addUrl}
          className="btn btn-outline text-sm"
        >
          Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length === 0 ? (
        <p className="text-sm text-ink/60">No images yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {images.map((url, i) => (
            <div
              key={url + i}
              className="bg-white rounded border border-pastel-dark p-1 text-xs"
            >
              <div className="aspect-[3/4] bg-sand overflow-hidden rounded">
                <img src={url} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="mt-1 flex flex-col gap-1">
                {i === 0 ? (
                  <span className="text-primary font-semibold text-center">
                    Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    className="underline"
                  >
                    Make cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-red-600 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
