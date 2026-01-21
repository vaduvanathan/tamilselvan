"use client";

import { useMemo, useState, useEffect } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";

const gold = "#D4AF37";

const containerFade = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const dummyChartData = [
  { date: "Mon", wholesale: 520, retail: 540, nattu: 650 },
  { date: "Tue", wholesale: 525, retail: 545, nattu: 648 },
  { date: "Wed", wholesale: 530, retail: 550, nattu: 655 },
  { date: "Thu", wholesale: 535, retail: 552, nattu: 660 },
  { date: "Fri", wholesale: 540, retail: 556, nattu: 662 },
  { date: "Sat", wholesale: 538, retail: 553, nattu: 658 },
  { date: "Sun", wholesale: 542, retail: 558, nattu: 663 },
];

const initialTickerData = [
  { label: "Piece", value: 5.42, change: 0 },
  { label: "Tray (30)", value: 162.6, change: 0 },
  { label: "100 Pcs", value: 542, change: 0 },
  { label: "Peti (210)", value: 1138, change: 0 },
];

const bottomNav = [
  // { label: "Home" },
  // { label: "Rates" },
  // { label: "Orders" },
  // { label: "Profile" },
];

const timeRanges = ["1W", "1M", "Max"];

// PASTE YOUR GOOGLE SHEET CSV URL HERE
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTLvWxgNikb-cPpcniuYQoGPuJiFzWQj2hQLcX34NDYrIfdT8eQy8FDcIujsP4DCQbmOsS7jjoFxHYX/pub?output=csv"; 

export default function Page() {
  const [timeRange, setTimeRange] = useState("1W");
  const [showContactForm, setShowContactForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });
  
  // Data State
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [tickerData, setTickerData] = useState(initialTickerData);
  const [currentDisplay, setCurrentDisplay] = useState({ 
    rate: 5.42, 
    change: 0, 
    percent: 0, 
    isIncrease: true 
  });
  
  const chartData = useMemo(() => sheetData.length > 0 ? sheetData : dummyChartData, [sheetData]);

  // Fetch CSV Data
  useEffect(() => {
    if (!GOOGLE_SHEET_URL) return;

    Papa.parse(GOOGLE_SHEET_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const parsed = results.data.map((row: any) => ({
          date: row.Date, 
          wholesale: Number(row.Normal_Wholesale || 0),
          retail: Number(row.Normal_Retail || 0),
          nattu: Number(row.Nattu_Koli_Price || 0),
        }));

        if (parsed.length > 0) {
          setSheetData(parsed);
          
          // Calculate Metrics based on latest data
          const latest = parsed[parsed.length - 1];
          const previous = parsed.length > 1 ? parsed[parsed.length - 2] : latest;
          
          const todayRate = latest.wholesale;
          const yesterdayRate = previous.wholesale;
          const diff = todayRate - yesterdayRate;
          
          // Unit Calculations
          // Assumption: Normal_Wholesale is the price per PIECE (e.g. 5.67)
          const pieceRate = todayRate; 
          const trayRate = Number((pieceRate * 30).toFixed(2));
          const hundredRate = Number((pieceRate * 100).toFixed(2));
          const petiRate = Number((pieceRate * 210).toFixed(0));

          // Previous Unit Calculations
          const prevPieceRate = yesterdayRate;
          const prevTrayRate = Number((prevPieceRate * 30).toFixed(2));
          const prevHundredRate = Number((prevPieceRate * 100).toFixed(2));
          const prevPetiRate = Number((prevPieceRate * 210).toFixed(0));

          setTickerData([
            { label: "Piece", value: pieceRate, change: Number((pieceRate - prevPieceRate).toFixed(2)) },
            { label: "Tray (30)", value: trayRate, change: Number((trayRate - prevTrayRate).toFixed(2)) },
            { label: "100 Pcs", value: hundredRate, change: Number((hundredRate - prevHundredRate).toFixed(2)) },
            { label: "Peti (210)", value: petiRate, change: Number((petiRate - prevPetiRate).toFixed(0)) },
          ]);

          setCurrentDisplay({
            rate: pieceRate,
            change: Number((pieceRate - prevPieceRate).toFixed(2)),
            percent: yesterdayRate ? Number(((diff / yesterdayRate) * 100).toFixed(2)) : 0,
            isIncrease: diff >= 0
          });
        }
      },
      error: (error: any) => {
        console.error("Error parsing CSV:", error);
      }
    });
  }, []);

  const handleWhatsAppSubmit = () => {
    const text = `*New Inquiry via Website*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Requirement:* ${formData.message}`;
    window.open(`https://wa.me/919360432189?text=${text}`, '_blank');
    setShowContactForm(false);
  };

  // Current pieces rates for display
  const { rate, change, percent, isIncrease } = currentDisplay;

  return (
    <div className="min-h-screen bg-black text-neutral-200 flex flex-col relative">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/20 via-yellow-900/10 to-black" />
        <motion.header
          initial="hidden"
          animate="show"
          variants={containerFade}
          className="px-5 pt-10 pb-6 text-center flex flex-col items-center relative z-10"
        >
          <p className="uppercase text-xs tracking-[0.3em] text-yellow-500/70">Est. 1994</p>
          <h1 className="text-3xl font-semibold text-yellow-400 mt-2">Shakthivel Egg Mart</h1>
          <div className="text-sm text-neutral-400 mt-2 space-y-1">
             <p>9841849340 / 9150294018</p>
          </div>
          <div className="mt-6 w-full rounded-2xl border border-yellow-600/30 bg-neutral-900/80 backdrop-blur-sm text-left">
            <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-600/20">
              <span className="text-neutral-300 text-sm">Egg Live Price Details</span>
              <span className="text-yellow-400 text-xs font-medium bg-yellow-500/10 px-3 py-1 rounded-full">Live</span>
            </div>
            <div className="divide-y divide-yellow-600/10">
              {tickerData.map((item) => {
                const isUp = item.change >= 0;
                return (
                  <div key={item.label} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-xs text-neutral-400">{item.label}</p>
                      <p className="text-2xl font-bold text-yellow-400 mt-1">₹{item.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          isUp ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                        }`}
                      >
                        {isUp ? "▲" : "▼"} {Math.abs(item.change)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.header>
      </div>

      <motion.main
        initial="hidden"
        animate="show"
        variants={containerFade}
        className="flex-1 px-5 pb-28 space-y-6"
      >
        <section className="rounded-2xl border border-yellow-600/30 bg-neutral-900/70 backdrop-blur-sm p-4">
          <div className="flex items-start justify-between mb-6">
            <div>
               <div className="flex items-baseline gap-2">
                 <h2 className="text-6xl font-bold text-neutral-100">{rate}<span className="text-xl font-normal text-neutral-400 ml-2">INR</span></h2>
               </div>
               <div className={`flex items-center gap-2 mt-2 font-medium ${isIncrease ? 'text-emerald-400' : 'text-rose-400'}`}>
                 <span className="text-lg">
                   {isIncrease ? '+' : ''}{change} ({percent}%)
                 </span>
                 {isIncrease ? (
                   <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 4l-8 8h16l-8-8z"/></svg>
                 ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 20l8-8H4l8 8z"/></svg>
                 )}
                 <span className="text-neutral-500 text-sm font-normal ml-1">today</span>
               </div>
            </div>
          </div>

          <div className="flex items-center border-b border-neutral-800 mb-4">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`flex-1 pb-3 text-sm font-medium transition relative ${
                  timeRange === range ? "text-blue-400" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {range}
                {timeRange === range && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="h-64 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={gold} stopOpacity={0.2} />
                    <stop offset="100%" stopColor={gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d2d" vertical={false} />
                <XAxis 
                   dataKey="date" 
                   tick={{ fill: "#6b7280", fontSize: 12 }} 
                   axisLine={false} 
                   tickLine={false} 
                   dy={10}
                />
                <YAxis 
                   tick={{ fill: "#6b7280", fontSize: 12 }} 
                   axisLine={false} 
                   tickLine={false} 
                   width={40}
                   domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f0f0f",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    borderRadius: 12,
                    color: gold,
                  }}
                  itemStyle={{ color: gold }}
                  labelStyle={{ color: "#e5e7eb" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="wholesale" 
                  stroke={gold} 
                  fill="url(#goldFill)" 
                  strokeWidth={2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <StatCard title="Date" value={sheetData.length > 0 ? sheetData[sheetData.length-1].date : "Jan 20"} change="Today" neutral />
            {tickerData.map((item) => (
               <StatCard 
                 key={item.label} 
                 title={item.label} 
                 value={`₹${item.value}`} 
                 change={`${item.change >= 0 ? '▲' : '▼'} ${Math.abs(item.change)}`} 
                 positive={item.change >= 0} 
               />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-yellow-600/30 bg-neutral-900/70 backdrop-blur-sm p-4">
           <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-yellow-400">Gallery</h2>
            <span className="text-xs text-neutral-400">Our Mart</span>
           </div>
           <div className="grid grid-cols-2 gap-3">
             <div className="aspect-square rounded-xl bg-neutral-800 border border-yellow-600/20 flex items-center justify-center text-neutral-500 text-xs">Photo 1</div>
             <div className="aspect-square rounded-xl bg-neutral-800 border border-yellow-600/20 flex items-center justify-center text-neutral-500 text-xs">Photo 2</div>
             <div className="aspect-square rounded-xl bg-neutral-800 border border-yellow-600/20 flex items-center justify-center text-neutral-500 text-xs">Photo 3</div>
             <div className="aspect-square rounded-xl bg-neutral-800 border border-yellow-600/20 flex items-center justify-center text-neutral-500 text-xs">Photo 4</div>
           </div>
        </section>
        
        <footer className="text-center py-6 text-neutral-500 text-sm space-y-4 pb-24">
            <button 
              onClick={() => setShowContactForm(true)}
              className="px-6 py-2 rounded-full border border-yellow-600/30 text-yellow-500 hover:bg-yellow-500/10 transition"
            >
              Contact Us
            </button>
            <div className="space-y-1">
              <p>9841849340</p>
              <p>9150294018</p>
              <p>shakthiveleggmart@gmail.com</p>
            </div>
        </footer>
      </motion.main>

      <AnimatePresence>
        {showContactForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContactForm(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-yellow-600/30 rounded-t-3xl z-50 p-6 shadow-2xl pb-24"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-yellow-400">Contact Us</h3>
                <button 
                  onClick={() => setShowContactForm(false)}
                  className="p-2 rounded-full bg-neutral-800 text-neutral-400"
                >
                  ✕
                </button>
              </div>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50" 
                    placeholder="Enter your name" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50" 
                    placeholder="Enter mobile number" 
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Requirement</label>
                  <textarea 
                    rows={3} 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-500/50" 
                    placeholder="Tell us what you need..." 
                  />
                </div>
                <button 
                  onClick={handleWhatsAppSubmit}
                  className="w-full bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-xl py-3 mt-2 shadow-lg shadow-red-900/40 active:scale-95 transition-transform"
                >
                  Submit Request
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-6 bg-neutral-900/90 backdrop-blur-xl border border-yellow-600/30 rounded-full px-8 py-3 shadow-2xl shadow-black/50">
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href="https://wa.me/919360432189"
            target="_blank"
            className="flex flex-col items-center gap-1 text-emerald-400 hover:text-emerald-300 transition"
          >
            <WhatsAppIcon />
            <span className="text-[10px] font-medium">Chat</span>
          </motion.a>
          <div className="w-px h-8 bg-neutral-800" />
          <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href="https://maps.app.goo.gl/MiF429qLLU8qY8DC8?g_st=iw"
            target="_blank"
            className="flex flex-col items-center gap-1 text-sky-400 hover:text-sky-300 transition"
          >
            <MapIcon />
             <span className="text-[10px] font-medium">Map</span>
          </motion.a>
          <div className="w-px h-8 bg-neutral-800" />
           <motion.a
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            href="https://www.instagram.com/shakthiveleggmart?igsh=MXFranM3ZWYwbHgyZg%3D%3D&utm_source=qr"
            target="_blank"
            className="flex flex-col items-center gap-1 text-pink-400 hover:text-pink-300 transition"
          >
            <InstagramIcon />
             <span className="text-[10px] font-medium">Insta</span>
          </motion.a>
        </div>
      </div>
    </div>
  );
}

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0C7.11 0 3.12 3.96 3.12 8.84c0 6.89 8.21 15.16 8.56 15.16.33 0 8.56-8.27 8.56-15.16C20.24 3.96 16.25 0 12 0zm0 13a4.01 4.01 0 01-4-4c0-2.2 1.79-4 4-4s4 1.8 4 4c0 2.21-1.79 4-4 4z"/></svg>
);


function StatCard({
  title,
  value,
  change,
  positive,
  neutral
}: {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  neutral?: boolean;
}) {
  const isUp = positive ?? change.trim().startsWith("▲");
  return (
    <div className="rounded-xl border border-yellow-600/20 bg-neutral-900/70 px-3 py-3">
      <p className="text-xs text-neutral-400">{title}</p>
      <div className="flex items-end justify-between mt-2">
        <p className="text-xl font-semibold text-yellow-400">{value}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full border ${
            neutral
              ? "border-neutral-700 bg-neutral-800 text-neutral-400"
              : isUp
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {change}
        </span>
      </div>
    </div>
  );
}

function ActionButton({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={
        accent
          ? "w-full rounded-xl bg-yellow-400 text-black font-semibold py-3 shadow-lg shadow-yellow-600/30"
          : "w-full rounded-xl border border-yellow-600/30 text-neutral-200 font-semibold py-3 bg-neutral-800/80"
      }
    >
      {label}
    </motion.button>
  );
}
