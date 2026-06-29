import { useState, useEffect } from "react";
import { HVACProposalPayload, CostCalculationResponse } from "../types";
import { FileText, Download, CheckSquare, Award, FileJson, Mail, Building, AlertTriangle } from "lucide-react";

interface CleanProposalDocumentProps {
  payload: HVACProposalPayload;
  calculation: CostCalculationResponse | null;
  onChangeAction?: (updated: HVACProposalPayload) => void;
}

export default function CleanProposalDocument({ payload, calculation, onChangeAction }: CleanProposalDocumentProps) {
  // Local custom text configurations for high-end professional appearance
  const [clientName, setClientName] = useState("Mr. Viñalon");
  const [proposalTitle, setProposalTitle] = useState("Supply, Installation & Commissioning of Air Conditioning System");
  const [department, setDepartment] = useState("Client Partner");
  const [authorName, setAuthorName] = useState("Mary Grace E. Santos");
  const [referenceNo, setReferenceNo] = useState(`M&G-HVAC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);

  // Commercial terms states
  const [deliveryLeadtime, setDeliveryLeadtime] = useState(
    "Equipment delivery and mechanical installation will be fully completed within 15 working days starting from the date of the mobilization deposit clearance and layout area hand-over."
  );
  
  // Dynamic Payment Options
  const [paymentOptions, setPaymentOptions] = useState<string[]>([
    "Option 1: 50% mobilization downpayment, 30% upon equipment delivery to site, and 20% upon successful commissioning and handover.",
    "Option 2: 50% downpayment on order, and the remaining 50% balance paid through approved bank loan financing.",
    "Option 3: 50% downpayment, with the remaining 50% balance paid via monthly post-dated checks (PDC) for an agreed duration."
  ]);

  const updatePaymentOption = (index: number, val: string) => {
    const next = [...paymentOptions];
    next[index] = val;
    setPaymentOptions(next);
  };

  const removePaymentOption = (index: number) => {
    setPaymentOptions(paymentOptions.filter((_, i) => i !== index));
  };

  const addPaymentOption = () => {
    setPaymentOptions([...paymentOptions, `Option ${paymentOptions.length + 1}: Click to edit payment option terms.`]);
  };

  const [financingSchedules, setFinancingSchedules] = useState(
    "Financing schedules can be custom configured by client requirements and approved bank credits."
  );
  const [cancellationTerms, setCancellationTerms] = useState(
    "- Prior to material procurement: 10% cancellation fee to cover engineering overheads and layouts\n- Post procurement / Pre delivery: 50% restocking fee covering logistics vendor chargeback\n- Post delivery at site: 80% restocking fee"
  );

  // Editable Signatures states
  const [sig1Label, setSig1Label] = useState("PREPARED BY");
  const [sig1Name, setSig1Name] = useState("Mary Grace E. Santos");
  const [sig1Title, setSig1Title] = useState("Chief Executive Officer");
  const [sig1Company, setSig1Company] = useState("M&G Non Specialized Wholesale Trading");

  const [sig2Label, setSig2Label] = useState("APPROVED BY");
  const [sig2Name, setSig2Name] = useState("Engr. Jerico Berme");
  const [sig2Title, setSig2Title] = useState("Operations Director");
  const [sig2Company, setSig2Company] = useState("M&G Non Specialized Wholesale Trading");

  const [sig3Label, setSig3Label] = useState("APPROVED & ACCEPTED BY");
  const [sig3Name, setSig3Name] = useState("Mr. Viñalon");
  const [sig3Title, setSig3Title] = useState("Client Partner / Authorized Representative");
  const [sig3Company, setSig3Company] = useState("");

  // Sync inputs with signature defaults if not customized
  useEffect(() => {
    setSig1Name(authorName);
  }, [authorName]);

  useEffect(() => {
    setSig3Name(clientName);
  }, [clientName]);

  useEffect(() => {
    setSig3Title(department);
  }, [department]);

  const [vatPercent, setVatPercent] = useState<number>(12); // standard 12% default for Philippines

  const updateUnitLabor = (itemId: string, value: number) => {
    if (!onChangeAction) return;
    const cleanVal = Math.max(0, value);
    if (itemId === "equipment") {
      onChangeAction({
        ...payload,
        selection_flow: {
          ...payload.selection_flow,
          resolved_model_details: {
            ...payload.selection_flow.resolved_model_details,
            unit_labor_price: cleanVal
          }
        }
      });
    } else {
      const fieldMap: Record<string, string> = {
        base_piping: "base_piping_labor_price",
        excess_piping: "excess_piping_labor_price",
        indoor_breaker: "indoor_breaker_labor_price",
        outdoor_breaker: "outdoor_breaker_labor_price",
        wire_run: "wire_labor_price",
        flat_wiring: "flat_wiring_labor_price",
        dismantling: "dismantling_labor_price",
      };
      const fieldName = fieldMap[itemId];
      if (fieldName) {
        onChangeAction({
          ...payload,
          installation_parameters: {
            ...payload.installation_parameters,
            [fieldName]: cleanVal
          }
        });
      }
    }
  };

  if (!calculation) {
    return (
      <div id="proposal-placeholder" className="bg-white border border-zinc-200 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] shadow-sm">
        <div className="w-12 h-12 bg-zinc-50 border border-zinc-150 rounded-full flex items-center justify-center text-zinc-400 mb-3">
          <FileText className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-zinc-800 text-sm font-semibold">Ready to Generate Proposal Document</p>
        <p className="text-zinc-500 text-xs mt-1 font-mono max-w-xs leading-relaxed">
          Please input or extract system specifications first to compile the final official PDF/Text proposals.
        </p>
      </div>
    );
  }

  const { selection_flow, installation_parameters } = payload;
  const { equipment_brand, form_factor, cooling_capacity, resolved_model_details } = selection_flow;
  const { base_quantity, actual_piping_distance_feet, dismantling_services } = installation_parameters;
  const { breakdown } = calculation;

  const subtotal = calculation.final_cost;
  const vat = subtotal * (vatPercent / 100);
  const total = subtotal + vat;

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setIsDownloadingPdf(true);
    
    // Give React a frame to repaint the DOM with clean plain text instead of inputs
    setTimeout(() => {
      const originalTitle = document.title;
      const formattedClient = clientName ? clientName.replace(/\s+/g, "_") : "Client";
      document.title = `MG_HVAC_Proposal_${formattedClient}`;
      
      window.print();
      
      document.title = originalTitle;
      setIsDownloadingPdf(false);
    }, 150);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MG_Specs_${equipment_brand}_${referenceNo}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // M&G Custom Logo SVG Icon
  const MGLogo = () => (
    <div className="flex flex-col items-center justify-center scale-90">
      <svg width="65" height="55" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        {/* Blue Main House/M shape structure */}
        <path d="M20 75V40L60 15L100 40V75" stroke="#102A83" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M40 75V50H80V75" stroke="#102A83" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Green Rising Roof / Arrow of wholesale trading */}
        <path d="M10 45L60 7L110 45" stroke="#005A36" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Dynamic Green Arrow Pointer inside house */}
        <path d="M60 48L85 24M85 24H68M85 24V40" stroke="#005A36" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="text-[10px] font-extrabold text-[#102A83] uppercase mt-1 tracking-wider leading-none text-center">
        M&G Non Specialized
      </div>
      <div className="text-[8.5px] font-bold text-[#005A36] uppercase tracking-wide mt-0.5 leading-none text-center">
        Wholesale Trading
      </div>
    </div>
  );

  // Math-exact scale logic to make totals sum exactly to calculation.final_cost
  const scale = 1;
  const rawItems: any[] = [];
  let itemNo = 1;

  // 1A. Equipment
  rawItems.push({
    id: "equipment",
    category: "1A. AIR CONDITIONING EQUIPMENT",
    no: String(itemNo++).padStart(2, "0"),
    description: `${equipment_brand} ${form_factor} ${cooling_capacity} (Model No: ${resolved_model_details.model_number})`,
    qty: base_quantity,
    uom: "PCS",
    unitMat: resolved_model_details.unit_base_price * scale,
    unitLabor: (resolved_model_details.unit_labor_price !== undefined ? resolved_model_details.unit_labor_price : (resolved_model_details.unit_base_price * 0.15)) * scale,
  });

  // 1B. Piping Surcharges
  const pipingBase = breakdown.piping?.base_fee ?? 0;
  if (pipingBase > 0) {
    rawItems.push({
      id: "base_piping",
      category: "1B. PIPING & INSTALLATION MATERIALS",
      no: String(itemNo++).padStart(2, "0"),
      description: `Base Refrigeration Piping Kit (First 10 Feet of Insulated Copper Lines)`,
      qty: base_quantity,
      uom: "LOT",
      unitMat: (payload.installation_parameters.base_piping_fee / base_quantity * 0.75) * scale,
      unitLabor: (payload.installation_parameters.base_piping_labor_price !== undefined ? payload.installation_parameters.base_piping_labor_price : (payload.installation_parameters.base_piping_fee / base_quantity * 0.25)) * scale,
    });
  }

  const excessFeet = breakdown.piping?.excess_feet ?? 0;
  if (excessFeet > 0) {
    rawItems.push({
      id: "excess_piping",
      category: "1B. PIPING & INSTALLATION MATERIALS",
      no: String(itemNo++).padStart(2, "0"),
      description: `Excess Insulated Copper Piping Run (Surcharge for remaining ${excessFeet} feet per system)`,
      qty: excessFeet * base_quantity,
      uom: "FT",
      unitMat: (payload.installation_parameters.excess_piping_rate_per_foot * 0.80) * scale,
      unitLabor: (payload.installation_parameters.excess_piping_labor_price !== undefined ? payload.installation_parameters.excess_piping_labor_price : (payload.installation_parameters.excess_piping_rate_per_foot * 0.20)) * scale,
    });
  }

  // 1C. Electrical
  const cbIndoorQty = breakdown.electrical?.circuit_breaker_indoor_qty ?? 0;
  if (cbIndoorQty > 0) {
    rawItems.push({
      id: "indoor_breaker",
      category: "1C. ELECTRICAL & CONTROL SYSTEM",
      no: String(itemNo++).padStart(2, "0"),
      description: "Circuit Breaker (Indoor isolating breaker block with enclosure)",
      qty: cbIndoorQty,
      uom: "PCS",
      unitMat: (payload.installation_parameters.electrical_breaker_options.indoor_breaker.unit_price_input * 0.82) * scale,
      unitLabor: (payload.installation_parameters.indoor_breaker_labor_price !== undefined ? payload.installation_parameters.indoor_breaker_labor_price : (payload.installation_parameters.electrical_breaker_options.indoor_breaker.unit_price_input * 0.18)) * scale,
    });
  }

  const cbOutdoorQty = breakdown.electrical?.circuit_breaker_outdoor_qty ?? 0;
  if (cbOutdoorQty > 0) {
    rawItems.push({
      id: "outdoor_breaker",
      category: "1C. ELECTRICAL & CONTROL SYSTEM",
      no: String(itemNo++).padStart(2, "0"),
      description: "Circuit Breaker (Outdoor Weatherproof Isolation Switch)",
      qty: cbOutdoorQty,
      uom: "PCS",
      unitMat: (payload.installation_parameters.electrical_breaker_options.outdoor_breaker.unit_price_input * 0.82) * scale,
      unitLabor: (payload.installation_parameters.outdoor_breaker_labor_price !== undefined ? payload.installation_parameters.outdoor_breaker_labor_price : (payload.installation_parameters.electrical_breaker_options.outdoor_breaker.unit_price_input * 0.18)) * scale,
    });
  }

  const wireQty = breakdown.electrical?.wire_qty ?? 0;
  if (wireQty > 0) {
    rawItems.push({
      id: "wire_run",
      category: "1C. ELECTRICAL & CONTROL SYSTEM",
      no: String(itemNo++).padStart(2, "0"),
      description: `Heavy-Duty Electrical Power Feed Wire Run (${wireQty} ft run length)`,
      qty: wireQty,
      uom: "FT",
      unitMat: (payload.installation_parameters.wire_rate_per_foot * 0.80) * scale,
      unitLabor: (payload.installation_parameters.wire_labor_price !== undefined ? payload.installation_parameters.wire_labor_price : (payload.installation_parameters.wire_rate_per_foot * 0.20)) * scale,
    });
  }

  const flatWiring = breakdown.electrical?.flat_wiring_connectivity_fee ?? 0;
  if (flatWiring > 0) {
    rawItems.push({
      id: "flat_wiring",
      category: "1C. ELECTRICAL & CONTROL SYSTEM",
      no: String(itemNo++).padStart(2, "0"),
      description: "Sub-meter Wiring & Conduit Installation Flat Rate Fee",
      qty: 1,
      uom: "LOT",
      unitMat: (payload.installation_parameters.flat_wiring_connectivity_fee * 0.40) * scale,
      unitLabor: (payload.installation_parameters.flat_wiring_labor_price !== undefined ? payload.installation_parameters.flat_wiring_labor_price : (payload.installation_parameters.flat_wiring_connectivity_fee * 0.60)) * scale,
    });
  }

  // 1D. Dismantling
  const dismantlingSub = breakdown.dismantling?.subtotal ?? 0;
  if (dismantlingSub > 0) {
    rawItems.push({
      id: "dismantling",
      category: "1D. SERVICES & DECOMMISSIONING",
      no: String(itemNo++).padStart(2, "0"),
      description: `Dismantling & Safe Decommissioning of Old AC equipment (${base_quantity} systems)`,
      qty: base_quantity,
      uom: "PCS",
      unitMat: 0,
      unitLabor: (payload.installation_parameters.dismantling_labor_price !== undefined ? payload.installation_parameters.dismantling_labor_price : payload.installation_parameters.dismantling_services.fee_per_unit) * scale,
    });
  }

  // General Services & Commissioning (Complimentary / Included in Equipment & Installation)
  const engineeringTotal = 0;
  const adjFactor = 1.0;

  const formattedItems = rawItems.map(item => {
    const mat = item.unitMat * adjFactor;
    const lab = item.unitLabor * adjFactor;
    const tot = item.qty * (mat + lab);
    return {
      ...item,
      unitMat: mat,
      unitLabor: lab,
      total: tot
    };
  });

  formattedItems.push({
    category: "1E. ENGINEERING, DESIGN & INSTALLATION",
    no: String(itemNo++).padStart(2, "0"),
    description: "Design & Installation (Complimentary / Included in System Cost)",
    qty: 1,
    uom: "LOT",
    unitMat: 0,
    unitLabor: 0,
    total: 0
  });

  // Split items across Page 2 and Page 3 dynamically
  const page2Items = formattedItems.slice(0, 5);
  const page3Items = formattedItems.slice(5);

  return (
    <div id="clean-proposal-view-container" className="space-y-6">
      
      {!resolved_model_details.model_number && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-xl text-xs shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Product Price Not Available</p>
            <p className="text-zinc-600 mt-1">
              We don't have this product prices. The selected manufacturer, form factor, or cooling capacity is not configured with official pricing in our database. Please select an officially supported configuration in the Interactive Specs Console.
            </p>
          </div>
        </div>
      )}
      
      {/* Configuration Customizer Header */}
      <div className="bg-white border-t-4 border-l-4 border-emerald-800 border-r border-b rounded-2xl p-5 shadow-sm space-y-4 print-hidden">
        <div className="flex items-center space-x-2 pb-2.5 border-b border-zinc-150">
          <Award className="w-5 h-5 text-emerald-800" />
          <div>
            <h4 className="text-zinc-900 text-sm font-semibold font-sans">Official Proposal Document Customizer</h4>
            <p className="text-[10px] text-zinc-500 font-mono">Customize the layout content below, then download a pixel-perfect, print-ready PDF proposal.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Client / Partner Name</label>
            <input 
              type="text" 
              value={clientName} 
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg font-sans text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none"
              placeholder="e.g. Mr. Viñalon"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Proposal Title</label>
            <input 
              type="text" 
              value={proposalTitle} 
              onChange={(e) => setProposalTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg font-sans text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none"
              placeholder="e.g. Supply, Installation & Commissioning of Air Conditioning System"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Client Designation / Role</label>
            <input 
              type="text" 
              value={department} 
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg font-sans text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none"
              placeholder="e.g. Client Partner"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Proposal Reference No.</label>
            <input 
              type="text" 
              value={referenceNo} 
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg font-sans text-xs font-mono focus:ring-1 focus:ring-emerald-800 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">VAT Rate (%)</label>
            <input 
              type="number" 
              min="0"
              max="100"
              step="any"
              value={vatPercent} 
              onChange={(e) => setVatPercent(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg font-sans text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none"
              placeholder="e.g. 12"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Unit Labor Price (₱)</label>
            <input 
              type="number" 
              min="0"
              step="50"
              value={resolved_model_details.unit_labor_price !== undefined ? resolved_model_details.unit_labor_price : parseFloat((resolved_model_details.unit_base_price * 0.15).toFixed(2))} 
              onChange={(e) => {
                if (onChangeAction) {
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
                }
              }}
              className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg font-sans text-xs focus:ring-1 focus:ring-emerald-800 focus:outline-none font-mono font-semibold"
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div className="pt-3 border-t border-zinc-150 flex flex-wrap gap-2.5 justify-end">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center space-x-1.5 px-3 py-2 bg-[#005A36] text-white rounded-lg hover:bg-emerald-700 text-xs font-mono tracking-tight font-bold transition-all cursor-pointer disabled:opacity-50"
            id="download-pdf-proposal"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloadingPdf ? "Creating A4 PDF..." : "Download PDF Proposal"}</span>
          </button>
          
          <button
            onClick={handleDownloadJson}
            className="flex items-center space-x-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-250 text-zinc-800 rounded-lg text-xs font-mono tracking-tight font-bold transition-all cursor-pointer"
            id="download-json-specification"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>Save Specs (JSON)</span>
          </button>
        </div>
      </div>

      {/* Corporate PDF A4 Viewer Container */}
      <div className="w-full overflow-x-auto flex flex-col items-center py-8 bg-zinc-100 rounded-2xl border border-zinc-200/80 shadow-inner">
        <div className="min-w-[840px] flex flex-col items-center space-y-8 p-4">
          
          {/* ==================== PAGE 1 ==================== */}
          <div 
            id="proposal-page-1" 
            className="w-[794px] h-[1123px] bg-white p-[60px] shadow-md border border-zinc-250 relative flex flex-col justify-between text-zinc-800 font-sans select-text shrink-0"
            style={{ boxSizing: "border-box" }}
          >
            <div>
              {/* Header Letterhead */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h1 className="text-3xl font-extrabold text-zinc-900 leading-tight tracking-tight">
                    M&G Non Specialized Whole-<br />sale Trading
                  </h1>
                  <div className="w-16 h-1 bg-[#005A36] mt-2 rounded" />
                </div>
                <MGLogo />
              </div>

              {/* Document Reference Info */}
              <div className="flex justify-end mt-4">
                <div className="text-right text-[11px] font-mono text-zinc-500 space-y-0.5">
                  <div>REF: <span className="font-semibold text-zinc-800">{referenceNo}</span></div>
                  <div>DATE: <span className="font-semibold text-zinc-800">{new Date().toLocaleDateString("en-PH")}</span></div>
                </div>
              </div>

              {/* Billing Block */}
              <div className="grid grid-cols-3 gap-6 mt-12 pb-6 border-b border-zinc-150">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider font-bold mb-1">BILL TO</span>
                  <span className="text-sm font-extrabold text-zinc-900 block">{clientName}</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{department}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider font-bold mb-1">ISSUE DATE</span>
                  <span className="text-sm font-bold text-zinc-900 block">{new Date().toLocaleDateString("en-PH")}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400 block tracking-wider font-bold mb-1">DUE DATE</span>
                  <span className="text-sm font-bold text-zinc-900 block">Upon Downpayment</span>
                </div>
              </div>

              {/* Subject Banner */}
              <div className="py-5 text-xs">
                <span className="font-black font-mono text-zinc-800 mr-2 uppercase tracking-wide">SUBJECT:</span>
                <span className="font-extrabold text-sm text-zinc-900 border-b-2 border-zinc-900 pb-0.5 uppercase tracking-tight">
                  Supply, Installation &amp; Commissioning of Air Conditioning System
                </span>
              </div>

              {/* Greeting & Cover Letter */}
              <div className="space-y-6 text-[12.5px] leading-relaxed text-zinc-600 mt-6">
                <p className="font-bold text-zinc-900">Gentlemen :</p>
                
                <p>
                  In compliance with your request, we are pleased to offer, for your consideration and review, this detailed project proposal. At 
                  M&G, we pride ourselves on delivering robust, high-performance HVAC systems and climate control solutions tailored to specific commercial and 
                  technical requirements.
                </p>

                <p>
                  We have completed a thorough engineering assessment of your premises to design an air conditioning system that maximizes cooling yield and 
                  provides the highest possible return on investment. The proposed multi-unit {equipment_brand} {form_factor} system consists of top-tier energy-efficient 
                  fan coil units, high-performance outdoor condensing units, premium thermal insulated refrigeration piping, and safety-calibrated circuit breakers.
                </p>

                <p>
                  We are confident that our qualifications, technical experience, and commitment to quality will meet your standards. We look 
                  forward to cooperating with you on this transition to energy-efficient comfort cooling, reducing your operating costs while supporting environmental 
                  sustainability.
                </p>
              </div>
            </div>

            {/* Footer page identifier */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 border-t border-zinc-150 pt-3">
              <span>M&G Non Specialized Wholesale Trading</span>
              <span>Page 1 of 5</span>
            </div>
          </div>


          {/* ==================== PAGE 2 ==================== */}
          <div 
            id="proposal-page-2" 
            className="w-[794px] h-[1123px] bg-white p-[60px] shadow-md border border-zinc-250 relative flex flex-col justify-between text-zinc-800 font-sans select-text shrink-0"
            style={{ boxSizing: "border-box" }}
          >
            <div>
              {/* Header Letterhead */}
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4 mb-6">
                <span className="text-[10px] font-mono text-[#102A83] font-bold">M&G COMMERCIAL CONTRACTS OFFICE</span>
                <span className="text-[10px] font-mono text-zinc-400">{referenceNo}</span>
              </div>

              <h2 className="text-lg font-black text-zinc-950 tracking-tight border-b-2 border-zinc-900 pb-2 uppercase font-sans">
                1. SCOPE OF SUPPLY
              </h2>
              <p className="text-[11.5px] text-zinc-500 mt-2">
                The system components, materials, and services detailed below will be delivered and installed:
              </p>

              {/* Table section 1 */}
              <div className="mt-6 overflow-hidden border border-zinc-200 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                      <th className="px-3 py-2 w-[5%] text-center">NO</th>
                      <th className="px-3 py-2 w-[50%]">DESCRIPTION</th>
                      <th className="px-3 py-2 w-[8%] text-center">QTY</th>
                      <th className="px-3 py-2 w-[8%] text-center">UOM</th>
                      <th className="px-3 py-2 w-[11%] text-right">UNIT MAT.</th>
                      <th className="px-3 py-2 w-[11%] text-right">UNIT LABOR</th>
                      <th className="px-3 py-2 w-[11%] text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 text-zinc-700">
                    {/* 1A. HVAC Equipment */}
                    <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-800 uppercase font-mono tracking-wide">
                      <td colSpan={7} className="px-3 py-1.5 border-b border-zinc-200">
                        1A. SYSTEM EQUIPMENTS
                      </td>
                    </tr>
                    {page2Items.filter(item => item.category.includes("1A")).map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/30">
                        <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.no}</td>
                        <td className="px-3 py-2 font-medium text-zinc-900">{item.description}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.uom}</td>
                        <td className="px-3 py-2 text-right font-mono">₱{item.unitMat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-1 text-right font-mono">
                          {isDownloadingPdf ? (
                            <span className="text-[10px] font-mono font-semibold text-zinc-800">
                              ₱{item.unitLabor.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-zinc-400 text-[10px]">₱</span>
                              <input
                                type="number"
                                min="0"
                                step="50"
                                value={parseFloat(item.unitLabor.toFixed(2))}
                                onChange={(e) => updateUnitLabor(item.id, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-800 focus:bg-white px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-zinc-800 transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-900 font-mono">₱{item.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}

                    {/* 1B. Piping & Installation */}
                    <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-800 uppercase font-mono tracking-wide">
                      <td colSpan={7} className="px-3 py-1.5 border-t border-b border-zinc-200">
                        1B. INSTALLATION &amp; REFRIGERATION MATERIALS
                      </td>
                    </tr>
                    {page2Items.filter(item => item.category.includes("1B")).map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/30">
                        <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.no}</td>
                        <td className="px-3 py-2 font-medium text-zinc-900">{item.description}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.uom}</td>
                        <td className="px-3 py-2 text-right font-mono">₱{item.unitMat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-1 text-right font-mono">
                          {isDownloadingPdf ? (
                            <span className="text-[10px] font-mono font-semibold text-zinc-800">
                              ₱{item.unitLabor.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <span className="text-zinc-400 text-[10px]">₱</span>
                              <input
                                type="number"
                                min="0"
                                step="50"
                                value={parseFloat(item.unitLabor.toFixed(2))}
                                onChange={(e) => updateUnitLabor(item.id, parseFloat(e.target.value) || 0)}
                                className="w-20 text-right bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-800 focus:bg-white px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-zinc-800 transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-900 font-mono">₱{item.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}

                    {/* 1C. Electrical - Start of page 2 part */}
                    {page2Items.some(item => item.category.includes("1C")) && (
                      <>
                        <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-800 uppercase font-mono tracking-wide">
                          <td colSpan={7} className="px-3 py-1.5 border-t border-b border-zinc-200">
                            1C. ELECTRICAL COMPONENTS
                          </td>
                        </tr>
                        {page2Items.filter(item => item.category.includes("1C")).map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/30">
                            <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.no}</td>
                            <td className="px-3 py-2 font-medium text-zinc-900">{item.description}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.uom}</td>
                            <td className="px-3 py-2 text-right font-mono">₱{item.unitMat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-1 text-right font-mono">
                              {isDownloadingPdf ? (
                                <span className="text-[10px] font-mono font-semibold text-zinc-800">
                                  ₱{item.unitLabor.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-zinc-400 text-[10px]">₱</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={parseFloat(item.unitLabor.toFixed(2))}
                                    onChange={(e) => updateUnitLabor(item.id, parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-800 focus:bg-white px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-zinc-800 transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-zinc-900 font-mono">₱{item.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer page identifier */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 border-t border-zinc-150 pt-3">
              <span>M&G Non Specialized Wholesale Trading</span>
              <span>Page 2 of 5</span>
            </div>
          </div>


          {/* ==================== PAGE 3 ==================== */}
          <div 
            id="proposal-page-3" 
            className="w-[794px] h-[1123px] bg-white p-[60px] shadow-md border border-zinc-250 relative flex flex-col justify-between text-zinc-800 font-sans select-text shrink-0"
            style={{ boxSizing: "border-box" }}
          >
            <div>
              {/* Header Letterhead */}
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4 mb-6">
                <span className="text-[10px] font-mono text-[#102A83] font-bold">M&G COMMERCIAL CONTRACTS OFFICE</span>
                <span className="text-[10px] font-mono text-zinc-400">{referenceNo}</span>
              </div>

              <h2 className="text-lg font-black text-zinc-950 tracking-tight border-b-2 border-zinc-900 pb-2 uppercase font-sans">
                1. SCOPE OF SUPPLY (CONTINUED)
              </h2>

              {/* Table section 2 */}
              <div className="mt-6 overflow-hidden border border-zinc-200 rounded-lg">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-mono">
                      <th className="px-3 py-2 w-[5%] text-center">NO</th>
                      <th className="px-3 py-2 w-[50%]">DESCRIPTION</th>
                      <th className="px-3 py-2 w-[8%] text-center">QTY</th>
                      <th className="px-3 py-2 w-[8%] text-center">UOM</th>
                      <th className="px-3 py-2 w-[11%] text-right">UNIT MAT.</th>
                      <th className="px-3 py-2 w-[11%] text-right">UNIT LABOR</th>
                      <th className="px-3 py-2 w-[11%] text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 text-zinc-700">
                    {/* 1C. Electrical - Remaining items */}
                    {page3Items.some(item => item.category.includes("1C")) && (
                      <>
                        <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-800 uppercase font-mono tracking-wide">
                          <td colSpan={7} className="px-3 py-1.5 border-b border-zinc-200">
                            1C. ELECTRICAL COMPONENTS (CONTINUED)
                          </td>
                        </tr>
                        {page3Items.filter(item => item.category.includes("1C")).map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/30">
                            <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.no}</td>
                            <td className="px-3 py-2 font-medium text-zinc-900">{item.description}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.uom}</td>
                            <td className="px-3 py-2 text-right font-mono">₱{item.unitMat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-1 text-right font-mono">
                              {isDownloadingPdf ? (
                                <span className="text-[10px] font-mono font-semibold text-zinc-800">
                                  ₱{item.unitLabor.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-zinc-400 text-[10px]">₱</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={parseFloat(item.unitLabor.toFixed(2))}
                                    onChange={(e) => updateUnitLabor(item.id, parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-800 focus:bg-white px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-zinc-800 transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-zinc-900 font-mono">₱{item.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* 1D. Dismantling */}
                    {page3Items.some(item => item.category.includes("1D")) && (
                      <>
                        <tr className="bg-zinc-50/50 text-[10px] font-bold text-zinc-800 uppercase font-mono tracking-wide">
                          <td colSpan={7} className="px-3 py-1.5 border-t border-b border-zinc-200">
                            1D. SERVICES &amp; DECOMMISSIONING
                          </td>
                        </tr>
                        {page3Items.filter(item => item.category.includes("1D")).map((item, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/30">
                            <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.no}</td>
                            <td className="px-3 py-2 font-medium text-zinc-900">{item.description}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                            <td className="px-3 py-2 text-center font-mono">{item.uom}</td>
                            <td className="px-3 py-2 text-right font-mono">₱{item.unitMat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-1 text-right font-mono">
                              {isDownloadingPdf ? (
                                <span className="text-[10px] font-mono font-semibold text-zinc-800">
                                  ₱{item.unitLabor.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <span className="text-zinc-400 text-[10px]">₱</span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="50"
                                    value={parseFloat(item.unitLabor.toFixed(2))}
                                    onChange={(e) => updateUnitLabor(item.id, parseFloat(e.target.value) || 0)}
                                    className="w-20 text-right bg-zinc-50 border border-zinc-200 hover:border-zinc-300 focus:border-emerald-800 focus:bg-white px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold text-zinc-800 transition-all focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-zinc-900 font-mono">₱{item.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* 1E. Engineering & Design */}
                    {page3Items.filter(item => item.category.includes("1E")).map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/30">
                        <td className="px-3 py-2 text-center text-zinc-400 font-mono">{item.no}</td>
                        <td className="px-3 py-2 font-medium text-zinc-900">{item.description}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.qty}</td>
                        <td className="px-3 py-2 text-center font-mono">{item.uom}</td>
                        <td className="px-3 py-2 text-right font-mono">₱{item.unitMat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-mono">₱{item.unitLabor.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2 text-right font-bold text-zinc-900 font-mono">₱{item.total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals box alignment exactly like Page 3 screenshot */}
              <div className="mt-8 flex justify-end">
                <div className="w-[320px] bg-zinc-50/50 border border-zinc-200/80 rounded-xl p-4 space-y-2.5 text-xs text-zinc-700">
                  <div className="flex justify-between items-center">
                    <span className="font-sans">Subtotal</span>
                    <span className="font-mono font-semibold text-zinc-900">
                      PHP {subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500">
                    <span className="font-sans">VAT ({vatPercent}%)</span>
                    <span className="font-mono">
                      PHP {vat.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="h-[1px] bg-zinc-200 my-1" />
                  
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-zinc-950 text-sm font-sans uppercase">Total</span>
                    <span className="font-mono text-base font-extrabold text-[#005A36]">
                      PHP {total.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer page identifier */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 border-t border-zinc-150 pt-3">
              <span>M&G Non Specialized Wholesale Trading</span>
              <span>Page 3 of 5</span>
            </div>
          </div>


          {/* ==================== PAGE 4 ==================== */}
          <div 
            id="proposal-page-4" 
            className="w-[794px] h-[1123px] bg-white p-[60px] shadow-md border border-zinc-250 relative flex flex-col justify-between text-zinc-800 font-sans select-text shrink-0"
            style={{ boxSizing: "border-box" }}
          >
            <div>
              {/* Header Letterhead */}
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4 mb-6">
                <span className="text-[10px] font-mono text-[#102A83] font-bold">M&G TECHNICAL CONTRACTS REFERENCE</span>
                <span className="text-[10px] font-mono text-zinc-400">{referenceNo}</span>
              </div>

              {/* Grid with 2 Columns exactly like screenshot 4 */}
              <div className="grid grid-cols-2 gap-8 h-full">
                
                {/* Column 1: Scope of Work */}
                <div className="space-y-4 pr-4 border-r border-zinc-100">
                  <h3 className="text-[12px] font-black text-zinc-900 tracking-wide uppercase font-sans border-b border-zinc-200 pb-1.5">
                    2. SCOPE OF WORK
                  </h3>
                  
                  <div className="space-y-3.5 text-[9.5px] leading-relaxed text-zinc-600 font-sans">
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">01</span>
                      <p>Conduct detailed site ocular inspection to verify structural integrity of the walls and electrical configurations.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">02</span>
                      <p>Mobilize highly qualified professional HVAC technical team and specialized crew to the site.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">03</span>
                      <p>Deliver all premium {equipment_brand} fan coil units, condensing modules, refrigerant pipelines, and breakers at site.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">04</span>
                      <p>Conduct rigorous pre-installation checks and civil safety clearances at target installation areas.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">05</span>
                      <p>Securely mount indoor fan coil elements to structural walls using heavy-duty anchor brackets and expansion bolts.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">06</span>
                      <p>Lay out refrigeration lines utilizing top-tier insulated copper coils along the shortest route possible.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">07</span>
                      <p>Interconnect copper pipelines and conduct nitrogen pressure decay leak checks and precise vacuum purging.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">08</span>
                      <p>Securely mount the isolated circuit breaker systems for both indoor terminals and outdoor units.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">09</span>
                      <p>Lay out high-resistance protective conduits along external masonry runs and seal connections tightly.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">10</span>
                      <p>Perform precise electrical terminations and verify parallel isolation grids match the required specifications.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">11</span>
                      <p>Conduct critical pre-commissioning checks including insulation resistance testing and grounding continuity.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">12</span>
                      <p>Restoring and plastering of structural holes and wall penetrations created by our team (excluding repainting and masonry reconstruction).</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">13</span>
                      <p>Inclusion of 1 PC specialized gravity drain unit per system installation and layout of external drain line runs under standard PVC/EMT containment.</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">14</span>
                      <p>Power up the system and log performance metrics (airflow speeds, supply/return differential, drain flow).</p>
                    </div>
                    <div className="flex items-start">
                      <span className="font-bold text-zinc-900 w-5 shrink-0 font-mono">15</span>
                      <p>Demobilize and clear installation zone of civil debris and residual packaging.</p>
                    </div>
                  </div>
                </div>

                {/* Column 2: Exclusions & Warranty */}
                <div className="space-y-5 text-[9.5px] leading-relaxed text-zinc-600 font-sans pl-4">
                  <div>
                    <h3 className="text-[12px] font-black text-zinc-900 tracking-wide uppercase font-sans border-b border-zinc-200 pb-1.5 mb-2.5">
                      3. EXCLUSIONS &amp; WARRANTY
                    </h3>
                    <span className="font-bold text-zinc-800 uppercase block tracking-wider text-[9px] mb-1.5">ITEMS NOT INCLUDED:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Structural reinforcement of building brick/concrete walls if identified as unsound prior to mounting.</li>
                      <li>Civil architectural restoration (repainting and masonry reconstruction) of surrounding areas (Note: plastering of wall penetrations is included).</li>
                      <li>Aesthetic boxing-in or concealment of external drain line runs (Note: standard PVC/EMT containment of external drain line runs is included).</li>
                      <li>Official licensing, building permit applications, and associated municipality local clearance fees.</li>
                      <li>Any electrical modifications to the main panelboard that are not detailed in this scope.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <span className="font-bold text-zinc-800 uppercase block tracking-wider text-[9px] mb-1.5">WARRANTY EXCLUSIONS (NOT COVERED):</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Equipment physical breakdown due to grid power fluctuations, lightning strikes, or external water damage.</li>
                      <li>System physical damage resulting from acts of God, extreme local weather, or civil security concerns.</li>
                      <li>Aesthetic color fading of plastic panels or covers caused by direct exposure to natural atmospheric conditions.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <span className="font-bold text-zinc-800 uppercase block tracking-wider text-[9px] mb-1.5">CONDITIONS VOIDING WARRANTY:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Any repairs, technical modifications, or refrigerant charging performed by unauthorized local contractors.</li>
                      <li>System electrical operation under sub-optimal voltage levels or incorrect power configurations.</li>
                      <li>Non-compliance with required standard filter and coil cleaning maintenance schedules.</li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer page identifier */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 border-t border-zinc-150 pt-3">
              <span>M&G Non Specialized Wholesale Trading</span>
              <span>Page 4 of 5</span>
            </div>
          </div>


          {/* ==================== PAGE 5 ==================== */}
          <div 
            id="proposal-page-5" 
            className="w-[794px] h-[1123px] bg-white p-[60px] shadow-md border border-zinc-250 relative flex flex-col justify-between text-zinc-800 font-sans select-text shrink-0"
            style={{ boxSizing: "border-box" }}
          >
            <div>
              {/* Header Letterhead */}
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4 mb-6">
                <span className="text-[10px] font-mono text-[#102A83] font-bold">M&G COMMERCIAL CONTRACTS TERMS</span>
                <span className="text-[10px] font-mono text-zinc-400">{referenceNo}</span>
              </div>

              <h2 className="text-lg font-black text-zinc-950 tracking-tight border-b-2 border-zinc-900 pb-2 uppercase font-sans mb-6">
                4. COMMERCIAL CONDITIONS
              </h2>

              {/* Commercial split layout exactly like screenshot 5 */}
              <div className="grid grid-cols-2 gap-8 text-[11px] leading-relaxed text-zinc-600 font-sans">
                
                {/* Left side */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] mb-1">Delivery &amp; Installation Leadtime:</h4>
                    {isDownloadingPdf ? (
                      <div className="w-full text-zinc-700 leading-normal text-[10px] min-h-[5rem] whitespace-pre-wrap text-left font-sans bg-transparent">
                        {deliveryLeadtime}
                      </div>
                    ) : (
                      <textarea
                        value={deliveryLeadtime}
                        onChange={(e) => setDeliveryLeadtime(e.target.value)}
                        className="w-full bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-emerald-800 text-zinc-700 focus:bg-white focus:ring-1 focus:ring-emerald-800 p-2 rounded-lg font-sans focus:outline-none transition-all leading-normal text-[10px] h-20 resize-none"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px]">Payment Terms:</h4>
                      {!isDownloadingPdf && (
                        <button
                          type="button"
                          onClick={addPaymentOption}
                          className="text-[9px] text-[#005A36] hover:text-emerald-700 font-bold font-mono uppercase border border-emerald-800/20 px-1.5 py-0.5 rounded hover:bg-emerald-50 transition-all cursor-pointer"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {paymentOptions.map((opt, index) => (
                        <div key={index} className="flex items-start space-x-1 relative group">
                          <span className="font-mono text-[9px] font-bold text-zinc-400 mt-2">{index + 1}.</span>
                          <div className="flex-1 relative">
                            {isDownloadingPdf ? (
                              <div className="w-full text-zinc-700 leading-normal text-[10px] min-h-[3rem] whitespace-pre-wrap text-left font-sans bg-transparent p-1.5">
                                {opt}
                              </div>
                            ) : (
                              <textarea
                                value={opt}
                                onChange={(e) => updatePaymentOption(index, e.target.value)}
                                className="w-full bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-emerald-800 text-zinc-700 focus:bg-white focus:ring-1 focus:ring-emerald-800 p-1.5 pr-6 rounded-lg font-sans focus:outline-none transition-all leading-normal text-[10px] h-12 resize-none"
                              />
                            )}
                            {!isDownloadingPdf && (
                              <button
                                type="button"
                                onClick={() => removePaymentOption(index)}
                                className="absolute right-1 top-1 text-zinc-300 hover:text-red-650 transition-colors cursor-pointer p-0.5 rounded hover:bg-zinc-100"
                                title="Remove Option"
                              >
                                <svg xmlns="http://www.w3.org/2550/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right side */}
                <div className="space-y-4 pl-4 border-l border-zinc-100">
                  <div>
                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] mb-1">Financing Schedules &amp; Custom Conditions:</h4>
                    {isDownloadingPdf ? (
                      <div className="w-full text-zinc-700 leading-normal text-[10px] min-h-[5rem] whitespace-pre-wrap text-left font-sans bg-transparent">
                        {financingSchedules}
                      </div>
                    ) : (
                      <textarea
                        value={financingSchedules}
                        onChange={(e) => setFinancingSchedules(e.target.value)}
                        className="w-full bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-emerald-800 text-zinc-700 focus:bg-white focus:ring-1 focus:ring-emerald-800 p-2 rounded-lg font-sans focus:outline-none transition-all leading-normal text-[10px] h-20 resize-none"
                      />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-zinc-900 uppercase tracking-wider text-[10px] mb-1">Cancellation Charges:</h4>
                    {isDownloadingPdf ? (
                      <div className="w-full text-zinc-700 leading-normal text-[10px] min-h-[6rem] whitespace-pre-wrap text-left font-sans bg-transparent">
                        {cancellationTerms}
                      </div>
                    ) : (
                      <textarea
                        value={cancellationTerms}
                        onChange={(e) => setCancellationTerms(e.target.value)}
                        className="w-full bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200 focus:border-emerald-800 text-zinc-700 focus:bg-white focus:ring-1 focus:ring-emerald-800 p-2 rounded-lg font-sans focus:outline-none transition-all leading-normal text-[10px] h-24 resize-none"
                      />
                    )}
                  </div>
                </div>

              </div>

              {/* Slogan paragraph block */}
              <div className="mt-10 pt-6 border-t border-zinc-100 text-[11px] text-zinc-500 leading-relaxed font-sans space-y-2">
                <p>
                  We hope this proposal merits your consideration. Should you have any questions or require further clarification, please feel free to call the undersigned.
                </p>
                <p className="font-semibold text-[#005A36]">
                  Thank you, and we hope to receive your valued order soon.
                </p>
              </div>

              {/* Signatures accept section exactly like page 5 screenshot */}
              <div className="mt-14">
                <span className="text-[10px] font-extrabold text-zinc-400 block tracking-widest font-mono mb-4">PROPOSAL ACCEPTANCE &amp; AUTHORIZATION</span>
                
                <div className="grid grid-cols-3 gap-8 text-[10.5px] font-sans">
                  {/* Prepared By column */}
                  <div className="space-y-1 flex flex-col items-center text-center">
                    {isDownloadingPdf ? (
                      <span className="font-bold text-zinc-500 block uppercase font-mono tracking-wider text-[9px] text-center w-full p-0.5">
                        {sig1Label}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig1Label}
                        onChange={(e) => setSig1Label(e.target.value)}
                        className="font-bold text-zinc-500 block uppercase font-mono tracking-wider text-[9px] text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                    <div className="h-14 border-b border-zinc-200 w-full" /> {/* Blank signature spot */}
                    {isDownloadingPdf ? (
                      <span className="font-extrabold text-zinc-900 block mt-2 text-[11px] text-center w-full p-0.5">
                        {sig1Name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig1Name}
                        onChange={(e) => setSig1Name(e.target.value)}
                        className="font-extrabold text-zinc-900 block mt-2 text-[11px] text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                    {isDownloadingPdf ? (
                      <span className="text-zinc-500 block text-center w-full p-0.5 text-[10px]">
                        {sig1Title}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig1Title}
                        onChange={(e) => setSig1Title(e.target.value)}
                        className="text-zinc-500 block text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all text-[10px]"
                      />
                    )}
                    {isDownloadingPdf ? (
                      <span className="text-[9px] text-[#102A83] block font-semibold text-center w-full p-0.5">
                        {sig1Company}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig1Company}
                        onChange={(e) => setSig1Company(e.target.value)}
                        className="text-[9px] text-[#102A83] block font-semibold text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                  </div>

                  {/* Approved By column */}
                  <div className="space-y-1 flex flex-col items-center text-center">
                    {isDownloadingPdf ? (
                      <span className="font-bold text-zinc-500 block uppercase font-mono tracking-wider text-[9px] text-center w-full p-0.5">
                        {sig2Label}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig2Label}
                        onChange={(e) => setSig2Label(e.target.value)}
                        className="font-bold text-zinc-500 block uppercase font-mono tracking-wider text-[9px] text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                    <div className="h-14 border-b border-zinc-200 w-full" /> {/* Blank signature spot */}
                    {isDownloadingPdf ? (
                      <span className="font-extrabold text-zinc-900 block mt-2 text-[11px] text-center w-full p-0.5">
                        {sig2Name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig2Name}
                        onChange={(e) => setSig2Name(e.target.value)}
                        className="font-extrabold text-zinc-900 block mt-2 text-[11px] text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                    {isDownloadingPdf ? (
                      <span className="text-zinc-500 block text-center w-full p-0.5 text-[10px]">
                        {sig2Title}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig2Title}
                        onChange={(e) => setSig2Title(e.target.value)}
                        className="text-zinc-500 block text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all text-[10px]"
                      />
                    )}
                    {isDownloadingPdf ? (
                      <span className="text-[9px] text-[#102A83] block font-semibold text-center w-full p-0.5">
                        {sig2Company}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig2Company}
                        onChange={(e) => setSig2Company(e.target.value)}
                        className="text-[9px] text-[#102A83] block font-semibold text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                  </div>

                  {/* Accepted By column */}
                  <div className="space-y-1 flex flex-col items-center text-center">
                    {isDownloadingPdf ? (
                      <span className="font-bold text-zinc-500 block uppercase font-mono tracking-wider text-[9px] text-center w-full p-0.5">
                        {sig3Label}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig3Label}
                        onChange={(e) => setSig3Label(e.target.value)}
                        className="font-bold text-zinc-500 block uppercase font-mono tracking-wider text-[9px] text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                    <div className="h-14 border-b border-zinc-200 w-full" /> {/* Blank signature spot */}
                    {isDownloadingPdf ? (
                      <span className="font-extrabold text-zinc-900 block mt-2 text-[11px] text-center w-full p-0.5">
                        {sig3Name}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig3Name}
                        onChange={(e) => setSig3Name(e.target.value)}
                        className="font-extrabold text-zinc-900 block mt-2 text-[11px] text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                    {isDownloadingPdf ? (
                      <span className="text-zinc-500 block text-center w-full p-0.5 text-[10px]">
                        {sig3Title}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig3Title}
                        onChange={(e) => setSig3Title(e.target.value)}
                        className="text-zinc-500 block text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all text-[10px]"
                      />
                    )}
                    {isDownloadingPdf ? (
                      <span className="text-[9px] text-[#102A83] block font-semibold text-center w-full p-0.5">
                        {sig3Company}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={sig3Company}
                        onChange={(e) => setSig3Company(e.target.value)}
                        className="text-[9px] text-[#102A83] block font-semibold text-center w-full bg-transparent hover:bg-zinc-50 border border-transparent hover:border-zinc-200 rounded p-0.5 focus:border-emerald-800 focus:bg-white focus:outline-none transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer page identifier */}
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 border-t border-zinc-150 pt-3">
              <span>M&G Non Specialized Wholesale Trading</span>
              <span>Page 5 of 5</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
