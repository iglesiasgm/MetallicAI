"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext";

type SubmissionStatus = "PENDING" | "REJECTED" | "PUBLISHED";

type SubmissionActor = {
  userId: string;
  username: string;
  role: "ADMIN" | "USER";
};

type BandSubmission = {
  id: string;
  status: SubmissionStatus;
  createdAt: string;
  updatedAt: string;
  reviewReason?: string;
  reviewedAt?: string;
  publishedAt?: string;
  publishedBandId?: string;
  createdBy?: SubmissionActor;
  reviewedBy?: SubmissionActor;
  flags?: { possibleDuplicate?: boolean };
  payload: any;
};

export default function AdminModerationPanel() {
  const { authFetch } = useAuth();

  const [status, setStatus] = useState<SubmissionStatus>("PENDING");
  const [items, setItems] = useState<BandSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<BandSubmission | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`/admin/band-submissions?status=${status}`, {
        method: "GET",
      });
      const data = await res.json().catch(() => []);
      if (!res.ok)
        throw new Error(data?.error ?? "Failed to fetch submissions");
      setItems(Array.isArray(data) ? data : []);
      // si la seleccionada ya no está, limpiamos
      if (selected && !data.some((x: any) => x.id === selected.id))
        setSelected(null);
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSelect = (s: BandSubmission) => {
    setSelected(s);
    setRejectReason("");
  };

  const approve = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await authFetch(
        `/admin/band-submissions/${selected.id}/approve`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Approve failed");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Approve error");
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await authFetch(
        `/admin/band-submissions/${selected.id}/reject`,
        {
          method: "POST",
          body: JSON.stringify({ reason: rejectReason || "Rejected by admin" }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Reject failed");
      await load();
    } catch (e: any) {
      setError(e?.message ?? "Reject error");
    } finally {
      setActionLoading(false);
    }
  };

  const rows = useMemo(() => items, [items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* LIST */}
      <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-sm opacity-80">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
              className="rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm"
            >
              <option value="PENDING">PENDING</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>

          <button
            onClick={load}
            className="rounded-xl px-3 py-2 text-sm bg-white/10 hover:bg-white/15"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Refresh"}
          </button>
        </div>

        {error ? <div className="p-4 text-sm text-red-300">{error}</div> : null}

        <div className="max-h-[520px] overflow-auto">
          {rows.length === 0 && !loading ? (
            <div className="p-4 text-sm opacity-70">No hay submissions.</div>
          ) : null}

          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-black/40">
              <tr className="text-left">
                <th className="p-3 font-medium">Band</th>
                <th className="p-3 font-medium">By</th>
                <th className="p-3 font-medium">Dup?</th>
                <th className="p-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const isSel = selected?.id === s.id;
                const bandName = s.payload?.name ?? "(no name)";
                const by = s.createdBy?.username ?? "unknown";
                const dup = s.flags?.possibleDuplicate ? "YES" : "NO";
                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelect(s)}
                    className={`cursor-pointer border-t border-white/5 hover:bg-white/5 ${
                      isSel ? "bg-white/10" : ""
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-medium">{bandName}</div>
                      <div className="text-xs opacity-60">{s.id}</div>
                    </td>
                    <td className="p-3">{by}</td>
                    <td className="p-3">{dup}</td>
                    <td className="p-3">
                      {new Date(s.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Detalle</h2>
        </div>

        {!selected ? (
          <div className="text-sm opacity-70">
            Seleccioná una submission para verla.
          </div>
        ) : (
          <>
            <div className="text-sm mb-3">
              <div className="opacity-80">Band:</div>
              <div className="font-semibold">{selected.payload?.name}</div>
              <div className="text-xs opacity-60 mt-1">{selected.id}</div>
            </div>

            <div className="text-sm mb-3">
              <div className="opacity-80">Created by:</div>
              <div>{selected.createdBy?.username ?? "unknown"}</div>
            </div>

            {selected.status !== "PENDING" ? (
              <div className="text-sm mb-3">
                <div className="opacity-80">Reviewed by:</div>
                <div>{selected.reviewedBy?.username ?? "unknown"}</div>
                {selected.reviewReason ? (
                  <div className="text-xs opacity-70 mt-1">
                    Reason: {selected.reviewReason}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="text-sm mb-2 opacity-80">Payload:</div>
            <pre className="text-xs bg-black/40 border border-white/10 rounded-xl p-3 max-h-[260px] overflow-auto">
              {JSON.stringify(selected.payload, null, 2)}
            </pre>

            {/* Actions */}
            {status === "PENDING" ? (
              <div className="mt-4 space-y-3">
                <button
                  onClick={approve}
                  disabled={actionLoading}
                  className="w-full rounded-xl px-3 py-2 bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/30 text-sm disabled:opacity-50"
                >
                  {actionLoading ? "Procesando..." : "Approve & Publish"}
                </button>

                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm"
                    rows={3}
                    placeholder="Razón del rechazo (opcional)"
                  />
                  <button
                    onClick={reject}
                    disabled={actionLoading}
                    className="w-full rounded-xl px-3 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-sm disabled:opacity-50"
                  >
                    {actionLoading ? "Procesando..." : "Reject"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-xs opacity-70">
                Acciones disponibles solo para PENDING.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
