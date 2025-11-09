import React, { useEffect, useState } from "react";
import { Dropdown, Menu, Pagination } from "antd";
import { MoreVertical, Eye, Check, X, Trash } from "lucide-react";
import api from "../../../api";
import ContactModal from "./components/ContactModal";
import { useAuth } from "../../context/AuthContext";

const Contact = () => {
  const { user } = useAuth();
  const [contactList, setContactList] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterName, setFilterName] = useState("");
  const [date, setDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Fetch contacts
  const getContacts = async () => {
    try {
      const response = await api.get("/api/contact/get-list", { withCredentials: true });
      setContactList(response.data);
      setFilteredContacts(response.data);
    } catch (error) {
      console.error("Erreur de récupération des contacts:", error);
    }
  };

  useEffect(() => {
    getContacts();
  }, []);

  // Delete contact
  const handleDelete = async (id) => {
    try {
      if (window.confirm("Voulez-vous vraiment supprimer ce contact ?")) {
        await api.delete(`/api/contact/delete-contact/${id}`, { withCredentials: true });
        getContacts();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du contact:", error);
    }
  };

  // Update status (Viewed / Not Viewed)
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/api/contact/${id}`, { isViewed: status });
      getContacts();
    } catch (error) {
      console.error("Erreur maj status:", error);
    }
  };

  // Modal
  const openDetailsModal = (contact) => {
    setSelectedContact(contact);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setSelectedContact(null);
    setDetailsModalOpen(false);
  };

  // Filter logic
  useEffect(() => {
    let filtered = contactList;

    if (filterStatus !== "all") {
      filtered = filtered.filter((contact) =>
        filterStatus === "viewed" ? contact.isViewed : !contact.isViewed
      );
    }

    if (filterName.trim() !== "") {
      filtered = filtered.filter((contact) =>
        contact.name?.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (date) {
      filtered = filtered.filter(
        (contact) => new Date(contact.createdAt).toISOString().split("T")[0] === date
      );
    }

    setFilteredContacts(filtered);
    setCurrentPage(1);
  }, [filterStatus, filterName, date, contactList]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredContacts.slice(startIndex, startIndex + itemsPerPage);

  // Status badge
  const getStatusBadge = (isViewed) => {
    const statusConfig = isViewed
      ? { color: "bg-green-100 text-green-700", label: "Vu" }
      : { color: "bg-red-100 text-red-700", label: "Non vu" };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  // Dropdown menu
  const actionMenu = (contact) => (
    <Menu>
      <Menu.Item key="view" icon={<Eye size={16} />} onClick={() => openDetailsModal(contact)}>
        Voir détails
      </Menu.Item>
      <Menu.Item key="approve" icon={<Check size={16} />} onClick={() => handleUpdateStatus(contact._id, true)}>
        Marquer comme vu
      </Menu.Item>
      <Menu.Item key="reject" icon={<X size={16} />} onClick={() => handleUpdateStatus(contact._id, false)}>
        Marquer comme non vu
      </Menu.Item>
      {user?.role === "manager" && (
        <Menu.Item key="delete" icon={<Trash size={16} />} onClick={() => handleDelete(contact._id)}>
          Supprimer
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <h1 className="text-2xl font-bold">Contacts Dashboard</h1>
        <p className="mt-1">Gérez les messages de contact reçus.</p>
      </div>

      <div className="rounded-lg shadow border border-gray-300 p-6 my-10">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-start">
            <label htmlFor="filterStatus" className="mr-2">
              Statut :
            </label>
            <select
              id="filterStatus"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">Tous</option>
              <option value="viewed">Vu</option>
              <option value="notViewed">Non vu</option>
            </select>
          </div>

          <div className="flex flex-col items-start col-span-2">
            <label htmlFor="search" className="text-gray-600 mr-2">
              Recherche :
            </label>
            <input
              type="text"
              id="search"
              className="border w-full border-gray-300 rounded-md px-3 py-1"
              placeholder="Rechercher par nom ..."
              onChange={(e) => setFilterName(e.target.value)}
              value={filterName}
            />
          </div>

          <div className="flex items-center col-span-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border w-full border-gray-300 rounded-md px-2 py-1 mx-2"
            />
          </div>
        </div>

        {/* Advanced columns toggle */}
        <div className="flex items-center col-span-1 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
            />
            Afficher colonnes avancées
          </label>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className={`w-full border-collapse ${showAdvanced ? 'min-w-[1000px]' : 'min-w-[700px]'}`}>
            <thead className="bg-gray-50">
              <tr>
                {showAdvanced && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Nom complet</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Téléphone</th>
                {showAdvanced && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Message</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                {showAdvanced && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Dernière mise à jour</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    {showAdvanced && (
                      <td className="px-6 py-4 text-sm whitespace-nowrap">{contact._id}</td>
                    )}
                    <td className="px-6 py-4 text-sm">{contact.name}</td>
                    <td className="px-6 py-4 text-sm">{contact.email}</td>
                    <td className="px-6 py-4 text-sm">{contact.phone}</td>
                    {showAdvanced && (
                      <td className="px-6 py-4 text-sm truncate max-w-[320px]" title={contact.message || ''}>
                        {contact.message}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm">
                      {new Date(contact.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    {showAdvanced && (
                      <td className="px-6 py-4 text-sm">
                        {new Date(contact.updatedAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    )}
                    <td className="px-6 py-4">{getStatusBadge(contact.isViewed)}</td>
                    <td className="px-6 py-4">
                      <Dropdown overlay={actionMenu(contact)} trigger={["click"]}>
                        <button className="text-gray-600 hover:text-black">
                          <MoreVertical size={18} />
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    Aucun contact trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Pagination
            current={currentPage}
            total={filteredContacts.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Modal */}
      <ContactModal open={detailsModalOpen} onClose={closeDetailsModal} contact={selectedContact} />
    </div>
  );
};

export default Contact;
