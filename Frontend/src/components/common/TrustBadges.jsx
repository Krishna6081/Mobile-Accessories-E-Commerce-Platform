import React from 'react';
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

export default function TrustBadges() {
  const badges = [
    { icon: Truck, title: 'Free Express Delivery', desc: 'On all orders above ₹499' },
    { icon: ShieldCheck, title: '100% Brand Guarantee', desc: 'Official warranty coverage' },
    { icon: CreditCard, title: 'Cash on Delivery', desc: 'Doorstep cash payment' },
    { icon: Headphones, title: '24/7 Expert Support', desc: 'Instant WhatsApp assistance' },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div key={idx} className="glass-card p-4 rounded-2xl flex items-center gap-3.5 border border-slate-200/80 bg-white">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-200 shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 tracking-wide">{b.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{b.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
