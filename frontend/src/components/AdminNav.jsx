import { NavLink } from "react-router-dom";

export default function AdminNav() {
  const cls = ({ isActive }) =>
    `px-4 py-2 rounded text-sm ${isActive ? "bg-primary text-cream" : "bg-white border border-gray-300"}`;
  return (
    <div className="flex gap-3 mb-8">
      <NavLink to="/admin/products" className={cls}>
        Products
      </NavLink>
      <NavLink to="/admin/categories" className={cls}>
        Categories
      </NavLink>
      <NavLink to="/admin/orders" className={cls}>
        Orders
      </NavLink>
    </div>
  );
}
