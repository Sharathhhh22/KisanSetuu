import React, { useState } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeft, 
  DollarSign, 
  CheckCircle2, 
  HelpCircle,
  RefreshCw
} from 'lucide-react';

export default function ProfitCalculator({ 
  langData, 
  setActiveTab 
}) {
  const [cropName, setCropName] = useState('Ragi (Finger Millet)');
  const [landAcres, setLandAcres] = useState(2.0);
  const [seedCost, setSeedCost] = useState(1800);
  const [fertCost, setFertCost] = useState(6500);
  const [pestCost, setPestCost] = useState(2200);
  const [labourCost, setLabourCost] = useState(14000);
  const [irrigCost, setIrrigCost] = useState(3500);
  const [transCost, setTransCost] = useState(2500);
  const [harvestQuantity, setHarvestQuantity] = useState(22); // 22 quintals
  const [sellingPrice, setSellingPrice] = useState(3350); // ₹3,350/qtl

  const [calculation, setCalculation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCalculate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/profit-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_name: cropName,
          land_acres: Number(landAcres),
          seed_cost: Number(seedCost),
          fertilizer_and_manure_cost: Number(fertCost),
          pesticide_and_bio_cost: Number(pestCost),
          labour_cost: Number(labourCost),
          irrigation_and_machinery_cost: Number(irrigCost),
          transport_and_marketing_cost: Number(transCost),
          expected_harvest_quantity_quintals: Number(harvestQuantity),
          selling_price_per_quintal: Number(sellingPrice)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCalculation(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          ಹಿಂದೆ (Dashboard)
        </button>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-indigo-600" />
          <span>{langData.toolProfit} (Crop Profit & Break-Even Calculator)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          ಖರ್ಚು, ಇಳುವರಿ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ದರ ನಮೂದಿಸಿ ನಿವ್ವಳ ಲಾಭ ಮತ್ತು ಸಮತೋಲನ ಬೆಲೆ (Break-Even) ಲೆಕ್ಕಹಾಕಿ
        </p>
      </div>

      {/* Inputs Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಬೆಳೆಯ ಹೆಸರು:</label>
              <input
                type="text"
                required
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ಜಮೀನು ವಿಸ್ತೀರ್ಣ (ಎಕರೆ):</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={landAcres}
                onChange={(e) => setLandAcres(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          {/* Expenses Breakdown */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              ಕೃಷಿ ವೆಚ್ಚಗಳ ವಿವರ (Cultivation Expenses in ₹):
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ಬೀಜ / ಸಸಿ ವೆಚ್ಚ:</label>
                <input
                  type="number"
                  value={seedCost}
                  onChange={(e) => setSeedCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ಗೊಬ್ಬರ & ಸೆಗಣಿ ಗೊಬ್ಬರ:</label>
                <input
                  type="number"
                  value={fertCost}
                  onChange={(e) => setFertCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ಔಷಧ & ಕೀಟನಾಶಕ:</label>
                <input
                  type="number"
                  value={pestCost}
                  onChange={(e) => setPestCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ಕೂಲಿ & ಕಳೆ ಕೀಳುವಿಕೆ:</label>
                <input
                  type="number"
                  value={labourCost}
                  onChange={(e) => setLabourCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ನೀರಾವರಿ & ಟ್ರ್ಯಾಕ್ಟರ್ ಬಾಡಿಗೆ:</label>
                <input
                  type="number"
                  value={irrigCost}
                  onChange={(e) => setIrrigCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">ಸಾಗಾಣಿಕೆ & ಮಾರುಕಟ್ಟೆ ಶುಲ್ಕ:</label>
                <input
                  type="number"
                  value={transCost}
                  onChange={(e) => setTransCost(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Harvest & Selling Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ನಿರೀಕ್ಷಿತ ಒಟ್ಟು ಇಳುವರಿ (ಕ್ವಿಂಟಾಲ್):
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={harvestQuantity}
                onChange={(e) => setHarvestQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ಕ್ವಿಂಟಾಲ್‌ಗೆ ಮಾರಾಟ ದರ (₹):
              </label>
              <input
                type="number"
                min="100"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...</span>
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                <span>ನಿವ್ವಳ ಲಾಭ & ಸಮತೋಲನ ಬೆಲೆ ಲೆಕ್ಕಹಾಕಿ (Calculate Profit)</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results Presentation */}
      {calculation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase">
                {cropName} ({landAcres} ಎಕರೆ)
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                ಆರ್ಥಿಕ ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ (Financial Outcome)
              </h3>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
              calculation.is_profitable 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {calculation.is_profitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{calculation.is_profitable ? 'ಲಾಭದಾಯಕ (Profitable)' : 'ನಷ್ಟದ ಸಂಭವ (Projected Loss)'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block">ಒಟ್ಟು ಬಂಡವಾಳ (Total Cost)</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
                ₹{calculation.total_investment.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-semibold block">ಒಟ್ಟು ವರಮಾನ (Gross Revenue)</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1 block">
                ₹{calculation.gross_revenue.toLocaleString()}
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border ${
              calculation.is_profitable ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            }`}>
              <span className="text-[11px] text-slate-600 font-semibold block">ನಿವ್ವಳ ಲಾಭ / ನಷ್ಟ (Net)</span>
              <span className={`text-lg sm:text-xl font-extrabold mt-1 block ${
                calculation.is_profitable ? 'text-emerald-700' : 'text-red-700'
              }`}>
                {calculation.is_profitable ? '+' : ''}₹{calculation.net_profit_or_loss.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[11px] text-amber-800 font-semibold block">ಸಮತೋಲನ ಬೆಲೆ (Break-Even)</span>
              <span className="text-lg sm:text-xl font-extrabold text-amber-950 mt-1 block">
                ₹{calculation.break_even_price}/qtl
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
            <strong>ತಜ್ಞರ ಆರ್ಥಿಕ ಸಲಹೆ:</strong> {calculation.advisory_notes}
          </div>
        </div>
      )}

    </div>
  );
}
