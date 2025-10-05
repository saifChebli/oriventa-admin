import React, { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
import { MoreVertical, Eye, Download, Check, X, Trash } from "lucide-react";
import axios from "axios";
import ContactModal from "./components/ContactModal";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
// import ResumeDetailsModal from "./components/ResumeDetailsModal";

const Contact = () => {


  const {user} = useAuth()

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
      const response = await api.get("/api/contact/get-list" , { withCredentials: true });
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
        await api.patch(
          `/api/contact/${id}`,
          { isViewed: status }
        );
        getContacts();
      } catch (error) {
        console.error("Erreur maj status:", error);
      }
    };

    const handleDelete = async (id) => {
      try {
        if (window.confirm("Voulez-vous vraiment supprimer ce contact ?")){
        await api.delete(`/api/contact/delete-contact/${id}` , { withCredentials: true });
        getContacts();
}
      } catch (error) {
        console.error("Error deleting contact:", error);
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
          {user.role === "manager" && (
                        <Menu.Item
                          key="delete"
                          icon={<Trash size={16} />}
                          onClick={() => handleDelete(contact._id)}
                        >
                          Delete
                        </Menu.Item>
                      )}
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
