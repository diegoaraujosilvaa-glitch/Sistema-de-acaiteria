
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, DeliveryFee, CartItem, PaymentMethod, DeliveryType, Sale, ProductCategory, UnitType } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Logo } from './Logo';

interface POSProps {
  products: Product[];
  fees: DeliveryFee[];
  onFinalize: (sale: Omit<Sale, 'id' | 'timestamp' | 'status'>) => Sale;
  onNavigate: (tab: any) => void;
}

export const POS: React.FC<POSProps> = ({ products, fees, onFinalize, onNavigate }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'Todos'>('Todos');
  
  // States for finalization process
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [deliveryType, setDeliveryType] = useState<DeliveryType | null>(null);
  const [selectedFee, setSelectedFee] = useState<DeliveryFee | null>(null);
  const [customerName, setCustomerName] = useState('');
  
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [weightModalProduct, setWeightModalProduct] = useState<Product | null>(null);
  const [weightInputString, setWeightInputString] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const weightInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const subtotal = useMemo(() => cart.reduce((acc, item) => {
    if (item.totalValue !== undefined) return acc + item.totalValue;
    return acc + (item.product.price * item.quantity);
  }, 0), [cart]);

  const deliveryValue = (deliveryType === DeliveryType.DELIVERY && selectedFee) ? selectedFee.value : 0;
  const total = subtotal + deliveryValue;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleProductSelection = (product: Product) => {
    if (product.unitType === UnitType.WEIGHT) {
      setWeightModalProduct(product);
      setWeightInputString('');
    } else {
      addToCart(product, 1);
    }
  };

  useEffect(() => {
    if (weightModalProduct && weightInputRef.current) {
      weightInputRef.current.focus();
    }
  }, [weightModalProduct]);

  const handleWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const sanitized = val.replace(/^0+/, '');
    setWeightInputString(sanitized || '0');
  };

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightModalProduct || !weightInputString || weightInputString === '0') return;
    
    const valueInBRL = parseInt(weightInputString) / 100;
    const calculatedWeight = valueInBRL / weightModalProduct.price;
    
    setCart(prev => [...prev, { 
      product: weightModalProduct, 
      quantity: calculatedWeight, 
      totalValue: valueInBRL 
    }]);
    
    setWeightModalProduct(null);
    setWeightInputString('');
  };

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.product.unitType === UnitType.UNIT);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev => prev.map((item, idx) => {
      if (idx === index) {
        if (item.product.unitType === UnitType.WEIGHT) return item; 
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleFinalize = () => {
    if (!paymentMethod || !deliveryType) return;
    if (deliveryType === DeliveryType.DELIVERY && !selectedFee) return;
    if (paymentMethod === PaymentMethod.POSTERIOR && !customerName.trim()) return;

    const saleData = { 
      items: cart, 
      subtotal, 
      deliveryFee: deliveryValue, 
      total, 
      paymentMethod, 
      deliveryType, 
      region: selectedFee?.region,
      customerName: paymentMethod === PaymentMethod.POSTERIOR ? customerName : undefined
    };
    
    const finalized = onFinalize(saleData);
    setLastSale(finalized);
    setCart([]);
    setIsFinalizing(false);
    setPaymentMethod(null);
    setDeliveryType(null);
    setSelectedFee(null);
    setCustomerName('');
  };

  const handleViewPDF = async () => {
    if (!receiptRef.current || isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const element = receiptRef.current;
      const canvas = await html2canvas(element, { 
        scale: 3, 
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 40; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 20, 10, imgWidth, imgHeight);
      
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Falha ao gerar PDF:', err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatBRL = (numString: string) => {
    if (!numString || numString === '0') return 'R$ 0,00';
    const val = parseInt(numString) / 100;
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (lastSale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] p-4 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-sm mb-6 flex items-center justify-between">
            <button onClick={() => setLastSale(null)} className="text-slate-500 hover:text-slate-950 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors">
              <i className="fas fa-arrow-left"></i> Voltar
            </button>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest">
              <i className="fas fa-check-circle"></i> Venda Finalizada
            </div>
        </div>

        <div 
          ref={receiptRef} 
          className="bg-white p-8 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 relative overflow-hidden flex flex-col items-center text-slate-950 font-sans"
        >
          <div className="mb-8 flex flex-col items-center w-full">
            <Logo className="w-20 h-20 mb-4" crossOrigin="anonymous" />
            <h2 className="text-[10px] font-black tracking-[0.4em] text-slate-950 uppercase mb-1">Comprovante de Pedido</h2>
            <div className="flex flex-col items-center opacity-60">
              <span className="text-[9px] font-bold uppercase tracking-widest">#{lastSale.id.slice(-8)}</span>
              <span className="text-[9px] font-bold uppercase mt-0.5">
                {new Date(lastSale.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </div>
          </div>

          <div className="w-full mb-8">
            <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">
              <span className="flex-1 text-left">Item</span>
              <span className="w-16 text-center">Qtd</span>
              <span className="w-20 text-right">Subtotal</span>
            </div>
            <div className="space-y-4">
              {lastSale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[11px] font-bold text-slate-900 group">
                  <div className="flex-1 text-left uppercase leading-tight pr-4">
                    {item.product.name}
                    <div className="text-[8px] text-slate-400 mt-0.5 font-black">UNID: R$ {item.product.price.toFixed(2)}</div>
                  </div>
                  <span className="w-16 text-center text-slate-600">
                    {item.product.unitType === UnitType.WEIGHT ? `${item.quantity.toFixed(3)}kg` : item.quantity}
                  </span>
                  <span className="w-20 text-right font-black">
                    R$ {(item.totalValue || item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full space-y-3 bg-slate-50/50 p-5 border-y border-slate-100 mb-8">
            {lastSale.customerName && (
              <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                <span className="text-slate-400 font-black tracking-widest">Cliente</span>
                <span className="text-slate-950 font-black">{lastSale.customerName}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-slate-400 font-black tracking-widest">Entrega</span>
              <span className="text-slate-950 font-black">{lastSale.deliveryFee > 0 ? `R$ ${lastSale.deliveryFee.toFixed(2)}` : 'Grátis'}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
              <span className="text-slate-400 font-black tracking-widest">Pagamento</span>
              <span className="text-purple-700 font-black">{lastSale.paymentMethod.toUpperCase()}</span>
            </div>
          </div>

          <div className="w-full flex justify-between items-center mb-10 px-1">
            <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-950">Total</span>
            <span className="text-3xl font-black text-emerald-800 tracking-tighter">
              R$ {lastSale.total.toFixed(2)}
            </span>
          </div>

          <div className="flex flex-col items-center text-center opacity-40">
             <div className="w-12 h-[1px] bg-slate-200 mb-4"></div>
             <p className="text-[9px] font-black uppercase tracking-[0.15em] mb-1">Obrigado pela preferência!</p>
             <p className="text-[8px] font-bold uppercase tracking-widest italic">Volte sempre.</p>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[radial-gradient(circle,transparent_70%,#f8fafc_70%)] bg-[length:10px_10px] bg-repeat-x"></div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-sm">
           <button 
            onClick={() => setLastSale(null)} 
            className="flex items-center justify-center gap-2 py-4 px-6 bg-slate-950 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
           >
             <i className="fas fa-cart-plus"></i> Novo Pedido
           </button>
           <button 
            onClick={handleViewPDF} 
            disabled={isGeneratingPDF}
            className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-slate-950 text-slate-950 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg disabled:opacity-50 active:scale-95"
           >
             <i className={`fas ${isGeneratingPDF ? 'fa-spinner fa-spin' : 'fa-print'}`}></i>
             {isGeneratingPDF ? 'Gerando...' : 'Imprimir'}
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
      {weightModalProduct && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <i className="fas fa-balance-scale text-xl"></i>
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-tight">{weightModalProduct.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Informe o valor total pesado</p>
            </div>
            
            <form onSubmit={handleWeightSubmit} className="space-y-6">
              <div className="relative">
                <input 
                  ref={weightInputRef}
                  type="tel"
                  inputMode="numeric"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text"
                  value={weightInputString}
                  onChange={handleWeightInputChange}
                  autoComplete="off"
                />
                <div className="w-full text-3xl font-black text-center py-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 tracking-tight shadow-inner pointer-events-none">
                  {formatBRL(weightInputString)}
                </div>
                
                <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                  <span>Preço KG:</span>
                  <span className="text-slate-800 font-black">R$ {weightModalProduct.price.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setWeightModalProduct(null)} 
                  className="flex-1 py-3.5 font-bold text-slate-500 hover:text-red-600 uppercase tracking-widest text-[10px] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={!weightInputString || weightInputString === '0'} 
                  className="flex-[2] py-3.5 bg-purple-600 text-white rounded-xl font-bold shadow-md hover:bg-purple-700 disabled:bg-slate-200 transition-all uppercase tracking-widest text-[10px]"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isFinalizing && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header - Fixed */}
            <div className="p-8 pb-4 flex justify-between items-start bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <i className="fas fa-check-double text-lg"></i>
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Conferir Pedido</h2>
              </div>
              <button onClick={() => setIsFinalizing(false)} className="w-10 h-10 bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-xl flex items-center justify-center transition-all">
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 pt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden shadow-inner">
                    <div className="p-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500 uppercase text-[9px] font-black tracking-widest">
                            <th className="text-left pb-3">Item</th>
                            <th className="text-center pb-3">Qtd</th>
                            <th className="text-right pb-3">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {cart.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-3 text-slate-800 font-bold uppercase">{item.product.name}</td>
                              <td className="py-3 text-center text-slate-500 font-bold">{item.product.unitType === UnitType.WEIGHT ? `${item.quantity.toFixed(3)} Kg` : item.quantity}</td>
                              <td className="py-3 text-right text-slate-800 font-black">R$ {(item.totalValue || item.product.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total do Carrinho</span>
                      <span className="text-xl font-black text-white">R$ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-truck text-purple-600"></i> Entrega
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.values(DeliveryType).map(t => (
                        <button key={t} onClick={() => { setDeliveryType(t); if (t !== DeliveryType.DELIVERY) setSelectedFee(null); }} className={`py-3 px-4 text-left rounded-xl border transition-all flex items-center justify-between ${deliveryType === t ? 'bg-purple-600 border-purple-700 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-purple-300'}`}>
                          <span className="font-bold uppercase text-[10px] tracking-tight">{t}</span>
                          {deliveryType === t && <i className="fas fa-check text-xs"></i>}
                        </button>
                      ))}
                    </div>
                    {deliveryType === DeliveryType.DELIVERY && (
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 uppercase outline-none focus:ring-2 focus:ring-purple-500/20" onChange={(e) => setSelectedFee(fees.find(f => f.id === e.target.value) || null)} value={selectedFee?.id || ''}>
                        <option value="">Selecione o Bairro...</option>
                        {fees.map(f => <option key={f.id} value={f.id}>{f.region.toUpperCase()} (+ R$ {f.value.toFixed(2)})</option>)}
                      </select>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-credit-card text-blue-600"></i> Pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(PaymentMethod).map(m => (
                        <button key={m} onClick={() => setPaymentMethod(m)} className={`py-3 px-3 text-center rounded-xl border transition-all ${paymentMethod === m ? 'bg-blue-600 border-blue-700 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                          <span className="font-bold uppercase text-[9px] tracking-tight">{m}</span>
                        </button>
                      ))}
                    </div>
                    {paymentMethod === PaymentMethod.POSTERIOR && (
                      <input type="text" placeholder="Nome do Cliente..." className="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold uppercase text-amber-900 outline-none focus:ring-2 focus:ring-amber-500/20" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Fixed/Sticky at Bottom */}
            <div className="p-8 pt-6 border-t border-slate-100 bg-white rounded-b-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_-4px_10px_-4px_rgba(0,0,0,0.05)]">
               <div className="text-left bg-slate-50 px-6 py-3 rounded-xl border border-slate-100 w-full md:w-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 block">Total Final</span>
                  <span className="text-3xl font-black text-slate-800 tracking-tight">R$ {total.toFixed(2)}</span>
               </div>
               <button onClick={handleFinalize} disabled={!paymentMethod || !deliveryType || (deliveryType === DeliveryType.DELIVERY && !selectedFee) || (paymentMethod === PaymentMethod.POSTERIOR && !customerName.trim())} className="w-full md:w-auto px-10 py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white rounded-xl font-black text-sm transition-all uppercase tracking-widest shadow-lg shadow-emerald-100">
                 Finalizar Pedido
               </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-9">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 min-h-[calc(100vh-160px)] flex flex-col">
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative w-full">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                <input type="text" placeholder="Pesquisar produto..." className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 text-sm font-bold text-slate-800 transition-all uppercase placeholder-slate-400" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['Todos', ...Object.values(ProductCategory)].map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat as any)} className={`whitespace-nowrap px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-slate-800 border-slate-800 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'}`}>{cat}</button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 overflow-y-auto pr-1">
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => handleProductSelection(p)} className="p-5 bg-slate-50 hover:bg-white border border-slate-200 hover:border-purple-400 rounded-xl transition-all text-left group flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-md">
                  <div className="font-bold text-slate-800 text-sm group-hover:text-purple-600 leading-snug mb-3 uppercase tracking-tight line-clamp-2">{p.name}</div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-slate-900 font-black text-xl tracking-tight">R$ {p.price.toFixed(2)}</div>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{p.unitType === UnitType.WEIGHT ? '/KG' : '/UNID'}</span>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm border border-slate-200 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all transform group-hover:scale-110"><i className="fas fa-plus text-[12px]"></i></div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 sticky top-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[calc(100vh-160px)] flex flex-col">
            <div className="mb-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                    <i className="fas fa-shopping-bag text-sm"></i>
                  </div>
                  <h2 className="text-sm font-black tracking-tight uppercase text-slate-800">Carrinho</h2>
                </div>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-[9px] font-black text-red-500 hover:text-red-700 transition-all uppercase tracking-widest">Limpar</button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-300 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-800 leading-tight uppercase truncate max-w-[130px]">{item.product.name}</span>
                      <span className="text-[9px] text-purple-600 font-black uppercase mt-1.5">{item.product.unitType === UnitType.WEIGHT ? `${item.quantity.toFixed(3)}kg` : `${item.quantity}un`}</span>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-slate-400 hover:text-red-500 transition-all"><i className="fas fa-times text-[12px]"></i></button>
                  </div>
                  <div className="flex justify-between items-center">
                    {item.product.unitType === UnitType.UNIT && (
                      <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                        <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50"><i className="fas fa-minus text-[10px]"></i></button>
                        <span className="w-8 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-50"><i className="fas fa-plus text-[10px]"></i></button>
                      </div>
                    )}
                    <div className="flex-1 text-right">
                      <p className="text-base font-black text-slate-900 tracking-tight">R$ {(item.totalValue || item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200 text-slate-200"><i className="fas fa-shopping-cart text-3xl"></i></div>
                  <p className="font-bold text-[10px] uppercase tracking-widest text-center">Vazio</p>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                <div className="bg-slate-800 p-5 rounded-xl text-white shadow-md flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Subtotal</p>
                      <p className="text-3xl font-black tracking-tight">R$ {subtotal.toFixed(2)}</p>
                    </div>
                </div>
                <button onClick={() => setIsFinalizing(true)} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest rounded-xl">
                  <i className="fas fa-check-circle text-lg"></i>
                  Fechar Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
