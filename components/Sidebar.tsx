
import React from 'react';
import { Logo } from './Logo';
import { Sale, PaymentMethod } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  sales: Sale[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, sales }) => {
  const pendingCount = sales.filter(s => s.paymentMethod === PaymentMethod.POSTERIOR && s.status === 'pendente').length;

  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: 'fa-tachometer-alt' },
    { id: 'pos', label: 'Vendas', icon: 'fa-cash-register' },
    { id: 'posterior', label: 'Pendentes', icon: 'fa-hourglass-half', badge: pendingCount },
    { id: 'inventory', label: 'Cadastro', icon: 'fa-address-book' },
    { id: 'reports', label: 'Financeiro', icon: 'fa-hand-holding-usd' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="relative w-12 h-12 flex-shrink-0">
            <Logo className="w-full h-full rounded-full overflow-hidden shadow-xl shadow-purple-900/40 transform group-hover:scale-110 transition-all duration-300 border-2 border-slate-800" />
          </div>
          <div className="flex flex-col leading-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span className="font-bold text-[13px] tracking-tight text-white uppercase">QUERO MAIS</span>
            <span className="font-extrabold text-[15px] tracking-tight text-purple-500 uppercase">AÇAÍ</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas ${item.icon} text-base ${activeTab === item.id ? 'text-white' : 'text-purple-400'}`}></i>
                <span className="font-bold tracking-tight uppercase text-xs">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === item.id ? 'bg-white text-purple-600' : 'bg-purple-600 text-white'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <img src="https://picsum.photos/40?grayscale" alt="Avatar" className="w-10 h-10 rounded-xl border border-slate-700" />
          <div className="overflow-hidden">
            <p className="text-xs font-black truncate text-white uppercase tracking-tight">Gerente Master</p>
            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Online</p>
          </div>
        </div>
      </div>
    </aside>
  );
};