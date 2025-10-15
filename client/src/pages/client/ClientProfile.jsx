import React, { useState, useEffect } from 'react';
import { User, Download, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../../api';

const ClientProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    email: '',
    role: '',
    createdAt: '',
    updatedAt: ''
  });
  const [suivi, setSuivi] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to handle file downloads
  const handleDownload = async (filePath, fileName) => {
    try {
      const fullUrl = `${api.defaults.baseURL}${filePath}`;
      
      // First, check if the file exists
      const response = await fetch(fullUrl, { method: 'HEAD' });
      
      if (!response.ok) {
        toast.error('Le fichier n\'existe pas ou n\'est pas accessible');
        return;
      }

      // If file exists, trigger download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Téléchargement de ${fileName}...`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement du fichier');
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileAndSuivi();
    }
  }, [user]);

  const fetchProfileAndSuivi = async () => {
    try {
      // Get profile from auth context (already has user data)
      setProfile({
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });

      // Get suivi data to access CV/LM files
      try {
        const suiviRes = await api.get('/api/suivi/me', { withCredentials: true });
        setSuivi(suiviRes.data);
      } catch (e) {
        setSuivi(null); // No suivi data yet
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading profile data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Chargement du profil...</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-2">Informations de votre compte</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Compte Client</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Type de compte</p>
              <p className="font-medium text-gray-900 capitalize">{profile.role}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Statut</p>
              <p className="font-medium text-green-600">Actif</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Membre depuis</p>
              <p className="font-medium text-gray-900">
                {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Dernière mise à jour</p>
              <p className="font-medium text-gray-900">
                {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes Documents</h3>
          
          {suivi && (suivi.cvFile || suivi.lmFile) ? (
            <div className="space-y-3">
              {suivi.cvFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">CV</p>
                      <p className="text-sm text-gray-500">Curriculum Vitae</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(suivi.cvFile, 'CV.pdf')}
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </button>
                </div>
              )}

              {suivi.lmFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Lettre de Motivation</p>
                      <p className="text-sm text-gray-500">Cover Letter</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(suivi.lmFile, 'Lettre_de_Motivation.pdf')}
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Télécharger
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun document disponible pour le moment</p>
              <p className="text-sm">Vos documents apparaîtront ici une fois qu'ils seront prêts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
