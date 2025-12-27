export default function CatalogStats({
  totalLoaded,
  showing,
  loading,
}: {
  totalLoaded: number;
  showing: number;
  loading: boolean;
}) {
  return (
    <div className="text-white/70 text-sm">
      {loading
        ? "Cargando…"
        : `Cargadas: ${totalLoaded} · Mostrando: ${showing}`}
    </div>
  );
}
