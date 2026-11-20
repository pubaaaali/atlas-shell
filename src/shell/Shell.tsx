import { useRef } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getWorkloads } from "./registry";

export default function Shell() {
  const workloads = getWorkloads();
  const mainRef = useRef<HTMLElement>(null);

  return (
    <div className="shell">
      <button
        type="button"
        className="skip-link"
        onClick={() => mainRef.current?.focus()}
      >
        Skip to content
      </button>
      <header className="topbar">
        <span className="brand">Atlas</span>
        <span className="muted">Workspace shell</span>
      </header>
      <nav className="sidebar" aria-label="Workloads">
        <NavLink to="/" end>
          Home
        </NavLink>
        {workloads.map((w) => (
          <NavLink key={w.id} to={`/workloads/${w.id}`}>
            <span aria-hidden="true">{w.icon}</span> {w.title}
          </NavLink>
        ))}
      </nav>
      <main ref={mainRef} tabIndex={-1} className="content">
        <Outlet />
      </main>
    </div>
  );
}