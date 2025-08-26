// components/PatientList.tsx
'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import Link from 'next/link'; // Import the Link component

interface Patient {
  id: string;
  name: string;
  age: number;
}

export default function PatientList() {
  // ... (useState and useEffect code remains the same) ...
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'patients'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const patientsData: Patient[] = [];
      querySnapshot.forEach((doc) => {
        patientsData.push({ id: doc.id, ...doc.data() } as Patient);
      });
      setPatients(patientsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading patients...</p>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">All Patients</h2>
      {patients.length === 0 ? (
        <p>No patients added yet.</p>
      ) : (
        <ul className="space-y-2">
          {patients.map((patient) => (
            // Wrap the list item in a Link component
            <Link key={patient.id} href={`/patient/${patient.id}`}>
              <li className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:bg-blue-100 hover:border-blue-400 cursor-pointer transition-colors duration-200">
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm text-gray-600">Age: {patient.age}</p>
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}