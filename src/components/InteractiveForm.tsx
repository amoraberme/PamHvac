import { ChangeEvent, useEffect, useState } from "react";
import { HVACProposalPayload, resolveModelDetails, getAvailableModels, getStandardPipingRate } from "../types";
import { Settings, CheckCircle2, Zap, Wind, Trash2, ShieldCheck, Tag, Cpu, Sliders, AlertTriangle } from "lucide-react";

interface InteractiveFormProps {
  payload: HVACProposalPayload;
  onChangeAction: (updated: HVACProposalPayload) => void;
}

export default function InteractiveForm({ payload, onChangeAction }: InteractiveFormProps) {
  const [isAdminEditorOpen, setIsAdminEditorOpen] = useState(false);

  // Extract fields for simple destructuring helper access
  const { selection_flow, installation_parameters } = payload;
  const { equipment_brand, form_factor, cooling_capacity, resolved_model_details } = selection_flow;
  const {
    base_quantity,
    actual_piping_distance_feet,
    excess_piping_rate_per_foot,
    base_piping_fee = 2000,
    electrical_breaker_options,
    flat_wiring_connectivity_fee,
    dismantling_services,
    wire_length_feet = 15,
    wire_rate_per_foot = 105
  } = installation_parameters;

  // Whenever brand, form factor, or cooling capacity is changed, resolve unit model and base price
  useEffect(() => {
    const available = getAvailableModels(equipment_brand, cooling_capacity, form_factor);
    // Find if current model exists in available (disregarding overridden price)
    const isCurrentValid = available.some(
      (m) => m.model_number === resolved_model_details.model_number
    );

    if (isCurrentValid) {
      // If the current model is already valid for this combination, do not reset it on mount/render.
      // This preserves any custom price overrides or other user parameter adjustments perfectly!
      return;
    }

    const firstModel = available.length > 0 ? available[0] : null;
    const resolvedModel = firstModel;

    if (resolvedModel) {
      const stdPipingRate = getStandardPipingRate(form_factor, cooling_capacity, resolvedModel.label);
      onChangeAction({
        ...payload,
        selection_flow: {
          ...selection_flow,
          resolved_model_details: {
            model_number: resolvedModel.model_number,
            unit_base_price: resolvedModel.unit_base_price,
            unit_labor_price: parseFloat((resolvedModel.unit_base_price * 0.15).toFixed(2))
          }
        },
        installation_parameters: {
          ...installation_parameters,
          excess_piping_rate_per_foot: stdPipingRate,
          base_piping_fee: 2000,
          flat_wiring_connectivity_fee: 2000,
          dismantling_services: {
            ...dismantling_services,
            fee_per_unit: dismantling_services.fee_per_unit === 85.00 ? 2000.00 : dismantling_services.fee_per_unit
          },
          electrical_breaker_options: {
            indoor_breaker: {
              ...electrical_breaker_options.indoor_breaker,
              unit_price_input: electrical_breaker_options.indoor_breaker.unit_price_input === 45.00 ? 750.00 : electrical_breaker_options.indoor_breaker.unit_price_input
            },
            outdoor_breaker: {
              ...electrical_breaker_options.outdoor_breaker,
              unit_price_input: electrical_breaker_options.outdoor_breaker.unit_price_input === 65.00 ? 1000.00 : electrical_breaker_options.outdoor_breaker.unit_price_input
            }
          },
          wire_length_feet: wire_length_feet === undefined ? 15 : wire_length_feet,
          wire_rate_per_foot: wire_rate_per_foot === undefined ? 105.00 : wire_rate_per_foot
        }
      });
    } else {
      onChangeAction({
        ...payload,
        selection_flow: {
          ...selection_flow,
          resolved_model_details: {
            model_number: "",
            unit_base_price: 0,
            unit_labor_price: 0
          }
        }
      });
    }
  }, [equipment_brand, cooling_capacity, form_factor]);

  const updateSelectionFlow = (key: string, value: any) => {
    let nextSelectionFlow = {
      ...selection_flow,
      [key]: value
    };

    // Keep form factor and cooling capacity in sync
    const isHeavyDuty = ["Ceiling Cassette", "Ceiling Suspended", "Floor Mounted"].includes(nextSelectionFlow.form_factor);
    if (isHeavyDuty) {
      if (nextSelectionFlow.cooling_capacity !== "3-tonner" && nextSelectionFlow.cooling_capacity !== "5-tonner") {
        nextSelectionFlow.cooling_capacity = "3-tonner";
      }
    } else {
      if (nextSelectionFlow.cooling_capacity === "3-tonner" || nextSelectionFlow.cooling_capacity === "5-tonner") {
        nextSelectionFlow.cooling_capacity = "3.0 HP";
      }
    }

    onChangeAction({
      ...payload,
      selection_flow: nextSelectionFlow
    });
  };

  const updateInstParams = (key: string, value: any) => {
    onChangeAction({
      ...payload,
      installation_parameters: {
        ...installation_parameters,
        [key]: value
      }
    });
  };

  const updateBreaker = (type: "indoor_breaker" | "outdoor_breaker", key: "selected" | "unit_price_input", value: any) => {
    onChangeAction({
      ...payload,
      installation_parameters: {
        ...installation_parameters,
        electrical_breaker_options: {
          ...electrical_breaker_options,
          [type]: {
            ...electrical_breaker_options[type],
            [key]: value
          }
        }
      }
    });
  };

  const updateDismantling = (key: "required" | "fee_per_unit", value: any) => {
    onChangeAction({
      ...payload,
      installation_parameters: {
        ...installation_parameters,
        dismantling_services: {
          ...dismantling_services,
          [key]: value
        }
      }
    });
  };

  const dbModels = getAvailableModels(equipment_brand, cooling_capacity, form_factor);
  const hasExactMatch = dbModels.some(
    (m) => m.model_number === resolved_model_details.model_number && Math.abs(m.unit_base_price - resolved_model_details.unit_base_price) < 0.01
  );

  // --- Inline Validation calculations ---
  const defaultDetails = resolveModelDetails(equipment_brand, form_factor, cooling_capacity);
  const basePrices = dbModels.length > 0 ? dbModels.map((m) => m.unit_base_price) : [defaultDetails.unit_base_price];
  const minBaseStd = Math.min(...basePrices);
  const maxBaseStd = Math.max(...basePrices);
  const isBasePriceTooLow = resolved_model_details.unit_base_price < minBaseStd * 0.85;
  const isBasePriceTooHigh = resolved_model_details.unit_base_price > maxBaseStd * 1.15;

  const currentLaborPrice = resolved_model_details.unit_labor_price !== undefined 
    ? resolved_model_details.unit_labor_price 
    : parseFloat((resolved_model_details.unit_base_price * 0.15).toFixed(2));
  const minLabor = parseFloat((resolved_model_details.unit_base_price * 0.10).toFixed(2));
  const maxLabor = parseFloat((resolved_model_details.unit_base_price * 0.25).toFixed(2));
  const isLaborTooLow = currentLaborPrice < minLabor;
  const isLaborTooHigh = currentLaborPrice > maxLabor;

  const stdPipingRate = getStandardPipingRate(form_factor, cooling_capacity);
  const isExcessPipingTooLow = excess_piping_rate_per_foot < stdPipingRate * 0.75;
  const isExcessPipingTooHigh = excess_piping_rate_per_foot > stdPipingRate * 1.50;

  // Electrical Overrides
  const indoorBreakerVal = electrical_breaker_options.indoor_breaker.unit_price_input;
  const isIndoorBreakerTooLow = indoorBreakerVal < 400;
  const isIndoorBreakerTooHigh = indoorBreakerVal > 1500;

  const outdoorBreakerVal = electrical_breaker_options.outdoor_breaker.unit_price_input;
  const isOutdoorBreakerTooLow = outdoorBreakerVal < 500;
  const isOutdoorBreakerTooHigh = outdoorBreakerVal > 2000;

  const isFlatWiringTooLow = flat_wiring_connectivity_fee < 1000;
  const isFlatWiringTooHigh = flat_wiring_connectivity_fee > 5000;

  const isWireRateTooLow = wire_rate_per_foot < 60;
  const isWireRateTooHigh = wire_rate_per_foot > 250;

  // Dismantling Services
  const dismantlingUnitFee = dismantling_services.fee_per_unit;
  const isDismantlingTooLow = dismantlingUnitFee < 1000;
  const isDismantlingTooHigh = dismantlingUnitFee > 4000;

  return (
    <div id="hvac-interactive-form" className="bg-white border-t-4 border-l-4 border-emerald-800 border-r border-b rounded-2xl rounded-tr-none rounded-bl-none shadow-md p-6 space-y-6">
      
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-zinc-150 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-emerald-950 text-sm font-semibold font-sans tracking-tight">
              Interactive Cascading Specs Console
            </h4>
            <p className="text-[10px] text-emerald-800/80 font-mono">
              Adjust sequential models to compute live proposals
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAdminEditorOpen(true)}
            className="px-2.5 py-1.5 bg-[#005A36] hover:bg-[#00472a] text-white rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
            id="btn-admin-price-editor"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Global Price Admin</span>
          </button>

        </div>
      </div>

      {/* Global Price Editor Overlay Modal */}
      {isAdminEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="bg-white border-2 border-emerald-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#005A36] text-white p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-emerald-300" />
                <span className="font-sans font-bold text-sm tracking-tight">Global Administrator Price Editor</span>
              </div>
              <button
                onClick={() => setIsAdminEditorOpen(false)}
                className="text-white bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-xs font-mono cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto font-sans text-xs flex-1">
              <p className="text-zinc-550 text-[11px] mb-2 leading-relaxed">
                As system administrator, you can override default rates and line-item fees for the current session. Live calculations will recalculate immediately.
              </p>

              {/* Grid of Values */}
              <div className="space-y-3.5">
                {/* Hardware Base Price */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase font-bold block">
                    Unit Base Price (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={100}
                      value={resolved_model_details.unit_base_price}
                      onChange={(e) => {
                        onChangeAction({
                          ...payload,
                          selection_flow: {
                            ...selection_flow,
                            resolved_model_details: {
                              ...resolved_model_details,
                              unit_base_price: Math.max(0, parseFloat(e.target.value) || 0)
                            }
                          }
                        });
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 italic block">Currently overrides {resolved_model_details.model_number} baseline rate.</span>
                </div>

                {/* Unit Labor Price */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase font-bold block">
                    Unit Labor Price (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={resolved_model_details.unit_labor_price !== undefined ? resolved_model_details.unit_labor_price : parseFloat((resolved_model_details.unit_base_price * 0.15).toFixed(2))}
                      onChange={(e) => {
                        onChangeAction({
                          ...payload,
                          selection_flow: {
                            ...selection_flow,
                            resolved_model_details: {
                              ...resolved_model_details,
                              unit_labor_price: Math.max(0, parseFloat(e.target.value) || 0)
                            }
                          }
                        });
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 italic block">Currently overrides {resolved_model_details.model_number} default installation labor rate.</span>
                </div>

                {/* Base Piping Surcharge Fee */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase font-bold block">
                    Base Piping Fee (₱) [First 10 Feet]
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={base_piping_fee}
                      onChange={(e) => {
                        onChangeAction({
                          ...payload,
                          installation_parameters: {
                            ...installation_parameters,
                            base_piping_fee: Math.max(0, parseFloat(e.target.value) || 0)
                          }
                        });
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 italic block">Flat charge applied for the first 10 ft of refrigerant piping.</span>
                </div>

                {/* Excess Piping rate per foot */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase font-bold block">
                    Excess Piping Rate (₱ / Ft) [Above 10 Feet]
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={excess_piping_rate_per_foot}
                      onChange={(e) => {
                        onChangeAction({
                          ...payload,
                          installation_parameters: {
                            ...installation_parameters,
                            excess_piping_rate_per_foot: Math.max(0, parseFloat(e.target.value) || 0)
                          }
                        });
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                    />
                  </div>
                  <span className="text-[9px] text-zinc-400 italic block">Rate applied to cumulative feet in excess of the standard 10 ft limit.</span>
                </div>

                {/* Flat Wiring Connectivity Fee */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase font-bold block">
                    Flat Wiring & Conduit Connectivity Fee (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={flat_wiring_connectivity_fee}
                      onChange={(e) => {
                        onChangeAction({
                          ...payload,
                          installation_parameters: {
                            ...installation_parameters,
                            flat_wiring_connectivity_fee: Math.max(0, parseFloat(e.target.value) || 0)
                          }
                        });
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                    />
                  </div>
                </div>

                {/* Dismantling Fee per unit */}
                <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-600 uppercase font-bold block">
                    Dismantling Fee per Unit (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-zinc-400 font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={dismantling_services.fee_per_unit}
                      onChange={(e) => {
                        onChangeAction({
                          ...payload,
                          installation_parameters: {
                            ...installation_parameters,
                            dismantling_services: {
                              ...dismantling_services,
                              fee_per_unit: Math.max(0, parseFloat(e.target.value) || 0)
                            }
                          }
                        });
                      }}
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                    />
                  </div>
                </div>

                {/* Breakers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-600 uppercase font-bold block">
                      Indoor Breaker (₱ / Unit)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-zinc-400 font-mono">₱</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={electrical_breaker_options.indoor_breaker.unit_price_input}
                        onChange={(e) => {
                          onChangeAction({
                            ...payload,
                            installation_parameters: {
                              ...installation_parameters,
                              electrical_breaker_options: {
                                ...electrical_breaker_options,
                                indoor_breaker: {
                                  ...electrical_breaker_options.indoor_breaker,
                                  unit_price_input: Math.max(0, parseFloat(e.target.value) || 0)
                                }
                              }
                            }
                          });
                        }}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-600 uppercase font-bold block">
                      Outdoor Breaker (₱ / Unit)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-zinc-400 font-mono">₱</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={electrical_breaker_options.outdoor_breaker.unit_price_input}
                        onChange={(e) => {
                          onChangeAction({
                            ...payload,
                            installation_parameters: {
                              ...installation_parameters,
                              electrical_breaker_options: {
                                ...electrical_breaker_options,
                                outdoor_breaker: {
                                  ...electrical_breaker_options.outdoor_breaker,
                                  unit_price_input: Math.max(0, parseFloat(e.target.value) || 0)
                                }
                              }
                            }
                          });
                        }}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                      />
                    </div>
                  </div>
                </div>

                {/* Wire Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-600 uppercase font-bold block">
                      Wire Length (Feet)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={wire_length_feet}
                        onChange={(e) => {
                          onChangeAction({
                            ...payload,
                            installation_parameters: {
                              ...installation_parameters,
                              wire_length_feet: Math.max(0, parseFloat(e.target.value) || 0)
                            }
                          });
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                      />
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200 space-y-1.5">
                    <label className="text-[9px] font-mono text-zinc-600 uppercase font-bold block">
                      Wire Rate (₱ / Foot)
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-zinc-400 font-mono">₱</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={wire_rate_per_foot}
                        onChange={(e) => {
                          onChangeAction({
                            ...payload,
                            installation_parameters: {
                              ...installation_parameters,
                              wire_rate_per_foot: Math.max(0, parseFloat(e.target.value) || 0)
                            }
                          });
                        }}
                        className="w-full pl-6 pr-2 py-1.5 bg-white border border-zinc-200 rounded text-xs font-mono font-semibold text-zinc-850 focus:outline-none focus:border-[#005A36]"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-zinc-50 border-t border-zinc-150 px-4 py-3 flex justify-between items-center shrink-0">
              <button
                onClick={() => {
                  const standardDetails = resolveModelDetails(equipment_brand, form_factor, cooling_capacity);
                  const stdPipingRate = getStandardPipingRate(form_factor, cooling_capacity);
                  onChangeAction({
                    selection_flow: {
                      equipment_brand,
                      form_factor,
                      cooling_capacity,
                      resolved_model_details: standardDetails
                    },
                    installation_parameters: {
                      base_quantity,
                      actual_piping_distance_feet,
                      excess_piping_rate_per_foot: stdPipingRate,
                      base_piping_fee: 2000,
                      electrical_breaker_options: {
                        indoor_breaker: { selected: true, unit_price_input: 750 },
                        outdoor_breaker: { selected: true, unit_price_input: 1000 }
                      },
                      flat_wiring_connectivity_fee: 2000,
                      dismantling_services: { required: true, fee_per_unit: 2000 },
                      wire_length_feet: 15,
                      wire_rate_per_foot: 105
                    }
                  });
                }}
                className="px-3 py-1.5 text-zinc-500 hover:text-zinc-805 text-[10px] font-mono border border-zinc-200 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors"
                id="btn-reset-pricing"
              >
                Reset to Defaults
              </button>
              <button
                onClick={() => setIsAdminEditorOpen(false)}
                className="px-4 py-1.5 bg-[#005A36] hover:bg-[#00472a] text-white font-sans font-bold text-xs rounded-lg shadow-sm cursor-pointer transition-all"
                id="btn-save-pricing"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sequential Multi-state conditional workflow verification checklist */}
      <div id="workflow-checklist" className="bg-[#005A36]/5 border border-[#005A36]/20 p-4 space-y-2 rounded-xl">
        <span className="text-[9px] font-mono text-[#005A36] uppercase tracking-widest block font-bold">
          Cascading System Resolution Check
        </span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] font-mono text-zinc-800">
          <div className="flex items-center space-x-1.5 bg-white border border-zinc-150 p-2 rounded-lg shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="truncate">Brand: {equipment_brand}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white border border-zinc-150 p-2 rounded-lg shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="truncate">Form: {form_factor}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-white border border-zinc-150 p-2 rounded-lg shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
            <span className="truncate">Cap: {cooling_capacity}</span>
          </div>
          <div className="flex items-center space-x-1.5 bg-emerald-800 text-white p-2 rounded-lg shadow-2xs">
            <Cpu className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="truncate font-bold">{resolved_model_details.model_number}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6 text-zinc-800">
        
        {/* Row 1: Brand, Form Factor, Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
              1. Equipment Brand
            </label>
            <select
              value={equipment_brand}
              onChange={(e) => updateSelectionFlow("equipment_brand", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs rounded-lg focus:outline-none focus:border-emerald-800 transition-colors font-sans font-semibold cursor-pointer"
            >
              <option value="Carrier">Carrier</option>
              <option value="Matrix">Matrix</option>
              <option value="Midea">Midea</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
              2. Form Factor
            </label>
            <select
              value={form_factor}
              onChange={(e) => updateSelectionFlow("form_factor", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs rounded-lg focus:outline-none focus:border-emerald-800 transition-colors font-sans font-semibold cursor-pointer"
            >
              <option value="Split Type">Split Type</option>
              <option value="Window Type">Window Type</option>
              <option value="Floor Mounted">Floor Mounted</option>
              <option value="Ceiling Cassette">Ceiling Cassette</option>
              <option value="Ceiling Suspended">Ceiling Suspended</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
              3. Cooling Capacity
            </label>
            <select
              value={cooling_capacity}
              onChange={(e) => updateSelectionFlow("cooling_capacity", e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs rounded-lg focus:outline-none focus:border-emerald-800 transition-colors font-sans font-semibold cursor-pointer"
            >
              {["Ceiling Cassette", "Ceiling Suspended", "Floor Mounted"].includes(form_factor) ? (
                <>
                  <option value="3-tonner">3-tonner (3.0TR / 36,000 BTU/hr)</option>
                  <option value="5-tonner">5-tonner (5.0TR / 60,000 BTU/hr)</option>
                </>
              ) : (
                <>
                  <option value="0.6 HP">0.6 HP</option>
                  <option value="1.0 HP">1.0 HP</option>
                  <option value="1.5 HP">1.5 HP</option>
                  <option value="2.0 HP">2.0 HP</option>
                  <option value="2.5 HP">2.5 HP</option>
                  <option value="3.0 HP">3.0 HP</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Resolved Model details & Dynamic Pricing Overrides */}
        <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-zinc-800 font-sans text-xs font-semibold">
            <Cpu className="w-4 h-4 text-emerald-800" />
            <span>Resolved Air-Handling Model Details &amp; Enterprise Rate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <div className="space-y-1.5 sm:col-span-2 md:col-span-2">
              <label className="text-[10px] font-mono text-emerald-800 uppercase tracking-wider block font-bold">
                Select Available Model &amp; Pricing Tier
              </label>
              <select
                value={
                  dbModels.length === 0 
                    ? "" 
                    : (hasExactMatch 
                        ? `${resolved_model_details.model_number}:${resolved_model_details.unit_base_price}` 
                        : (resolved_model_details.model_number ? "custom" : ""))
                }
                disabled={dbModels.length === 0}
                onChange={(e) => {
                  if (dbModels.length === 0) return;
                  const val = e.target.value;
                  if (val === "custom" || !val) return;
                  const [selectedModelNo, priceText] = val.split(":");
                  const newPrice = parseFloat(priceText) || 0;
                  const standardLabor = parseFloat((newPrice * 0.15).toFixed(2));
                  onChangeAction({
                    ...payload,
                    selection_flow: {
                      ...selection_flow,
                      resolved_model_details: {
                        model_number: selectedModelNo,
                        unit_base_price: newPrice,
                        unit_labor_price: standardLabor
                      }
                    }
                  });
                }}
                className={`w-full px-3 py-2.5 bg-white border border-zinc-200 text-zinc-800 font-mono text-[11px] font-semibold rounded-lg focus:outline-none focus:border-emerald-800 ${dbModels.length === 0 ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {dbModels.length > 0 ? (
                  <>
                    {dbModels.map((m, idx) => {
                      const optVal = `${m.model_number}:${m.unit_base_price}`;
                      return (
                        <option key={idx} value={optVal}>
                          {m.model_number} ({m.price_type} — ₱{m.unit_base_price.toLocaleString()})
                        </option>
                      );
                    })}
                    {!hasExactMatch && resolved_model_details.model_number && (
                      <option value="custom" disabled>
                        {resolved_model_details.model_number} (Custom Override — ₱{resolved_model_details.unit_base_price.toLocaleString()})
                      </option>
                    )}
                  </>
                ) : (
                  <option value="">We don't have this product prices</option>
                )}
              </select>
              {dbModels.length === 0 && (
                <div className="mt-2 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px]">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">We don't have this product prices.</p>
                    <p className="text-zinc-600 mt-0.5">Please choose another combination of Brand, Form Factor, or Cooling Capacity that exists in our official pricelist catalog.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                Quantity Ordered
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={base_quantity}
                onChange={(e) => updateInstParams("base_quantity", Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs rounded-lg focus:outline-none focus:border-emerald-800 font-mono font-semibold"
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                Base Price (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={resolved_model_details.unit_base_price}
                  onChange={(e) => onChangeAction({
                    ...payload,
                    selection_flow: {
                      ...selection_flow,
                      resolved_model_details: {
                        ...resolved_model_details,
                        unit_base_price: Math.max(0, parseFloat(e.target.value) || 0)
                      }
                    }
                  })}
                  className={`w-full pl-7 pr-3 py-2 bg-white border text-zinc-800 text-xs rounded-lg focus:outline-none font-mono font-semibold transition-colors ${
                    isBasePriceTooLow || isBasePriceTooHigh 
                      ? "border-amber-400 focus:border-amber-600 bg-amber-50/20" 
                      : "border-zinc-200 focus:border-emerald-800"
                  }`}
                />
              </div>
              {isBasePriceTooLow && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Manual price is below standard catalog minimum (₱{minBaseStd.toLocaleString()}). May under-quote.</span>
                </div>
              )}
              {isBasePriceTooHigh && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Manual price is above standard catalog maximum (₱{maxBaseStd.toLocaleString()}). May over-charge.</span>
                </div>
              )}
              {!isBasePriceTooLow && !isBasePriceTooHigh && (
                <div className="text-[10px] text-emerald-700 leading-tight flex items-center gap-1 font-medium mt-1 pl-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Within standard catalog cost band (₱{minBaseStd.toLocaleString()} - ₱{maxBaseStd.toLocaleString()}).</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                Unit Labor (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={resolved_model_details.unit_labor_price !== undefined ? resolved_model_details.unit_labor_price : parseFloat((resolved_model_details.unit_base_price * 0.15).toFixed(2))}
                  onChange={(e) => onChangeAction({
                    ...payload,
                    selection_flow: {
                      ...selection_flow,
                      resolved_model_details: {
                        ...resolved_model_details,
                        unit_labor_price: Math.max(0, parseFloat(e.target.value) || 0)
                      }
                    }
                  })}
                  className={`w-full pl-7 pr-3 py-2 bg-white border text-zinc-800 text-xs rounded-lg focus:outline-none font-mono font-semibold transition-colors ${
                    isLaborTooLow || isLaborTooHigh 
                      ? "border-amber-400 focus:border-amber-600 bg-amber-50/20" 
                      : "border-zinc-200 focus:border-emerald-800"
                  }`}
                />
              </div>
              {isLaborTooLow && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Labor rate is below standard 10% band (₱{minLabor.toLocaleString()}). May under-compensate installers.</span>
                </div>
              )}
              {isLaborTooHigh && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Labor rate is above standard 25% band (₱{maxLabor.toLocaleString()}). Over-estimates labor.</span>
                </div>
              )}
              {!isLaborTooLow && !isLaborTooHigh && (
                <div className="text-[10px] text-emerald-700 leading-tight flex items-center gap-1 font-medium mt-1 pl-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Within standard labor band (10% - 25% of base price).</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Piping details */}
        <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-zinc-800 font-sans text-xs font-semibold">
            <Wind className="w-4 h-4 text-emerald-800" />
            <span>Fluid Cooling Piping &amp; Linear Run Constraints</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">
                  Total Installation Pipe Run
                </span>
                <span className="text-emerald-800 text-[10px] font-mono font-bold">
                  {actual_piping_distance_feet} feet
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={150}
                value={actual_piping_distance_feet}
                onChange={(e) => updateInstParams("actual_piping_distance_feet", parseInt(e.target.value) || 0)}
                className="w-full accent-emerald-800 h-[2px] bg-zinc-200 appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[8px] font-mono text-zinc-400 mt-1">
                <span>0 ft</span>
                <span>10 ft (Standard Included)</span>
                <span>150 ft</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block font-bold">
                  Extra Pipe Ext. Rate (PHP/ft)
                </label>
                <span className="text-zinc-500 text-[9px] font-mono font-semibold">User Overridable</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={excess_piping_rate_per_foot}
                  onChange={(e) => updateInstParams("excess_piping_rate_per_foot", Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full pl-7 pr-3 py-2 bg-white text-zinc-800 text-xs font-mono focus:outline-none font-semibold border rounded-lg transition-colors ${
                    isExcessPipingTooLow || isExcessPipingTooHigh
                      ? "border-amber-400 bg-amber-50/20"
                      : "border-zinc-200 focus:border-emerald-800"
                  }`}
                />
              </div>
              {isExcessPipingTooLow && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Rate is below standard minimum (₱{Math.round(stdPipingRate * 0.75).toLocaleString()}/ft). Margins may suffer.</span>
                </div>
              )}
              {isExcessPipingTooHigh && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Rate is above standard maximum (₱{Math.round(stdPipingRate * 1.5).toLocaleString()}/ft). High surcharge warning.</span>
                </div>
              )}
              {!isExcessPipingTooLow && !isExcessPipingTooHigh && (
                <div className="text-[10px] text-emerald-700 leading-tight flex items-center gap-1 font-medium mt-1 pl-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Within standard piping rate band (₱{stdPipingRate}/ft).</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Independent Dual-Breaker Options with Custom Price Input Overrides */}
        <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-4">
          <div className="flex items-center space-x-2 text-zinc-800 font-sans text-xs font-semibold">
            <Zap className="w-4 h-4 text-emerald-800" />
            <span>Safe Electrical Circuit Isolated Dual-Breakers &amp; Wiring Overrides</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Indoor Breaker Node */}
            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Indoor Circuit Breaker</span>
                  <span className="text-[9px] text-zinc-400 italic font-mono">Isolated terminal disconnects</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={electrical_breaker_options.indoor_breaker.selected}
                    onChange={(e) => updateBreaker("indoor_breaker", "selected", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-200 rounded-full peer peer-checked:bg-emerald-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {electrical_breaker_options.indoor_breaker.selected && (
                <div className="space-y-1.5 pt-1.5 border-t border-zinc-100">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Breaker Unit Price (PHP)</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-zinc-400 text-[10px] font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={electrical_breaker_options.indoor_breaker.unit_price_input}
                      onChange={(e) => updateBreaker("indoor_breaker", "unit_price_input", Math.max(0, parseFloat(e.target.value) || 0))}
                      className={`w-full pl-6 pr-2 py-1 bg-white border text-zinc-800 text-xs rounded-lg font-mono focus:outline-none transition-colors ${
                        isIndoorBreakerTooLow || isIndoorBreakerTooHigh
                          ? "border-amber-400 bg-amber-50/10 focus:border-amber-600"
                          : "border-zinc-200 focus:border-emerald-800"
                      }`}
                    />
                  </div>
                  {isIndoorBreakerTooLow && (
                    <div className="text-[9px] text-amber-700 leading-tight font-medium bg-amber-50/50 border border-amber-200 p-1 rounded-lg">
                      Below standard min (₱400).
                    </div>
                  )}
                  {isIndoorBreakerTooHigh && (
                    <div className="text-[9px] text-amber-700 leading-tight font-medium bg-amber-50/50 border border-amber-200 p-1 rounded-lg">
                      Above standard max (₱1,500).
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Outdoor Breaker Node */}
            <div className="p-3 bg-white border border-zinc-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase block">Outdoor Weatherproof Breaker</span>
                  <span className="text-[9px] text-zinc-400 italic font-mono">Condenser isolated lockouts</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={electrical_breaker_options.outdoor_breaker.selected}
                    onChange={(e) => updateBreaker("outdoor_breaker", "selected", e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-zinc-200 rounded-full peer peer-checked:bg-emerald-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>

              {electrical_breaker_options.outdoor_breaker.selected && (
                <div className="space-y-1.5 pt-1.5 border-t border-zinc-100">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Breaker Unit Price (PHP)</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-zinc-400 text-[10px] font-mono">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={5}
                      value={electrical_breaker_options.outdoor_breaker.unit_price_input}
                      onChange={(e) => updateBreaker("outdoor_breaker", "unit_price_input", Math.max(0, parseFloat(e.target.value) || 0))}
                      className={`w-full pl-6 pr-2 py-1 bg-white border text-zinc-800 text-xs rounded-lg font-mono focus:outline-none transition-colors ${
                        isOutdoorBreakerTooLow || isOutdoorBreakerTooHigh
                          ? "border-amber-400 bg-amber-50/10 focus:border-amber-600"
                          : "border-zinc-200 focus:border-emerald-800"
                      }`}
                    />
                  </div>
                  {isOutdoorBreakerTooLow && (
                    <div className="text-[9px] text-amber-700 leading-tight font-medium bg-amber-50/50 border border-amber-200 p-1 rounded-lg">
                      Below standard min (₱500).
                    </div>
                  )}
                  {isOutdoorBreakerTooHigh && (
                    <div className="text-[9px] text-amber-700 leading-tight font-medium bg-amber-50/50 border border-amber-200 p-1 rounded-lg">
                      Above standard max (₱2,000).
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1.5 border-t border-zinc-150">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">
                Electrical Labor &amp; Conduit (PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={flat_wiring_connectivity_fee}
                  onChange={(e) => updateInstParams("flat_wiring_connectivity_fee", Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full pl-7 pr-3 py-2 bg-white border text-zinc-800 text-xs rounded-lg focus:outline-none font-mono font-semibold transition-colors ${
                    isFlatWiringTooLow || isFlatWiringTooHigh
                      ? "border-amber-400 bg-amber-50/20 focus:border-amber-600"
                      : "border-zinc-200 focus:border-emerald-800"
                  }`}
                />
              </div>
              {isFlatWiringTooLow && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Below standard minimum (₱1,000). May not cover electrical scope.</span>
                </div>
              )}
              {isFlatWiringTooHigh && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Above standard maximum (₱5,000). Over-estimates conduit work.</span>
                </div>
              )}
              {!isFlatWiringTooLow && !isFlatWiringTooHigh && (
                <div className="text-[10px] text-emerald-700 leading-tight flex items-center gap-1 font-medium mt-1 pl-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Within standard flat wiring range (₱1,000 - ₱5,000).</span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">
                Wire Length (Feet)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={wire_length_feet}
                  onChange={(e) => updateInstParams("wire_length_feet", Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 bg-white border border-zinc-200 text-zinc-800 text-xs rounded-lg focus:outline-none focus:border-emerald-800 font-mono font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-zinc-500 uppercase block font-bold">
                Wire Price (Per Foot, PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={wire_rate_per_foot}
                  onChange={(e) => updateInstParams("wire_rate_per_foot", Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full pl-7 pr-3 py-2 bg-white border text-zinc-800 text-xs rounded-lg focus:outline-none font-mono font-semibold transition-colors ${
                    isWireRateTooLow || isWireRateTooHigh
                      ? "border-amber-400 bg-amber-50/20 focus:border-amber-600"
                      : "border-zinc-200 focus:border-emerald-800"
                  }`}
                />
              </div>
              {isWireRateTooLow && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Below standard rate (₱60/ft). Potential under-spec copper wire.</span>
                </div>
              )}
              {isWireRateTooHigh && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Above standard rate (₱250/ft). Over-estimated wire material rate.</span>
                </div>
              )}
              {!isWireRateTooLow && !isWireRateTooHigh && (
                <div className="text-[10px] text-emerald-700 leading-tight flex items-center gap-1 font-medium mt-1 pl-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Within standard wire rate band (₱60 - ₱250).</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Dismantling */}
        <div className="bg-zinc-50 border border-zinc-150 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-zinc-800 font-sans text-xs font-semibold">
              <Trash2 className="w-4 h-4 text-emerald-800" />
              <span>Dismantling</span>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dismantling_services.required}
                onChange={(e) => updateDismantling("required", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-zinc-200 rounded-full peer peer-checked:bg-emerald-800 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          {dismantling_services.required && (
            <div className="grid grid-cols-1 gap-1.5 pt-2 border-t border-zinc-150 transition-all">
              <label className="text-[10px] font-mono text-zinc-500 uppercase font-bold block">
                Flat Deinstallation Fee (Per decommissioned box, PHP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-zinc-400 text-xs font-mono">₱</span>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={dismantling_services.fee_per_unit}
                  onChange={(e) => updateDismantling("fee_per_unit", Math.max(0, parseFloat(e.target.value) || 0))}
                  className={`w-full pl-7 pr-3 py-2 bg-white border text-zinc-800 text-xs rounded-lg focus:outline-none font-mono transition-colors ${
                    isDismantlingTooLow || isDismantlingTooHigh
                      ? "border-amber-400 bg-amber-50/20 focus:border-emerald-800"
                      : "border-zinc-200 focus:border-emerald-800"
                  }`}
                />
              </div>
              {isDismantlingTooLow && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Below standard fee (₱1,000). May not cover complex dismantling labor.</span>
                </div>
              )}
              {isDismantlingTooHigh && (
                <div className="text-[10px] text-amber-700 leading-tight flex items-start gap-1 font-medium bg-amber-50 border border-amber-200 p-1.5 rounded-lg mt-1">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span>Above standard fee (₱4,000). High fee for basic decommissioning.</span>
                </div>
              )}
              {!isDismantlingTooLow && !isDismantlingTooHigh && (
                <div className="text-[10px] text-emerald-700 leading-tight flex items-center gap-1 font-medium mt-1 pl-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span>Within standard decommissioning fee band (₱1,000 - ₱4,000).</span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
