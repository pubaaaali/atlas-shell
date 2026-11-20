import { Link } from "react-router-dom";
import { getWorkloads } from "./registry";

export default function Home() {
  const workloads = getWorkloads();

  return (
    <section aria-labelledby="home-heading">
      <h1 id="home-heading">Workloads</h1>
      <p className="muted">
        Pick a workload to open it. Each one loads only when you open it.
      </p>
      <ul className="tiles">
        {workloads.map((w) => (
          <li key={w.id}>
            <Link className="tile" to={`/workloads/${w.id}`}>
              <span className="tile-icon" aria-hidden="true">
                {w.icon}
              </span>
              <span className="tile-title">{w.title}</span>
              <span className="tile-desc">{w.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}