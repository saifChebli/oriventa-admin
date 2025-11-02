import React, { useEffect, useState } from "react";
import { Dropdown, Menu, Pagination } from "antd";
import { MoreVertical, Eye, Check, X, Trash } from "lucide-react";
import api from "../../../api";
import ResumeDetailsModal from "./components/ResumeDetailsModal";
import { useAuth } from "../../context/AuthContext";

const Resume = () => {
  const [resumeList, setResumeList] = useState([]);
  const [filteredResumes, setFilteredResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { user } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFullName, setFilterFullName] = useState("");
  const [date, setDate] = useState("");
  // Simplified view to avoid horizontal scroll; full details in modal

  // Fetch resumes from backend
  const getResumes = async () => {
    try {
      const response = await api.get("/api/creation", { withCredentials: true });
  const [showAdvanced, setShowAdvanced] = useState(false);
      setResumeList(response.data);
      setFilteredResumes(response.data);
    } catch (error) {
      console.error("Erreur de récupération des CV:", error);
    }
  };

  useEffect(() => {
    getResumes();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    try {
      if (window.confirm("Voulez-vous vraiment supprimer ce CV ?")) {
        await api.delete(`/api/creation/delete-resume/${id}`, { withCredentials: true });
        getResumes();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du CV:", error);
    }
  };

  // Handle Status Update
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/api/creation/update-status/${id}`, { status });
      getResumes();
    } catch (error) {
      console.error("Erreur maj status:", error);
    }
  };

  // Handle Modal
  const openDetailsModal = (resume) => {
    setSelectedResume(resume);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setSelectedResume(null);
    setDetailsModalOpen(false);
  };

  // Filter Logic
  useEffect(() => {
    let filtered = resumeList;

    if (filterStatus !== "all") {
      filtered = filtered.filter((resume) => resume.status === filterStatus);
    }

    if (filterFullName.trim() !== "") {
      const search = filterFullName.trim().toLowerCase();
      filtered = filtered.filter((resume) =>
        resume.fullName?.toLowerCase().includes(search) ||
        resume.phone?.toLowerCase().includes(search) ||
        resume.address?.toLowerCase().includes(search) ||
        resume.email?.toLowerCase().includes(search)
      );
    }

    if (date) {
      filtered = filtered.filter(
        (resume) =>
          new Date(resume.createdAt).toISOString().split("T")[0] === date
      );
    }

    setFilteredResumes(filtered);
    setCurrentPage(1);
  }, [filterStatus, filterFullName, resumeList , date]);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredResumes.slice(startIndex, startIndex + itemsPerPage);

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      accepted: { color: "bg-green-100 text-green-700", label: "Approuvé" },
      pending: { color: "bg-orange-100 text-orange-700", label: "En attente" },
      refuse: { color: "bg-red-100 text-red-700", label: "Rejeté" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Dropdown menu
  const actionMenu = (resume) => (
    <Menu>
      <Menu.Item key="view" icon={<Eye size={16} />} onClick={() => openDetailsModal(resume)}>
        Voir détails
      </Menu.Item>
      <Menu.Item
        key="approve"
        icon={<Check size={16} />}
        onClick={() => handleUpdateStatus(resume._id, "accepted")}
      >
        Approuver
      </Menu.Item>
      <Menu.Item
        key="reject"
        icon={<X size={16} />}
        onClick={() => handleUpdateStatus(resume._id, "refuse")}
      >
        Rejeter
      </Menu.Item>
      {user?.role === "manager" && (
        <Menu.Item key="delete" icon={<Trash size={16} />} onClick={() => handleDelete(resume._id)}>
          Supprimer
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <div className="p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <h1 className="text-2xl font-bold">Resumes Dashboard</h1>
        <p className="mt-1">Gérez les CVs des candidats.</p>
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
              <option value="accepted">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="refuse">Rejeté</option>
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
              onChange={(e) => setFilterFullName(e.target.value)}
              value={filterFullName}
            />
          </div>
          <div className="flex items-center col-span-2">
            <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
             type="date"
             name="" id="search" 
             className="border w-full border-gray-300 rounded-md px-2 py-1 mx-2"
              placeholder="Rechercher par date..." />
          </div>
          
        </div>

        {/* Table */}
        <div className="rounded-lg overflow-hidden border border-gray-200">
          <table className="w-full border-collapse table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Nom complet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Téléphone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentData.length > 0 ? (
                currentData.map((resume) => (
                  <tr key={resume._id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-3">{resume._id}</td>
                    <td className="px-6 py-3 truncate" title={resume.fullName || ''}>{resume.fullName}</td>
                    <td className="px-6 py-3 truncate" title={resume.email || ''}>{resume.email}</td>
                    <td className="px-6 py-3 whitespace-nowrap">{resume.phone}</td>
                    <td className="px-6 py-3">
                      {new Date(resume.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" , hour: '2-digit', minute:'2-digit' })}
                    </td>
                    <td className="px-6 py-3">{getStatusBadge(resume.status)}</td>
                    <td className="px-6 py-3">
                      <Dropdown overlay={actionMenu(resume)} trigger={["click"]}>
                        <button className="text-gray-600 hover:text-black">
                          <MoreVertical size={18} />
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    Aucun CV trouvé.
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
            total={filteredResumes.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Modal */}
      <ResumeDetailsModal open={detailsModalOpen} onClose={closeDetailsModal} resume={selectedResume} />
    </div>
  );
};

export default Resume;
