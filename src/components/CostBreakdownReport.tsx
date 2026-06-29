import { CostCalculationResponse, HVACProposalPayload, getAvailableModels } from "../types";
import { TrendingUp, Info, Sparkles, Bookmark, Tag } from "lucide-react";

interface CostBreakdownReportProps {
  calculation: CostCalculationResponse | null;
  payload?: HVACProposalPayload;
}

export default function CostBreakdownReport({ calculation, payload }: CostBreakdownReportProps) {

  if (!calculation) {
    return (
      <div id="cost-breakdown-placeholder" className="bg-white border border-zinc-200 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full shadow-xs">
        <div className="w-12 h-12 bg-zinc-50 border border-zinc-150 rounded-full flex items-center justify-center text-zinc-400 mb-3">
          <Info className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-zinc-800 text-sm font-semibold">Ready for Billing Calculation</p>
        <p className="text-zinc-500 text-xs mt-1 font-mono max-w-xs leading-relaxed">
          Select a document preset specification sheet or configure parameters manually to generate programmatic estimates.
        </p>
      </div>
    );
  }

  const { breakdown } = calculation;

  const isOverride = (() => {
    if (!payload) return false;
    const { equipment_brand, cooling_capacity, form_factor, resolved_model_details } = payload.selection_flow;
    const dbModels = getAvailableModels(equipment_brand, cooling_capacity, form_factor);
    const matchEntry = dbModels.find(m => m.model_number === resolved_model_details.model_number);
    return matchEntry ? Math.abs(matchEntry.unit_base_price - resolved_model_details.unit_base_price) > 0.01 : false;
  })();

  const isLaborOverride = (() => {
    if (!payload) return false;
    const { resolved_model_details } = payload.selection_flow;
    const defaultLabor = parseFloat((resolved_model_details.unit_base_price * 0.15).toFixed(2));
    return resolved_model_details.unit_labor_price !== undefined && Math.abs(resolved_model_details.unit_labor_price - defaultLabor) > 0.01;
  })();

  return (
    <div id="cost-breakdown-report" className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-150 bg-zinc-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-zinc-800" />
          <h4 className="text-zinc-900 text-sm font-semibold font-sans tracking-tight">
            HVAC Programmatic Proposal &amp; Billing
          </h4>
        </div>
      </div>

      {/* Main Billing Card Grid */}
      <div className="p-6 space-y-6 flex-grow overflow-y-auto">
        
        {/* Cost summary bubble */}
        <div id="cost-summary-cards" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* PHP Card (Adjusted total cost in Pesos) */}
          <div className="p-4 bg-zinc-900 border border-zinc-950 text-white rounded-xl text-left space-y-1 relative overflow-hidden shadow-xs">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
              Dynamic Proposal Total (PHP)
            </span>
            <div className="flex items-baseline space-x-1 pt-0.5">
              <span className="text-3xl font-bold text-white font-mono">
                ₱{calculation.final_cost.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-zinc-350 font-mono text-xs font-bold font-mono">PHP</span>
            </div>
            
            <div className="text-[10px] text-zinc-400 font-mono">
              Direct regional procurement tariff.
            </div>
            
            <div className="absolute top-2 right-2 p-1 bg-zinc-800 border border-zinc-750 text-white rounded text-[8px] font-mono font-bold uppercase">
              Approved
            </div>
          </div>

          {/* Savings / Corporate discount Card */}
          <div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-xl text-left space-y-2 relative shadow-xs">
            <span className="text-[10px] font-mono text-emerald-700 uppercase tracking-widest block font-bold">
              Procurement Savings (PHP)
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-emerald-950 font-mono">
                ₱{calculation.savings.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-emerald-700 font-mono text-xs font-semibold">PHP</span>
            </div>
            <div className="text-[10px] text-emerald-800 font-sans leading-snug">
              {calculation.savings > 0 ? (
                <span className="font-mono flex items-center">
                  <Tag className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                  Corporate volume discount applied successfully.
                </span>
              ) : (
                <span className="text-zinc-500 font-mono">Standard regional pricing structure applies.</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Pricing Metadata Badge Indicators */}
        <div className="bg-zinc-50/60 border border-zinc-150 p-3 rounded-lg space-y-2 text-xs font-sans">
          <div className="flex items-start space-x-2">
            <Bookmark className="w-4 h-4 text-zinc-550 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-zinc-855 text-[11px] font-mono">Dynamic Rule Logic:</p>
              <p className="text-zinc-550 text-[10px] font-mono leading-relaxed mt-0.5">
                {calculation.regional_rule_applied}
              </p>
              <p className="text-zinc-550 text-[10px] font-mono leading-relaxed">
                {calculation.discount_applied}
              </p>
            </div>
          </div>
        </div>

        {/* Itemized Table Breakdown */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block font-bold">
            Itemized Regional Cost Breakdown (PHP)
          </span>
          
          <div className="border border-zinc-200 rounded-xl overflow-hidden bg-white font-mono text-xs">
            
            {/* Header row */}
            <div className="grid grid-cols-12 bg-zinc-50 px-4 py-2.5 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-200">
              <span className="col-span-6">Cost Element</span>
              <span className="col-span-2 text-right">Qty/Basis</span>
              <span className="col-span-2 text-right">Adjusted Rate</span>
              <span className="col-span-2 text-right">Line Sum</span>
            </div>

            <div className="divide-y divide-zinc-150">
              
              {/* Row 1: Base Equipment */}
              <div className="grid grid-cols-12 px-4 py-3 text-zinc-850 bg-white">
                <div className="col-span-6 flex flex-col space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-zinc-900 font-semibold font-sans">Base HVAC Systems</span>
                    {isOverride ? (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[8px] font-mono font-bold uppercase leading-none">
                        Override Price
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[8px] font-mono font-bold uppercase leading-none">
                        Base Price
                      </span>
                    )}
                    {isLaborOverride && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[8px] font-mono font-bold uppercase leading-none">
                        Labor Override
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-zinc-450 font-mono leading-relaxed">
                    Standard base: ₱{breakdown.equipment.unit_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })} / unit
                  </span>
                </div>
                <span className="col-span-2 text-right self-center">{breakdown.equipment.quantity} units</span>
                <span className="col-span-2 text-right self-center text-zinc-700 font-mono">
                  ₱{breakdown.equipment.adjusted_unit_price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
                <span className="col-span-2 text-right self-center font-semibold text-zinc-900 font-mono">
                  ₱{breakdown.equipment.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row 2: Variable Piping Runs */}
              <div className="grid grid-cols-12 px-4 py-3 text-zinc-805 bg-white">
                <div className="col-span-6 flex flex-col space-y-0.5">
                  <span className="text-zinc-900 font-semibold font-sans">Extended Installation Piping</span>
                  <span className="text-[9px] text-zinc-450 font-mono leading-relaxed text-left">
                    Total: {breakdown.piping.actual_distance_feet} ft (Flat Base 10 ft: ₱{breakdown.piping.base_fee?.toLocaleString("en-PH", { minimumFractionDigits: 2 }) ?? "0.00"} + Excess Rate: ₱{breakdown.piping.rate_per_foot.toLocaleString("en-PH", { minimumFractionDigits: 2 })}/ft)
                  </span>
                </div>
                <span className="col-span-2 text-right self-center">
                  {breakdown.piping.excess_feet > 0 ? `${breakdown.piping.excess_feet} ft` : "0 ft"}
                </span>
                <span className="col-span-2 text-right self-center text-zinc-700 font-mono">
                  {breakdown.piping.excess_feet > 0 ? `₱${breakdown.piping.adjusted_rate_per_foot.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "—"}
                </span>
                <span className="col-span-2 text-right self-center font-semibold text-zinc-900 font-mono">
                  ₱{breakdown.piping.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row 3: Dismantling / Deinstallation */}
              <div className="grid grid-cols-12 px-4 py-3 text-zinc-805 bg-white">
                <div className="col-span-6 flex flex-col space-y-0.5">
                  <span className="text-zinc-900 font-semibold font-sans">Dismantling</span>
                  <span className="text-[9px] text-zinc-450 font-mono leading-relaxed">
                    {breakdown.dismantling.required ? "Old systems disassembly requested" : "No old unit tear-down required"}
                  </span>
                </div>
                <span className="col-span-2 text-right self-center">
                  {breakdown.dismantling.required ? `${breakdown.equipment.quantity} units` : "—"}
                </span>
                <span className="col-span-2 text-right self-center text-zinc-700 font-mono">
                  {breakdown.dismantling.required ? `₱${breakdown.dismantling.fee_per_unit.toLocaleString("en-PH", { minimumFractionDigits: 2 })}` : "—"}
                </span>
                <span className="col-span-2 text-right self-center font-semibold text-zinc-900 font-mono">
                  ₱{breakdown.dismantling.subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row 4: Electrical - Indoor breaker */}
              <div className="grid grid-cols-12 px-4 py-3 text-zinc-700 bg-zinc-50/30">
                <div className="col-span-6 flex flex-col pl-3 border-l-2 border-zinc-400">
                  <span className="text-zinc-900 font-sans text-xs">Circuit Breaker (Indoor)</span>
                  <span className="text-[9px] text-zinc-450 font-mono">Terminal isolating breakers</span>
                </div>
                <span className="col-span-2 text-right self-center">
                  {breakdown.electrical.circuit_breaker_indoor_qty} pcs
                </span>
                <span className="col-span-2 text-right self-center text-zinc-650 font-mono">
                  ₱{breakdown.electrical.circuit_breaker_indoor_rate.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
                <span className="col-span-2 text-right self-center text-zinc-800 font-mono">
                  ₱{breakdown.electrical.circuit_breaker_indoor_subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row 5: Electrical - Outdoor breaker */}
              <div className="grid grid-cols-12 px-4 py-3 text-zinc-700 bg-zinc-50/30">
                <div className="col-span-6 flex flex-col pl-3 border-l-2 border-zinc-400">
                  <span className="text-zinc-900 font-sans text-xs">Circuit Breaker (Outdoor)</span>
                  <span className="text-[9px] text-zinc-450 font-mono">Condenser weatherproof disconnect</span>
                </div>
                <span className="col-span-2 text-right self-center">
                  {breakdown.electrical.circuit_breaker_outdoor_qty} pcs
                </span>
                <span className="col-span-2 text-right self-center text-zinc-650 font-mono">
                  ₱{breakdown.electrical.circuit_breaker_outdoor_rate.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
                <span className="col-span-2 text-right self-center text-zinc-800 font-mono">
                  ₱{breakdown.electrical.circuit_breaker_outdoor_subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row 6: Electrical - Flat wiring fee */}
              <div className="grid grid-cols-12 px-4 py-3 text-zinc-700 bg-zinc-50/30">
                <div className="col-span-6 flex flex-col pl-3 border-l-2 border-zinc-400">
                  <span className="text-zinc-900 font-sans text-xs">Cabling &amp; Power Connectivity</span>
                  <span className="text-[9px] text-zinc-450 font-mono">Labor &amp; conduit connectivity</span>
                </div>
                <span className="col-span-2 text-right self-center">Flat Rate</span>
                <span className="col-span-2 text-right self-center">—</span>
                <span className="col-span-2 text-right self-center text-zinc-800 font-mono">
                  ₱{breakdown.electrical.flat_wiring_connectivity_fee.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Row 7: Electrical - Wire connectivity per foot */}
              {breakdown.electrical.wire_qty > 0 && (
                <div className="grid grid-cols-12 px-4 py-3 text-zinc-700 bg-zinc-50/30">
                  <div className="col-span-6 flex flex-col pl-3 border-l-2 border-zinc-400">
                    <span className="text-zinc-900 font-sans text-xs">Electrical Wire Cable</span>
                    <span className="text-[9px] text-zinc-450 font-mono">Heavy-duty power feed cabling ({breakdown.electrical.wire_qty} ft)</span>
                  </div>
                  <span className="col-span-2 text-right self-center">
                    {breakdown.electrical.wire_qty} ft
                  </span>
                  <span className="col-span-2 text-right self-center text-zinc-650 font-mono">
                    ₱{breakdown.electrical.wire_rate.toLocaleString("en-PH", { minimumFractionDigits: 2 })}/ft
                  </span>
                  <span className="col-span-2 text-right self-center text-zinc-800 font-mono">
                    ₱{breakdown.electrical.wire_subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Total Highlight Footer */}
            <div className="grid grid-cols-12 bg-zinc-900 px-4 py-3 text-white font-bold uppercase tracking-wider relative">
              {calculation.original_final_cost > calculation.final_cost && (
                <div className="absolute left-4 top-2 text-[8px] font-mono text-zinc-400 lowercase italic">
                  original standard rate estimate was ₱{calculation.original_final_cost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </div>
              )}
              <span className="col-span-10 text-right self-center pt-1.5 md:pt-0 font-sans">Corporate Calculated Sum:</span>
              <span className="col-span-2 text-right text-emerald-400 text-sm font-mono self-center">
                ₱{calculation.final_cost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
            
          </div>
        </div>

        {/* Dynamic Formula Viewer */}
        <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2">
          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block font-bold">
            Programmatic Proposal Calculation Formulas (PHP)
          </span>
          <div className="p-2 bg-white border border-zinc-200 rounded-lg text-left shadow-2xs">
            <code className="text-[10px] text-zinc-700 font-mono block break-all select-all text-center leading-relaxed">
              Final Cost = [Qty × (BasePrice × RegMult) × (1 - Discount)] + [ExcessPiping × (ExcessRate × RegMult) × (1 - Discount)] + Dismantling + Electrical
            </code>
          </div>
          <div className="text-[9px] text-zinc-450 leading-relaxed font-sans">
            *Where dynamic multipliers apply to base equipment prices and excess piping rates per the chosen geographic zone. Corporate volume percentage discounts apply on top. Math complies with standard double-floating precision models.
          </div>
        </div>

      </div>
    </div>
  );
}
