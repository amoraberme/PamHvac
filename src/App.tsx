import { useState, useEffect, useRef } from "react";
import { 
  HVACProposalPayload, 
  CostCalculationResponse, 
  HistoricalTransaction 
} from "./types";
import InteractiveForm from "./components/InteractiveForm";
import CostBreakdownReport from "./components/CostBreakdownReport";
import TransactionLog from "./components/TransactionLog";
import CleanProposalDocument from "./components/CleanProposalDocument";
import { calculateCost } from "./utils/calculator";
import { 
  Building2, 
  CheckCircle, 
  Terminal, 
  Info,
  AlertTriangle
} from "lucide-react";

// Synchronized local preset values with the cascading regional parameters
const INITIAL_PAYLOAD: HVACProposalPayload = {
  selection_flow: {
    equipment_brand: "Carrier",
    form_factor: "Split Type",
    cooling_capacity: "2.5 HP",
    resolved_model_details: {
      model_number: "CR-ST-25-ENT",
      unit_base_price: 1250.00,
      unit_labor_price: 0
    }
  },
  installation_parameters: {
    base_quantity: 4,
    actual_piping_distance_feet: 28,
    excess_piping_rate_per_foot: 450.00,
    base_piping_fee: 2000.00,
    electrical_breaker_options: {
      indoor_breaker: {
        selected: true,
        unit_price_input: 750.00
      },
      outdoor_breaker: {
        selected: false,
        unit_price_input: 1000.00
      }
    },
    flat_wiring_connectivity_fee: 0,
    dismantling_services: {
      required: true,
      fee_per_unit: 2000.00
    },
    wire_length_feet: 15,
    wire_rate_per_foot: 105.00
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"form" | "proposal">("form");
  const [proposalPayload, setProposalPayload] = useState<HVACProposalPayload>(INITIAL_PAYLOAD);
  const [calculation, setCalculation] = useState<CostCalculationResponse | null>(null);
  const [history, setHistory] = useState<HistoricalTransaction[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "info" | "error"; text: string } | null>({
    type: "info",
    text: "Facilities Procurement system online. Standard cascading specs loaded."
  });

  const isApplyingHistoryRef = useRef(false);

  const isValidForExport = !!proposalPayload.selection_flow.resolved_model_details.model_number && proposalPayload.installation_parameters.base_quantity > 0;
  const [shouldPulse, setShouldPulse] = useState(false);

  // Trigger pulse whenever calculation is updated, but only if we are not on the proposal tab and specs are valid
  useEffect(() => {
    if (calculation && activeTab !== "proposal" && isValidForExport) {
      setShouldPulse(true);
    }
  }, [calculation]);

  // Turn off pulse when the user switches to the proposal tab
  useEffect(() => {
    if (activeTab === "proposal") {
      setShouldPulse(false);
    }
  }, [activeTab]);

  // Calculate detailed financial breakdown from the Express server API with client-side fallback
  const syncCalculationAPI = async (payload: HVACProposalPayload, skipLog: boolean = false) => {
    // 1. Calculate instantly client-side so it displays right away
    const clientCalc = calculateCost(payload);
    setCalculation(clientCalc);

    if (!skipLog) {
      const key = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newTx: HistoricalTransaction = {
        id: key,
        timestamp: new Date().toLocaleTimeString(),
        payload,
        calculation: clientCalc,
      };
      setHistory(prev => {
        if (prev.length > 0 && JSON.stringify(prev[0].payload) === JSON.stringify(payload)) {
          return prev;
        }
        return [newTx, ...prev.slice(0, 9)];
      });
    }

    // 2. Fetch from backend to sync or log, but ignore failures silently since client-side is already done
    try {
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setCalculation(data);
      }
    } catch (err: any) {
      console.warn("Pricing synchronization server error (using client-side fallback):", err);
    }
  };

  // Sync calculation whenever parameters change
  useEffect(() => {
    const skipLog = isApplyingHistoryRef.current;
    isApplyingHistoryRef.current = false;
    syncCalculationAPI(proposalPayload, skipLog);
  }, [proposalPayload]);

  const handleIngestionComplete = (payload: HVACProposalPayload, logText: string) => {
    setProposalPayload(payload);
    setActiveTab("form"); // Switch to manual form so they see the manual fields filled
    setNotification({
      type: "success",
      text: `✓ Extraction complete! Brand: ${payload.selection_flow.equipment_brand} (${payload.selection_flow.form_factor}), Capacity: ${payload.selection_flow.cooling_capacity}. Price resolved.`,
    });
  };

  const handleApplyHistory = (tx: HistoricalTransaction) => {
    isApplyingHistoryRef.current = true;
    setProposalPayload(tx.payload);
    setCalculation(tx.calculation);
    setNotification({
      type: "info",
      text: `Loaded calculation from history timestamp ${tx.timestamp}`
    });
  };

  return (
    <div className="min-h-screen bg-[#005A36] text-zinc-900 font-sans selection:bg-[#005A36] selection:text-white py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Decorative top ambient indicator bar */}
      <div className="h-1.5 w-full bg-[#FFFFFF]/25 rounded-t-xl max-w-7xl mx-auto print-hidden" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 bg-zinc-50 border border-emerald-900 rounded-b-xl shadow-xl space-y-8">
        
        {/* Navigation / Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 pb-6 print-hidden">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white border border-emerald-200 text-[#005A36] rounded-xl shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold tracking-tight text-[#005A36] font-sans">
                    HVAC Sequential Proposal Architect
                  </h1>
                </div>
              </div>
            </div>
          </div>


        </header>

        {/* Global Notifications Alert Row */}
        {notification && (
          <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs tracking-wide transition-all print-hidden ${
            notification.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : notification.type === "success"
                ? "bg-[#005A36] border-emerald-850 text-white"
                : "bg-white border-zinc-200 text-zinc-800 shadow-2xs"
          }`}>
            <div className="flex items-center space-x-2.5">
              <Info className={`w-4 h-4 shrink-0 ${
                notification.type === "error" ? "text-red-600" : notification.type === "success" ? "text-emerald-300" : "text-zinc-500"
              }`} />
              <span className="font-mono">{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-[10px] font-mono opacity-80 hover:opacity-100 hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Workspace Navigation Tabs Row */}
        <div id="workspace-layers-nav" className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-4 print-hidden">
          <div className="flex flex-wrap gap-1.5 animate-fade-in">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-3 py-1.5 text-xs font-mono font-bold tracking-tight rounded-lg transition-all cursor-pointer ${
                activeTab === "form"
                ? "bg-[#005A36] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              Interactive Specs Console
            </button>
            <div className="relative group">
              <button
                onClick={() => setActiveTab("proposal")}
                className={`px-3 py-1.5 text-xs font-mono font-bold tracking-tight rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "proposal"
                  ? "bg-[#005A36] text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                } ${shouldPulse ? "animate-pulse ring-2 ring-emerald-400 ring-offset-2" : ""}`}
                id="tab-proposal-sheet"
              >
                <span>Downloadable Proposal Sheet</span>
                {isValidForExport ? (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
                )}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute left-0 top-full mt-2 hidden group-hover:block z-50 w-72 p-3.5 bg-zinc-900 text-white rounded-xl text-[11px] font-mono shadow-xl border border-zinc-800 transition-all pointer-events-none">
                {isValidForExport ? (
                  <div className="space-y-1">
                    <p className="text-emerald-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      Ready for Export
                    </p>
                    <p className="text-zinc-300 font-normal leading-relaxed">
                      All minimum specs are valid and standard pricing has been resolved. The document is ready for final generation (PDF / Print).
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-amber-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Incomplete Specs
                    </p>
                    <p className="text-zinc-300 font-normal leading-relaxed">
                      No official pricing exists for this model/capacity in our database. Please select a supported specs combination first.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Double Column Workspace */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Ingestion & Controls Panel (Expands to 12 cols when in proposal view) */}
          <div className={`${activeTab === "proposal" ? "lg:col-span-12" : "lg:col-span-6"} space-y-6`}>
            
            {/* Render selected left panel workspace */}
            <div>
              {activeTab === "form" ? (
                <InteractiveForm 
                  payload={proposalPayload} 
                  onChangeAction={(updated) => {
                    setProposalPayload(updated);
                    setNotification(null);
                  }} 
                />
              ) : (
                <CleanProposalDocument 
                  payload={proposalPayload}
                  calculation={calculation}
                  onChangeAction={(updated) => {
                    setProposalPayload(updated);
                    setNotification(null);
                  }}
                />
              )}
            </div>

          </div>

          {/* Right Column (6/12): Automated Cost Report - only render if not on proposal tab */}
          {activeTab !== "proposal" && (
            <div className="lg:col-span-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
                <span className="px-1 py-1.5 text-xs font-mono font-bold tracking-tight text-zinc-900">
                  Automated Pricing Proposal
                </span>
                <span className="text-[10px] font-mono text-zinc-400 mr-1 uppercase font-semibold">Outputs Layer</span>
              </div>

              {/* Calculations & Output Panel */}
              <div className="min-h-[500px]">
                <CostBreakdownReport 
                  calculation={calculation} 
                  payload={proposalPayload}
                />
              </div>

            </div>
          )}

        </main>

        {/* Audit Tracker & Logs Row at Bottom */}
        <section className="space-y-3 print-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-[#005A36]" />
              <h4 className="text-xs font-mono font-bold text-[#005A36] uppercase tracking-wider">
                Systemic Compliance Audit Trail
              </h4>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 font-bold">Active Proposal Records (Max 10 Logs)</span>
          </div>
          
          <TransactionLog 
            currentPayload={proposalPayload}
            history={history}
            onSelectAction={handleApplyHistory}
            onClearHistoryAction={() => {
              setHistory([]);
              setNotification({ type: "info", text: "Session logs history formatted." });
            }}
          />
        </section>



      </div>
    </div>
  );
}
