
import React, { useState } from 'react';
import { Sale, PaymentMethod, UnitType } from '../types';

interface PosteriorPaymentsProps {
  sales: Sale[];
  onMarkAsPaid: (saleId: string, method: PaymentMethod) => void;
}

export const PosteriorPayments: React.FC<PosteriorPaymentsProps> = ({ sales, onMarkAsPaid }) => {
  const pendingSales = sales.filter(s => s.status === 'pendente');
  const paidSales = sales.filter(s => s.paymentMethod !== PaymentMethod.POSTERIOR && s.status === 'pago').slice(0, 5);

  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [payingSale, setPayingSale] = useState<Sale | null>(null);

  const totalPendente = pendingSales.reduce((acc, s) => acc + s.total, 0);

  const handleFinalPay = (method: PaymentMethod) => {
    if (payingSale) {
      onMarkAsPaid(payingSale.id, method);
      setPayingSale(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner de Resumo */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-3xl shadow-sm">
              <i className="fas fa-hand-holding-usd"></i>
            </div>
            {pendingSales.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md border-2 border-white">
                {pendingSales.length}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-slate-800 font-black text-2xl uppercase tracking-tight leading-none">
              Contas em <span className="text-amber-500">Aberto</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
              Controle de Vendas Fiado / Posterior
            </p>
          </div>
        </div>
        <div className="text-center md:text-right bg-slate-50 p-6 rounded-xl border border-slate-100 min-w-[220px] shadow-inner">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total a Receber</p>
          <p className="text-4xl font-black text-slate-800 tracking-tight">R$ {totalPendente.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lista de Pendentes */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
               Pendências Ativas
             </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingSales.map(sale => (
              <div key={sale.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-bold text-slate-800 uppercase text-lg tracking-tight group-hover:text-purple-600 transition-colors">{sale.customerName || 'Cliente sem nome'}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {sale.id.slice(-8)} • {new Date(sale.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-800 tracking-tight">R$ {sale.total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-5 border-t border-slate-50">
                   <button 
                    onClick={() => setViewingSale(sale)}
                    className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                   >
                     <i className="fas fa-list-ul mr-2"></i> Ver Itens
                   </button>
                   <button 
                    onClick={() => setPayingSale(sale)}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-50"
                   >
                     <i className="fas fa-check mr-2"></i> Baixar
                   </button>
                </div>
              </div>
            ))}
            {pendingSales.length === 0 && (
              <div className="col-span-full py-20 bg-white rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300">
                <i className="fas fa-check-circle text-5xl mb-4 opacity-10"></i>
                <p className="font-bold text-xs uppercase tracking-widest">Nenhuma conta em aberto</p>
              </div>
            )}
          </div>
        </div>

        {/* Histórico Lateral */}
        <div className="lg:col-span-4 bg-white p-8 rounded-xl border border-slate-100 shadow-sm h-fit">
          <h3 className="text-slate-800 font-black text-lg mb-8 uppercase tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center"><i className="fas fa-history text-xs"></i></div>
            Recebidos Recentemente
          </h3>

          <div className="space-y-4">
            {paidSales.map(sale => (
              <div key={sale.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-all shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 uppercase text-xs truncate">{sale.customerName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">{sale.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">R$ {sale.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
            {paidSales.length === 0 && (
              <div className="py-12 text-center text-slate-400">
                <p className="font-bold text-[9px] uppercase tracking-widest opacity-30">Sem registros recentes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Detalhes do Pedido Pendente */}
      {viewingSale && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center">
                    <i className="fas fa-receipt"></i>
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Itens do Pedido</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingSale.customerName}</p>
                 </div>
              </div>
              <button onClick={() => setViewingSale(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="space-y-4 mb-8 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin">
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

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 space-y-3 mb-8 shadow-inner">
              <div className="flex justify-between text-2xl font-black uppercase text-slate-800">
                <span>Total</span>
                <span className="text-emerald-600">R$ {viewingSale.total.toFixed(2)}</span>
              </div>
            </div>

            <button onClick={() => setViewingSale(null)} className="w-full py-4 bg-slate-800 text-white font-black text-xs rounded-xl uppercase tracking-widest hover:bg-slate-900 transition-all shadow-md">
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Quitação */}
      {payingSale && (
        <div className="fixed inset-0 z-[130] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <i className="fas fa-cash-register text-2xl"></i>
              </div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Receber Pagamento</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-3">
                Cliente: <span className="text-slate-800 font-black">{payingSale.customerName}</span>
              </p>
              <div className="bg-emerald-50 py-5 rounded-xl border border-emerald-100 mt-6 shadow-inner">
                <p className="text-[9px] font-black text-emerald-800 uppercase tracking-widest mb-1">Valor Final</p>
                <p className="text-4xl font-black text-emerald-900 tracking-tight">R$ {payingSale.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {[PaymentMethod.PIX, PaymentMethod.CASH, PaymentMethod.DEBIT, PaymentMethod.CREDIT].map((method) => (
                <button
                  key={method}
                  onClick={() => handleFinalPay(method)}
                  className="py-4 border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-800 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 flex flex-col items-center gap-2 group"
                >
                  <i className={`fas ${
                    method === PaymentMethod.PIX ? 'fa-bolt text-blue-500' :
                    method === PaymentMethod.CASH ? 'fa-money-bill-wave text-emerald-600' :
                    'fa-credit-card text-purple-600'
                  } group-hover:scale-110 transition-transform`}></i>
                  {method}
                </button>
              ))}
            </div>

            <button 
              onClick={() => setPayingSale(null)} 
              className="w-full py-4 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Cancelar Operação
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
