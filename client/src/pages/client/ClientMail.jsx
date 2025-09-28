import React, { useState } from 'react';
import { Mail, Send, Reply, Archive, Trash2, Search } from 'lucide-react';

const ClientMail = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Mock data for messages
  const messages = {
    inbox: [
      {
        id: 1,
        from: 'Support Team',
        subject: 'Application Status Update',
        preview: 'Your application has been reviewed and is now in the final processing stage...',
        date: '2024-01-15',
        unread: true
      },
      {
        id: 2,
        from: 'Consultation Team',
        subject: 'Document Request',
        preview: 'We need additional documents to complete your application...',
        date: '2024-01-14',
        unread: true
      },
      {
        id: 3,
        from: 'Admin',
        subject: 'Welcome to Oriventa Services',
        preview: 'Welcome! Your account has been created successfully...',
        date: '2024-01-13',
        unread: false
      }
    ],
    sent: [
      {
        id: 4,
        to: 'Support Team',
        subject: 'Question about my application',
        preview: 'I have a question regarding the status of my application...',
        date: '2024-01-14',
        unread: false
      }
    ]
  };

  const tabs = [
    { id: 'inbox', label: 'Inbox', count: messages.inbox.filter(m => m.unread).length },
    { id: 'sent', label: 'Sent', count: 0 },
    { id: 'archived', label: 'Archived', count: 0 }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with our team</p>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Header with tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex h-96">
          {/* Message list */}
          <div className="w-1/3 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="overflow-y-auto">
              {messages[activeTab]?.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm text-gray-900">
                      {activeTab === 'sent' ? message.to : message.from}
                    </span>
                    <span className="text-xs text-gray-500">{message.date}</span>
                  </div>
                  <h3 className="font-medium text-sm text-gray-900 mb-1">{message.subject}</h3>
                  <p className="text-xs text-gray-600 line-clamp-2">{message.preview}</p>
                  {message.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Message content */}
          <div className="flex-1">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Reply className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Archive className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span>
                      {activeTab === 'sent' ? `To: ${selectedMessage.to}` : `From: ${selectedMessage.from}`}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{selectedMessage.date}</span>
                  </div>
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedMessage.preview}
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      This is a detailed message content. In a real application, this would contain
                      the full message body with proper formatting and any attachments.
                    </p>
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Send className="h-4 w-4 mr-2" />
                      Forward
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a message to view</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientMail;
