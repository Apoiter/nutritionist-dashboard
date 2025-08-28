'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// --- CALCULATION FUNCTIONS ---

// Calculates Body Mass Index
const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
};

// Calculates Body Fat Percentage using the precise U.S. Navy formula
const calculateBFP = (gender: string, heightCm: number, neckIn: number, waistIn: number, hipsIn: number): number => {
  // The USC formula requires height in inches, so we must convert it.
  const heightIn = heightCm / 2.54;

  if (gender === 'Male') {
    // Corrected: Invalid text removed from the comment
    // Formula for males from your provided text/image
    return 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  } else if (gender === 'Female') {
    // Corrected: Invalid text removed from the comment
    // Formula for females from your provided text/image
    return 163.205 * Math.log10(waistIn + hipsIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
  }
  return 0;
};


export default function AddPatientForm() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [neck, setNeck] = useState('');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isFemale = gender === 'Female';
    if (!name || !gender || !age || !weight || !height || !neck || !waist || (isFemale && !hips)) {
      setError('Please fill in all required fields. Hips are required for female body fat calculation.');
      return;
    }

    const patientData = {
        name, gender,
        age: Number(age),
        initialWeight: Number(weight),
        height: Number(height),
        neck: Number(neck),
        chest: Number(chest) || 0,
        waist: Number(waist),
        hips: Number(hips) || 0,
        conditions,
        allergies,
    };

    const bmi = calculateBMI(patientData.initialWeight, patientData.height);
    const bfp = calculateBFP(patientData.gender, patientData.height, patientData.neck, patientData.waist, patientData.hips);

    try {
      await addDoc(collection(db, 'patients'), {
        ...patientData,
        bmi: bmi,
        bfp: bfp, 
        createdAt: serverTimestamp(),
      });

      setSuccess('Patient added successfully!');
      setName(''); setGender(''); setAge(''); setWeight(''); setHeight('');
      setNeck(''); setChest(''); setWaist(''); setHips('');
      setConditions(''); setAllergies('');

    } catch (err) {
      console.error(err);
      setError('Failed to add patient. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add a New Patient</h2>
      <form onSubmit={handleAddPatient} className="space-y-4">
        <input type="text" placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border rounded" required>
          <option value="" disabled>Select Gender *</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <div className="grid grid-cols-3 gap-4">
          <input type="number" placeholder="Age *" value={age} onChange={(e) => setAge(e.target.value)} className="p-2 border rounded" required />
          <input type="number" step="0.1" placeholder="Weight (kg) *" value={weight} onChange={(e) => setWeight(e.target.value)} className="p-2 border rounded" required />
          <input type="number" step="0.1" placeholder="Height (cm) *" value={height} onChange={(e) => setHeight(e.target.value)} className="p-2 border rounded" required />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <input type="number" step="0.1" placeholder="Neck (in) *" value={neck} onChange={(e) => setNeck(e.target.value)} className="p-2 border rounded" required/>
            <input type="number" step="0.1" placeholder="Chest (in)" value={chest} onChange={(e) => setChest(e.target.value)} className="p-2 border rounded" />
            <input type="number" step="0.1" placeholder="Waist (in) *" value={waist} onChange={(e) => setWaist(e.target.value)} className="p-2 border rounded" required/>
            <input type="number" step="0.1" placeholder="Hips (in)" value={hips} onChange={(e) => setHips(e.target.value)} className="p-2 border rounded" required={gender === 'Female'}/>
        </div>
        <textarea placeholder="Medical Conditions (e.g., Diabetes)" value={conditions} onChange={(e) => setConditions(e.target.value)} className="w-full p-2 border rounded" />
        <textarea placeholder="Allergies (e.g., Peanuts)" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="w-full p-2 border rounded" />
        
        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}
        
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Patient</button>
      </form>
    </div>
  );
}