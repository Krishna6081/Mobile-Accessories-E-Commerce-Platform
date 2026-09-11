import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-slate-900 via-[#0b132b] to-[#070b19] text-slate-300 text-xs mt-auto border-t border-slate-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center overflow-hidden border border-slate-700 shadow-md p-0.5">
              <img src="/mobixia-logo.jpg" alt="Mobixia Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl tracking-tight text-white leading-none">
                Mobi<span className="text-blue-500">X</span>ia
              </span>
              <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase mt-0.5">
                Mobile Accessories Online
              </span>
            </div>
          </Link>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm font-medium">
            Mobixia is India's premier online mobile accessories destination for authentic GaN fast chargers, heavy-duty armor cases, TWS noise-canceling audio gear, glass protectors, and MagSafe power banks.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" /> Live WhatsApp Help
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Top Categories</h4>
          <ul className="space-y-2.5 font-medium">
            <li><Link to="/category/phone-cases" className="hover:text-blue-400 transition-colors">Armor Phone Cases</Link></li>
            <li><Link to="/category/chargers" className="hover:text-blue-400 transition-colors">GaN Fast Chargers</Link></li>
            <li><Link to="/category/cables" className="hover:text-blue-400 transition-colors">Braided 100W Cables</Link></li>
            <li><Link to="/category/audio-accessories" className="hover:text-blue-400 transition-colors">TWS Earbuds</Link></li>
            <li><Link to="/category/power-banks" className="hover:text-blue-400 transition-colors">MagSafe Power Banks</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Customer Policies</h4>
          <ul className="space-y-2.5 font-medium">
            <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Mobixia</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">Privacy & Data Security</Link></li>
            <li><Link to="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/shipping-policy" className="hover:text-blue-400 transition-colors">Shipping & Delivery</Link></li>
            <li><Link to="/refund-policy" className="hover:text-blue-400 transition-colors">7-Day Easy Returns</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Direct Contact</h4>
          <ul className="space-y-3 font-medium">
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-blue-400 shrink-0" /> support@mobixia.com
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-blue-400 shrink-0" /> +91 98765 43210
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" /> 123 Mobixia Tech Park, MG Road, Indiranagar, Bengaluru - 560038
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-4 text-center text-[11px] text-slate-500 font-medium bg-[#050812]">
        © {new Date().getFullYear()} MOBIXIA Mobile Accessories Online. All Rights Reserved.
      </div>
    </footer>
  );
}
