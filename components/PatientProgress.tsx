// components/PatientProgress.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// We must register the components we want to use from Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Define the structure of props and a measurement
interface PatientProgressProps {
  patientId: string;
}
interface Measurement {
  id: string;
  date: string;
  weight: number;
}

export default function PatientProgress({ patientId }: PatientProgressProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [weight, setWeight] = useState('');

  // Fetch measurements from the subcollection
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

  // Handle adding a new measurement
  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !weight) return;

    const measurementsColRef = collection(db, 'patients', patientId, 'measurements');
    await addDoc(measurementsColRef, {
      date,
      weight: Number(weight),
      createdAt: serverTimestamp()
    });
    setWeight(''); // Clear input
  };

  // Prepare data for the chart. useMemo prevents re-calculating on every render.
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
      {/* Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Weight Progress</h2>
          {measurements.length > 1 ? <Line data={chartData} /> : <p>Add at least two measurements to see a chart.</p>}
      </div>

      {/* Form and Table Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Track Progress</h2>

        <form onSubmit={handleAddMeasurement} className="flex gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 p-2 border rounded w-full" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
            <input type="number" step="0.1" placeholder="e.g., 60.5" value={weight} onChange={e => setWeight(e.target.value)} className="mt-1 p-2 border rounded w-full" required />
          </div>
          <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded h-fit">Add Entry</button>
        </form>

        <h3 className="font-semibold mb-2">Progress History</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {measurements.map(m => (
                        <tr key={m.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">{m.weight}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}