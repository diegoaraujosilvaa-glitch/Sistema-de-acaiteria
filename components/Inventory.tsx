
import React, { useState } from 'react';
import { Product, DeliveryFee, ProductCategory, UnitType } from '../types';

interface InventoryProps {
  products: Product[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  removeProduct: (id: string) => void;
  updateProductPrice: (id: string, newPrice: number) => void;
  fees: DeliveryFee[];
  addFee: (f: Omit<DeliveryFee, 'id'>) => void;
  removeFee: (id: string) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ 
  products, 
  addProduct, 
  removeProduct, 
  updateProductPrice,
  fees, 
  addFee, 
  removeFee 
}) => {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  // Inicializado vazio para evitar erros de cadastro acidental na categoria errada
  const [newCategory, setNewCategory] = useState<ProductCategory | ''>('');
  const [newUnitType, setNewUnitType] = useState<UnitType>(UnitType.UNIT);
  
  const [newRegion, setNewRegion] = useState('');
  const [newFeeValue, setNewFeeValue] = useState('');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação inclui a verificação se a categoria foi selecionada
    if (!newProductName || !newProductPrice || !newCategory) return;
    addProduct({ 
      name: newProductName, 
      price: parseFloat(newProductPrice),
      category: newCategory as ProductCategory,
      unitType: newUnitType
    });
    setNewProductName('');
    setNewProductPrice('');
    setNewCategory(''); // Reseta para vazio após o cadastro
  };

  const handleAddFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegion || !newFeeValue) return;
    addFee({ region: newRegion, value: parseFloat(newFeeValue) });
    setNewRegion('');
    setNewFeeValue('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Products Section */}
      <div className="xl:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-100">
            <i className="fas fa-box"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Cadastro de Produtos</h2>
        </div>
        
        <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1">Nome do Item</label>
            <input
              type="text"
              placeholder="Ex: Açaí 500ml"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-slate-800 transition-all"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1">Preço ({newUnitType === UnitType.UNIT ? 'Unid' : 'Kg'})</label>
            <input
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold text-slate-800 transition-all"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1">Categoria</label>
            <div className="relative">
              <select
                className={`w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm font-bold transition-all appearance-none ${newCategory === '' ? 'text-slate-400' : 'text-slate-800'}`}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ProductCategory)}
              >
                <option value="" disabled>Selecione uma categoria...</option>
                {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none"></i>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1">Venda por</label>
            <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-xl">
              {Object.values(UnitType).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewUnitType(type)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all uppercase tracking-tighter ${newUnitType === type ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {type.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 lg:col-span-2 flex items-end">
            <button 
              type="submit"
              disabled={!newProductName || !newProductPrice || !newCategory}
              className="w-full bg-slate-800 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md shadow-slate-100 flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              <i className="fas fa-plus-circle"></i>
              Cadastrar Item
            </button>
          </div>
        </form>

        <div className="bg-white rounded-xl overflow-hidden border border-slate-100">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-700 font-black uppercase tracking-widest">
                <th className="py-4 px-4">Produto</th>
                <th className="py-4 px-4">Categoria</th>
                <th className="py-4 px-4">Tipo</th>
                <th className="py-4 px-4 text-center">Ajuste de Preço</th>
                <th className="py-4 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-sm">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-slate-800 uppercase tracking-tight">{p.name}</td>
                  <td className="py-4 px-4"><span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[9px] font-black uppercase whitespace-nowrap">{p.category}</span></td>
                  <td className="py-4 px-4 text-slate-500 text-xs font-bold uppercase">{p.unitType}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 max-w-[150px] mx-auto">
                      <button 
                        onClick={() => updateProductPrice(p.id, p.price - 0.5)}
                        className="w-7 h-7 bg-white text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm transition-all"
                      >
                        <i className="fas fa-minus text-[10px]"></i>
                      </button>
                      <span className="flex-1 text-center font-black text-slate-800 whitespace-nowrap">R$ {p.price.toFixed(2)}</span>
                      <button 
                        onClick={() => updateProductPrice(p.id, p.price + 0.5)}
                        className="w-7 h-7 bg-white text-slate-400 hover:text-emerald-500 rounded-lg flex items-center justify-center border border-slate-100 shadow-sm transition-all"
                      >
                        <i className="fas fa-plus text-[10px]"></i>
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => removeProduct(p.id)} className="w-9 h-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delivery Fees Section */}
      <div className="xl:col-span-4 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-100">
            <i className="fas fa-truck"></i>
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Taxas de Entrega</h2>
        </div>
        
        <form onSubmit={handleAddFee} className="space-y-4 mb-10 bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1">Bairro/Região</label>
            <input
              type="text"
              placeholder="Ex: Centro"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-800"
              value={newRegion}
              onChange={(e) => setNewRegion(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest px-1">Valor</label>
            <input
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-slate-800"
              value={newFeeValue}
              onChange={(e) => setNewFeeValue(e.target.value)}
            />
          </div>
          <button className="w-full bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest">
            <i className="fas fa-map-marker-alt"></i>
            Adicionar Taxa
          </button>
        </form>

        <div className="bg-white rounded-xl overflow-hidden border border-slate-100 font-bold text-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-700 font-black uppercase tracking-widest">
                <th className="py-4 px-4">Região</th>
                <th className="py-4 px-4 text-right">Valor</th>
                <th className="py-4 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4 text-slate-800 uppercase tracking-tight">{f.region}</td>
                  <td className="py-4 px-4 text-right text-slate-800 font-black">R$ {f.value.toFixed(2)}</td>
                  <td className="py-4 px-4 text-right">
                    <button onClick={() => removeFee(f.id)} className="w-9 h-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all">
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
