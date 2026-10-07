import { useState } from "react";
import { BRAND } from "../config";

export default function SizeGuide() {
  const [open, setOpen] = useState(false);
  const guide = BRAND.sizeGuide;
  if (!guide) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs underline text-primary"
      >
        Size guide
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl">Size guide ({guide.unit})</h3>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-3xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead>
                  <tr className="bg-sand">
                    {guide.columns.map((c) => (
                      <th key={c} className="p-2 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row, i) => (
                    <tr key={i} className="border-t border-pastel-dark">
                      {row.map((cell, j) => (
                        <td key={j} className="p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {guide.note && (
              <p className="text-xs text-ink/60 mt-3">{guide.note}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
