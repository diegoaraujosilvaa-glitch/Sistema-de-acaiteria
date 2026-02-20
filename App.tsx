
import React, { useState, useEffect } from 'react';
import { 
  Product, DeliveryFee, Sale, AppState, ProductCategory, UnitType, PaymentMethod 
} from './types';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { POS } from './components/POS';
import { FinancialReports } from './components/FinancialReports';
import { PosteriorPayments } from './components/PosteriorPayments';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pos' | 'reports' | 'posterior'>('dashboard');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('acai_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse products from localStorage', e);
      }
    }
    return [
      { id: '1', name: 'Açaí Premium (Self-Service)', price: 52.00, category: ProductCategory.ACAI_CREMES, unitType: UnitType.WEIGHT },
      { id: '2', name: 'Sorvetes (Self-Service)', price: 52.00, category: ProductCategory.ACAI_CREMES, unitType: UnitType.WEIGHT },
      { id: '3', name: 'Hamburguer Normal', price: 14.00, category: ProductCategory.SNACKS, unitType: UnitType.UNIT },
      { id: '4', name: 'X-Baicon', price: 17.00, category: ProductCategory.SNACKS, unitType: UnitType.UNIT },
      { id: '5', name: 'X-Tudo', price: 20.00, category: ProductCategory.SNACKS, unitType: UnitType.UNIT },
      { id: '6', name: 'X-frango', price: 20.00, category: ProductCategory.SNACKS, unitType: UnitType.UNIT },
      { id: '7', name: 'Salgados', price: 10.00, category: ProductCategory.SNACKS, unitType: UnitType.UNIT },
      { id: '8', name: 'Coca-cola 2L', price: 15.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
      { id: '9', name: 'Coca-cola 1L', price: 10.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
      { id: '10', name: 'Coca-cola LT 350ml', price: 6.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
      { id: '11', name: 'São Geraldo 2L', price: 15.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
      { id: '12', name: 'São Geraldo 1L', price: 10.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
      { id: '13', name: 'São Geraldo LT 350ml', price: 10.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
      { id: '14', name: 'Água mineral', price: 3.00, category: ProductCategory.DRINKS, unitType: UnitType.UNIT },
    ];
  });
  const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>(() => {
    const saved = localStorage.getItem('acai_deliveryFees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse deliveryFees from localStorage', e);
      }
    }
    return [
      { id: 'f1', region: 'Centro', value: 5.00 },
      { id: 'f2', region: 'Vila Nova', value: 8.00 },
    ];
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('acai_sales');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse sales from localStorage', e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('acai_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('acai_deliveryFees', JSON.stringify(deliveryFees));
  }, [deliveryFees]);

  useEffect(() => {
    localStorage.setItem('acai_sales', JSON.stringify(sales));
  }, [sales]);

  const appState: AppState = { products, deliveryFees, sales };

  const addProduct = (p: Omit<Product, 'id'>) => {
    setProducts(prev => [...prev, { ...p, id: Date.now().toString() }]);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const updateProductPrice = (id: string, newPrice: number) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, price: Math.max(0, newPrice) } : p));
  };

  const addFee = (f: Omit<DeliveryFee, 'id'>) => {
    setDeliveryFees(prev => [...prev, { ...f, id: Date.now().toString() }]);
  };

  const removeFee = (id: string) => {
    setDeliveryFees(prev => prev.filter(f => f.id !== id));
  };

  const finalizeSale = (sale: Omit<Sale, 'id' | 'timestamp' | 'status'>) => {
    const isPosterior = sale.paymentMethod === PaymentMethod.POSTERIOR;
    const newSale: Sale = {
      ...sale,
      id: `V-${Date.now()}`,
      timestamp: Date.now(),
      status: isPosterior ? 'pendente' : 'pago'
    };
    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const updateSaleStatus = (saleId: string, status: 'pago' | 'pendente', method?: PaymentMethod) => {
    setSales(prev => prev.map(s => 
      s.id === saleId 
        ? { ...s, status, paymentMethod: method || s.paymentMethod } 
        : s
    ));
  };

  const getPageTitle = () => {
    const pendingCount = sales.filter(s => s.status === 'pendente').length;
    switch(activeTab) {
      case 'pos': return <>PONTO DE <span className="text-purple-600">VENDA</span></>;
      case 'posterior': return <>CONTAS <span className="text-amber-600">PENDENTES</span> <span className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full align-middle">{pendingCount}</span></>;
      case 'dashboard': return <>PAINEL <span className="text-blue-600">GERENCIAL</span></>;
      case 'inventory': return <>CADASTRO DE <span className="text-emerald-600">ITENS</span></>;
      case 'reports': return <>RELATÓRIO <span className="text-indigo-600">FINANCEIRO</span></>;
      default: return 'QUERO MAIS AÇAÍ';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} sales={sales} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white p-6 mb-6 flex justify-between items-center shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 cursor-pointer hover:scale-105 transition-all" onClick={() => setActiveTab('dashboard')}>
               <Logo className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border border-slate-100" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight leading-none">
                {getPageTitle()}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="h-[3px] w-6 bg-purple-600 rounded-full"></span>
                <p className="text-slate-700 font-bold text-[10px] uppercase tracking-widest">Gestão Profissional</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-none mb-1">Terminal Ativo</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full"></span>
                  Conectado
                </span>
             </div>
             <div className="bg-slate-100 text-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-3">
               <i className="fas fa-calendar-alt text-purple-600 text-sm"></i>
               <span className="text-xs font-bold uppercase tracking-widest">
                 {new Date().toLocaleDateString('pt-BR')}
               </span>
             </div>
          </div>
        </header>

        <div className="max-w-[1800px] mx-auto w-full px-6 pb-10">
          {activeTab === 'dashboard' && <Dashboard state={appState} setActiveTab={setActiveTab} />}
          {activeTab === 'inventory' && (
            <Inventory 
              products={products} 
              addProduct={addProduct} 
              removeProduct={removeProduct}
              updateProductPrice={updateProductPrice}
              fees={deliveryFees}
              addFee={addFee}
              removeFee={removeFee}
            />
          )}
          {activeTab === 'pos' && (
            <POS 
              products={products} 
              fees={deliveryFees} 
              onFinalize={finalizeSale}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'reports' && <FinancialReports sales={sales} />}
          {activeTab === 'posterior' && (
            <PosteriorPayments 
              sales={sales} 
              onMarkAsPaid={(id, method) => updateSaleStatus(id, 'pago', method)} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
