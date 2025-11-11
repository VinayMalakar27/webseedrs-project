import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (filter) params.set("filter", filter);
      const res = await api.get(`/projects?${params.toString()}`);
      setProjects(res.data?.projects || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const res = await api.get("/users");
      const members = (res.data?.users || res.data || []).filter(
        (u) => u.role === "member"
      );
      setAllMembers(members);
    } catch (err) {
      console.error(err);
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShowForm = () => {
    if (!showForm && user?.role === "admin") {
      loadMembers();
    }
    setShowForm(!showForm);
    if (showForm) {
      setSelectedMembers([]);
      setFormData({ title: "", description: "" });
    }
  };

  const doSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleMember = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const createProject = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert("Project title is required");
      return;
    }

    try {
      // Create project
      const createRes = await api.post("/projects", formData);
      const newProjectId = createRes.data?.project?._id;

      // Add members to project
      if (selectedMembers.length > 0 && newProjectId) {
        for (const memberId of selectedMembers) {
          try {
            await api.post(`/projects/${newProjectId}/members`, { memberId });
          } catch (err) {
            console.error(`Failed to add member ${memberId}:`, err);
          }
        }
      }

      setFormData({ title: "", description: "" });
      setSelectedMembers([]);
      setShowForm(false);
      await load();
      alert("Project created successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create project");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-3">Projects</h1>

      <form onSubmit={doSearch} className="flex gap-2 mb-4">
        <input
          className="flex-1 border p-2 rounded"
          placeholder="Search projects"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
        <button className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700">
          Search
        </button>
      </form>

      {user?.role === "admin" && (
        <div className="mb-4">
          <button
            onClick={handleShowForm}
            className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-medium"
          >
            {showForm ? "Cancel" : "+ New Project"}
          </button>

          {showForm && (
            <form onSubmit={createProject} className="mt-4 p-4 border rounded bg-blue-50 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Title *</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Enter project title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border p-2 rounded"
                  placeholder="Enter project description (optional)"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Assign Members</label>
                {membersLoading ? (
                  <p className="text-gray-600 text-sm">Loading members...</p>
                ) : allMembers.length === 0 ? (
                  <p className="text-gray-600 text-sm">No members available</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto border p-3 rounded bg-white">
                    {allMembers.map((m) => (
                      <label key={m._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(m._id)}
                          onChange={() => toggleMember(m._id)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">
                          <div className="font-medium">{m.name}</div>
                          <div className="text-xs text-gray-500">{m.email}</div>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {selectedMembers.length} member(s)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 font-medium"
                >
                  Create Project
                </button>
                <button
                  type="button"
                  onClick={handleShowForm}
                  className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-600">Loading projects...</p>
      ) : (
        <div className="space-y-3">
          {projects.length === 0 && (
            <p className="text-center text-gray-600 py-4">No projects found.</p>
          )}
          {projects.map((p) => (
            <div
              key={p._id}
              className="p-4 border rounded hover:bg-gray-50 transition flex justify-between items-center"
            >
              <div className="flex-1">
                <Link to={`/projects/${p._id}`} className="font-semibold text-lg hover:text-blue-600">
                  {p.title}
                </Link>
                <p className="text-sm text-gray-600">{p.description}</p>
                <div className="text-xs text-gray-500 mt-1">
                  Members: {p.members?.length || 0}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  p.status === "completed"
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}>
                  {p.status || "active"}
                </span>

                {user?.role === "admin" && (
                  <button
                    onClick={() => deleteProject(p._id)}
                    className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
