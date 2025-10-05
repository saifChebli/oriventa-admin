import React, { useEffect, useState } from "react";
import { Card, Statistic } from "antd";
import {
  UserRound,
  FileText,
  MessageCircle,
  TrendingUp,
  Clock,
  MessageCircleCode,
  PhoneCall,
} from "lucide-react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import api from "../../../api";
const Dashboard = () => {
  const [stats, setStats] = useState({
    candidates: 0,
    resumes: 0,
    consultations: 0,
    contacts : 0,
    pendingCandidates: 0,
    approvedResumes: 0,
    scheduledConsultations: 0,
  });



  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch stats from backend
  const getStats = async () => {
    try {
      const [candidatesRes, resumesRes, consultationsRes ,contactsRes] = await Promise.all([
        api.get("/api/dossiers" , { withCredentials: true }),
        api.get("/api/creation" , { withCredentials: true }),
        api.get("/api/consultations" , { withCredentials: true }),
        api.get("/api/contact/get-list" , { withCredentials: true }),
      ]);

      setStats({
        candidates: candidatesRes.data.length,
        resumes: resumesRes.data.length,
        consultations: consultationsRes.data.length,
        contacts : contactsRes.data.length,
        pendingCandidates: candidatesRes.data.filter(
          (c) => c.status === "pending"
        ).length,
        approvedResumes: resumesRes.data.filter(
          (r) => r.status === "accepted"
        ).length,
        scheduledConsultations: consultationsRes.data.filter(
          (c) => c.status === "pending"
        ).length,
      });

      // Build a recent activity feed (latest 5 items from all)
      const activities = [
        ...candidatesRes.data.map((c) => ({
          type: "Candidate",
          name: c.fullName,
          date: c.createdAt,
          status: c.status,
        })),
        ...resumesRes.data.map((r) => ({
          type: "Resume",
          name: r.fullName,
          date: r.createdAt,
          status: r.status,
        })),
        ...consultationsRes.data.map((c) => ({
          type: "Consultation",
          name: c.fullName,
          date: c.createdAt,
          status: c.status,
        })),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error("Erreur de récupération des stats:", error);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

  // Pie chart for distribution
  const pieData = [
    { name: "Candidates", value: stats.candidates },
    { name: "Resumes", value: stats.resumes },
    { name: "Consultations", value: stats.consultations },
  ];

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B"];

  // Bar chart for statuses
  const barData = [
    { name: "Pending", value: stats.pendingCandidates },
    { name: "Approved CVs", value: stats.approvedResumes },
    { name: "Consultations", value: stats.scheduledConsultations },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-gray-500">Aperçu global des activités</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6"  >
  <Card className={"shadow-lg rounded-2xl border"} >
          <Statistic
            title="Total Candidates"
            value={stats.candidates}
            prefix={<UserRound size={20} className="text-blue-500" />}
          />
        </Card>
        <Card className="shadow-lg rounded-2xl border" >
          <Statistic
            title="Total Resumes"
            value={stats.resumes}
            prefix={<FileText size={20} className="text-green-500" />}
          />
        </Card>
        <Card className="shadow-lg rounded-2xl border" >
          <Statistic
            title="Consultations"
            value={stats.consultations}
            prefix={<MessageCircle size={20} className="text-yellow-500" />}
          />
        </Card>
          <Card className={"shadow-lg rounded-2xl border"} >
          <Statistic
            title="Total Contacts"
            value={stats.contacts}
            prefix={<PhoneCall size={20} className="text-blue-500" />}
          />
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg rounded-2xl border p-4" >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} /> Distribution
          </h2>
          <ResponsiveContainer width="100%" height={250} >
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="shadow-lg rounded-2xl border p-4">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock size={18} /> Suivi des statuts
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366F1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="shadow-lg rounded-2xl border p-4" >
        <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
        <ul className={`divide-y divide-gray-200` }>
          {recentActivities.map((activity, idx) => (
            <li key={idx} className="py-3 flex justify-between">
              <div>
                <span className="font-medium">{activity.type}:</span>{" "}
                {activity.name}
              </div>
              <div className="text-gray-500 text-sm">
                {new Date(activity.date).toLocaleDateString()} —{" "}
                <span className="italic">{activity.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default Dashboard;
