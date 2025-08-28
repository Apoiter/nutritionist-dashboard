'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore'; // 1. IMPORT deleteDoc and doc
import { db } from '../firebase';
import Link from 'next/link';

interface Patient {
  id: string;
  name: string;
  age: number;
}

export default function PatientList() {
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

  // --- 2. ADD THE DELETE FUNCTION ---
  const handleDeletePatient = async (patientId: string) => {
    // Use a confirmation dialog as a safety measure
    const isConfirmed = window.confirm("Are you sure you want to delete this patient? This action cannot be undone.");
    
    if (isConfirmed) {
      try {
        const patientDocRef = doc(db, 'patients', patientId);
        await deleteDoc(patientDocRef);
        // No need to update the state manually, onSnapshot will do it for us!
      } catch (error) {
        console.error("Error deleting patient: ", error);
        alert("Failed to delete patient. Please try again.");
      }
    }
  };

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
            <li 
              key={patient.id} 
              className="p-3 bg-gray-50 rounded-md border border-gray-200 flex justify-between items-center"
            >
              <Link href={`/patient/${patient.id}`} className="flex-grow hover:text-blue-600">
                <p className="font-semibold">{patient.name}</p>
                <p className="text-sm text-gray-600">Age: {patient.age}</p>
              </Link>
              
              {/* --- 3. ADD THE DELETE BUTTON --- */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the link from being triggered
                  handleDeletePatient(patient.id);
                }}
                className="ml-4 bg-red-500 hover:bg-red-700 text-white text-xs font-bold py-1 px-2 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}