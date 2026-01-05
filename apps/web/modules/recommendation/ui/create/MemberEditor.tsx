"use client";

import { FaPlus, FaTrash } from "react-icons/fa";
import { BandMember } from "../../domain/Catalog";

type Props = {
  value: BandMember[];
  onChange: (next: BandMember[]) => void;
};

const emptyMember = (): BandMember => ({ name: "", role: "", period: "" });

export default function MemberEditor({ value, onChange }: Props) {
  function addMember() {
    onChange([...value, emptyMember()]);
  }

  function removeMember(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  function patch(idx: number, patch: Partial<BandMember>) {
    onChange(value.map((m, i) => (i === idx ? { ...m, ...patch } : m)));
  }

  return (
    <section className="space-y-4">
      <label className="block text-red-400 font-bold text-sm uppercase tracking-wider">
        Band Members
      </label>

      <div className="space-y-4">
        {value.map((m, idx) => (
          <div
            key={idx}
            className="rounded-lg border-2 border-gray-600 p-4
                       bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a]"
          >
            <div className="grid grid-cols-1 gap-3">
              <input
                value={m.name}
                onChange={(e) => patch(idx, { name: e.target.value })}
                className="bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400
                           focus:outline-none focus:border-red-500"
                placeholder="Member name"
              />
              <input
                value={m.role}
                onChange={(e) => patch(idx, { role: e.target.value })}
                className="bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400
                           focus:outline-none focus:border-red-500"
                placeholder="Role (e.g., Vocals, Guitar)"
              />
              <input
                value={m.period}
                onChange={(e) => patch(idx, { period: e.target.value })}
                className="bg-transparent border-b border-gray-600 pb-2 text-white placeholder-gray-400
                           focus:outline-none focus:border-red-500"
                placeholder="Period (e.g., 1996-present)"
              />
            </div>

            <button
              type="button"
              onClick={() => removeMember(idx)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-red-500 hover:text-red-300 transition-colors"
            >
              <FaTrash />
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addMember}
        className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm
                   bg-gray-700 hover:bg-gray-600 transition-colors"
      >
        <FaPlus />
        Add Member
      </button>
    </section>
  );
}
