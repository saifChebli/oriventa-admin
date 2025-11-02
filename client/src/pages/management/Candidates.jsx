import React, { useEffect, useState } from "react";
import { Dropdown, Menu, Pagination } from "antd";
import {
  MoreVertical,
  Eye,
  Check,
  X,
  MessageCircle,
  Info,
  MessageSquare,
  Download,
  Trash,
} from "lucide-react";
import CandidatesDetailsModal from "./components/CandidatesDetailsModal";
import CommentModal from "./components/CommentModal";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";

const Candidates = () => {
  const { user } = useAuth();
  const [dossierList, setDossierList] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comments, setComments] = useState([]);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFullName, setFilterFullName] = useState("");
  const [date, setDate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Simplified view: show only essential columns; details in modal
  const getDossiers = async () => {
    try {
      const response = await api.get("/api/dossiers");
      setDossierList(response.data);
    } catch (error) {
      console.error("Erreur de récupération des dossiers:", error);
    }
  };

  useEffect(() => {
    getDossiers();
  }, []);

  // Modal logic
  const openDetailsModal = (dossier) => {
    setSelectedDossier(dossier);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setSelectedDossier(null);
    setDetailsModalOpen(false);
  };

  const openCommentModal = (dossier) => {
    setSelectedDossier(dossier);
    setCommentModalOpen(true);
    setComments(dossier.comments);
  };
  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedDossier(null);
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      accepted: { color: "bg-green-100 text-green-700", label: "Confirmé" },
      pending: { color: "bg-orange-100 text-orange-700", label: "En attente" },
      comment: { color: "bg-blue-100 text-blue-700", label: "Commentaire" },
      traite: { color: "bg-purple-100 text-purple-700", label: "En cours" },
      refuse: { color: "bg-red-100 text-red-700", label: "Refusé" },
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

  // Actions
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/api/dossiers/update-candidate-status/${id}`, { status });
      getDossiers();
    } catch (error) {
      console.error("Erreur maj status:", error);
    }
  };

  const handleDownload = async (dossierNumber, fullName) => {
    try {
      // Ensure consistency with server: replace spaces with underscores
      const safeFullName = (fullName || "").replace(/\s+/g, "_");
      const encodedName = encodeURIComponent(safeFullName);
      const url = `${api.defaults.baseURL}/api/dossiers/download-folder/${encodeURIComponent(dossierNumber)}/${encodedName}`;

      // Optional HEAD check to surface clearer errors
      const headResp = await fetch(url, { method: 'HEAD' });
      if (!headResp.ok) {
        const msg = headResp.status === 404 ? 'Dossier introuvable à télécharger' : 'Erreur lors de la préparation du téléchargement';
        console.error('Download check failed:', headResp.status, headResp.statusText);
        // Use alert to avoid adding extra deps; replace with toast if available
        window.alert(msg);
        return;
      }

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${dossierNumber}_${safeFullName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erreur de téléchargement du dossier:', err);
      window.alert('Erreur de téléchargement. Veuillez réessayer.');
    }
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this dossier?")) {
        await api.delete(`/api/dossiers/delete-candidate/${id}`, {
          withCredentials: true,
        });
        getDossiers();
      }
    } catch (error) {
      console.error("Error deleting dossier:", error);
    }
  };

  const actionMenu = (dossier) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<Eye size={16} />}
        onClick={() => openDetailsModal(dossier)}
      >
        Voir détails
      </Menu.Item>
      <Menu.Item
        key="download"
        icon={<Download size={16} />}
        onClick={() => handleDownload(dossier.dossierNumber, dossier.fullName)}
      >
        Télécharger
      </Menu.Item>
      <Menu.Item
        key="accepted"
        icon={<Check size={16} />}
        onClick={() => handleUpdateStatus(dossier._id, "accepted")}
      >
        Confirmer
      </Menu.Item>
      <Menu.Item
        key="traite"
        icon={<Info size={16} />}
        onClick={() => handleUpdateStatus(dossier._id, "traite")}
      >
        En cours
      </Menu.Item>
      <Menu.Item
        key="comment"
        icon={<MessageCircle size={16} />}
        onClick={() => openCommentModal(dossier)}
      >
        Commentaire
      </Menu.Item>
      <Menu.Item
        key="refuse"
        icon={<X size={16} />}
        onClick={() => handleUpdateStatus(dossier._id, "refuse")}
      >
        Refuser
      </Menu.Item>
      {user.role === "manager" && (
        <Menu.Item
          key="delete"
          icon={<Trash size={16} />}
          onClick={() => handleDelete(dossier._id)}
        >
          Supprimer
        </Menu.Item>
      )}
    </Menu>
  );

  // Filter logic
  const filteredDossiers = dossierList.filter((dossier) => {
        let comment = dossier.comment;
    const statusMatches = filterStatus === "all" || dossier.status === filterStatus || (filterStatus === "comment" && comment && comment.length > 0);

    const search = filterFullName.trim().toLowerCase();
    const nameMatches =
      search === "" ||
      (dossier.fullName && dossier.fullName.toLowerCase().includes(search)) ||
      (dossier.phone && dossier.phone.toLowerCase().includes(search)) ||
      (dossier.address && dossier.address.toLowerCase().includes(search));
    const dateMatches =
      date === "" ||
      (dossier.createdAt &&
        new Date(dossier.createdAt).toISOString().split("T")[0] === date);
    return statusMatches && nameMatches && dateMatches;
  });

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDossiers = filteredDossiers.slice(
    startIndex,
    startIndex + pageSize
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="rounded-lg shadow border border-gray-300 p-6 bg-white">
        <h1 className="text-2xl font-bold">Dossiers Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Gérez les dossiers des clients et leurs documents.
        </p>
      </div>

      {/* Filters */}
  <div className="rounded-lg shadow border border-gray-300 p-6 my-10 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2 font-medium text-sm">
              Statut:
            </label>
            <select
              id="filterStatus"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">Tous</option>
              <option value="accepted">Confirmé</option>
              <option value="traite">En cours</option>
              <option value="comment">Commentaire</option>
              <option value="refuse">Refusé</option>
            </select>
          </div>

          <div className="flex items-center col-span-2">
            <label htmlFor="search">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
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
            <input
              type="text"
              id="search"
              className="border w-full border-gray-300 rounded-md px-2 py-1 mx-2"
              placeholder="Rechercher par nom..."
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
          
          {/* Advanced columns toggle */}
          <div className="flex items-center col-span-1">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} />
              Afficher colonnes avancées
            </label>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-lg overflow-hidden border border-gray-200 ${showAdvanced ? 'overflow-x-auto' : ''}`}>
          <table className={`w-full border-collapse ${showAdvanced ? 'min-w-[1000px]' : ''} table-auto`}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Dossier ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Nom complet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Téléphone</th>
                {showAdvanced && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Adresse</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Naissance</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Métier</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">A un CV</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Langues</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Diplômes</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Stages</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Associations</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Compétences</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Remarques</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Pièces</th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDossiers.length > 0 ? (
                paginatedDossiers.map((dossier) => (
                  <tr key={dossier._id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors">
                    <td className="px-6 py-3 text-sm whitespace-nowrap">
                      {dossier.dossierNumber}
                    </td>
                    <td className="px-6 py-3 text-sm truncate max-w-[220px]" title={dossier.fullName || ''}>{dossier.fullName}</td>
                    <td className="px-6 py-3 text-sm truncate max-w-[220px]" title={dossier.email || ''}>{dossier.email}</td>
                    <td className="px-6 py-3 text-sm whitespace-nowrap">{dossier.phone}</td>
                    {showAdvanced && (
                      <>
                        <td className="px-6 py-3 text-sm truncate max-w-[260px]" title={dossier.address || ''}>{dossier.address}</td>
                        <td className="px-6 py-3 text-sm">{dossier.birthDate ? new Date(dossier.birthDate).toLocaleDateString('fr-FR') : '-'}</td>
                        <td className="px-6 py-3 text-sm">{dossier.jobType || '-'}</td>
                        <td className="px-6 py-3 text-sm">{dossier.hasCV || '-'}</td>
                        <td className="px-6 py-3 text-sm truncate max-w-[200px]" title={dossier.languages || ''}>{dossier.languages || '-'}</td>
                        <td className="px-6 py-3 text-sm truncate max-w-[200px]" title={dossier.diplomas || ''}>{dossier.diplomas || '-'}</td>
                        <td className="px-6 py-3 text-sm truncate max-w-[200px]" title={dossier.stages || ''}>{dossier.stages || '-'}</td>
                        <td className="px-6 py-3 text-sm truncate max-w-[200px]" title={dossier.associations || ''}>{dossier.associations || '-'}</td>
                        <td className="px-6 py-3 text-sm truncate max-w-[200px]" title={dossier.skills || ''}>{dossier.skills || '-'}</td>
                        <td className="px-6 py-3 text-sm truncate max-w-[240px]" title={dossier.remarks || ''}>{dossier.remarks ? (dossier.remarks.length > 40 ? `${dossier.remarks.slice(0,40)}...` : dossier.remarks) : '-'}</td>
                        <td className="px-6 py-3 text-sm space-x-2 whitespace-nowrap">
                          {dossier.cvFile && (
                            <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.cvFile}`} target="_blank" rel="noreferrer">CV</a>
                          )}
                          {dossier.diplomasFiles && (
                            <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.diplomasFiles}`} target="_blank" rel="noreferrer">Diplômes</a>
                          )}
                          {dossier.passportPhoto && (
                            <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.passportPhoto}`} target="_blank" rel="noreferrer">Passeport</a>
                          )}
                          {dossier.photoPersonne && (
                            <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.photoPersonne}`} target="_blank" rel="noreferrer">Photo</a>
                          )}
                          {dossier.attestationsTravail && (
                            <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.attestationsTravail}`} target="_blank" rel="noreferrer">Attest. Travail</a>
                          )}
                          {dossier.attestationsStage && (
                            <a className="text-blue-600 underline" href={`${api.defaults.baseURL}${dossier.attestationsStage}`} target="_blank" rel="noreferrer">Attest. Stage</a>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-6 py-3 text-sm whitespace-nowrap">
                      {new Date(dossier.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    </td>
                    <td className="relative px-6 py-3 text-sm">
                      {getStatusBadge(dossier.status)}
                      {dossier.comment?.length > 0 && (
                        <span
                          onClick={() => openCommentModal(dossier)}
                          className="text-gray-600 hover:text-black absolute right-10 cursor-pointer"
                        >
                          <MessageSquare size={12} />
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <Dropdown overlay={actionMenu(dossier)} trigger={["click"]}>
                        <button className="text-gray-600 hover:text-black">
                          <MoreVertical size={18} />
                        </button>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    Aucun dossier trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-6">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredDossiers.length}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            pageSizeOptions={["5", "8", "10", "20"]}
          />
        </div>
      </div>

      {/* Modals */}
      <CandidatesDetailsModal
        open={detailsModalOpen}
        onClose={closeDetailsModal}
        dossier={selectedDossier}
      />
      <CommentModal
        url="/api/dossiers/add-comment"
        getBookings={getDossiers}
        consultation={selectedDossier}
        visible={commentModalOpen}
        onClose={closeCommentModal}
      />
    </div>
  );
};

export default Candidates;
