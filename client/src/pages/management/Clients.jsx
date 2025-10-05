import React from "react";
import { Dropdown, Menu } from "antd";
import {
  MoreVertical,
  Eye,
  Check,
  UserRoundCheck,
  X,
  MessageCircle,
  Info,
  MessageSquare,
  Trash,
} from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";
import DetailsModal from "./components/DetailModal";
import CommentModal from "./components/CommentModal";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";

const Clients = () => {
  const { user } = useAuth();
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  const [newComment, setNewComment] = useState("");

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
    setComments(booking.comments);
  };

  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: {
        color: "bg-green-100 text-green-700",
        label: "Confirmer",
      },
      pending: {
        color: "bg-orange-100 text-orange-700",
        label: "En attente",
      },
      comment: {
        color: "bg-blue-100 text-blue-700",
        label: "Commentaire",
      },
      unreachable: {
        color: "bg-blue-100 text-blue-700",
        label: "Injoignable",
      },
      decline: {
        color: "bg-red-100 text-red-700",
        label: "Refuser",
      },
    };

    const config = statusConfig[status] || statusConfig["PENDING"];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

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
      if (window.confirm("Are you sure you want to delete this dossier?")){
      await api.delete(`/api/consultations/delete-consultation/${id}`, { withCredentials: true });
      getBookings();
      }
    } catch (error) {
      console.error("Error deleting dossier:", error);
    }
  };

  // const handleDecline = async (id) => {
  //   await api.patch(`/reservation/${id}/status`, { status: "DECLINED" });
  //   getBookings();
  // };

  // const handleChecked = async (id) => {
  //   await api.patch(`/reservation/${id}/status`, { status: "CHECKED_IN" });
  //   getBookings();
  // };

  const actionMenu = (booking) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<Eye size={16} />}
        onClick={() => openDetailsModal(booking)}
      >
        View Details
      </Menu.Item>
      <Menu.Item
        key="checkedIn"
        icon={<Check size={16} />}
        onClick={() => handleAccept(booking._id)}
      >
        Confirmer
      </Menu.Item>
      <Menu.Item
        key="accept"
        icon={<Info size={16} />}
        onClick={() => handleInjoignable(booking._id)}
      >
        Injoignable
      </Menu.Item>
      <Menu.Item
        key="accept"
        icon={<MessageCircle size={16} />}
        onClick={() => openCommentModal(booking)}
      >
        Commentaire
      </Menu.Item>
      <Menu.Item
        key="decline"
        icon={<X size={16} />}
        onClick={() => handleDecline(booking._id)}
      >
        Refuser
      </Menu.Item>
      {user.role === "manager" && (
        <Menu.Item
          key="delete"
          icon={<Trash size={16} />}
          onClick={() => handleDelete(booking._id)}
        >
          Delete
        </Menu.Item>
      )}
    </Menu>
  );

  const [filterCreated, setfilterCreated] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFullName, setfilterFullName] = useState("");

  const filteredBookings = bookingList.filter((booking) => {
    const roomTypeMatches =
      filterCreated === "all" || booking.created_at === filterCreated;
    const statusMatches =
      filterStatus === "all" || booking.status === filterStatus;
    const filterFullNameMatches =
      filterFullName === "" ||
      (booking.fullName &&
        booking.fullName.toLowerCase().includes(filterFullName.toLowerCase()));

    return roomTypeMatches && statusMatches && filterFullNameMatches;
  });
  return (
    <div className="p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <div>
          <h1 className="text-2xl font-bold">Consultations Dashboard</h1>
          <p className=" mt-1">
            Here you can view and manage your consultations.{" "}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6 my-10">
        {/* Filter and search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 mb-8">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2">
              Consultation Status:
            </label>
            <select
              id="filterStatus"
              className="border border-gray-300 rounded-md px-2 py-1"
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="all">All</option>
              <option value="pending">En attente</option>
              <option value="unreachable">Injoingable</option>
              <option value="confirmed">Confirmer</option>
              <option value="comment">Commentaire</option>
              <option value="decline">Refuser</option>
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
        <table className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                Consultation ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Nom complet
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Adresse
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Domaine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBookings?.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50 transition-fast">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                  {booking._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium ">
                      {booking.fullName ? booking.fullName : "Unknown Guest"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm ">{booking.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-wrap ">
                  <div>
                    <div className="text-sm ">{booking.address}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm ">{booking.jobDomain}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm ">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="relative px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(booking.status)}
                  {booking.comment.length > 0 ? (
                    <span
                      onClick={() => {
                        // setSelectedBooking(booking);
                        openCommentModal(booking);
                      }}
                      className="text-gray-600 hover:text-black absolute right-4 cursor-pointer"
                    >
                      <MessageSquare size={10} />
                    </span>
                  ) : null}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Dropdown overlay={actionMenu(booking)} trigger={["click"]}>
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
