import React, { useEffect, useState } from 'react';
import { CheckCircle, FileText, Download } from 'lucide-react';
import api from '../../../api';

const ClientSuivi = () => {
  const [suivi, setSuivi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuivi = async () => {
      try {
        const res = await api.get('/api/suivi/me', { withCredentials: true });
        setSuivi(res.data);
      } catch (e) {
        setSuivi(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSuivi();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Chargement du suivi...</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mon Suivi</h1>
        <p className="text-gray-600 mt-2">Les dernières nouvelles de votre dossier</p>
      </div>

      <div className="space-y-4 max-w-3xl">
        {/* 1. Consultation gratuite */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium">Consultation gratuite</p>
            <p className="text-sm text-gray-500">Première étape</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${suivi?.consultationValidated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {suivi?.consultationValidated ? 'Validé' : 'En attente'}
          </span>
        </div>

        {/* 2. Paiement reçu */}
        <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
          <div>
            <p className="font-medium">Paiement reçu</p>
            <p className="text-sm text-gray-500">Confirmation du paiement</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${suivi?.paymentReceived ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {suivi?.paymentReceived ? 'Validé' : 'En attente'}
          </span>
        </div>

        {/* 3. Destination */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <p className="font-medium">Destination</p>
          <p className="text-sm text-gray-700 mt-1">{suivi?.destination || 'Non définie'}</p>
        </div>

        {/* 4. Création CV et Lettre */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="font-medium">Création CV et Lettre</p>
            <span className={`px-3 py-1 rounded-full text-sm ${suivi?.cvLetterCreated ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {suivi?.cvLetterCreated ? 'Validé' : 'En attente'}
            </span>
          </div>
          <div className="flex gap-4 mt-3">
            {suivi?.cvFile && (
              <a href={suivi.cvFile} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 underline">
                <Download className="h-4 w-4 mr-1" /> Télécharger CV
              </a>
            )}
            {suivi?.lmFile && (
              <a href={suivi.lmFile} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 underline">
                <Download className="h-4 w-4 mr-1" /> Télécharger LM
              </a>
            )}
          </div>
        </div>

        {/* 5. Postulation */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg">
          <p className="font-medium">Postulation</p>
          <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{suivi?.applicationNotes || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientSuivi;
