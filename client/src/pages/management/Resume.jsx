import React, { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
import { MoreVertical, Eye, Download, Check, X } from "lucide-react";
import axios from "axios";
// import ResumeDetailsModal from "./components/ResumeDetailsModal";

const Resume = () => {
  const [resumeList, setResumeList] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Fetch resumes from backend
  const getResumes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/creation" , { withCredentials: true });
      setResumeList(response.data);
    } catch (error) {
      console.error("Erreur de récupération des CV:", error);
    }
  };

  useEffect(() => {
    getResumes();
  }, []);

  // Open/close details modal
  const openDetailsModal = (resume) => {
    setSelectedResume(resume);
    setDetailsModalOpen(true);
  };
  const closeDetailsModal = () => {
    setSelectedResume(null);
    setDetailsModalOpen(false);
  };

  // Status badge mapping
  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: "bg-green-100 text-green-700", label: "Approuvé" },
      pending: { color: "bg-orange-100 text-orange-700", label: "En attente" },
      rejected: { color: "bg-red-100 text-red-700", label: "Rejeté" },
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
      await axios.patch(
        `http://localhost:5000/api/resumes/update-status/${id}`,
        { status }
      );
      getResumes();
    } catch (error) {
      console.error("Erreur maj status:", error);
    }
  };

  const actionMenu = (resume) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<Eye size={16} />}
        onClick={() => openDetailsModal(resume)}
      >
        Voir détails
      </Menu.Item>
      <Menu.Item
        key="download"
        icon={<Download size={16} />}
        // onClick={() =>
        //   window.open(`http://localhost:5000/${resume.filePath}`, "_blank")
        // }
      >
        Télécharger
      </Menu.Item>
      <Menu.Item
        key="approve"
        icon={<Check size={16} />}
        onClick={() => handleUpdateStatus(resume._id, "approved")}
      >
        Approuver
      </Menu.Item>
      <Menu.Item
        key="reject"
        icon={<X size={16} />}
        onClick={() => handleUpdateStatus(resume._id, "rejected")}
      >
        Rejeter
      </Menu.Item>
    </Menu>
  );

  // Filters
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterFullName, setFilterFullName] = useState("");

  const filteredResumes = resumeList.filter((resume) => {
    const statusMatches =
      filterStatus === "all" || resume.status === filterStatus;
    const nameMatches =
      filterFullName === "" ||
      (resume.fullName &&
        resume.fullName.toLowerCase().includes(filterFullName.toLowerCase()));

    return statusMatches && nameMatches;
  });

  return (
    <div className="p-6">
      <div className="rounded-lg shadow border border-gray-300 p-6">
        <h1 className="text-2xl font-bold">Resumes Dashboard</h1>
        <p className="mt-1">Gérez les CVs des candidats.</p>
      </div>

      <div className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6 my-10">
        {/* Filters */}
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
              <option value="approved">Approuvé</option>
              <option value="pending">En attente</option>
              <option value="rejected">Rejeté</option>
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
              placeholder="Search by name ..."
              onChange={(e) => setFilterFullName(e.target.value)}
              value={filterFullName}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-300 p-6">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">
                  Resume ID
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
              {filteredResumes.map((resume) => (
                <tr key={resume._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{resume._id}</td>
                  <td className="px-6 py-4 text-sm">{resume.fullName}</td>
                  <td className="px-6 py-4 text-sm">{resume.email}</td>
                  <td className="px-6 py-4 text-sm">{resume.phone}</td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(resume.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(resume.status)}</td>
                  <td className="px-6 py-4">
                    <Dropdown overlay={actionMenu(resume)} trigger={["click"]}>
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
      {/* <ResumeDetailsModal
        open={detailsModalOpen}
        onClose={closeDetailsModal}
        resume={selectedResume}
      /> */}
    </div>
  );
};

export default Resume;
