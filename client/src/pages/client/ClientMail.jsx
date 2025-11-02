import React from 'react';
import { ExternalLink, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientMail = () => {
  const { user } = useAuth();
  const webmailUrl = 'https://mail.oriventa-pro-service.tn/webmail';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
        <p className="text-gray-600 mt-2">L’accès à vos emails se fait désormais via notre webmail.</p>
      </div>

      <div className="max-w-3xl bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Consulter vos emails</h2>
            <p className="text-gray-600 mt-1">
              Utilisez le bouton ci-dessous pour ouvrir le webmail.
              {user?.email && (
                <>
                  {' '}Votre identifiant: <span className="font-medium">{user.email}</span>.
                </>
              )}
            </p>
            <a
              href={webmailUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir le webmail
            </a>
            <p className="text-sm text-gray-500 mt-3">Astuce: Ajoutez cette page à vos favoris pour un accès rapide.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMail;
