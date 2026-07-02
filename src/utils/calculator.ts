import { HVACProposalPayload, CostCalculationResponse } from "../types";

export function calculateCost(data: HVACProposalPayload): CostCalculationResponse {
  const brand = data.selection_flow.equipment_brand;
  const formFactor = data.selection_flow.form_factor;
  const capacity = data.selection_flow.cooling_capacity;
  const modelNo = data.selection_flow.resolved_model_details.model_number;
  const basePrice = Number(data.selection_flow.resolved_model_details.unit_base_price);
  
  // Custom unit labor fallback to 15% if undefined/null
  const unitLaborPrice = Number(
    data.selection_flow.resolved_model_details.unit_labor_price !== undefined &&
    data.selection_flow.resolved_model_details.unit_labor_price !== null
      ? data.selection_flow.resolved_model_details.unit_labor_price
      : basePrice * 0.15
  );
  const totalEquipmentUnitPrice = basePrice + unitLaborPrice;

  const qty = Number(data.installation_parameters.base_quantity);
  const pipingDistance = Number(data.installation_parameters.actual_piping_distance_feet);

  // Dynamic overridable piping rates
  const excessRate = Number(data.installation_parameters.excess_piping_rate_per_foot);
  const basePipingFee = Number(data.installation_parameters.base_piping_fee);

  const flatWiringFee = Number(data.installation_parameters.flat_wiring_connectivity_fee);
  const wireLength = Number(data.installation_parameters.wire_length_feet || 0);
  const wireRate = Number(data.installation_parameters.wire_rate_per_foot || 0);

  const dismantlingRequired = data.installation_parameters.dismantling_services.required;
  const decommissioningUnitFee = Number(data.installation_parameters.dismantling_services.fee_per_unit);

  const eb = data.installation_parameters.electrical_breaker_options;
  const indoorSelected = eb.indoor_breaker.selected;
  const indoorUnitFee = Number(eb.indoor_breaker.unit_price_input);
  const outdoorSelected = eb.outdoor_breaker.selected;
  const outdoorUnitFee = Number(eb.outdoor_breaker.unit_price_input);

  // 1. Base Hardware Cost (Material + Labor)
  const hardwareCost = totalEquipmentUnitPrice * qty;

  // 2. Overridable Refrigerant Piping Cost (Material + Labor splits)
  const basePipingLabor = data.installation_parameters.base_piping_labor_price !== undefined &&
                          data.installation_parameters.base_piping_labor_price !== null
    ? Number(data.installation_parameters.base_piping_labor_price)
    : (pipingDistance > 0 ? (basePipingFee / qty * 0.25) : 0);
  
  const basePipingMat = pipingDistance > 0 ? (basePipingFee / qty * 0.75) : 0;
  const totalBasePipingUnitPrice = basePipingMat + basePipingLabor;
  const actualBasePipingFee = pipingDistance > 0 ? (totalBasePipingUnitPrice * qty) : 0;

  const excessDistance = Math.max(0, pipingDistance - 10);
  const excessPipingLabor = data.installation_parameters.excess_piping_labor_price !== undefined &&
                            data.installation_parameters.excess_piping_labor_price !== null
    ? Number(data.installation_parameters.excess_piping_labor_price)
    : (excessRate * 0.20);
  const excessPipingMat = excessRate * 0.80;
  const totalExcessPipingUnitPrice = excessPipingMat + excessPipingLabor;
  const excessPipingCost = excessDistance > 0 ? (excessDistance * qty * totalExcessPipingUnitPrice) : 0;

  const pipingCost = actualBasePipingFee + excessPipingCost;

  // 3. Overridable Independent Breaker & Wiring Dynamic Addons
  const indoorBreakerLabor = data.installation_parameters.indoor_breaker_labor_price !== undefined &&
                             data.installation_parameters.indoor_breaker_labor_price !== null
    ? Number(data.installation_parameters.indoor_breaker_labor_price)
    : (indoorUnitFee * 0.18);
  const indoorBreakerMat = indoorUnitFee * 0.82;
  const totalIndoorBreakerUnitPrice = indoorBreakerMat + indoorBreakerLabor;
  const indoorBreakerAddon = indoorSelected ? (totalIndoorBreakerUnitPrice * qty) : 0;

  const outdoorBreakerLabor = data.installation_parameters.outdoor_breaker_labor_price !== undefined &&
                              data.installation_parameters.outdoor_breaker_labor_price !== null
    ? Number(data.installation_parameters.outdoor_breaker_labor_price)
    : (outdoorUnitFee * 0.18);
  const outdoorBreakerMat = outdoorUnitFee * 0.82;
  const totalOutdoorBreakerUnitPrice = outdoorBreakerMat + outdoorBreakerLabor;
  const outdoorBreakerAddon = outdoorSelected ? (totalOutdoorBreakerUnitPrice * qty) : 0;

  const wireLabor = data.installation_parameters.wire_labor_price !== undefined &&
                    data.installation_parameters.wire_labor_price !== null
    ? Number(data.installation_parameters.wire_labor_price)
    : (wireRate * 0.20);
  const wireMat = wireRate * 0.80;
  const totalWireUnitPrice = wireMat + wireLabor;
  const wireCost = wireLength * totalWireUnitPrice;

  const flatWiringLabor = data.installation_parameters.flat_wiring_labor_price !== undefined &&
                          data.installation_parameters.flat_wiring_labor_price !== null
    ? Number(data.installation_parameters.flat_wiring_labor_price)
    : (flatWiringFee * 0.60);
  const flatWiringMat = flatWiringFee * 0.40;
  const totalFlatWiringFee = flatWiringFee > 0 ? (flatWiringMat + flatWiringLabor) : 0;

  const electricalInfrastructureCost = indoorBreakerAddon + outdoorBreakerAddon + totalFlatWiringFee + wireCost;

  // 4. Overridable Dismantling
  const dismantlingLabor = data.installation_parameters.dismantling_labor_price !== undefined &&
                            data.installation_parameters.dismantling_labor_price !== null
    ? Number(data.installation_parameters.dismantling_labor_price)
    : decommissioningUnitFee;
  const dismantlingCost = dismantlingRequired ? (dismantlingLabor * qty) : 0;

  // Compute final sum
  const finalCost = hardwareCost + pipingCost + electricalInfrastructureCost + dismantlingCost;

  // Backwards compatible mockup comparison rate for "Original Standard Rate / Savings" presentation
  const originalHardwareCost = (totalEquipmentUnitPrice * 1.10) * qty;
  const originalPipingCost = (pipingDistance > 0 ? (basePipingFee * 1.10) : 0) + excessDistance * (excessRate * 1.10) * qty;
  const originalFinalCost = originalHardwareCost + originalPipingCost + electricalInfrastructureCost + dismantlingCost;
  const savings = Math.max(0, originalFinalCost - finalCost);

  return {
    formula: "Final Cost = [Qty * (BasePrice + UnitLabor)] + [Base Piping Fee] + [max(0, Piping - 10) * ExcessRate * Qty] + [Indoor Breaker Addon] + [Outdoor Breaker Addon] + Flat Wiring Fee + [Wire Length * Wire Rate] + Dismantling",
    regional_rule_applied: `Resolved Model: ${modelNo} with direct enterprise material pricing of ₱${basePrice.toLocaleString()} and unit labor pricing of ₱${unitLaborPrice.toLocaleString()} per system.`,
    discount_applied: `Direct corporate procurement pipeline resolved with 0% further tariff overhead.`,
    breakdown: {
      equipment: {
        quantity: qty,
        unit_price: totalEquipmentUnitPrice,
        adjusted_unit_price: totalEquipmentUnitPrice,
        subtotal: hardwareCost,
      },
      piping: {
        actual_distance_feet: pipingDistance,
        excess_feet: excessDistance,
        rate_per_foot: excessRate,
        adjusted_rate_per_foot: excessRate,
        base_fee: actualBasePipingFee,
        subtotal: pipingCost,
      },
      dismantling: {
        required: dismantlingRequired,
        fee_per_unit: dismantlingLabor,
        subtotal: dismantlingCost,
      },
      electrical: {
        circuit_breaker_indoor_qty: indoorSelected ? qty : 0,
        circuit_breaker_indoor_rate: totalIndoorBreakerUnitPrice,
        circuit_breaker_indoor_subtotal: indoorBreakerAddon,
        circuit_breaker_outdoor_qty: outdoorSelected ? qty : 0,
        circuit_breaker_outdoor_rate: totalOutdoorBreakerUnitPrice,
        circuit_breaker_outdoor_subtotal: outdoorBreakerAddon,
        flat_wiring_connectivity_fee: totalFlatWiringFee,
        wire_qty: wireLength,
        wire_rate: totalWireUnitPrice,
        wire_subtotal: wireCost,
        subtotal: electricalInfrastructureCost,
      },
    },
    original_final_cost: originalFinalCost,
    final_cost: finalCost,
    savings: savings,
    currency: "PHP",
  };
}
