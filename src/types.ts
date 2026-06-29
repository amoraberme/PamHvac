/**
 * TypeScript Typings and Static Constants for the HVAC Procurement & Calculation Engine
 * Conforming strictly to the Antigravity 2.0 Cascading Component & Schema Refactor
 */

export interface ResolvedModelDetails {
  model_number: string;
  unit_base_price: number;
  unit_labor_price?: number;
}

export interface SelectionFlow {
  equipment_brand: "Carrier" | "Matrix" | "Midea";
  form_factor: "Split Type" | "Window Type" | "Floor Mounted" | "Ceiling Cassette" | "Ceiling Suspended";
  cooling_capacity: "0.6 HP" | "1.0 HP" | "1.5 HP" | "2.0 HP" | "2.5 HP" | "3.0 HP" | "3-tonner" | "5-tonner";
  resolved_model_details: ResolvedModelDetails;
}

export interface BreakerOption {
  selected: boolean;
  unit_price_input: number;
}

export interface ElectricalBreakerOptions {
  indoor_breaker: BreakerOption;
  outdoor_breaker: BreakerOption;
}

export interface DismantlingServices {
  required: boolean;
  fee_per_unit: number;
}

export interface InstallationParameters {
  base_quantity: number;
  actual_piping_distance_feet: number;
  excess_piping_rate_per_foot: number;
  base_piping_fee: number;
  electrical_breaker_options: ElectricalBreakerOptions;
  flat_wiring_connectivity_fee: number;
  dismantling_services: DismantlingServices;
  wire_length_feet: number;
  wire_rate_per_foot: number;
  base_piping_labor_price?: number;
  excess_piping_labor_price?: number;
  indoor_breaker_labor_price?: number;
  outdoor_breaker_labor_price?: number;
  wire_labor_price?: number;
  flat_wiring_labor_price?: number;
  dismantling_labor_price?: number;
}

export interface HVACProposalPayload {
  selection_flow: SelectionFlow;
  installation_parameters: InstallationParameters;
}

export interface CostBreakdownItem {
  quantity: number;
  unit_price: number; // original base cost
  adjusted_unit_price: number; // resolved model unit base price
  subtotal: number;
}

export interface CostBreakdownPiping {
  actual_distance_feet: number;
  excess_feet: number;
  rate_per_foot: number;
  adjusted_rate_per_foot: number;
  base_fee: number;
  subtotal: number;
}

export interface CostBreakdownDismantling {
  required: boolean;
  fee_per_unit: number;
  subtotal: number;
}

export interface CostBreakdownElectrical {
  circuit_breaker_indoor_qty: number;
  circuit_breaker_indoor_rate: number;
  circuit_breaker_indoor_subtotal: number;
  circuit_breaker_outdoor_qty: number;
  circuit_breaker_outdoor_rate: number;
  circuit_breaker_outdoor_subtotal: number;
  flat_wiring_connectivity_fee: number;
  wire_qty: number;
  wire_rate: number;
  wire_subtotal: number;
  subtotal: number;
}

export interface CostCalculationResponse {
  formula: string;
  regional_rule_applied: string;
  discount_applied: string;
  breakdown: {
    equipment: CostBreakdownItem;
    piping: CostBreakdownPiping;
    dismantling: CostBreakdownDismantling;
    electrical: CostBreakdownElectrical;
  };
  original_final_cost: number;
  final_cost: number;
  savings: number;
  currency: string;
}

export interface HistoricalTransaction {
  id: string;
  timestamp: string;
  payload: HVACProposalPayload;
  calculation: CostCalculationResponse;
}

// Preset Handwritten spec sheets to simulate raw data sheet ingestion
export interface RawSpecPreset {
  id: string;
  title: string;
  description: string;
  rawText: string;
}

export interface ModelPricelistEntry {
  model_number: string;
  brand: "Carrier" | "Matrix" | "Midea";
  capacity: "0.6 HP" | "1.0 HP" | "1.5 HP" | "2.0 HP" | "2.5 HP" | "3.0 HP" | "3-tonner" | "5-tonner";
  form_factor: "Split Type" | "Window Type" | "Floor Mounted" | "Ceiling Cassette" | "Ceiling Suspended";
  unit_base_price: number;
  price_type: "SRP" | "NET" | "Bulk" | "End User" | "Dealer" | "Credit Card" | "Default";
  label: string;
}

export const PRICELIST_MODELS: ModelPricelistEntry[] = [
  // --- MIDEA ---
  // 1.0 HP
  { model_number: "MSCE-10CRFN8", brand: "Midea", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 15100.00, price_type: "NET", label: "Midea MSCE-10CRFN8 (NET: 15,100 PHP)" },
  { model_number: "MSCE-10CRFN8", brand: "Midea", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 30495.00, price_type: "SRP", label: "Midea MSCE-10CRFN8 (SRP: 30,495 PHP)" },
  { model_number: "MSCE-10CRFN8", brand: "Midea", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 15895.00, price_type: "Credit Card", label: "Midea MSCE-10CRFN8 (CC: 15,895 PHP)" },
  // 1.5 HP
  { model_number: "MSCE-13CRFN8", brand: "Midea", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 16000.00, price_type: "NET", label: "Midea MSCE-13CRFN8 (NET: 16,000 PHP)" },
  { model_number: "MSCE-13CRFN8", brand: "Midea", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 31995.00, price_type: "SRP", label: "Midea MSCE-13CRFN8 (SRP: 31,995 PHP)" },
  { model_number: "MSCE-13CRFN8", brand: "Midea", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 16842.00, price_type: "Credit Card", label: "Midea MSCE-13CRFN8 (CC: 16,842 PHP)" },
  // 2.0 HP
  { model_number: "MSCE-19CRFN8", brand: "Midea", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 21400.00, price_type: "NET", label: "Midea MSCE-19CRFN8 (NET: 21,400 PHP)" },
  { model_number: "MSCE-19CRFN8", brand: "Midea", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 40995.00, price_type: "SRP", label: "Midea MSCE-19CRFN8 (SRP: 40,995 PHP)" },
  { model_number: "MSCE-19CRFN8", brand: "Midea", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 22526.00, price_type: "Credit Card", label: "Midea MSCE-19CRFN8 (CC: 22,526 PHP)" },
  // 2.5 HP
  { model_number: "MSCE-22CRFN8", brand: "Midea", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 26400.00, price_type: "NET", label: "Midea MSCE-22CRFN8 (NET: 26,400 PHP)" },
  { model_number: "MSCE-22CRFN8", brand: "Midea", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 49395.00, price_type: "SRP", label: "Midea MSCE-22CRFN8 (SRP: 49,395 PHP)" },
  { model_number: "MSCE-22CRFN8", brand: "Midea", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 27789.00, price_type: "Credit Card", label: "Midea MSCE-22CRFN8 (CC: 27,789 PHP)" },
  // 3.0 HP
  { model_number: "MSCE-25CRFN8", brand: "Midea", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 41700.00, price_type: "NET", label: "Midea MSCE-25CRFN8 (NET: 41,700 PHP)" },
  { model_number: "MSCE-25CRFN8", brand: "Midea", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 74895.00, price_type: "SRP", label: "Midea MSCE-25CRFN8 (SRP: 74,895 PHP)" },
  { model_number: "MSCE-25CRFN8", brand: "Midea", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 43895.00, price_type: "Credit Card", label: "Midea MSCE-25CRFN8 (CC: 43,895 PHP)" },

  // --- MATRIX ---
  // --- Split Type [2.1] ---
  { model_number: "MX-CS25L2A", brand: "Matrix", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 13800.00, price_type: "Bulk", label: "Matrix MX-CS25L2A (Bulk: 13,800 PHP)" },
  { model_number: "MX-CS25L2A", brand: "Matrix", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 21500.00, price_type: "SRP", label: "Matrix MX-CS25L2A (SRP: 21,500 PHP)" },
  { model_number: "MX-CS25L2A", brand: "Matrix", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 18700.00, price_type: "End User", label: "Matrix MX-CS25L2A (End User: 18,700 PHP)" },
  { model_number: "MX-CS25L2A", brand: "Matrix", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 14900.00, price_type: "Dealer", label: "Matrix MX-CS25L2A (Dealer: 14,900 PHP)" },

  { model_number: "MX-CS35L2A", brand: "Matrix", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 14600.00, price_type: "Bulk", label: "Matrix MX-CS35L2A (Bulk: 14,600 PHP)" },
  { model_number: "MX-CS35L2A", brand: "Matrix", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 23500.00, price_type: "SRP", label: "Matrix MX-CS35L2A (SRP: 23,500 PHP)" },
  { model_number: "MX-CS35L2A", brand: "Matrix", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 19800.00, price_type: "End User", label: "Matrix MX-CS35L2A (End User: 19,800 PHP)" },
  { model_number: "MX-CS35L2A", brand: "Matrix", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 15800.00, price_type: "Dealer", label: "Matrix MX-CS35L2A (Dealer: 15,800 PHP)" },

  { model_number: "MX-CS51L2A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 19700.00, price_type: "Bulk", label: "Matrix MX-CS51L2A (Bulk: 19,700 PHP)" },
  { model_number: "MX-CS51L2A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 31500.00, price_type: "SRP", label: "Matrix MX-CS51L2A (SRP: 31,500 PHP)" },
  { model_number: "MX-CS51L2A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 26700.00, price_type: "End User", label: "Matrix MX-CS51L2A (End User: 26,700 PHP)" },
  { model_number: "MX-CS51L2A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 21250.00, price_type: "Dealer", label: "Matrix MX-CS51L2A (Dealer: 21,250 PHP)" },

  { model_number: "MX-CS70L2A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 23900.00, price_type: "Bulk", label: "Matrix MX-CS70L2A (Bulk: 23,900 PHP)" },
  { model_number: "MX-CS70L2A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 38200.00, price_type: "SRP", label: "Matrix MX-CS70L2A (SRP: 38,200 PHP)" },
  { model_number: "MX-CS70L2A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 32400.00, price_type: "End User", label: "Matrix MX-CS70L2A (End User: 32,400 PHP)" },
  { model_number: "MX-CS70L2A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 25800.00, price_type: "Dealer", label: "Matrix MX-CS70L2A (Dealer: 25,800 PHP)" },

  { model_number: "MX-CS24HRFN", brand: "Matrix", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 30800.00, price_type: "Bulk", label: "Matrix MX-CS24HRFN (Bulk: 30,800 PHP)" },
  { model_number: "MX-CS24HRFN", brand: "Matrix", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 47800.00, price_type: "SRP", label: "Matrix MX-CS24HRFN (SRP: 47,800 PHP)" },
  { model_number: "MX-CS24HRFN", brand: "Matrix", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 41700.00, price_type: "End User", label: "Matrix MX-CS24HRFN (End User: 41,700 PHP)" },
  { model_number: "MX-CS24HRFN", brand: "Matrix", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 33200.00, price_type: "Dealer", label: "Matrix MX-CS24HRFN (Dealer: 33,200 PHP)" },

  // --- Window Type DC Inverter [2.2] ---
  { model_number: "MX-INVT100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 13800.00, price_type: "Bulk", label: "Matrix MX-INVT100 (Inverter Bulk: 13,800 PHP)" },
  { model_number: "MX-INVT100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 23800.00, price_type: "SRP", label: "Matrix MX-INVT100 (Inverter SRP: 23,800 PHP)" },
  { model_number: "MX-INVT100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 21500.00, price_type: "End User", label: "Matrix MX-INVT100 (Inverter End User: 21,500 PHP)" },
  { model_number: "MX-INVT100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 15100.00, price_type: "Dealer", label: "Matrix MX-INVT100 (Inverter Dealer: 15,100 PHP)" },

  { model_number: "MX-INV35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 16700.00, price_type: "Bulk", label: "Matrix MX-INV35 (Inverter Bulk: 16,700 PHP)" },
  { model_number: "MX-INV35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 25500.00, price_type: "SRP", label: "Matrix MX-INV35 (Inverter SRP: 25,500 PHP)" },
  { model_number: "MX-INV35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 22500.00, price_type: "End User", label: "Matrix MX-INV35 (Inverter End User: 22,500 PHP)" },
  { model_number: "MX-INV35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 17972.00, price_type: "Dealer", label: "Matrix MX-INV35 (Inverter Dealer: 17,972 PHP)" },

  { model_number: "MX-INV50", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 26312.00, price_type: "Bulk", label: "Matrix MX-INV50 (Inverter Bulk: 26,312 PHP)" },
  { model_number: "MX-INV50", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 43500.00, price_type: "SRP", label: "Matrix MX-INV50 (Inverter SRP: 43,500 PHP)" },
  { model_number: "MX-INV50", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 36900.00, price_type: "End User", label: "Matrix MX-INV50 (Inverter End User: 36,900 PHP)" },
  { model_number: "MX-INV50", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 28500.00, price_type: "Dealer", label: "Matrix MX-INV50 (Inverter Dealer: 28,500 PHP)" },

  { model_number: "MX-INV2500A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 29350.00, price_type: "Bulk", label: "Matrix MX-INV2500A (Inverter Bulk: 29,350 PHP)" },
  { model_number: "MX-INV2500A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 46000.00, price_type: "SRP", label: "Matrix MX-INV2500A (Inverter SRP: 46,000 PHP)" },
  { model_number: "MX-INV2500A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 40500.00, price_type: "End User", label: "Matrix MX-INV2500A (Inverter End User: 40,500 PHP)" },
  { model_number: "MX-INV2500A", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 31700.00, price_type: "Dealer", label: "Matrix MX-INV2500A (Inverter Dealer: 31,700 PHP)" },

  // --- Window Type Non-Inverter [2.3] ---
  { model_number: "MX-KC1509", brand: "Matrix", capacity: "0.6 HP", form_factor: "Window Type", unit_base_price: 7000.00, price_type: "Bulk", label: "Matrix MX-KC1509 0.6HP (Bulk: 7,000 PHP)" },
  { model_number: "MX-KC1509", brand: "Matrix", capacity: "0.6 HP", form_factor: "Window Type", unit_base_price: 10300.00, price_type: "SRP", label: "Matrix MX-KC1509 0.6HP (SRP: 10,300 PHP)" },
  { model_number: "MX-KC1509", brand: "Matrix", capacity: "0.6 HP", form_factor: "Window Type", unit_base_price: 9417.89, price_type: "End User", label: "Matrix MX-KC1509 0.6HP (End User: 9,417.89 PHP)" },
  { model_number: "MX-KC1509", brand: "Matrix", capacity: "0.6 HP", form_factor: "Window Type", unit_base_price: 7525.00, price_type: "Dealer", label: "Matrix MX-KC1509 0.6HP (Dealer: 7,525 PHP)" },

  { model_number: "MX-KC1100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 10200.00, price_type: "Bulk", label: "Matrix MX-KC1100 (Bulk: 10,200 PHP)" },
  { model_number: "MX-KC1100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 15000.00, price_type: "SRP", label: "Matrix MX-KC1100 (SRP: 15,000 PHP)" },
  { model_number: "MX-KC1100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 13703.09, price_type: "End User", label: "Matrix MX-KC1100 (End User: 13,703.09 PHP)" },
  { model_number: "MX-KC1100", brand: "Matrix", capacity: "1.0 HP", form_factor: "Window Type", unit_base_price: 11000.00, price_type: "Dealer", label: "Matrix MX-KC1100 (Dealer: 11,000 PHP)" },

  { model_number: "MX-KC35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 12900.00, price_type: "Bulk", label: "Matrix MX-KC35 (Bulk: 12,900 PHP)" },
  { model_number: "MX-KC35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 16000.00, price_type: "SRP", label: "Matrix MX-KC35 (SRP: 16,000 PHP)" },
  { model_number: "MX-KC35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 17453.14, price_type: "End User", label: "Matrix MX-KC35 (End User: 17,453.14 PHP)" },
  { model_number: "MX-KC35", brand: "Matrix", capacity: "1.5 HP", form_factor: "Window Type", unit_base_price: 13900.00, price_type: "Dealer", label: "Matrix MX-KC35 (Dealer: 13,900 PHP)" },

  { model_number: "MX-KC50A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 18900.00, price_type: "Bulk", label: "Matrix MX-KC50A (Bulk: 18,900 PHP)" },
  { model_number: "MX-KC50A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 29000.00, price_type: "SRP", label: "Matrix MX-KC50A (SRP: 29,000 PHP)" },
  { model_number: "MX-KC50A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 25583.37, price_type: "End User", label: "Matrix MX-KC50A (End User: 25,583.37 PHP)" },
  { model_number: "MX-KC50A", brand: "Matrix", capacity: "2.0 HP", form_factor: "Window Type", unit_base_price: 20500.00, price_type: "Dealer", label: "Matrix MX-KC50A (Dealer: 20,500 PHP)" },

  { model_number: "MX-KC25", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 20200.00, price_type: "Bulk", label: "Matrix MX-KC25 (Bulk: 20,200 PHP)" },
  { model_number: "MX-KC25", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 31000.00, price_type: "SRP", label: "Matrix MX-KC25 (SRP: 31,000 PHP)" },
  { model_number: "MX-KC25", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 27366.61, price_type: "End User", label: "Matrix MX-KC25 (End User: 27,366.61 PHP)" },
  { model_number: "MX-KC25", brand: "Matrix", capacity: "2.5 HP", form_factor: "Window Type", unit_base_price: 21800.00, price_type: "Dealer", label: "Matrix MX-KC25 (Dealer: 21,800 PHP)" },

  // --- Floor Mounted Inverter & Non-Inverter [2.4, 2.5] ---
  { model_number: "MX-FDC100INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 56000.00, price_type: "Bulk", label: "Matrix MX-FDC100INV 3.0TR (Bulk: 56,000 PHP)" },
  { model_number: "MX-FDC100INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 86700.00, price_type: "SRP", label: "Matrix MX-FDC100INV 3.0TR (SRP: 86,700 PHP)" },
  { model_number: "MX-FDC100INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 76000.00, price_type: "End User", label: "Matrix MX-FDC100INV 3.0TR (End User: 76,000 PHP)" },
  { model_number: "MX-FDC100INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 60400.00, price_type: "Dealer", label: "Matrix MX-FDC100INV 3.0TR (Dealer: 60,400 PHP)" },

  { model_number: "MX-FDC741INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 84500.00, price_type: "Bulk", label: "Matrix MX-FDC741INV 5.0TR (Bulk: 84,500 PHP)" },
  { model_number: "MX-FDC741INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 128200.00, price_type: "SRP", label: "Matrix MX-FDC741INV 5.0TR (SRP: 128,200 PHP)" },
  { model_number: "MX-FDC741INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 114600.00, price_type: "End User", label: "Matrix MX-FDC741INV 5.0TR (End User: 114,600 PHP)" },
  { model_number: "MX-FDC741INV", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 91200.00, price_type: "Dealer", label: "Matrix MX-FDC741INV 5.0TR (Dealer: 91,200 PHP)" },

  { model_number: "MX-CF100C2", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 52200.00, price_type: "Bulk", label: "Matrix MX-CF100C2 3.0TR (Bulk: 52,200 PHP)" },
  { model_number: "MX-CF100C2", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 82500.00, price_type: "SRP", label: "Matrix MX-CF100C2 3.0TR (SRP: 82,500 PHP)" },
  { model_number: "MX-CF100C2", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 70800.00, price_type: "End User", label: "Matrix MX-CF100C2 3.0TR (End User: 70,800 PHP)" },
  { model_number: "MX-CF100C2", brand: "Matrix", capacity: "3.0 HP", form_factor: "Floor Mounted", unit_base_price: 56300.00, price_type: "Dealer", label: "Matrix MX-CF100C2 3.0TR (Dealer: 56,300 PHP)" },

  // --- Ceiling Cassette Inverter & Non-Inverter [2.6, 2.7] ---
  { model_number: "MX-FDC36CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 51800.00, price_type: "Bulk", label: "Matrix MX-FDC36CT-DCI 3.0TR (Bulk: 51,800 PHP)" },
  { model_number: "MX-FDC36CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 77000.00, price_type: "SRP", label: "Matrix MX-FDC36CT-DCI 3.0TR (SRP: 77,000 PHP)" },
  { model_number: "MX-FDC36CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 70300.00, price_type: "End User", label: "Matrix MX-FDC36CT-DCI 3.0TR (End User: 70,300 PHP)" },
  { model_number: "MX-FDC36CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 56000.00, price_type: "Dealer", label: "Matrix MX-FDC36CT-DCI 3.0TR (Dealer: 56,000 PHP)" },

  { model_number: "MX-FDC60CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 85900.00, price_type: "Bulk", label: "Matrix MX-FDC60CT-DCI 5.0TR (Bulk: 85,900 PHP)" },
  { model_number: "MX-FDC60CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 122000.00, price_type: "SRP", label: "Matrix MX-FDC60CT-DCI 5.0TR (SRP: 122,000 PHP)" },
  { model_number: "MX-FDC60CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 116600.00, price_type: "End User", label: "Matrix MX-FDC60CT-DCI 5.0TR (End User: 116,600 PHP)" },
  { model_number: "MX-FDC60CT-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 92800.00, price_type: "Dealer", label: "Matrix MX-FDC60CT-DCI 5.0TR (Dealer: 92,800 PHP)" },

  { model_number: "MX-36CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 50000.00, price_type: "Bulk", label: "Matrix MX-36CT 3.0TR (Bulk: 50,000 PHP)" },
  { model_number: "MX-36CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 73800.00, price_type: "SRP", label: "Matrix MX-36CT 3.0TR (SRP: 73,800 PHP)" },
  { model_number: "MX-36CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 67500.00, price_type: "End User", label: "Matrix MX-36CT 3.0TR (End User: 67,500 PHP)" },
  { model_number: "MX-36CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 53700.00, price_type: "Dealer", label: "Matrix MX-36CT 3.0TR (Dealer: 53,700 PHP)" },

  { model_number: "MX-60CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 72000.00, price_type: "Bulk", label: "Matrix MX-60CT 5.0TR (Bulk: 72,000 PHP)" },
  { model_number: "MX-60CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 107500.00, price_type: "SRP", label: "Matrix MX-60CT 5.0TR (SRP: 107,500 PHP)" },
  { model_number: "MX-60CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 97600.00, price_type: "End User", label: "Matrix MX-60CT 5.0TR (End User: 97,600 PHP)" },
  { model_number: "MX-60CT", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Cassette", unit_base_price: 77700.00, price_type: "Dealer", label: "Matrix MX-60CT 5.0TR (Dealer: 77,700 PHP)" },

  // --- Ceiling Suspended Inverter & Non-Inverter [2.8, 2.9, 2.10] ---
  { model_number: "MX-FDC36WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 51100.00, price_type: "Bulk", label: "Matrix MX-FDC36WM-DCI 3.0TR (Bulk: 51,100 PHP)" },
  { model_number: "MX-FDC36WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 82800.00, price_type: "SRP", label: "Matrix MX-FDC36WM-DCI 3.0TR (SRP: 82,800 PHP)" },
  { model_number: "MX-FDC36WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 69300.00, price_type: "End User", label: "Matrix MX-FDC36WM-DCI 3.0TR (End User: 69,300 PHP)" },
  { model_number: "MX-FDC36WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 55100.00, price_type: "Dealer", label: "Matrix MX-FDC36WM-DCI 3.0TR (Dealer: 55,100 PHP)" },

  { model_number: "MX-FDC60WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 91500.00, price_type: "Bulk", label: "Matrix MX-FDC60WM-DCI 5.0TR (Bulk: 91,500 PHP)" },
  { model_number: "MX-FDC60WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 139200.00, price_type: "SRP", label: "Matrix MX-FDC60WM-DCI 5.0TR (SRP: 139,200 PHP)" },
  { model_number: "MX-FDC60WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 124200.00, price_type: "End User", label: "Matrix MX-FDC60WM-DCI 5.0TR (End User: 124,200 PHP)" },
  { model_number: "MX-FDC60WM-DCI", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 98800.00, price_type: "Dealer", label: "Matrix MX-FDC60WM-DCI 5.0TR (Dealer: 98,800 PHP)" },

  { model_number: "MX-36WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 47400.00, price_type: "Bulk", label: "Matrix MX-36WM 3.0TR (Bulk: 47,400 PHP)" },
  { model_number: "MX-36WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 70800.00, price_type: "SRP", label: "Matrix MX-36WM 3.0TR (SRP: 70,800 PHP)" },
  { model_number: "MX-36WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 57000.00, price_type: "End User", label: "Matrix MX-36WM 3.0TR (End User: 57,000 PHP)" },
  { model_number: "MX-36WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 51100.00, price_type: "Dealer", label: "Matrix MX-36WM 3.0TR (Dealer: 51,100 PHP)" },

  { model_number: "MX-60WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 71400.00, price_type: "Bulk", label: "Matrix MX-60WM 5.0TR (Bulk: 71,400 PHP)" },
  { model_number: "MX-60WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 106700.00, price_type: "SRP", label: "Matrix MX-60WM 5.0TR (SRP: 106,700 PHP)" },
  { model_number: "MX-60WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 96900.00, price_type: "End User", label: "Matrix MX-60WM 5.0TR (End User: 96,900 PHP)" },
  { model_number: "MX-60WM", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 77100.00, price_type: "Dealer", label: "Matrix MX-60WM 5.0TR (Dealer: 77,100 PHP)" },

  { model_number: "MX-FDC36INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 51100.00, price_type: "Bulk", label: "Matrix MX-FDC36INV-CC 3.0TR (Bulk: 51,100 PHP)" },
  { model_number: "MX-FDC36INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 80600.00, price_type: "SRP", label: "Matrix MX-FDC36INV-CC 3.0TR (SRP: 80,600 PHP)" },
  { model_number: "MX-FDC36INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 73200.00, price_type: "End User", label: "Matrix MX-FDC36INV-CC 3.0TR (End User: 73,200 PHP)" },
  { model_number: "MX-FDC36INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 55100.00, price_type: "Dealer", label: "Matrix MX-FDC36INV-CC 3.0TR (Dealer: 55,100 PHP)" },

  { model_number: "MX-FDC60INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 91900.00, price_type: "Bulk", label: "Matrix MX-FDC60INV-CC 5.0TR (Bulk: 91,900 PHP)" },
  { model_number: "MX-FDC60INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 147100.00, price_type: "SRP", label: "Matrix MX-FDC60INV-CC 5.0TR (SRP: 147,100 PHP)" },
  { model_number: "MX-FDC60INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 124600.00, price_type: "End User", label: "Matrix MX-FDC60INV-CC 5.0TR (End User: 124,600 PHP)" },
  { model_number: "MX-FDC60INV-CC", brand: "Matrix", capacity: "3.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 99200.00, price_type: "Dealer", label: "Matrix MX-FDC60INV-CC 5.0TR (Dealer: 99,200 PHP)" },

  // --- Air Curtains [2.11] ---
  { model_number: "MX-1209X-ZY", brand: "Matrix", capacity: "1.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 7999.00, price_type: "SRP", label: "Matrix MX-1209X-ZY Air Curtain 36\" (SRP: 7,999 PHP)" },
  { model_number: "MX-1209X-ZY", brand: "Matrix", capacity: "1.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 5900.00, price_type: "Dealer", label: "Matrix MX-1209X-ZY Air Curtain 36\" (Dealer: 5,900 PHP)" },
  { model_number: "MX-1209X-ZY", brand: "Matrix", capacity: "1.0 HP", form_factor: "Ceiling Suspended", unit_base_price: 7900.00, price_type: "End User", label: "Matrix MX-1209X-ZY Air Curtain 36\" (End User: 7,900 PHP)" },

  { model_number: "MX-1210X-ZY", brand: "Matrix", capacity: "1.5 HP", form_factor: "Ceiling Suspended", unit_base_price: 8999.00, price_type: "SRP", label: "Matrix MX-1210X-ZY Air Curtain 40\" (SRP: 8,999 PHP)" },
  { model_number: "MX-1210X-ZY", brand: "Matrix", capacity: "1.5 HP", form_factor: "Ceiling Suspended", unit_base_price: 6500.00, price_type: "Dealer", label: "Matrix MX-1210X-ZY Air Curtain 40\" (Dealer: 6,500 PHP)" },
  { model_number: "MX-1210X-ZY", brand: "Matrix", capacity: "1.5 HP", form_factor: "Ceiling Suspended", unit_base_price: 8400.00, price_type: "End User", label: "Matrix MX-1210X-ZY Air Curtain 40\" (End User: 8,400 PHP)" },

  // --- CARRIER ---
  // Represent standard/reputed Carrier equipment prices
  { model_number: "CR-ST-10-ENT", brand: "Carrier", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 16500.00, price_type: "Bulk", label: "Carrier CR-ST-10 (NET/Bulk: 16,500 PHP)" },
  { model_number: "CR-ST-10-ENT", brand: "Carrier", capacity: "1.0 HP", form_factor: "Split Type", unit_base_price: 28000.00, price_type: "SRP", label: "Carrier CR-ST-10 (SRP: 28,000 PHP)" },

  { model_number: "CR-ST-15-ENT", brand: "Carrier", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 18500.00, price_type: "Bulk", label: "Carrier CR-ST-15 (NET/Bulk: 18,500 PHP)" },
  { model_number: "CR-ST-15-ENT", brand: "Carrier", capacity: "1.5 HP", form_factor: "Split Type", unit_base_price: 32000.00, price_type: "SRP", label: "Carrier CR-ST-15 (SRP: 32,000 PHP)" },

  { model_number: "CR-ST-20-ENT", brand: "Carrier", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 24500.00, price_type: "Bulk", label: "Carrier CR-ST-20 (NET/Bulk: 24,500 PHP)" },
  { model_number: "CR-ST-20-ENT", brand: "Carrier", capacity: "2.0 HP", form_factor: "Split Type", unit_base_price: 43500.00, price_type: "SRP", label: "Carrier CR-ST-20 (SRP: 43,500 PHP)" },

  { model_number: "CR-ST-25-ENT", brand: "Carrier", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 29500.00, price_type: "Bulk", label: "Carrier CR-ST-25 (NET/Bulk: 29,500 PHP)" },
  { model_number: "CR-ST-25-ENT", brand: "Carrier", capacity: "2.5 HP", form_factor: "Split Type", unit_base_price: 52000.00, price_type: "SRP", label: "Carrier CR-ST-25 (SRP: 52,000 PHP)" },

  { model_number: "CR-ST-30-ENT", brand: "Carrier", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 36500.00, price_type: "Bulk", label: "Carrier CR-ST-30 (NET/Bulk: 36,500 PHP)" },
  { model_number: "CR-ST-30-ENT", brand: "Carrier", capacity: "3.0 HP", form_factor: "Split Type", unit_base_price: 64000.00, price_type: "SRP", label: "Carrier CR-ST-30 (SRP: 64,000 PHP)" },
];

export function getAvailableModels(
  brand: "Carrier" | "Matrix" | "Midea",
  capacity: "0.6 HP" | "1.0 HP" | "1.5 HP" | "2.0 HP" | "2.5 HP" | "3.0 HP" | "3-tonner" | "5-tonner",
  formFactor: "Split Type" | "Window Type" | "Floor Mounted" | "Ceiling Cassette" | "Ceiling Suspended"
): ModelPricelistEntry[] {
  // Try to find matching brand, capacity and form factor in the official pricelist
  const matches = PRICELIST_MODELS.filter((m) => {
    if (m.brand !== brand || m.form_factor !== formFactor) return false;
    
    // If the capacity is 3-tonner, find a 3.0 HP model whose label does NOT contain 5.0TR or 5 TR or 5TR
    if (capacity === "3-tonner") {
      return m.capacity === "3.0 HP" && !m.label.includes("5.0TR") && !m.label.includes("5.0 TR") && !m.label.includes("5TR") && !m.label.includes("5.0 TR");
    }
    
    // If the capacity is 5-tonner, find a 3.0 HP model whose label DOES contain 5.0TR or 5 TR or 5TR
    if (capacity === "5-tonner") {
      return m.capacity === "3.0 HP" && (m.label.includes("5.0TR") || m.label.includes("5.0 TR") || m.label.includes("5TR") || m.label.includes("5.0 TR"));
    }
    
    return m.capacity === capacity;
  });

  if (matches.length > 0) {
    return matches;
  }

  return [];
}

/**
 * Deterministically resolves the specific model number and base price for any given brand, form factor, and capacity.
 * Ensures the pre-configured presets are exactly matched, while other combinations follow robust scaling logic.
 */
export function resolveModelDetails(
  brand: "Carrier" | "Matrix" | "Midea",
  formFactor: "Split Type" | "Window Type" | "Floor Mounted" | "Ceiling Cassette" | "Ceiling Suspended",
  capacity: "0.6 HP" | "1.0 HP" | "1.5 HP" | "2.0 HP" | "2.5 HP" | "3.0 HP" | "3-tonner" | "5-tonner"
): ResolvedModelDetails {
  // Brand prefix mappings
  const brandPrefix = brand === "Carrier" ? "CR" : brand === "Matrix" ? "MX" : "MD";
  
  // Form factor mapping
  const formCode = (() => {
    switch (formFactor) {
      case "Split Type": return "ST";
      case "Window Type": return "WT";
      case "Floor Mounted": return "FM";
      case "Ceiling Cassette": return "CC";
      case "Ceiling Suspended": return "CS";
      default: return "XX";
    }
  })();

  // Capacity mapping
  const capacityCode = (() => {
    switch (capacity) {
      case "0.6 HP": return "06";
      case "1.0 HP": return "10";
      case "1.5 HP": return "15";
      case "2.0 HP": return "20";
      case "2.5 HP": return "25";
      case "3.0 HP": return "30";
      case "3-tonner": return "36"; // 36,000 BTU/hr
      case "5-tonner": return "60"; // 60,000 BTU/hr
      default: return "00";
    }
  })();

  const model_number = `${brandPrefix}-${formCode}-${capacityCode}-ENT`;

  // Explicit preset exact matches
  if (brand === "Carrier" && formFactor === "Split Type" && capacity === "2.5 HP") {
    return { model_number, unit_base_price: 1250.00, unit_labor_price: 187.50 };
  }
  if (brand === "Matrix" && formFactor === "Ceiling Cassette" && capacity === "3-tonner") {
    return { model_number, unit_base_price: 2100.00, unit_labor_price: 315.00 };
  }
  if (brand === "Midea" && formFactor === "Window Type" && capacity === "1.5 HP") {
    return { model_number, unit_base_price: 495.00, unit_labor_price: 74.25 };
  }

  // Generative base pricing scales with HP and Form Factor premium
  const capacityWeights: Record<string, number> = {
    "0.6 HP": 350,
    "1.0 HP": 500,
    "1.5 HP": 750,
    "2.0 HP": 1100,
    "2.5 HP": 1400,
    "3.0 HP": 1900,
    "3-tonner": 2800, // heavy-duty 3-tonner
    "5-tonner": 4500, // heavy-duty 5-tonner
  };

  const formFactorPremiums: Record<string, number> = {
    "Split Type": 1.0,
    "Window Type": 0.8,
    "Floor Mounted": 1.25,
    "Ceiling Cassette": 1.4,
    "Ceiling Suspended": 1.3,
  };

  const brandMultipliers: Record<string, number> = {
    "Carrier": 1.15,
    "Matrix": 1.05,
    "Midea": 0.95,
  };

  const weight = capacityWeights[capacity] || 1000;
  const premium = formFactorPremiums[formFactor] || 1.0;
  const brandMult = brandMultipliers[brand] || 1.0;

  const unit_base_price = parseFloat((weight * premium * brandMult).toFixed(2));
  const unit_labor_price = parseFloat((unit_base_price * 0.15).toFixed(2));

  return {
    model_number,
    unit_base_price,
    unit_labor_price,
  };
}

export function getStandardPipingRate(
  formFactor: "Split Type" | "Window Type" | "Floor Mounted" | "Ceiling Cassette" | "Ceiling Suspended",
  capacity: "0.6 HP" | "1.0 HP" | "1.5 HP" | "2.0 HP" | "2.5 HP" | "3.0 HP" | "3-tonner" | "5-tonner",
  modelLabel?: string
): number {
  const isSplitOrWindow = formFactor === "Split Type" || formFactor === "Window Type";
  if (isSplitOrWindow) {
    if (capacity === "0.6 HP" || capacity === "1.0 HP" || capacity === "1.5 HP") {
      return 400;
    }
    if (capacity === "2.0 HP" || capacity === "2.5 HP") {
      return 450;
    }
    return 500; // 3.0 HP Split Type default
  } else {
    // Floor Mounted / Cassette / Suspended
    if (capacity === "5-tonner" || modelLabel?.includes("5.0TR") || modelLabel?.includes("5.0 TR") || modelLabel?.includes("5 TR") || modelLabel?.includes("5TR")) {
      return 550; // thicker linesets are more expensive for 5-tonner
    }
    return 500; // default/3 TR/3-tonner
  }
}

export const RAW_SPEC_PRESETS: RawSpecPreset[] = [
  {
    id: "preset-lobby-carrier",
    title: "1. Main Lobby HVAC Upgrade (Carrier)",
    description: "Handwritten site notes for building lobby air cooling retrofitting in NCR region with 5% discount.",
    rawText: `PROPOSAL SPEC SHEET - LOBBY DEPT
Date: June 15, 2026
Notes: Replace old central blower. Checked site layout.

System specifications needed:
- Vendor brand chosen: Carrier
- Selection configuration type: Split Type units (wall mounted)
- Aircon cooling rating required: 2.5 HP capacity
- Number of actual units to procure: 4 systems
- Core base equipment budget: ₱1250.00 base cost per unit (this includes standard first 10ft refrigeration piping set)
- Operational Region: NCR
- Applicable Corporate Discount: 5% discount

Piping & Distances measured:
- Actual physical line deployment between indoor lobby mount and outdoor condenser rack: 28 feet total.
- Rate for extra refrigerant piping runs: ₱22.50 per foot for all copper pipes exceeding 10ft standard base set.

Dismantling site notes:
- Old Carrier systems remain on wall. Dismantling services required? YES.
- Quoted dismantling fee of ₱85.00 per unit for the older units.

Electrical Work requirements:
- Dedicated electrical circuit breaker panel is necessary.
- Safe installation requires 4 indoor circuit breakers and 4 outdoor independent circuit breakers to safeguard units.
- Complete electrical wiring from breaker terminal to unit: flat rate connectivity cost of ₱350.00 for building work.

Extract and calculate the total purchase order requirement.`
  },
  {
    id: "preset-server-matrix",
    title: "2. Server Room Deep Cooling (Matrix)",
    description: "Inspected logs from procurement office in Visayas with high extra piping requirements and 12% discount.",
    rawText: `MEMORANDUM FOR INFRASTRUCTURE ENGINEERING
REF: Server Rack Cool room upgrade
To: Facilities Logistics team

We request 2 modern high capacity modular systems to sustain rack expansion (Matrix brand selected).
Configuration details:
- Selected Brand: Matrix
- Equipment Form Factor: Ceiling Cassette (four-way airflow)
- Cooling capacity load: 3.0 HP
- Quantity needed: 2 units
- Negotiated equipment base price with distributor: ₱2100.00 (includes standard piping package for initial 10 ft)
- Region: Visayas
- Discount rate: 12%

Physical Environment Measurement:
- Server cabinets are near the ceiling drop. Distance to rooftop compressor units: exactly 35 feet of copper tubes.
- Extra piping copper material extension cost: ₱30.00/foot.

Deconstruction/Decommissioning notes:
- The server room currently is unoccupied. No old AC is on the concrete.
- Dismantling required: NO (fee per unit: ₱0.00)

Power Supply Grid hookup:
- Needs 2 heavy duty indoor breakers and 2 matching outdoor isolation breakers. Indoor circuit_breaker_indoor_installed: true. Outdoor circuit_breaker_outdoor_installed: true.
- Flat rate electrician fee: ₱480.00 flat wiring fee for complete electrical works.`
  },
  {
    id: "preset-office-midea",
    title: "3. Executive Annex Offices (Midea)",
    description: "Procurement notebook entries detailing small scale office window units in Mindanao region and 15% discount.",
    rawText: `FACILITIES INVENTORY WORKNOTE
Annex Executive Suite - Air Conditioning procurement.

Requirements:
- Brand selected: Midea
- Aircon setup requirement: Window Type
- Capacity rating required: 1.5 HP specifications
- Unit quantity required: 5 units of window units
- Base item price: ₱495.00 per unit (standard 10ft setup)
- Region: Mindanao
- Discount percentage: 15%

Refrigeration tubing distance:
- Since these are window units, they slide straight into structural brick frames, but need a dynamic drain/tubing run.
- Distances measured: 10 feet. It is exactly 10ft, so actual piping distance: 10.
- Extra piping rate per foot: ₱18.00 (though we shouldn't trigger excess because actual distance stays under limits).

Annex Deinstallation Needs:
- Crucial to take down 5 old rusty window boxes safely before installing new ones.
- Required: TRUE.
- Cost: ₱40.00 dismantling fee per unit decommissioned.

Electrical safety switch setup:
- Power supply does not need outdoor breakers (window unit runs off single breaker). Indoor circuit_breaker_indoor_installed: TRUE (quantity: 5 indoor breakers to prevent Annex power overload). Outdoor circuit_breaker_outdoor_installed: FALSE.
- Sub-meter wiring connectivity flat fee is ₱120.00.`
  },
  {
    id: "preset-handwritten-audit",
    title: "4. Standard Service & Installation Rates Audit (Carrier Split-Type)",
    description: "Extracted official proposal sheet based on standard service, installation rates, and dual breakers.",
    rawText: `OFFICIAL ESTIMATE PROPOSAL SHEET - SPEC 1000094631
Date: June 24, 2026
Client reference: Standard Service & Installation Rates Audit

We request a high-quality split-type system installation with the following details:
- Vendor brand: Carrier
- Selection configuration: Split Type
- Aircon cooling rating required: 2.0 HP
- Quantity to procure: 4 units
- Core base equipment budget: ₱12500.00 base cost per unit (equipment cost only)
- Region: NCR

Measured physical distance:
- Total refrigeration piping distance: 28 feet (First 10 feet flat base rate of ₱2000.00 applies; excess piping is 18 feet per unit)
- Excess piping rate per foot: ₱450.00 (Split Type 2.0 - 2.5 HP standard rate)

Services & Decommissioning:
- Dismantling older units required: YES
- Dismantling service rate per unit: ₱2000.00

Electrical & Isolation Materials:
- Indoor breaker: YES (₱750.00 per unit)
- Outdoor weatherproof breaker: YES (₱1000.00 per unit)
- Flat rate Electrical Labor: ₱2000.00
- Custom wire connectivity length: 15 feet
- Wire rate per foot: ₱105.00`
  }
];
