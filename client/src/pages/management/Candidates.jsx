import React, { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
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
import api from "../../../api";
import CommentModal from "./components/CommentModal";
import { useAuth } from "../../context/AuthContext";
const Candidates = () => {

  const  {user } = useAuth()

  const [dossierList, setDossierList] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  // Fetch dossiers from backend
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

  // Open/close details modal
  const openDetailsModal = (dossier) => {
    setSelectedDossier(dossier);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setSelectedDossier(null);
    setDetailsModalOpen(false);
  };

    const openCommentModal = (booking) => {
    setSelectedDossier(booking);
    setCommentModalOpen(true);
    setComments(booking.comments);
  }
  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedDossier(null);
  }
  // Status badge mapping
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

  // Actions for each dossier
  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(
        `/api/dossiers/update-candidate-status/${id}`,
        { status }
      );
      getDossiers();
    } catch (error) {
      console.error("Erreur maj status:", error);
    }
  };

  const handleDownload = async (dossierNumber, fullName) => {
  const url = `http://localhost:5000/api/dossiers/download-folder/${dossierNumber}/${fullName}`;
  
  // Trigger browser download
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${dossierNumber}_${fullName}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const handleDelete = async (id) => {
  try {
    if (window.confirm("Are you sure you want to delete this dossier?")){
    await api.delete(`/api/dossiers/delete-candidate/${id}`, { withCredentials: true });
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
              // onClick={() =>
              //   window.open(`https://admin.oriventa-pro-service.com/${resume.filePath}`, "_blank")
              // }
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
                Delete
              </Menu.Item>
            )}
    </Menu>
  );

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFullName, setFilterFullName] = useState("");

  const filteredDossiers = dossierList.filter((dossier) => {
    const statusMatches =
      filterStatus === "all" || dossier.status === filterStatus;
    const nameMatches =
      filterFullName === "" ||
      (dossier.fullName &&
        dossier.fullName.toLowerCase().includes(filterFullName.toLowerCase()));

    return statusMatches && nameMatches;
  });

  return (
    <div className="p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <h1 className="text-2xl font-bold">Dossiers Dashboard</h1>
        <p className="mt-1">Gérez les dossiers des clients et leurs documents.</p>
      </div>
       <div className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6 my-10">
     {/* Filter and search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 mb-8">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2">
              Statut:
            </label>
            <select
              id="filterStatus"
              className="border border-gray-300 rounded-md px-2 py-1"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">All</option>
              <option value="accepted">Confirmer</option>
              <option value="traite">En cours</option>
              <option value="comment">Commentaire</option>
              <option value="refuse">Refuser</option>
            </select>
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
            <input
              type="text"
              id="search"
              className="border w-full border-gray-300 rounded-md px-2 py-1 mx-2"
              placeholder="Search by client name ..."
              onChange={(e) => setfilterFullName(e.target.value)}
              value={filterFullName}
            />
          </div>
        </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg  shadow border border-gray-300 p-6">
        <table className="w-full border-collapse ">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Dossier ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Nom complet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDossiers.map((dossier) => (
              <tr key={dossier._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{dossier.dossierNumber}</td>
                <td className="px-6 py-4 text-sm">{dossier.fullName}</td>
                <td className="px-6 py-4 text-sm">{dossier.phone}</td>
                <td className="px-6 py-4 text-sm whitespace-wrap">{dossier.address}</td>
                <td className="px-6 py-4 text-sm">
                  {new Date(dossier.createdAt).toLocaleDateString()}
                </td>
                <td className="relative px-6 py-4">
                  {getStatusBadge(dossier.status)}
                {dossier.comment.length > 0 ? (
                                    <span
                                      onClick={() => {
                                        // setSelectedBooking(booking);
                                        openCommentModal(dossier);
                                      }}
                                      className="text-gray-600 hover:text-black absolute right-12 cursor-pointer"
                                    >
                                      <MessageSquare size={10} />
                                    </span> 
                                  ) : 
                                    null
                                  
                                  }

                </td>
                <td className="px-6 py-4">
                  <Dropdown overlay={actionMenu(dossier)} trigger={["click"]}>
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
          <CandidatesDetailsModal
              open={detailsModalOpen}
              onClose={closeDetailsModal}
              dossier={selectedDossier}
            />
                 <CommentModal url="/api/dossiers/add-comment" getBookings={getDossiers} consultation={selectedDossier} visible={commentModalOpen} onClose={closeCommentModal} />
           
    </div>
  );
};

export default Candidates;
