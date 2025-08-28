'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Link from 'next/link';
import PatientProgress from '../../../components/PatientProgress';
import DietChartCreator from '../../../components/DietChartCreator';

// UPDATE: Add new fields to the patient interface
interface Patient {
  id: string; name: string; age: number; gender: string; initialWeight: number;
  height: number; conditions: string; allergies: string;
  neck: number; chest: number; waist: number; hips: number;
  bmi: number; bfp: number; // Body Fat Percentage
}

interface LetterheadSettings {
  nutritionistName?: string; email?: string; phone?: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [settings, setSettings] = useState<LetterheadSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const patientDocRef = doc(db, 'patients', id);
      const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() } as Patient);
        }
      });

      const fetchSettings = async () => {
        const settingsDocRef = doc(db, 'settings', 'letterheadDetails');
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as LetterheadSettings);
        }
        setLoading(false);
      };
      
      fetchSettings();
      return () => unsubscribe();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center p-10">Loading page...</div>;
  }
  if (!patient) {
    return <div className="text-center p-10">Patient not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-gray-50 min-h-screen">
      <Link href="/" className="text-blue-500 hover:underline mb-6 block">&larr; Back to Dashboard</Link>
      
      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
         <h1 className="text-3xl font-bold mb-2">{patient.name}</h1>
         <p className="text-gray-600 mb-6">{patient.age} years old, {patient.gender}</p>
         
         {/* UPDATE: Display the new data */}
         <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
             <div><strong className="block text-gray-500">Weight</strong> {patient.initialWeight} kg</div>
             <div><strong className="block text-gray-500">Height</strong> {patient.height} cm</div>
             <div><strong className="block text-gray-500">Chest</strong> {patient.chest} in</div>
             <div><strong className="block text-gray-500">Neck</strong> {patient.neck} in</div>
             <div><strong className="block text-gray-500">Waist</strong> {patient.waist} in</div>
             <div><strong className="block text-gray-500">Hips</strong> {patient.hips} in</div>
         </div>

         <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-blue-800">BMI</p>
                <p className="text-2xl font-bold text-blue-900">{patient.bmi ? patient.bmi.toFixed(1) : 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-green-800">Body Fat %</p>
                <p className="text-2xl font-bold text-green-900">{patient.bfp ? patient.bfp.toFixed(1) + '%' : 'N/A'}</p>
            </div>
         </div>
      </div>
      
      <div className="space-y-8">
        <PatientProgress patientId={patient.id} />
        <DietChartCreator 
          patientId={patient.id} 
          patientName={patient.name}
          letterheadSettings={settings}
        />
      </div>
    </div>
  );
}