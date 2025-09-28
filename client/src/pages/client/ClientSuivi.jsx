import React, { useState } from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, Calendar, Download } from 'lucide-react';

const ClientSuivi = () => {
  const [selectedApplication, setSelectedApplication] = useState(null);

  // Mock data for applications
  const applications = [
    {
      id: 1,
      title: 'Work Permit Application',
      status: 'in_review',
      statusText: 'In Review',
      submittedDate: '2024-01-10',
      lastUpdate: '2024-01-15',
      progress: 75,
      documents: [
        { name: 'Passport Copy', status: 'approved', uploaded: '2024-01-10' },
        { name: 'Employment Contract', status: 'pending', uploaded: '2024-01-12' },
        { name: 'Medical Certificate', status: 'approved', uploaded: '2024-01-11' },
        { name: 'Bank Statement', status: 'rejected', uploaded: '2024-01-13' }
      ],
      timeline: [
        { date: '2024-01-10', event: 'Application submitted', status: 'completed' },
        { date: '2024-01-11', event: 'Initial review started', status: 'completed' },
        { date: '2024-01-12', event: 'Documents under review', status: 'completed' },
        { date: '2024-01-15', event: 'Additional documents requested', status: 'current' },
        { date: null, event: 'Final approval', status: 'pending' }
      ]
    },
    {
      id: 2,
      title: 'Visa Application',
      status: 'approved',
      statusText: 'Approved',
      submittedDate: '2024-01-05',
      lastUpdate: '2024-01-20',
      progress: 100,
      documents: [
        { name: 'Visa Application Form', status: 'approved', uploaded: '2024-01-05' },
        { name: 'Passport Photos', status: 'approved', uploaded: '2024-01-05' },
        { name: 'Travel Insurance', status: 'approved', uploaded: '2024-01-06' }
      ],
      timeline: [
        { date: '2024-01-05', event: 'Application submitted', status: 'completed' },
        { date: '2024-01-08', event: 'Documents verified', status: 'completed' },
        { date: '2024-01-15', event: 'Interview scheduled', status: 'completed' },
        { date: '2024-01-20', event: 'Visa approved', status: 'completed' }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
      case 'in_review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Suivi des Dossiers</h1>
        <p className="text-gray-600 mt-2">Track the progress of your applications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications List */}
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApplication(app)}
              className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow ${
                selectedApplication?.id === app.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{app.title}</h3>
                  <p className="text-sm text-gray-600">Submitted: {app.submittedDate}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(app.status)}`}>
                  {app.statusText}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{app.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${app.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                Last update: {app.lastUpdate}
              </div>
            </div>
          ))}
        </div>

        {/* Application Details */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {selectedApplication ? (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedApplication.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Status: {selectedApplication.statusText}</span>
                  <span>•</span>
                  <span>Progress: {selectedApplication.progress}%</span>
                </div>
              </div>

              {/* Documents Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                <div className="space-y-3">
                  {selectedApplication.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">Uploaded: {doc.uploaded}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(doc.status)}`}>
                          {doc.status}
                        </span>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  {selectedApplication.timeline.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mr-4">
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.event}</p>
                        {item.date && (
                          <p className="text-xs text-gray-500">{item.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 flex items-center justify-center h-96 text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an application to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientSuivi;
