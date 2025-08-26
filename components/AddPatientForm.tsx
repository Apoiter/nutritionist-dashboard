// components/AddPatientForm.tsx
'use client';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Our initialized firestore instance

export default function AddPatientForm() {
  // We use useState for each form field to hold its current value.
  // Think of useState as a memory box for a component.
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [conditions, setConditions] = useState('');
  const [allergies, setAllergies] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // This function runs when the form is submitted
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevents the page from refreshing
    setError('');
    setSuccess('');

    // Basic validation to ensure fields are not empty
    if (!name || !gender || !age || !weight || !height) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      // 'addDoc' is the firestore function to add a new document.
      // 'collection(db, 'patients')' tells firestore which collection we want to add to.
      await addDoc(collection(db, 'patients'), {
        name,
        gender,
        age: Number(age), // Convert age, weight, height to numbers
        initialWeight: Number(weight),
        height: Number(height),
        conditions,
        allergies,
        createdAt: serverTimestamp(), // Adds a server-side timestamp
      });

      // If successful, show a success message and clear the form
      setSuccess('Patient added successfully!');
      setName('');
      setGender('');
      setAge('');
      setWeight('');
      setHeight('');
      setConditions('');
      setAllergies('');

    } catch (err) {
      console.error(err);
      setError('Failed to add patient. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Add a New Patient</h2>
      <form onSubmit={handleAddPatient} className="space-y-4">
        {/* We create an input field for each piece of data */}
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" required />
        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2 border rounded" required>
          <option value="" disabled>Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <div className="grid grid-cols-3 gap-4">
          <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} className="p-2 border rounded" required />
          <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} className="p-2 border rounded" required />
          <input type="number" placeholder="Height (cm)" value={height} onChange={(e) => setHeight(e.target.value)} className="p-2 border rounded" required />
        </div>
        <textarea placeholder="Medical Conditions (e.g., Diabetes, Hypertension)" value={conditions} onChange={(e) => setConditions(e.target.value)} className="w-full p-2 border rounded" />
        <textarea placeholder="Allergies (e.g., Peanuts, Gluten)" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="w-full p-2 border rounded" />

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">{success}</p>}

        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add Patient</button>
      </form>
    </div>
  );
}