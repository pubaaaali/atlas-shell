import { Suspense } from "react";
import { useParams } from "react-router-dom";
import { getWorkload, getWorkloadComponent } from "./registry";

export default function WorkloadHost() {
  const { id = "" } = useParams();
  const definition = getWorkload(id);
  const Workload = getWorkloadComponent(id);

  if (!definition || !Workload) {
    return <p role="alert">Workload "{id}" was not found.</p>;
  }

  return (
    <section aria-labelledby="workload-heading">
      <h1 id="workload-heading">{definition.title}</h1>
      <Suspense fallback={<p role="status">Loading {definition.title}...</p>}>
        {/* eslint-disable-next-line react-hooks/static-components -- the registry caches each lazy component, so its identity is stable across renders */}
        <Workload />
      </Suspense>
    </section>
  );
}