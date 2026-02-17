
import React, { useState, useMemo } from 'react';
import { AppState, Sale, UnitType } from '../types';

interface DashboardProps {
  state: AppState;
  setActiveTab: (tab: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ state, setActiveTab }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return state.sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      const timestamp = saleDate.getTime();
      let startValid = true;
      let endValid = true;
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00').getTime();
        startValid = timestamp >= start;
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59').getTime();
        endValid = timestamp <= end;
      }
      return startValid && endValid;
    });
  }, [state.sales, startDate, endDate]);

  const paidSales = useMemo(() => filteredSales.filter(s => s.status === 'pago'), [filteredSales]);
  const pendingSales = useMemo(() => filteredSales.filter(s => s.status === 'pendente'), [filteredSales]);

  const totalFaturamento = useMemo(() => paidSales.reduce((acc, s) => acc + s.total, 0), [paidSales]);
  const totalVendas = useMemo(() => filteredSales.length, [filteredSales]);
  const totalPendente = useMemo(() => pendingSales.reduce((acc, s) => acc + s.total, 0), [pendingSales]);
  
  const stats = [
    { label: 'Faturamento Bruto', value: `R$ ${totalFaturamento.toFixed(2)}`, icon: 'fa-dollar-sign', color: 'bg-emerald-600', trend: 'Confirmadas' },
    { label: 'Total de Pedidos', value: totalVendas, icon: 'fa-receipt', color: 'bg-blue-600', trend: 'Registros' },
    { label: 'Total Posterior', value: `R$ ${totalPendente.toFixed(2)}`, icon: 'fa-clock', color: 'bg-purple-600', trend: `${pendingSales.length} pendentes` },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filtros Compactos */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
          <div className="flex-1 flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Início</label>
            <input type="date" className="bg-transparent w-full outline-none text-xs font-bold text-slate-800" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="flex-1 flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Fim</label>
            <input type="date" className="bg-transparent w-full outline-none text-xs font-bold text-slate-800" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto h-9">
          <button onClick={() => { const today = new Date().toISOString().split('T')[0]; setStartDate(today); setEndDate(today); }} className="flex-1 md:flex-none px-4 bg-slate-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 transition-all shadow-sm">Hoje</button>
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="flex-1 md:flex-none px-4 bg-white text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200 text-center flex items-center justify-center"><i className="fas fa-undo-alt"></i></button>
        </div>
      </div>

      {/* Stats Grid Compacto (Altura reduzida pela metade) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all group relative flex items-center gap-4 overflow-hidden">
            <div className={`${stat.color} w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-base shadow-lg shadow-slate-100 transform group-hover:scale-110 transition-all`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest truncate">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight truncate leading-tight">{stat.value}</h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 truncate">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Relatório de Vendas Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md shadow-slate-200"><i className="fas fa-receipt text-sm"></i></div>
             <div>
                <h3 className="text-slate-800 font-black text-lg tracking-tight uppercase">Extrato de Movimentação</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{filteredSales.length} transações filtradas</p>
             </div>
          </div>
          <button 
            onClick={() => setActiveTab('pos')}
            className="bg-purple-600 text-white px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all shadow-sm flex items-center gap-2"
          >
            <i className="fas fa-plus"></i> Novo Pedido
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-700">
                <th className="px-6 py-3 font-black text-[9px] uppercase tracking-widest">Operação</th>
                <th className="px-6 py-3 font-black text-[9px] uppercase tracking-widest">Horário</th>
                <th className="px-6 py-3 font-black text-[9px] uppercase tracking-widest">Modalidade</th>
                <th className="px-6 py-3 font-black text-[9px] uppercase tracking-widest">Status</th>
                <th className="px-6 py-3 font-black text-[9px] uppercase tracking-widest text-right">Total</th>
                <th className="px-6 py-3 font-black text-[9px] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.slice(0, 15).map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-3 font-bold text-xs text-slate-800 uppercase tracking-tight">#{sale.id.slice(-8)}</td>
                  <td className="px-6 py-3 text-[10px] text-slate-600 font-bold uppercase">{new Date(sale.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-6 py-3 text-[10px] text-slate-800 font-black uppercase">{sale.paymentMethod}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest inline-block border ${
                      sale.status === 'pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-black text-slate-800 text-sm">R$ {sale.total.toFixed(2)}</td>
                  <td className="px-6 py-3 text-center">
                    <button 
                      onClick={() => setViewingSale(sale)}
                      className="w-8 h-8 bg-white text-slate-400 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                    >
                      <i className="fas fa-eye text-xs"></i>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-300">
                    <i className="fas fa-inbox text-3xl mb-2 opacity-10"></i>
                    <p className="text-[9px] font-bold uppercase tracking-widest">Sem movimentações</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Detalhes do Pedido (Ações) */}
      {viewingSale && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-receipt"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detalhamento</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: #{viewingSale.id.slice(-12)}</p>
                 </div>
              </div>
              <button onClick={() => setViewingSale(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4 mb-6 overflow-y-auto pr-2 scrollbar-thin flex-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Data da Operação</span>
                  <span className="text-slate-800">{new Date(viewingSale.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Método Utilizado</span>
                  <span className="text-slate-800 font-black">{viewingSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Status do Pagamento</span>
                  <span className={viewingSale.status === 'pago' ? 'text-emerald-600 font-black' : 'text-amber-600 font-black'}>{viewingSale.status.toUpperCase()}</span>
                </div>
                {viewingSale.customerName && (
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 pt-2 border-t border-slate-200">
                    <span>Identificação Cliente</span>
                    <span className="text-slate-800 font-black">{viewingSale.customerName}</span>
                  </div>
                )}
              </div>

              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Discriminação de Itens</p>
              {viewingSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">{item.product.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      {item.product.unitType === UnitType.WEIGHT ? `${item.quantity.toFixed(3)}kg` : `${item.quantity}un`} x R$ {item.product.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    R$ {(item.totalValue || item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 p-5 rounded-xl space-y-3 shadow-lg">
              <div className="flex justify-between text-xl font-black uppercase text-white tracking-tighter">
                <span className="text-[10px] text-slate-400 font-bold self-center">VALOR TOTAL</span>
                <span className="text-emerald-400">R$ {viewingSale.total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setViewingSale(null)} className="w-full mt-4 py-3 bg-slate-100 text-slate-700 font-black text-[10px] rounded-xl uppercase tracking-widest hover:bg-slate-200 transition-all">
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
