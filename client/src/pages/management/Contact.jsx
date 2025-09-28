import React, { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
import { MoreVertical, Eye, Download, Check, X } from "lucide-react";
import axios from "axios";
import ContactModal from "./components/ContactModal";
// import ResumeDetailsModal from "./components/ResumeDetailsModal";

const Contact = () => {
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

   const openDetailsModal = (contact) => {
    setSelectedContact(contact);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setSelectedContact(null);
    setDetailsModalOpen(false);
  };
  // Fetch contacts from backend
  const getContacts = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/contact/get-list" , { withCredentials: true });
      setContactList(response.data);
    } catch (error) {
      console.error("Erreur de récupération des Contacts:", error);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

   const handleUpdateStatus = async (id, status) => {
      try {
        await axios.patch(
          `http://localhost:5000/api/contact/${id}`,
          { isViewed: status }
        );
        getContacts();
      } catch (error) {
        console.error("Erreur maj status:", error);
      }
    };
    

    const actionMenu = (contact) => (
        <Menu>
          <Menu.Item
            key="view"
            icon={<Eye size={16} />}
            onClick={() => openDetailsModal(contact)}
          >
            Voir détails
          </Menu.Item>
          <Menu.Item
            key="approve"
            icon={<Check size={16} />}
            onClick={() => handleUpdateStatus(contact._id, true)}
          >
            Viewed
          </Menu.Item>
          <Menu.Item
            key="reject"
            icon={<X size={16} />}
            onClick={() => handleUpdateStatus(contact._id, false)}
          >
            Not Viewed
          </Menu.Item>
        </Menu>
      );

 const getStatusBadge = (isViewed) => {
    if (isViewed) {
      return <span className="text-green-500 py-1 px-2  text-xs rounded-full bg-green-200 wrap-break-word">Viewed</span>;
    } else {
      return <span className="text-red-500 py-1 px-2  text-xs rounded-full bg-red-200 wrap-break-word">Not Viewed</span>;
    }
  };



  return (
    <div className="p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <h1 className="text-2xl font-bold">Contacts Dashboard</h1>
        <p className="mt-1">Gérez les Contacts et les messages</p>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6 my-10">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 mb-8">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2">
              Statut:
            </label>
            {/* <select
              id="filterStatus"
              className="border border-gray-300 rounded-md px-2 py-1"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">All</option>
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
            </select> */}
          </div>

          <div className="flex items-center">
            <label htmlFor="search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </label>
            {/* <input
              type="text"
              id="search"
              className="border w-full border-gray-300 rounded-md px-2 py-1 mx-2"
              placeholder="Search by name ..."
              onChange={(e) => setFilterFullName(e.target.value)}
              value={filterFullName}
            /> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Contact ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Nom complet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {contactList.map((contact) => (
                <tr key={contact._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{contact._id}</td>
                  <td className="px-6 py-4 text-sm">{contact.name}</td>
                  <td className="px-6 py-4 text-sm">{contact.email}</td>
                  <td className="px-6 py-4 text-sm">{contact.phone}</td>
                  <td className="px-6 py-4 text-sm">{contact.message.length > 20 ? `${contact.message.slice(0, 20)}...` : contact.message.slice(0, 20)}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(contact.createdAt).toLocaleDateString() || "N/A"}
                  </td>
                  <td className=" ">{getStatusBadge(contact.isViewed)}</td>
                  <td className="px-6 py-4">
                    <Dropdown overlay={actionMenu(contact)} trigger={["click"]}>
                      <button className="text-gray-600 hover:text-black">
                        <MoreVertical size={18} />
                      </button>
                    </Dropdown>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <ContactModal
        open={detailsModalOpen}
        onClose={closeDetailsModal}
        contact={selectedContact}
      />
    </div>
  );
};

export default Contact;
