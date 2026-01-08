
import React, { useState } from 'react';
import { User, UserRole, FoodItem } from '../types';

interface FoodChartProps {
  user: User;
  foodChart: FoodItem[];
  onUpdateFoodChart: (foodChart: FoodItem[]) => void;
}

const FoodChart: React.FC<FoodChartProps> = ({ user, foodChart, onUpdateFoodChart }) => {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [foodFormData, setFoodFormData] = useState({ breakfast: '', breakfastPrice: 0, lunch: '', lunchPrice: 0 });

  const startEditFood = (item: FoodItem) => {
    setEditingDay(item.day);
    setFoodFormData({ 
      breakfast: item.breakfast, 
      breakfastPrice: item.breakfastPrice || 0,
      lunch: item.lunch,
      lunchPrice: item.lunchPrice || 0
    });
  };

  const handleUpdateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDay) return;
    const updated = foodChart.map(item => 
      item.day === editingDay ? { ...item, ...foodFormData } : item
    );
    onUpdateFoodChart(updated);
    setEditingDay(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-indigo-900">Weekly Fuel Station</h1>
          <p className="text-emerald-500 font-medium italic">Healthy meals for growing super heroes! 🍎</p>
        </div>
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-emerald-50">
          <i className="fa-solid fa-utensils"></i>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white/60 relative overflow-hidden">
        {editingDay && user.role === UserRole.ADMIN && (
          <form onSubmit={handleUpdateFood} className="mb-8 p-8 bg-emerald-50 rounded-[2.5rem] border-4 border-white shadow-xl animate-fade-in relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-pen-fancy"></i>
                Update Menu: {editingDay}
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingDay(null)} 
                className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-rose-400 hover:text-rose-600 shadow-sm transition-all"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">Morning Breakfast</label>
                <input 
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-emerald-300 outline-none shadow-inner mb-2"
                  placeholder="e.g. Fruit Salad & Milk"
                  value={foodFormData.breakfast}
                  onChange={e => setFoodFormData({...foodFormData, breakfast: e.target.value})}
                />
                <div className="relative">
                  <span className="absolute left-4 top-4 text-emerald-500 font-bold">₹</span>
                  <input 
                    required
                    type="number"
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-emerald-300 outline-none shadow-inner"
                    placeholder="Price"
                    value={foodFormData.breakfastPrice}
                    onChange={e => setFoodFormData({...foodFormData, breakfastPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-emerald-600 uppercase tracking-widest ml-1">Afternoon Lunch</label>
                <input 
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-emerald-300 outline-none shadow-inner mb-2"
                  placeholder="e.g. Paneer & Rice"
                  value={foodFormData.lunch}
                  onChange={e => setFoodFormData({...foodFormData, lunch: e.target.value})}
                />
                <div className="relative">
                  <span className="absolute left-4 top-4 text-emerald-500 font-bold">₹</span>
                  <input 
                    required
                    type="number"
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white border-2 border-transparent focus:border-emerald-300 outline-none shadow-inner"
                    placeholder="Price"
                    value={foodFormData.lunchPrice}
                    onChange={e => setFoodFormData({...foodFormData, lunchPrice: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            
            <button type="submit" className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-[1.5rem] shadow-lg shadow-emerald-100 transition-all transform hover:scale-[1.02] active:scale-95">
              Confirm Menu Update
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
          {foodChart.map((item) => (
            <div key={item.day} className="p-8 bg-gray-50/50 rounded-[2.5rem] border-2 border-transparent hover:bg-white hover:shadow-2xl hover:border-emerald-100 transition-all group relative overflow-hidden">
              {user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => startEditFood(item)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white shadow-lg rounded-2xl flex items-center justify-center text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform hover:rotate-12"
                >
                  <i className="fa-solid fa-pen-nib"></i>
                </button>
              )}
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-sm">
                  {item.day.slice(0, 3)}
                </div>
                <h4 className="font-black text-gray-800 text-xl tracking-tight">{item.day}</h4>
              </div>

              <div className="space-y-6">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-1 h-full bg-amber-200 rounded-full"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Morning Kickstart</p>
                      <p className="text-base font-bold text-gray-700 leading-tight">{item.breakfast}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-lg">₹{item.breakfastPrice}</span>
                  </div>
                </div>
                
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 w-1 h-full bg-emerald-200 rounded-full"></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">Afternoon Feast</p>
                      <p className="text-base font-bold text-gray-800 leading-tight">{item.lunch}</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] font-black px-2 py-1 rounded-lg">₹{item.lunchPrice}</span>
                  </div>
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="absolute -bottom-6 -right-6 text-emerald-50/30 text-7xl transform rotate-12">
                <i className={`fa-solid ${item.day === 'Monday' ? 'fa-apple-whole' : item.day === 'Wednesday' ? 'fa-carrot' : 'fa-pizza-slice'}`}></i>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute bottom-[-10%] left-[-5%] w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-40"></div>
      </div>
    </div>
  );
};

export default FoodChart;
