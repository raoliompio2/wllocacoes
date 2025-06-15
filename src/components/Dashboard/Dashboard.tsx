import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase, testConnection } from '../../utils/supabaseClient';
import ClientDashboard from './ClientDashboard';
import OwnerDashboard from './OwnerDashboard';
import { AlertCircle } from 'lucide-react';
import DashboardSkeleton from './DashboardSkeleton';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [role, setRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getOrCreateProfile = async () => {
      try {
        if (!user) {
          setError('No user found. Please log in again.');
          setLoading(false);
          return;
        }

        // Test Supabase connection first
        const isConnected = await testConnection();
        if (!isConnected) {
          throw new Error('Unable to connect to the database. Please check your internet connection.');
        }

        // First try to get the existing profile
        let { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // If no profile exists, create one with default role 'cliente'
        if (error && error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                role: 'cliente',
                theme_preferences: {
                  mode: 'light',
                  primaryColor: '#1976d2'
                }
              }
            ])
            .select('role')
            .single();

          if (createError) {
            throw new Error(`Failed to create profile: ${createError.message}`);
          }
          profile = newProfile;
        } else if (error) {
          throw new Error(`Failed to fetch profile: ${error.message}`);
        }

        setRole(profile?.role || 'cliente');
        setError(null);
      } catch (error) {
        console.error('Error loading or creating user profile:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        // Set default role on error to prevent UI from breaking
        setRole('cliente');
      } finally {
        setLoading(false);
      }
    };

    getOrCreateProfile();
  }, [user]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return role === 'proprietario' ? <OwnerDashboard /> : <ClientDashboard />;
};

export default Dashboard;