import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const { user } = useAuth();
  const [counts, setCounts] = useState({ projects: 0, tasks: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError(null);
      try {
        // Get counts
        const countsRes = await api.get("/dashboard");
        setCounts({
          projects: countsRes.data?.projectsCount ?? 0,
          tasks: countsRes.data?.tasksCount ?? 0,
        });

        // Get recent projects and tasks
        if (user?.role === "admin") {
          const projRes = await api.get("/projects");
          setRecentProjects((projRes.data?.projects || []).slice(0, 5));
        } else {
          const projRes = await api.get("/projects");
          setRecentProjects((projRes.data?.projects || []).slice(0, 5));
        }

        const tasksRes = await api.get("/tasks");
        setRecentTasks((tasksRes.data?.tasks || []).slice(0, 5));
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) fetchDashboard();
  }, [user]);

  if (loading) return <p className="text-center">Loading dashboard...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600">
          Role: <b className="capitalize">{user?.role}</b>
        </p>
        {error && <p className="text-red-600 mt-2">Error: {error}</p>}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded shadow">
          <p className="text-sm text-gray-600">
            {user?.role === "admin" ? "Projects Created" : "Projects Assigned"}
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {counts.projects}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <p className="text-sm text-gray-600">
            {user?.role === "admin" ? "Total Tasks" : "Tasks Assigned"}
          </p>
          <p className="text-3xl font-bold text-green-600">{counts.tasks}</p>
        </div>
      </div>

      {/* Admin Dashboard */}
      {user?.role === "admin" && (
        <div className="space-y-4">
          {/* Admin Stats */}
          <div className="bg-purple-50 p-4 rounded shadow">
            <h2 className="font-semibold text-lg mb-2">Admin Controls</h2>
            <div className="flex gap-3">
              <Link
                to="/projects"
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm"
              >
                Manage Projects
              </Link>
              <Link
                to="/profile"
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                My Profile
              </Link>
            </div>
          </div>

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold text-lg mb-3">Recent Projects</h2>
              <div className="space-y-2">
                {recentProjects.map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="block p-2 hover:bg-gray-50 border-l-4 border-blue-500 pl-3"
                  >
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">
                      {p.members?.length || 0} members
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Tasks */}
          {recentTasks.length > 0 && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold text-lg mb-3">All Tasks Overview</h2>
              <div className="space-y-2">
                {recentTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-2 border rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-sm text-gray-500">
                        {t.assignedTo?.name || "Unassigned"}
                      </div>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {t.status || "todo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Member Dashboard */}
      {user?.role === "member" && (
        <div className="space-y-4">
          {/* Member Quick Actions */}
          <div className="bg-blue-50 p-4 rounded shadow">
            <h2 className="font-semibold text-lg mb-2">Quick Actions</h2>
            <div className="flex gap-3">
              <Link
                to="/projects"
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
              >
                View Projects
              </Link>
              <Link
                to="/profile"
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm"
              >
                My Profile
              </Link>
            </div>
          </div>

          {/* Assigned Projects */}
          {recentProjects.length > 0 && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold text-lg mb-3">Your Projects</h2>
              <div className="space-y-2">
                {recentProjects.map((p) => (
                  <Link
                    key={p._id}
                    to={`/projects/${p._id}`}
                    className="block p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-500">{p.description}</div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* My Tasks */}
          {recentTasks.length > 0 && (
            <div className="bg-white p-6 rounded shadow">
              <h2 className="font-semibold text-lg mb-3">Your Tasks</h2>
              <div className="space-y-2">
                {recentTasks.map((t) => (
                  <div
                    key={t._id}
                    className="p-3 border rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-sm text-gray-500">
                        Project: {t.projectId?.title || "N/A"}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        t.status === "done"
                          ? "bg-green-200 text-green-800"
                          : t.status === "in-progress"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {t.status || "todo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentTasks.length === 0 && (
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-gray-600">No tasks assigned yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
