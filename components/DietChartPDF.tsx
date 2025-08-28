import React from 'react';

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

// Update the props interface to accept the new notes prop
interface DietChartPDFProps {
  patientName: string;
  dietChart: DietChart;
  letterheadSettings: LetterheadSettings | null;
  notes: string;
}

export default function DietChartPDF({ patientName, dietChart, letterheadSettings, notes }: DietChartPDFProps) {
  
  const calculateTotals = (items: FoodItem[]) => {
    return items.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const grandTotals = calculateTotals(Object.values(dietChart).flat());

  const renderMealTable = (title: string, items: FoodItem[]) => {
    if (items.length === 0) return null;
    const totals = calculateTotals(items);
    return (
      <div style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '4px', marginBottom: '8px' }}>{title}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <th style={{ textAlign: 'left', padding: '6px', border: '1px solid #ddd' }}>Food Item</th>
              <th style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>Calories</th>
              <th style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>Protein (g)</th>
              <th style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>Carbs (g)</th>
              <th style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>Fat (g)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((food, index) => (
              <tr key={index}>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{food.text}</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{food.calories}</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{food.protein}</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{food.carbs}</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{food.fat}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
              <td style={{ padding: '6px', border: '1px solid #ddd' }}>Subtotal</td>
              <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{totals.calories}</td>
              <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{totals.protein}</td>
              <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{totals.carbs}</td>
              <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{totals.fat}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div id="diet-chart-to-export" style={{ padding: '40px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <img src="/logo.png" alt="Fitspiration by Rupa" style={{ width: '250px', height: 'auto' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'right', fontSize: '10px', color: '#555' }}>
          <p style={{ margin: 0, fontWeight: 'bold', color: '#000', fontSize: '14px' }}>
            {letterheadSettings?.nutritionistName || 'Rupa Sharma'}
          </p>
          <p style={{ margin: '4px 0 0' }}>
            Certified Nutrition & Fitness Coach (INFS Certified)<br />
            Certified Fitness/Wellness Coach (Medvarsity & Apollo Life)<br />
            Fellowship in Applied Nutrition<br />
            Fellowship in Clinical Nutrition (Medvarsity & Apollo Hospitals Education & Research Foundation)<br />
            Certificate in Diabetic Nutrition (AHERF)<br />
            Specialisation-Diabetic Nutrition
          </p>
          <p style={{ margin: '10px 0 0', fontWeight: 'bold' }}>
            <span style={{ marginRight: '10px' }}>📞 {letterheadSettings?.phone || '9760022729'}</span>
            <span>📧 {letterheadSettings?.email || 'rupasharma583@gmail.com'}</span>
          </p>
        </div>
      </header>

      <main style={{ maxWidth: '7.5in', margin: '0 auto' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center' }}>Diet Chart for: {patientName}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {renderMealTable('🍳 Breakfast', dietChart.breakfast)}
          {renderMealTable('🥗 Lunch', dietChart.lunch)}
          {renderMealTable('🍎 Snacks', dietChart.snacks)}
          {renderMealTable('🍲 Dinner', dietChart.dinner)}
        </div>
        <div style={{ marginTop: '30px', paddingTop: '10px', borderTop: '2px solid #eee', pageBreakInside: 'avoid' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}>Grand Totals</h3>
          <table style={{ width: '50%', borderCollapse: 'collapse', fontSize: '14px', marginLeft: '50%' }}>
            <tbody>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>Total Calories</td>
                <td style={{ textAlign: 'right', padding: '8px', border: '1px solid #ddd' }}>{grandTotals.calories}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Total Protein</td>
                <td style={{ textAlign: 'right', padding: '8px', border: '1px solid #ddd' }}>{grandTotals.protein}g</td>
              </tr>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Total Carbs</td>
                <td style={{ textAlign: 'right', padding: '8px', border: '1px solid #ddd' }}>{grandTotals.carbs}g</td>
              </tr>
              <tr>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>Total Fat</td>
                <td style={{ textAlign: 'right', padding: '8px', border: '1px solid #ddd' }}>{grandTotals.fat}g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* ADDED: Notes section that starts on a new page */}
      {notes && (
        <div style={{ pageBreakBefore: 'always', paddingTop: '40px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', textAlign: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            Additional Notes & Instructions
          </h2>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
            {/* Split the notes string by new lines and map to list items */}
            {notes.split('\n').map((line, index) => (
              line.trim() && <li key={index} style={{ marginBottom: '8px' }}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}