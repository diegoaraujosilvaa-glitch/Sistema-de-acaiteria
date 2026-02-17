
import React, { useMemo, useState } from 'react';
import { Sale, PaymentMethod, UnitType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FinancialReportsProps {
  sales: Sale[];
}

export const FinancialReports: React.FC<FinancialReportsProps> = ({ sales }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
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
  }, [sales, startDate, endDate]);

  const totalFaturamento = useMemo(() => {
    return filteredSales.filter(s => s.status === 'pago').reduce((acc, s) => acc + s.total, 0);
  }, [filteredSales]);

  const paymentSummary = useMemo(() => {
    const summary = Object.values(PaymentMethod).reduce((acc, method) => {
      acc[method] = 0;
      return acc;
    }, {} as Record<string, number>);

    filteredSales.forEach(sale => {
      summary[sale.paymentMethod] += sale.total;
    });

    return Object.entries(summary).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#64748b'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-end gap-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-1">Período Inicial</label>
            <div className="relative">
              <i className="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type="date" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600/20 text-sm font-bold text-slate-800 transition-all" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-widest px-1">Período Final</label>
            <div className="relative">
              <i className="fas fa-calendar-alt absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              <input type="date" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600/20 text-sm font-bold text-slate-800 transition-all" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => { const today = new Date().toISOString().split('T')[0]; setStartDate(today); setEndDate(today); }} className="flex-1 md:flex-none px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-900 shadow-sm transition-all">Hoje</button>
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="flex-1 md:flex-none px-6 py-3 bg-white text-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-200">Limpar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <div className="mb-8">
            <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Confirmado no Período</h3>
            <p className="text-4xl font-black text-emerald-600 tracking-tight">R$ {totalFaturamento.toFixed(2)}</p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Volume por Meio</p>
            {paymentSummary.map((item, idx) => (
              <div key={item.name} className="flex justify-between items-center text-xs font-bold py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-700 uppercase tracking-tight">{item.name}</span>
                </div>
                <span className="font-black text-slate-800">R$ {item.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100 min-h-[300px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-sm shadow-sm"><i className="fas fa-chart-pie"></i></div>
            <h3 className="text-slate-800 font-black uppercase tracking-tight text-lg">Resumo Financeiro</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentSummary}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="700" tick={{ fill: '#64748b' }} height={40} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="700" tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: '#1e293b' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {paymentSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-800 text-white rounded-xl flex items-center justify-center shadow-md shadow-slate-200"><i className="fas fa-file-invoice text-lg"></i></div>
             <div>
                <h3 className="text-slate-800 font-black text-xl tracking-tight uppercase">Extrato de Vendas</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{filteredSales.length} transações no período</p>
             </div>
          </div>
          <button className="bg-white text-slate-800 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all border border-slate-200 shadow-sm">
            <i className="fas fa-download mr-2"></i> Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="px-8 py-4 font-black text-[9px] uppercase tracking-widest">ID Operação</th>
                <th className="px-8 py-4 font-black text-[9px] uppercase tracking-widest">Data / Hora</th>
                <th className="px-8 py-4 font-black text-[9px] uppercase tracking-widest">Modalidade</th>
                <th className="px-8 py-4 font-black text-[9px] uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 font-black text-[9px] uppercase tracking-widest text-right">Valor</th>
                <th className="px-8 py-4 font-black text-[9px] uppercase tracking-widest text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-4 font-bold text-xs text-slate-800 uppercase tracking-tight">#{sale.id.slice(-8)}</td>
                  <td className="px-8 py-4 text-xs text-slate-600 font-bold uppercase">{new Date(sale.timestamp).toLocaleString('pt-BR')}</td>
                  <td className="px-8 py-4 text-xs text-slate-800 font-bold uppercase">{sale.paymentMethod}</td>
                  <td className="px-8 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      sale.status === 'pago' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right font-black text-slate-800 text-base">R$ {sale.total.toFixed(2)}</td>
                  <td className="px-8 py-4 text-center">
                    <button 
                      onClick={() => setViewingSale(sale)}
                      className="w-9 h-9 bg-white text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-800 hover:text-white transition-all shadow-sm"
                    >
                      <i className="fas fa-eye text-sm"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Detalhes do Pedido (Ações) - CORREÇÃO: Implementação da Modal que não estava renderizada */}
      {viewingSale && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-receipt"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detalhes da Venda</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref: #{viewingSale.id.slice(-12)}</p>
                 </div>
              </div>
              <button onClick={() => setViewingSale(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4 mb-8 overflow-y-auto pr-2 scrollbar-thin flex-1">
              <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                  <span>Data / Hora</span>
                  <span className="text-slate-800">{new Date(viewingSale.timestamp).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mb-1">
                  <span>Forma Pagamento</span>
                  <span className="text-slate-800 font-black">{viewingSale.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                  <span>Situação</span>
                  <span className={viewingSale.status === 'pago' ? 'text-emerald-600 font-black' : 'text-amber-600 font-black'}>{viewingSale.status.toUpperCase()}</span>
                </div>
                {viewingSale.customerName && (
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 mt-1">
                    <span>Cliente</span>
                    <span className="text-slate-800 font-black">{viewingSale.customerName}</span>
                  </div>
                )}
              </div>

              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Produtos no Pedido</p>
              {viewingSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 uppercase">{item.product.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                      {item.product.unitType === UnitType.WEIGHT ? `${item.quantity.toFixed(3)}kg` : `${item.quantity}un`} x R$ {item.product.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    R$ {(item.totalValue || item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3 shadow-inner">
              <div className="flex justify-between text-2xl font-black uppercase text-slate-800">
                <span>Total Recebido</span>
                <span className="text-emerald-600">R$ {viewingSale.total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setViewingSale(null)} className="w-full mt-6 py-4 bg-slate-800 text-white font-black text-xs rounded-xl uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md">
              Voltar ao Relatório
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
