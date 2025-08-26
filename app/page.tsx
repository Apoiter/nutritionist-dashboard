'use client';

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../components/AuthContext';
import AddPatientForm from '../components/AddPatientForm';
import PatientList from '../components/PatientList';
import Link from 'next/link'; // Import Link

export default function HomePage() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nutritionist Dashboard</h1>
            <p className="text-sm text-gray-500">Logged in as {user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Add Settings Link */}
            <Link href="/settings" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Settings
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <AddPatientForm />
          </div>
          <div>
            <PatientList />
          </div>
        </div>
      </main>
    </div>
  );
}