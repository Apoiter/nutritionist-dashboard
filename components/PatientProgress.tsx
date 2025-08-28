'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

interface PatientProgressProps {
  patientId: string;
}

// Update the measurement type to include the new fields
interface Measurement {
  id: string;
  date: string;
  weight: number;
  neck?: number;
  chest?: number;
  waist?: number;
  hips?: number;
}

export default function PatientProgress({ patientId }: PatientProgressProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  
  // --- 1. ADD STATE FOR NEW INPUTS ---
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [neck, setNeck] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');

  // Fetch measurements from the subcollection (no changes here)
  useEffect(() => {
    const measurementsColRef = collection(db, 'patients', patientId, 'measurements');
    const q = query(measurementsColRef, orderBy('date', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMeasurements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Measurement));
      setMeasurements(fetchedMeasurements);
    });
    return () => unsubscribe();
  }, [patientId]);

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !weight) return;
    
    // --- 2. UPDATE SAVE LOGIC ---
    // Add the new measurement values to the object saved in Firestore.
    // Use Number() to convert them from strings to numbers.
    const measurementsColRef = collection(db, 'patients', patientId, 'measurements');
    await addDoc(measurementsColRef, {
      date,
      weight: Number(weight),
      neck: Number(neck) || null,
      chest: Number(chest) || null,
      waist: Number(waist) || null,
      hips: Number(hips) || null,
      createdAt: serverTimestamp()
    });
    // Clear all input fields after saving
    setWeight('');
    setNeck('');
    setChest('');
    setWaist('');
    setHips('');
  };
  
  // Chart data logic remains the same, as it only uses weight.
  const chartData = useMemo(() => {
    return {
      labels: measurements.map(m => m.date),
      datasets: [
        {
          label: 'Weight (kg)',
          data: measurements.map(m => m.weight),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        },
      ],
    };
  }, [measurements]);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Weight Progress Chart</h2>
          {measurements.length > 1 ? <Line data={chartData} /> : <p>Add at least two weight entries to see a chart.</p>}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Track Progress</h2>
        
        {/* --- 3. UPDATE THE FORM --- */}
        {/* Add new input fields for the measurements. */}
        <form onSubmit={handleAddMeasurement} className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 items-end">
          <div className="col-span-2 md:col-span-6">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 p-2 border rounded w-full md:w-1/3" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input type="number" step="0.1" placeholder="e.g., 60.5" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Neck (in)</label>
            <input type="number" step="0.1" value={neck} onChange={e => setNeck(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Chest (in)</label>
            <input type="number" step="0.1" value={chest} onChange={e => setChest(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Waist (in)</label>
            <input type="number" step="0.1" value={waist} onChange={e => setWaist(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hips (in)</label>
            <input type="number" step="0.1" value={hips} onChange={e => setHips(e.target.value)} className="mt-1 p-2 border rounded w-full" />
          </div>
          <div className="col-span-2 md:col-span-6">
            <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded w-full md:w-auto">Add Entry</button>
          </div>
        </form>
        
        <h3 className="font-semibold mb-2">Progress History</h3>
        <div className="overflow-x-auto">
            {/* --- 4. UPDATE THE TABLE --- */}
            {/* Add new columns for each measurement. */}
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Neck (in)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chest (in)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waist (in)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hips (in)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {measurements.map(m => (
                        <tr key={m.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">{m.weight}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.neck || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.chest || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.waist || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.hips || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}