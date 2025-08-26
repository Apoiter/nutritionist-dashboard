'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot, getDoc } from 'firebase/firestore'; // Import getDoc
import { db } from '../../../firebase';
import Link from 'next/link';
import PatientProgress from '../../../components/PatientProgress';
import DietChartCreator from '../../../components/DietChartCreator';

interface Patient {
  id: string; name: string; age: number; gender: string; initialWeight: number;
  height: number; conditions: string; allergies: string;
}

// Add a type for our settings data
interface LetterheadSettings {
  nutritionistName?: string;
  email?: string;
  phone?: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [settings, setSettings] = useState<LetterheadSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Fetch patient data with real-time updates
      const patientDocRef = doc(db, 'patients', id);
      const unsubscribe = onSnapshot(patientDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() } as Patient);
        } else {
          console.log("No such document!");
        }
      });

      // Fetch settings data once
      const fetchSettings = async () => {
        const settingsDocRef = doc(db, 'settings', 'letterheadDetails');
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as LetterheadSettings);
        }
        setLoading(false); // Set loading to false after both are attempted
      };

      fetchSettings();

      return () => unsubscribe(); // Cleanup patient listener
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
         <p className="text-gray-600">{patient.age} years old, {patient.gender}</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
             <p><strong>Initial Weight:</strong> {patient.initialWeight} kg</p>
             <p><strong>Height:</strong> {patient.height} cm</p>
             <p className="md:col-span-2"><strong>Conditions:</strong> {patient.conditions || 'None'}</p>
             <p className="md:col-span-2"><strong>Allergies:</strong> {patient.allergies || 'None'}</p>
         </div>
      </div>

      <div className="space-y-8">
        <PatientProgress patientId={patient.id} />
        {/* Pass both patient and settings data down */}
        <DietChartCreator 
          patientId={patient.id} 
          patientName={patient.name}
          letterheadSettings={settings}
        />
      </div>
    </div>
  );
}