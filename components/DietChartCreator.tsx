'use client';

import { useState, useMemo } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
// REMOVED: import html2pdf from 'html2pdf.js';
import DietChartPDF from './DietChartPDF';

// Type definitions
type FoodItem = {
  text: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
type Meal = 'breakfast' | 'lunch' | 'snacks' | 'dinner';
type DietChart = {
  [key in Meal]: FoodItem[];
};
interface LetterheadSettings {
  nutritionistName?: string;
  email?: string;
  phone?: string;
}
interface DietChartCreatorProps {
  patientId: string;
  patientName: string;
  letterheadSettings: LetterheadSettings | null;
}

export default function DietChartCreator({ patientId, patientName, letterheadSettings }: DietChartCreatorProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [manualFoodName, setManualFoodName] = useState('');
  const [manualCals, setManualCals] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualError, setManualError] = useState('');
  const [dietChart, setDietChart] = useState<DietChart>({
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  });
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [notes, setNotes] = useState('');

  const addFoodToMeal = (meal: Meal, foodItem: FoodItem) => {
    setDietChart(prevChart => ({
      ...prevChart,
      [meal]: [...prevChart[meal], foodItem],
    }));
    setSearchResults([]);
    setQuery('');
  };

  const handleApiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    setApiError('');
    setSearchResults([]);
    const apiKey = process.env.NEXT_PUBLIC_CALORIE_NINJAS_API_KEY;
    const url = `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`;
    try {
      const response = await fetch(url, {
        headers: { 'X-Api-Key': apiKey || '' },
      });
      if (!response.ok) {
        throw new Error('API request failed. Please check your query and API key.');
      }
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const parsedResults: FoodItem[] = data.items.map((item: any) => ({
          text: `${item.serving_size_g}g ${item.name}`,
          calories: Math.round(item.calories),
          protein: Math.round(item.protein_g),
          carbs: Math.round(item.carbohydrates_total_g),
          fat: Math.round(item.fat_total_g),
        }));
        setSearchResults(parsedResults);
      } else {
        setApiError('No results found. Try a different query or add manually.');
      }
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = (e: React.FormEvent, meal: Meal) => {
    e.preventDefault();
    setManualError('');
    const cals = Number(manualCals);
    const protein = Number(manualProtein);
    const carbs = Number(manualCarbs);
    const fat = Number(manualFat);
    if (!manualFoodName || isNaN(cals) || isNaN(protein) || isNaN(carbs) || isNaN(fat)) {
      setManualError('Please fill in all manual fields with valid numbers.');
      return;
    }
    const newFoodItem: FoodItem = {
      text: manualFoodName,
      calories: Math.round(cals),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
    addFoodToMeal(meal, newFoodItem);
    setManualFoodName('');
    setManualCals('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
  };
  
  const calculateTotals = (items: FoodItem[]) => {
    return items.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };
  
  const grandTotals = useMemo(() => {
    const allItems = Object.values(dietChart).flat();
    return calculateTotals(allItems);
  }, [dietChart]);


  const handleSaveChart = async () => {
    setSaveError('');
    setSaveSuccess('');
    if (Object.values(dietChart).flat().length === 0) {
      setSaveError("Cannot save an empty diet chart.");
      return;
    }
    try {
      const dietChartsColRef = collection(db, 'patients', patientId, 'dietCharts');
      await addDoc(dietChartsColRef, {
        chart: dietChart,
        totals: grandTotals,
        notes: notes,
        createdAt: serverTimestamp(),
      });
      setSaveSuccess("Diet chart saved successfully!");
      setDietChart({ breakfast: [], lunch: [], snacks: [], dinner: [] });
      setNotes('');
    } catch (err) {
      console.error(err);
      setSaveError("Failed to save the diet chart.");
    }
  };
  
  // UPDATED: This function is now async and uses a dynamic import
  const handleExportPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;

    const element = document.getElementById('diet-chart-to-export');
    const opt = {
      margin:       0.5,
      filename:     `${patientName.replace(' ', '_')}-DietChart.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  const renderMealSection = (meal: Meal, title: string) => {
    const items = dietChart[meal];
    const totals = calculateTotals(items);
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <ul className="space-y-2">
                {items.map((food, index) => (
                    <li key={index} className="text-sm p-2 bg-white rounded border">
                        <p className="font-semibold">{food.text}</p>
                        <p className="text-xs text-gray-600">
                            Cals: {food.calories} | Protein: {food.protein}g | Carbs: {food.carbs}g | Fat: {food.fat}g
                        </p>
                    </li>
                ))}
            </ul>
            <div className="text-sm font-semibold mt-3 pt-2 border-t">
                Total: Cals: {totals.calories} | P: {totals.protein}g | C: {totals.carbs}g | F: {totals.fat}g
            </div>
        </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      <h2 className="text-2xl font-bold">Diet Chart Creator</h2>
      
      <div className="border p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">1. Search & Add via API</h3>
        <form onSubmit={handleApiSearch} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='e.g., "1 large apple" or "100g chicken breast"'
            className="flex-grow p-2 border rounded"
          />
          <button type="submit" disabled={loading} className="bg-green-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400">
            {loading ? 'Searching...' : 'Search Food'}
          </button>
        </form>
        {apiError && <p className="text-red-500 mt-2">{apiError}</p>}
      </div>

      {searchResults.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold">Search Results</h3>
          <ul className="space-y-2">
            {searchResults.map((food, index) => (
              <li key={index} className="p-2 border rounded flex items-center justify-between">
                <div>
                  <p className="font-medium">{food.text}</p>
                  <p className="text-xs text-gray-600">
                    Cals: {food.calories} | Protein: {food.protein}g | Carbs: {food.carbs}g | Fat: {food.fat}g
                  </p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button onClick={() => addFoodToMeal('breakfast', food)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Bfast</button>
                  <button onClick={() => addFoodToMeal('lunch', food)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Lunch</button>
                  <button onClick={() => addFoodToMeal('snacks', food)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Snacks</button>
                  <button onClick={() => addFoodToMeal('dinner', food)} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Dinner</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">2. Manually Add Food</h3>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <input type="text" placeholder="Food Name" value={manualFoodName} onChange={(e) => setManualFoodName(e.target.value)} className="p-2 border rounded col-span-2" />
          <input type="number" step="1" placeholder="Calories" value={manualCals} onChange={(e) => setManualCals(e.target.value)} className="p-2 border rounded" />
          <input type="number" step="1" placeholder="Protein (g)" value={manualProtein} onChange={(e) => setManualProtein(e.target.value)} className="p-2 border rounded" />
          <input type="number" step="1" placeholder="Carbs (g)" value={manualCarbs} onChange={(e) => setManualCarbs(e.target.value)} className="p-2 border rounded" />
          <input type="number" step="1" placeholder="Fat (g)" value={manualFat} onChange={(e) => setManualFat(e.target.value)} className="p-2 border rounded" />
        </div>
        {manualError && <p className="text-red-500 text-sm">{manualError}</p>}
        <div className="flex gap-2 justify-end flex-wrap">
            <button onClick={(e) => handleManualAdd(e, 'breakfast')} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Add to Breakfast</button>
            <button onClick={(e) => handleManualAdd(e, 'lunch')} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Add to Lunch</button>
            <button onClick={(e) => handleManualAdd(e, 'snacks')} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Add to Snacks</button>
            <button onClick={(e) => handleManualAdd(e, 'dinner')} className="bg-blue-500 text-white text-xs py-1 px-2 rounded">Add to Dinner</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMealSection('breakfast', '🍳 Breakfast')}
          {renderMealSection('lunch', '🥗 Lunch')}
          {renderMealSection('snacks', '🍎 Snacks')}
          {renderMealSection('dinner', '🍲 Dinner')}
      </div>

      <div className="border p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">3. Notes for Patient</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific instructions or notes for the patient here. Each new line will be a bullet point in the PDF."
            className="w-full p-2 border rounded"
            rows={4}
          />
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
            <h3 className="text-lg font-bold">Grand Totals</h3>
            <p><strong>Calories:</strong> {grandTotals.calories}</p>
            <p><strong>Protein:</strong> {grandTotals.protein}g</p>
            <p><strong>Carbs:</strong> {grandTotals.carbs}g</p>
            <p><strong>Fat:</strong> {grandTotals.fat}g</p>
        </div>
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="text-right">
                {saveSuccess && <p className="text-green-600 text-sm">{saveSuccess}</p>}
                {saveError && <p className="text-red-600 text-sm">{saveError}</p>}
            </div>
            <button onClick={handleSaveChart} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">Save Chart</button>
            <button onClick={handleExportPDF} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg">Export to PDF</button>
        </div>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <DietChartPDF 
            dietChart={dietChart} 
            patientName={patientName} 
            letterheadSettings={letterheadSettings}
            notes={notes}
          />
      </div>
    </div>
  );
}