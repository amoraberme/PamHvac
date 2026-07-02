import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set maximum request size limit for uploading PDFs/images
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Initialize Gemini SDK lazily to avoid startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Settings/Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Target schema specified by Lead Systems Architect
export const HVAC_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "HVAC_Dynamic_Proposal_System",
  "type": "object",
  "required": [
    "selection_flow",
    "installation_parameters"
  ],
  "properties": {
    "selection_flow": {
      "type": "object",
      "required": ["equipment_brand", "form_factor", "cooling_capacity", "resolved_model_details"],
      "properties": {
        "equipment_brand": {
          "type": "string",
          "enum": ["Carrier", "Matrix", "Midea"]
        },
        "form_factor": {
          "type": "string",
          "enum": ["Split Type", "Window Type", "Floor Mounted", "Ceiling Cassette", "Ceiling Suspended"]
        },
        "cooling_capacity": {
          "type": "string",
          "enum": ["0.6 HP", "1.0 HP", "1.5 HP", "2.0 HP", "2.5 HP", "3.0 HP", "3-tonner", "5-tonner"]
        },
        "resolved_model_details": {
          "type": "object",
          "description": "Auto-populated by the system database lookup when the 3 preceding fields match successfully.",
          "required": ["model_number", "unit_base_price"],
          "properties": {
            "model_number": { "type": "string" },
            "unit_base_price": { "type": "number", "minimum": 0 }
          }
        }
      }
    },
    "installation_parameters": {
      "type": "object",
      "required": [
        "base_quantity",
        "actual_piping_distance_feet",
        "excess_piping_rate_per_foot",
        "base_piping_fee",
        "electrical_breaker_options",
        "flat_wiring_connectivity_fee",
        "dismantling_services",
        "wire_length_feet",
        "wire_rate_per_foot"
      ],
      "properties": {
        "base_quantity": { "type": "integer", "minimum": 1 },
        "actual_piping_distance_feet": { "type": "number", "minimum": 0 },
        "excess_piping_rate_per_foot": { "type": "number", "minimum": 0 },
        "base_piping_fee": { "type": "number", "minimum": 0 },
        "electrical_breaker_options": {
          "type": "object",
          "required": ["indoor_breaker", "outdoor_breaker"],
          "properties": {
            "indoor_breaker": {
              "type": "object",
              "required": ["selected", "unit_price_input"],
              "properties": {
                "selected": { "type": "boolean" },
                "unit_price_input": { "type": "number", "minimum": 0 }
              }
            },
            "outdoor_breaker": {
              "type": "object",
              "required": ["selected", "unit_price_input"],
              "properties": {
                "selected": { "type": "boolean" },
                "unit_price_input": { "type": "number", "minimum": 0 }
              }
            }
          }
        },
        "flat_wiring_connectivity_fee": { "type": "number", "minimum": 0 },
        "dismantling_services": {
          "type": "object",
          "required": ["required", "fee_per_unit"],
          "properties": {
            "required": { "type": "boolean" },
            "fee_per_unit": { "type": "number", "minimum": 0 }
          }
        },
        "wire_length_feet": { "type": "number", "minimum": 0 },
        "wire_rate_per_foot": { "type": "number", "minimum": 0 }
      }
    }
  }
};

// Pure TypeScript JSON Schema Validator
function validateHVACPayload(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { valid: false, errors: ["Payload must be a valid JSON object."] };
  }

  // selection_flow validation
  if (!data.selection_flow || typeof data.selection_flow !== "object") {
    errors.push("Missing or invalid 'selection_flow' object.");
  } else {
    const sf = data.selection_flow;
    if (!["Carrier", "Matrix", "Midea"].includes(sf.equipment_brand)) {
      errors.push(`Invalid 'selection_flow.equipment_brand' '${sf.equipment_brand}'. Must be: Carrier, Matrix, Midea.`);
    }
    const forms = ["Split Type", "Window Type", "Floor Mounted", "Ceiling Cassette", "Ceiling Suspended"];
    if (!forms.includes(sf.form_factor)) {
      errors.push(`Invalid 'selection_flow.form_factor' '${sf.form_factor}'.`);
    }
    const caps = ["0.6 HP", "1.0 HP", "1.5 HP", "2.0 HP", "2.5 HP", "3.0 HP", "3-tonner", "5-tonner"];
    if (!caps.includes(sf.cooling_capacity)) {
      errors.push(`Invalid 'selection_flow.cooling_capacity' '${sf.cooling_capacity}'.`);
    }
    if (!sf.resolved_model_details || typeof sf.resolved_model_details !== "object") {
      errors.push("Missing or invalid 'selection_flow.resolved_model_details'.");
    } else {
      const rm = sf.resolved_model_details;
      if (typeof rm.model_number !== "string" || !rm.model_number.trim()) {
        errors.push("'selection_flow.resolved_model_details.model_number' must be a valid string.");
      }
      if (typeof rm.unit_base_price !== "number" || rm.unit_base_price < 0) {
        errors.push("'selection_flow.resolved_model_details.unit_base_price' must be a non-negative number.");
      }
      if (rm.unit_labor_price !== undefined && (typeof rm.unit_labor_price !== "number" || rm.unit_labor_price < 0)) {
        errors.push("'selection_flow.resolved_model_details.unit_labor_price' must be a non-negative number.");
      }
    }
  }

  // installation_parameters validation
  if (!data.installation_parameters || typeof data.installation_parameters !== "object") {
    errors.push("Missing or invalid 'installation_parameters' object.");
  } else {
    const ip = data.installation_parameters;
    if (!Number.isInteger(ip.base_quantity) || ip.base_quantity < 1) {
      errors.push(`'installation_parameters.base_quantity' must be an integer >= 1. Received: ${ip.base_quantity}`);
    }
    if (typeof ip.actual_piping_distance_feet !== "number" || ip.actual_piping_distance_feet < 0) {
      errors.push(`'installation_parameters.actual_piping_distance_feet' must be >= 0.`);
    }
    if (typeof ip.excess_piping_rate_per_foot !== "number" || ip.excess_piping_rate_per_foot < 0) {
      errors.push(`'installation_parameters.excess_piping_rate_per_foot' must be >= 0.`);
    }
    if (typeof ip.base_piping_fee !== "number" || ip.base_piping_fee < 0) {
      errors.push(`'installation_parameters.base_piping_fee' must be >= 0.`);
    }
    if (typeof ip.flat_wiring_connectivity_fee !== "number" || ip.flat_wiring_connectivity_fee < 0) {
      errors.push(`'installation_parameters.flat_wiring_connectivity_fee' must be >= 0.`);
    }
    if (typeof ip.wire_length_feet !== "number" || ip.wire_length_feet < 0) {
      errors.push(`'installation_parameters.wire_length_feet' must be >= 0.`);
    }
    if (typeof ip.wire_rate_per_foot !== "number" || ip.wire_rate_per_foot < 0) {
      errors.push(`'installation_parameters.wire_rate_per_foot' must be >= 0.`);
    }

    // Optional custom labor fields
    const optionalLaborFields = [
      "base_piping_labor_price",
      "excess_piping_labor_price",
      "indoor_breaker_labor_price",
      "outdoor_breaker_labor_price",
      "wire_labor_price",
      "flat_wiring_labor_price",
      "dismantling_labor_price"
    ];
    for (const f of optionalLaborFields) {
      if (ip[f] !== undefined && (typeof ip[f] !== "number" || ip[f] < 0)) {
        errors.push(`'installation_parameters.${f}' must be a non-negative number.`);
      }
    }
    
    // Dismantling validation
    if (!ip.dismantling_services || typeof ip.dismantling_services !== "object") {
      errors.push("Missing or invalid 'installation_parameters.dismantling_services'.");
    } else {
      const ds = ip.dismantling_services;
      if (typeof ds.required !== "boolean") {
        errors.push("'installation_parameters.dismantling_services.required' must be a boolean.");
      }
      if (typeof ds.fee_per_unit !== "number" || ds.fee_per_unit < 0) {
        errors.push("'installation_parameters.dismantling_services.fee_per_unit' must be >= 0.");
      }
    }

    // Electrical Breaker Options validation
    if (!ip.electrical_breaker_options || typeof ip.electrical_breaker_options !== "object") {
      errors.push("Missing or invalid 'installation_parameters.electrical_breaker_options'.");
    } else {
      const eo = ip.electrical_breaker_options;
      if (!eo.indoor_breaker || typeof eo.indoor_breaker !== "object") {
        errors.push("'installation_parameters.electrical_breaker_options.indoor_breaker' is required.");
      } else {
        if (typeof eo.indoor_breaker.selected !== "boolean") {
          errors.push("'indoor_breaker.selected' must be a boolean.");
        }
        if (typeof eo.indoor_breaker.unit_price_input !== "number" || eo.indoor_breaker.unit_price_input < 0) {
          errors.push("'indoor_breaker.unit_price_input' must be >= 0.");
        }
      }
      if (!eo.outdoor_breaker || typeof eo.outdoor_breaker !== "object") {
        errors.push("'installation_parameters.electrical_breaker_options.outdoor_breaker' is required.");
      } else {
        if (typeof eo.outdoor_breaker.selected !== "boolean") {
          errors.push("'outdoor_breaker.selected' must be a boolean.");
        }
        if (typeof eo.outdoor_breaker.unit_price_input !== "number" || eo.outdoor_breaker.unit_price_input < 0) {
          errors.push("'outdoor_breaker.unit_price_input' must be >= 0.");
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// API to retrieve standard schema
app.get("/api/schema", (req, res) => {
  res.json(HVAC_SCHEMA);
});

// API to validate payload
app.post("/api/validate", (req, res) => {
  const result = validateHVACPayload(req.body);
  res.json(result);
});

// API to calculate detailed cost proposal based on target math
app.post("/api/calculate", (req, res) => {
  const data = req.body;
  const validationResult = validateHVACPayload(data);

  if (!validationResult.valid) {
    res.status(400).json({
      error: "Invalid specification format according to structural JSON Schema guidelines.",
      details: validationResult.errors,
    });
    return;
  }

  // Destructure variables matching target schema & math pipeline instructions
  const brand = data.selection_flow.equipment_brand;
  const formFactor = data.selection_flow.form_factor;
  const capacity = data.selection_flow.cooling_capacity;
  const modelNo = data.selection_flow.resolved_model_details.model_number;
  const basePrice = Number(data.selection_flow.resolved_model_details.unit_base_price);
  const unitLaborPrice = Number(data.selection_flow.resolved_model_details.unit_labor_price !== undefined
    ? data.selection_flow.resolved_model_details.unit_labor_price
    : (basePrice * 0.15));
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
  const basePipingLabor = data.installation_parameters.base_piping_labor_price !== undefined
    ? Number(data.installation_parameters.base_piping_labor_price)
    : (pipingDistance > 0 ? (basePipingFee / qty * 0.25) : 0);
  const basePipingMat = pipingDistance > 0 ? (basePipingFee / qty * 0.75) : 0;
  const totalBasePipingUnitPrice = basePipingMat + basePipingLabor;
  const actualBasePipingFee = pipingDistance > 0 ? (totalBasePipingUnitPrice * qty) : 0;

  const excessDistance = Math.max(0, pipingDistance - 10);
  const excessPipingLabor = data.installation_parameters.excess_piping_labor_price !== undefined
    ? Number(data.installation_parameters.excess_piping_labor_price)
    : (excessRate * 0.20);
  const excessPipingMat = excessRate * 0.80;
  const totalExcessPipingUnitPrice = excessPipingMat + excessPipingLabor;
  const excessPipingCost = excessDistance > 0 ? (excessDistance * qty * totalExcessPipingUnitPrice) : 0;

  const pipingCost = actualBasePipingFee + excessPipingCost;

  // 3. Overridable Independent Breaker & Wiring Dynamic Addons
  const indoorBreakerLabor = data.installation_parameters.indoor_breaker_labor_price !== undefined
    ? Number(data.installation_parameters.indoor_breaker_labor_price)
    : (indoorUnitFee * 0.18);
  const indoorBreakerMat = indoorUnitFee * 0.82;
  const totalIndoorBreakerUnitPrice = indoorBreakerMat + indoorBreakerLabor;
  const indoorBreakerAddon = indoorSelected ? (totalIndoorBreakerUnitPrice * qty) : 0;

  const outdoorBreakerLabor = data.installation_parameters.outdoor_breaker_labor_price !== undefined
    ? Number(data.installation_parameters.outdoor_breaker_labor_price)
    : (outdoorUnitFee * 0.18);
  const outdoorBreakerMat = outdoorUnitFee * 0.82;
  const totalOutdoorBreakerUnitPrice = outdoorBreakerMat + outdoorBreakerLabor;
  const outdoorBreakerAddon = outdoorSelected ? (totalOutdoorBreakerUnitPrice * qty) : 0;

  const wireLabor = data.installation_parameters.wire_labor_price !== undefined
    ? Number(data.installation_parameters.wire_labor_price)
    : (wireRate * 0.20);
  const wireMat = wireRate * 0.80;
  const totalWireUnitPrice = wireMat + wireLabor;
  const wireCost = wireLength * totalWireUnitPrice;

  const flatWiringLabor = data.installation_parameters.flat_wiring_labor_price !== undefined
    ? Number(data.installation_parameters.flat_wiring_labor_price)
    : (flatWiringFee * 0.60);
  const flatWiringMat = flatWiringFee * 0.40;
  const totalFlatWiringFee = flatWiringFee > 0 ? (flatWiringMat + flatWiringLabor) : 0;

  const electricalInfrastructureCost = indoorBreakerAddon + outdoorBreakerAddon + totalFlatWiringFee + wireCost;

  // 4. Overridable Dismantling
  const dismantlingLabor = data.installation_parameters.dismantling_labor_price !== undefined
    ? Number(data.installation_parameters.dismantling_labor_price)
    : decommissioningUnitFee;
  const dismantlingCost = dismantlingRequired ? (dismantlingLabor * qty) : 0;

  // Compute final sum
  const finalCost = hardwareCost + pipingCost + electricalInfrastructureCost + dismantlingCost;

  // Backwards compatible mockup comparison rate for "Original Standard Rate / Savings" presentation
  // We simulate savings based on a default standard vendor list rate or if prices are negotiated down.
  // Standard list rate adds a simulated 10% premium to units & piping rates to represent savings.
  const originalHardwareCost = (totalEquipmentUnitPrice * 1.10) * qty;
  const originalPipingCost = (pipingDistance > 0 ? (basePipingFee * 1.10) : 0) + excessDistance * (excessRate * 1.10) * qty;
  const originalFinalCost = originalHardwareCost + originalPipingCost + electricalInfrastructureCost + dismantlingCost;
  const savings = Math.max(0, originalFinalCost - finalCost);

  res.json({
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
  });
});

// Intelligent Ingestion parser using Gemini API (using process.env.GEMINI_API_KEY server-side)
app.post("/api/parse-quote", async (req, res) => {
  try {
    const { rawText, fileData } = req.body;
    
    const ai = getGeminiClient();

    const systemInstruction = `You are a Lead Sys Procurement Data Extractor specializing in HVAC purchase requests.
Analyze the user's raw unstructured document, handwritten quote description, uploaded file snapshot, or site notes and map them strictly into a standardized, nested JSON object conforming perfectly to the Target JSON Schema.

TARGET JSON SCHEMA:
${JSON.stringify(HVAC_SCHEMA, null, 2)}

GUIDELINES FOR INGESTION AND EXTRACTION:
1. Populate 'selection_flow':
   - 'equipment_brand': Choose closest from ["Carrier", "Matrix", "Midea"].
   - 'form_factor': Choose closest from ["Split Type", "Window Type", "Floor Mounted", "Ceiling Cassette", "Ceiling Suspended"].
   - 'cooling_capacity': Choose closest from ["0.6 HP", "1.0 HP", "1.5 HP", "2.0 HP", "2.5 HP", "3.0 HP"].
   - 'resolved_model_details': Extract or generate a valid string for model_number and a non-negative number for unit_base_price. If the text specifies e.g. "base cost: 1250", then set 'unit_base_price' to 1250.
2. Populate 'installation_parameters':
   - 'base_quantity': Extract the quantity of aircon systems. Defaults to 1 if unmentioned.
   - 'actual_piping_distance_feet': Extract distance or default to 10 if standard/unmentioned.
   - 'excess_piping_rate_per_foot': Extract rate.
   - 'electrical_breaker_options':
     - 'indoor_breaker': Set 'selected' to true or false. 'unit_price_input' stands for unit price of the indoor breaker (default to 45 if not mentioned otherwise).
     - 'outdoor_breaker': Set 'selected' to true or false. 'unit_price_input' stands for unit price of the outdoor breaker (default to 65 if not mentioned otherwise).
   - 'flat_wiring_connectivity_fee': Extract flat wiring price.
   - 'dismantling_services':
     - 'required': Is dismantling or taking down existing units required?
     - 'fee_per_unit': Extract decommissioning rate per unit.
3. Keep prices calibrated in PHP as specified in the original specifications. Return ONLY clean, valid, parseable JSON representing the structured data object. Do not wrap in markdown or markdown code blocks (such as \`\`\`json).`;

    const contents: any[] = [];

    if (fileData && fileData.base64) {
      let base64String = fileData.base64;
      if (base64String.includes(";base64,")) {
        base64String = base64String.split(";base64,")[1];
      }
      contents.push({
        inlineData: {
          data: base64String,
          mimeType: fileData.mimeType
        }
      });
      contents.push(`Parse this uploaded vendor quote document file (${fileData.fileName || "document"}). Extract all fields conforming to schema rules.`);
    }

    if (rawText && rawText.trim()) {
      contents.push(`Raw contract quote snippet or site notes text:\n\n"${rawText}"`);
    } else if (contents.length === 0) {
      res.status(400).json({ error: "Either rawText parameter or fileData needs to be populated." });
      return;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["selection_flow", "installation_parameters"],
          properties: {
            selection_flow: {
              type: Type.OBJECT,
              required: ["equipment_brand", "form_factor", "cooling_capacity", "resolved_model_details"],
              properties: {
                equipment_brand: { type: Type.STRING, description: "Carrier, Matrix, or Midea" },
                form_factor: { type: Type.STRING, description: "Split Type, Window Type, Floor Mounted, Ceiling Cassette, or Ceiling Suspended" },
                cooling_capacity: { type: Type.STRING, description: "0.6 HP, 1.0 HP, 1.5 HP, 2.0 HP, 2.5 HP, or 3.0 HP" },
                resolved_model_details: {
                  type: Type.OBJECT,
                  required: ["model_number", "unit_base_price"],
                  properties: {
                    model_number: { type: Type.STRING },
                    unit_base_price: { type: Type.NUMBER }
                  }
                }
              }
            },
            installation_parameters: {
              type: Type.OBJECT,
              required: [
                "base_quantity",
                "actual_piping_distance_feet",
                "excess_piping_rate_per_foot",
                "electrical_breaker_options",
                "flat_wiring_connectivity_fee",
                "dismantling_services",
                "wire_length_feet",
                "wire_rate_per_foot"
              ],
              properties: {
                base_quantity: { type: Type.INTEGER },
                actual_piping_distance_feet: { type: Type.NUMBER },
                excess_piping_rate_per_foot: { type: Type.NUMBER },
                electrical_breaker_options: {
                  type: Type.OBJECT,
                  required: ["indoor_breaker", "outdoor_breaker"],
                  properties: {
                    indoor_breaker: {
                      type: Type.OBJECT,
                      required: ["selected", "unit_price_input"],
                      properties: {
                        selected: { type: Type.BOOLEAN },
                        unit_price_input: { type: Type.NUMBER }
                      }
                    },
                    outdoor_breaker: {
                      type: Type.OBJECT,
                      required: ["selected", "unit_price_input"],
                      properties: {
                        selected: { type: Type.BOOLEAN },
                        unit_price_input: { type: Type.NUMBER }
                      }
                    }
                  }
                },
                flat_wiring_connectivity_fee: { type: Type.NUMBER },
                dismantling_services: {
                  type: Type.OBJECT,
                  required: ["required", "fee_per_unit"],
                  properties: {
                    required: { type: Type.BOOLEAN },
                    fee_per_unit: { type: Type.NUMBER }
                  }
                },
                wire_length_feet: { type: Type.NUMBER },
                wire_rate_per_foot: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    });

    const parsedJsonText = response.text?.trim() || "{}";
    const parsedPayload = JSON.parse(parsedJsonText);

    // Validate the parsed payload
    const check = validateHVACPayload(parsedPayload);

    res.json({
      success: check.valid,
      validation_errors: check.errors,
      payload: parsedPayload,
      raw_ai_response: parsedJsonText,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to parse unstructured spec document utilizing Gemini API.",
      details: error.message,
    });
  }
});

// Setup Vite Dev server integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`HVAC Ingestion & Calculation Engine Server booting on port ${PORT}`);
    });
  }
}

startServer();

export default app;
