import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  MapPin, 
  Truck, 
  ArrowLeft, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  HelpCircle,
  Clock,
  Sparkles,
  Calculator
} from 'lucide-react';

export default function MandiIntelligence({ 
  langData, 
  setActiveTab 
}) {
  const [commodity, setCommodity] = useState('All');
  const [district, setDistrict] = useState('All');
  const [mandiData, setMandiData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Net return calculator state
  const [farmerQuantity, setFarmerQuantity] = useState(20); // 20 quintals default

  const fetchPrices = async (comm, dist) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/mandi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodity: comm,
          district: dist,
          state: 'Karnataka'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setMandiData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices(commodity, district);
  }, [commodity, district]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            ಹಿಂದೆ (Dashboard)
          </button>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <span>{langData.actionMandi}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ಅಧಿಕೃತ ಎಪಿಎಂಸಿ ಆಗ್ಮಾರ್ಕ್‌ನೆಟ್ ಮಾರುಕಟ್ಟೆ ದರಗಳು ಮತ್ತು ನಿವ್ವಳ ಲಾಭ ಹೋಲಿಕೆ
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Commodity Dropdown */}
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-kisan-600 focus:outline-none shadow-2xs"
          >
            <option value="All">ಎಲ್ಲಾ ಬೆಳೆಗಳು (All Crops)</option>
            {mandiData?.available_commodities?.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* District Dropdown */}
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-kisan-600 focus:outline-none shadow-2xs"
          >
            <option value="All">ಎಲ್ಲಾ ಮಂಡಿಗಳು (All Mandis)</option>
            {mandiData?.available_districts?.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selling Opportunity Insights Banner */}
      {mandiData?.selling_insights?.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
              {mandiData.selling_insights[0].title}
            </h4>
            <p className="text-xs sm:text-sm font-medium mt-0.5 leading-relaxed">
              {mandiData.selling_insights[0].detail}
            </p>
          </div>
        </div>
      )}

      {/* Net Return Calculator Quick Widget */}
      <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-950">ಸಾಗಾಣಿಕೆ ವೆಚ್ಚ ಕಡಿತ ಕ್ಯಾಲ್ಕುಲೇಟರ್ (Net Return Realization)</h4>
            <p className="text-xs text-emerald-800">ನಿಮ್ಮ ಬೆಳೆಯ ಪ್ರಮಾಣ ನಮೂದಿಸಿ ಪ್ರತಿ ಮಾರುಕಟ್ಟೆಯ ನಿವ್ವಳ ಗಳಿಕೆಯನ್ನು ಲೆಕ್ಕಹಾಕಿ</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-bold text-emerald-900">ನಿಮ್ಮ ಫಸಲು (ಕ್ವಿಂಟಾಲ್):</label>
          <input
            type="number"
            min="1"
            max="1000"
            value={farmerQuantity}
            onChange={(e) => setFarmerQuantity(Math.max(1, Number(e.target.value)))}
            className="w-20 px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-sm font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Mandi Price Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm">
              ದೈನಂದಿನ ಮಾರುಕಟ್ಟೆ ದರ ಪಟ್ಟಿ (Daily APMC Rate Sheet)
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            {mandiData?.last_updated || 'Agmarknet Live Session'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ಬೆಳೆ & ತಳಿ</th>
                <th className="py-3 px-4">ಮಂಡಿ & ಜಿಲ್ಲೆ</th>
                <th className="py-3 px-4 text-right">ಮಾದರಿ ದರ (Modal)</th>
                <th className="py-3 px-4 text-right">ಕನಿಷ್ಠ / ಗರಿಷ್ಠ</th>
                <th className="py-3 px-4 text-center">ದೂರ</th>
                <th className="py-3 px-4 text-right bg-emerald-50/50">ನಿವ್ವಳ ಗಳಿಕೆ ({farmerQuantity} qtl)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mandiData?.records?.map((r) => {
                const totalGross = r.modal_price * farmerQuantity;
                const totalFreight = r.estimated_transport_cost_per_qtl * farmerQuantity;
                const totalNet = Math.round(totalGross - totalFreight);

                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.commodity}</div>
                      <div className="text-xs text-slate-500">{r.variety}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {r.market}
                      </div>
                      <div className="text-xs text-slate-500 pl-4">{r.district}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-extrabold text-slate-900 text-base">
                        ₹{r.modal_price.toLocaleString()}
                      </div>
                      <div className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                        r.trend === 'up' ? 'text-emerald-600' : 'text-slate-500'
                      }`}>
                        {r.trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5" />}
                        <span>{r.price_change}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      <div>₹{r.min_price} - ₹{r.max_price}</div>
                      <div className="text-[11px] text-slate-400">ಕ್ವಿಂಟಾಲ್‌ಗೆ</div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-slate-600">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        {r.distance_km_from_mandya} km
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right bg-emerald-50/30">
                      <div className="font-bold text-emerald-900 text-base">
                        ₹{totalNet.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-medium">
                        (ಸಾಗಾಣಿಕೆ ಕಡಿತ: -₹{Math.round(totalFreight)})
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Disclaimer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
          {mandiData?.disclaimer}
        </div>
      </div>

    </div>
  );
}
