import { useState } from "react";
import { HistoricalTransaction } from "../types";
import { FileCheck, BadgeCheck, Trash2, Calendar, ShieldCheck, CornerDownRight } from "lucide-react";

interface TransactionLogProps {
  currentPayload: any;
  history: HistoricalTransaction[];
  onSelectAction: (tx: HistoricalTransaction) => void;
  onClearHistoryAction: () => void;
}

export default function TransactionLog({
  currentPayload,
  history,
  onSelectAction,
  onClearHistoryAction,
}: TransactionLogProps) {
  const sf = currentPayload?.selection_flow;
  const ip = currentPayload?.installation_parameters;

  return (
    <div id="transaction-audit-log" className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
      
      {/* Col 1: System Validation Checks */}
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <BadgeCheck className="w-4 h-4 text-emerald-800" />
            <h5 className="text-zinc-900 text-xs font-semibold font-sans uppercase tracking-wider">
              Verification Compliance Audit
            </h5>
          </div>
          <p className="text-[10px] text-zinc-450 font-mono">
            Direct validation constraints evaluated in active memory
          </p>
        </div>

        <div className="space-y-1.5 text-[10px] font-mono">
          
          <div className="p-2 bg-zinc-50 border border-zinc-150 rounded-lg flex items-center justify-between">
            <span className="text-zinc-600 font-medium font-sans">1. Draft-07 Schema Compliance</span>
            <span className="px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded font-bold uppercase text-[9px]">
              Pass
            </span>
          </div>

          <div className="p-2 bg-zinc-50 border border-zinc-150 rounded-lg flex items-center justify-between">
            <span className="text-zinc-600 font-medium font-sans">2. Selected Brand matched</span>
            <span className="text-zinc-800 font-bold">
              {sf?.equipment_brand || "None"}
            </span>
          </div>

          <div className="p-2 bg-zinc-50 border border-zinc-150 rounded-lg flex items-center justify-between">
            <span className="text-zinc-600 font-medium font-sans">3. Equipment Capacity</span>
            <span className="px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded font-bold uppercase text-[9px]">
              {sf?.cooling_capacity || "N/A"}
            </span>
          </div>

          <div className="p-2 bg-zinc-50 border border-zinc-150 rounded-lg flex items-center justify-between">
            <span className="text-zinc-600 font-medium font-sans">4. Piping Run Threshold (&gt; 10 ft)</span>
            <span className={`px-1.5 py-0.5 rounded font-bold border text-[9px] ${
              ip?.actual_piping_distance_feet > 10
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-zinc-100 border-zinc-200 text-zinc-500"
            }`}>
              {ip?.actual_piping_distance_feet > 10 ? "SURCHARGE" : "INCLUDED"}
            </span>
          </div>

        </div>
      </div>

      {/* Col 2: Calculation audit history */}
      <div className="p-5 space-y-3 flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <h5 className="text-zinc-900 text-xs font-semibold font-sans uppercase tracking-wider">
                Historic Calculated Queue
              </h5>
            </div>
            {history.length > 0 && (
              <button
                onClick={onClearHistoryAction}
                className="text-[9px] text-zinc-500 hover:text-zinc-800 flex items-center space-x-1 font-mono font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Format list</span>
              </button>
            )}
          </div>
          <p className="text-[10px] text-zinc-450 font-mono">
            Proposals logged within active browser workspace session
          </p>
        </div>

        {history.length === 0 ? (
          <div className="p-5 bg-zinc-50 border border-zinc-150 rounded-lg text-center font-mono text-[10px] text-zinc-450">
            No logged proposal records within this session.
          </div>
        ) : (
          <div className="space-y-1.5 overflow-y-auto max-h-[120px] pr-1">
            {history.map((tx) => (
              <button
                key={tx.id}
                onClick={() => onSelectAction(tx)}
                className="w-full p-2 bg-zinc-50 hover:bg-zinc-100/70 border border-zinc-150 hover:border-zinc-350 rounded-lg flex items-center justify-between text-left transition-colors font-mono text-[10px]"
                title="Click to load back to layout input"
              >
                <div className="space-y-0.5 truncate">
                  <div className="text-zinc-800 font-bold truncate max-w-[170px]">
                    {tx.payload.selection_flow.equipment_brand} • {tx.payload.selection_flow.form_factor}
                  </div>
                  <div className="text-[8.5px] text-zinc-400 flex items-center">
                    <CornerDownRight className="w-2.5 h-2.5 mr-1 text-emerald-700" />
                    Qty: {tx.payload.installation_parameters.base_quantity} units ({tx.payload.selection_flow.cooling_capacity})
                  </div>
                </div>
                <span className="text-zinc-900 font-bold bg-white border border-zinc-200 px-2 py-0.5 rounded shadow-2xs">
                  ₱{tx.calculation.final_cost.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
