import React, { useEffect, useState } from "react";
import { Dropdown, Menu, Pagination } from "antd";
import {
  MoreVertical,
  Eye,
  Check,
  Info,
  MessageCircle,
  X,
  MessageSquare,
  Trash,
} from "lucide-react";
import DetailsModal from "./components/DetailModal";
import CommentModal from "./components/CommentModal";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";

const Clients = () => {
  const { user } = useAuth();
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFullName, setfilterFullName] = useState("");
  const [date, setDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);

  const getBookings = async () => {
    try {
      const response = await api.get("/api/consultations");
      setBookingList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getBookings();
  }, []);

  const openDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedBooking(null);
  };

  const openCommentModal = (booking) => {
    setSelectedBooking(booking);
    setCommentModalOpen(true);
  };

  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: "bg-green-100 text-green-700", label: "Confirmé" },
      pending: { color: "bg-orange-100 text-orange-700", label: "En attente" },
      comment: { color: "bg-blue-100 text-blue-700", label: "Commentaire" },
      unreachable: { color: "bg-blue-100 text-blue-700", label: "Injoignable" },
      decline: { color: "bg-red-100 text-red-700", label: "Refusé" },
    };
    const config = statusConfig[status] || statusConfig["pending"];
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // --- ACTION HANDLERS ---
  const handleAccept = async (id) => {
    await api.patch(`/api/consultations/update-consultation-status/${id}`, {
      status: "confirmed",
    });
    getBookings();
  };

  const handleDecline = async (id) => {
    await api.patch(`/api/consultations/update-consultation-status/${id}`, {
      status: "decline",
    });
    getBookings();
  };

  const handleInjoignable = async (id) => {
    await api.patch(`/api/consultations/update-consultation-status/${id}`, {
      status: "unreachable",
    });
    getBookings();
  };

  const handleDelete = async (id) => {
    try {
      if (window.confirm("Êtes-vous sûr de vouloir supprimer cette consultation ?")) {
        await api.delete(`/api/consultations/delete-consultation/${id}`, {
          withCredentials: true,
        });
        getBookings();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const actionMenu = (booking) => (
    <Menu>
      <Menu.Item key="view" icon={<Eye size={16} />} onClick={() => openDetailsModal(booking)}>
        Voir Détails
      </Menu.Item>
      <Menu.Item key="confirm" icon={<Check size={16} />} onClick={() => handleAccept(booking._id)}>
        Confirmer
      </Menu.Item>
      <Menu.Item
        key="unreachable"
        icon={<Info size={16} />}
        onClick={() => handleInjoignable(booking._id)}
      >
        Injoignable
      </Menu.Item>
      <Menu.Item
        key="comment"
        icon={<MessageCircle size={16} />}
        onClick={() => openCommentModal(booking)}
      >
        Commentaire
      </Menu.Item>
      <Menu.Item key="decline" icon={<X size={16} />} onClick={() => handleDecline(booking._id)}>
        Refuser
      </Menu.Item>
      {user.role === "manager" && (
        <Menu.Item key="delete" icon={<Trash size={16} />} onClick={() => handleDelete(booking._id)}>
          Supprimer
        </Menu.Item>
      )}
    </Menu>
  );

  // --- FILTERED DATA ---
  const filteredBookings = bookingList.filter((booking) => {
    let comment = booking.comment;
    const statusMatches = filterStatus === "all" || booking.status === filterStatus || (filterStatus === "comment" && comment && comment.length > 0);
    const search = filterFullName.trim().toLowerCase();
    const nameMatches =
      search === "" ||
      (booking.fullName && booking.fullName.toLowerCase().includes(search)) ||
      (booking.phone && booking.phone.toLowerCase().includes(search)) ||
      (booking.address && booking.address.toLowerCase().includes(search));
         const dateMatches =
      date === "" ||
      (booking.createdAt &&
        new Date(booking.createdAt).toISOString().split("T")[0] === date);
    return statusMatches && nameMatches && dateMatches;
  });

  // --- PAGINATION LOGIC ---
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-4 sm:p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <h1 className="text-2xl font-bold">Consultations Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Gérez et suivez vos consultations ici.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg shadow border border-gray-300 p-4 my-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label htmlFor="filterStatus" className="text-sm font-medium mb-1">
              Statut :
            </label>
            <select
              id="filterStatus"
              className="border border-gray-300 rounded-md px-2 py-1"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="unreachable">Injoignable</option>
              <option value="confirmed">Confirmé</option>
              <option value="comment">Commentaire</option>
              <option value="decline">Refusé</option>
            </select>
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="search" className="text-sm font-medium mb-1">
              Rechercher par nom :
            </label>
            <input
              type="text"
              id="search"
              className="border border-gray-300 rounded-md px-2 py-1 w-full"
              placeholder="Nom du client..."
              onChange={(e) => setfilterFullName(e.target.value)}
              value={filterFullName}
            />
          </div>
            <div className="flex  md:col-span-2">
        
            <input
            value={date}
            onChange={(e) => setDate(e.target.value)}
             type="date"
             name="" 
             id="search" 
             className="border w-full border-gray-300 rounded-md px-2 py-1 mx-2"
              placeholder="Rechercher par date..." />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-300">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {[
                // "ID",
                "Nom complet",
                "Téléphone",
                "Adresse",
                "Domaine",
                "Date",
                "Statut",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 sm:px-6 py-3 text-left font-medium uppercase tracking-wider text-xs text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedBookings.length > 0 ? (
              paginatedBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  {/* <td className="px-4 sm:px-6 py-3 break-all">{booking._id}</td> */}
                  <td className="px-4 sm:px-6 py-3">
                    {booking.fullName || "Inconnu"}
                  </td>
                  <td className="px-4 sm:px-6 py-3">{booking.phone}</td>
                  <td className="px-4 sm:px-6 py-3 whitespace-pre-wrap">
                    {booking.address}
                  </td>
                  <td className="px-4 sm:px-6 py-3">{booking.jobDomain}</td>
                  <td className="px-4 sm:px-6 py-3">
                    {new Date(booking.createdAt).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 sm:px-6 py-3 relative">
                    {getStatusBadge(booking.status)}
                    {booking.comment?.length > 0 && (
                      <span
                        onClick={() => openCommentModal(booking)}
                        className="text-gray-600 hover:text-black absolute right-3 cursor-pointer"
                      >
                        <MessageSquare size={12} />
                      </span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3">
                    <Dropdown overlay={actionMenu(booking)} trigger={["click"]}>
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
                  colSpan="8"
                  className="text-center py-6 text-gray-500 italic"
                >
                  Aucune consultation trouvée.
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
          pageSize={pageSize}
          total={filteredBookings.length}
          onChange={(page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          }}
          showSizeChanger
          pageSizeOptions={["5", "7", "10", "15", "20"]}
          showTotal={(total) => `Total: ${total} consultations`}
        />
      </div>

      {/* Modals */}
      <DetailsModal
        open={detailsModalOpen}
        onClose={closeDetailsModal}
        reservation={selectedBooking}
      />
      <CommentModal
        url="/api/consultations/add-comment"
        getBookings={getBookings}
        consultation={selectedBooking}
        visible={commentModalOpen}
        onClose={closeCommentModal}
      />
    </div>
  );
};

export default Clients;
