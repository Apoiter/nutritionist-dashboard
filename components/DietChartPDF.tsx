import React from 'react';

// Define the types for the props this component will receive
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

// Add a type for the settings data
interface LetterheadSettings {
  nutritionistName?: string;
  email?: string;
  phone?: string;
}

// Update the props interface to accept the new settings
interface DietChartPDFProps {
  patientName: string;
  dietChart: DietChart;
  letterheadSettings: LetterheadSettings | null;
}

// Update the function signature to accept the new prop
export default function DietChartPDF({ patientName, dietChart, letterheadSettings }: DietChartPDFProps) {
  
  const calculateTotals = (items: FoodItem[]) => {
    return items.reduce((acc, item) => ({
        calories: acc.calories + item.calories,
        protein: acc.protein + item.protein,
        carbs: acc.carbs + item.carbs,
        fat: acc.fat + item.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const grandTotals = calculateTotals(Object.values(dietChart).flat());

  // Helper function to render each meal section as a table
  const renderMealTable = (title: string, items: FoodItem[]) => {
    if (items.length === 0) return null;
    const totals = calculateTotals(items);
    return (
      <div style={{ marginBottom: '16px' }}>
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
    // The id 'diet-chart-to-export' is crucial. We will target this element for PDF conversion.
    <div id="diet-chart-to-export" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      {/* DYNAMIC Letterhead */}
      <header style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>
          {/* Use the dynamic data with a fallback */}
          {letterheadSettings?.nutritionistName || 'Your Nutritionist Name'}
        </h1>
        <p style={{ margin: '4px 0 0' }}>
          {/* Use the dynamic data with a fallback */}
          {letterheadSettings?.email || 'your.email@example.com'} | {letterheadSettings?.phone || '(123) 456-7890'}
        </p>
      </header>

      <main>
        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Diet Chart for: {patientName}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {renderMealTable('🍳 Breakfast', dietChart.breakfast)}
          {renderMealTable('🥗 Lunch', dietChart.lunch)}
          {renderMealTable('🍎 Snacks', dietChart.snacks)}
          {renderMealTable('🍲 Dinner', dietChart.dinner)}
        </div>

        {/* Grand Totals Section */}
        <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '2px solid #333' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Grand Totals</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <tbody>
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>Total Calories</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{grandTotals.calories}</td>
              </tr>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>Total Protein</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{grandTotals.protein}g</td>
              </tr>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>Total Carbs</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{grandTotals.carbs}g</td>
              </tr>
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td style={{ padding: '6px', border: '1px solid #ddd' }}>Total Fat</td>
                <td style={{ textAlign: 'right', padding: '6px', border: '1px solid #ddd' }}>{grandTotals.fat}g</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}