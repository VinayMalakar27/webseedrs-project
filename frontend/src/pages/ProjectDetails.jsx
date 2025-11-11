import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskAssignee, setEditTaskAssignee] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${id}`);
      const data = res.data?.project || res.data;
      setProject(data);
    } catch (err) {
      console.error(err);
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      const members = (res.data?.users || res.data || []).filter(
        (u) => u.role === "member"
      );
      setAllUsers(members);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
    if (user?.role === "admin") loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      alert("Task title is required");
      return;
    }
    setTaskLoading(true);
    try {
      await api.post(`/projects/${id}/tasks`, {
        title: newTaskTitle,
        assignedTo: newTaskAssignee || null,
      });
      setNewTaskTitle("");
      setNewTaskAssignee("");
      setShowTaskForm(false);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add task");
    } finally {
      setTaskLoading(false);
    }
  };

  const startEditTask = (task) => {
    setEditingTaskId(task._id);
    setEditTaskTitle(task.title);
    setEditTaskAssignee(task.assignedTo?._id || "");
  };

  const updateTask = async (e) => {
    e.preventDefault();
    if (!editTaskTitle.trim()) {
      alert("Task title is required");
      return;
    }
    setTaskLoading(true);
    try {
      await api.patch(`/projects/${id}/tasks/${editingTaskId}`, {
        title: editTaskTitle,
        assignedTo: editTaskAssignee || null,
      });
      setEditingTaskId(null);
      setEditTaskTitle("");
      setEditTaskAssignee("");
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update task");
    } finally {
      setTaskLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/projects/${id}/tasks/${taskId}`, { status });
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    setTaskLoading(true);
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete task");
    } finally {
      setTaskLoading(false);
    }
  };

  const assignMember = async (e) => {
    e.preventDefault();
    if (!selectedMember) {
      alert("Please select a member");
      return;
    }
    try {
      await api.post(`/projects/${id}/members`, { memberId: selectedMember });
      setSelectedMember("");
      setShowMemberForm(false);
      await load();
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to assign member");
    }
  };

  const removeMember = async (memberId) => {
    if (!window.confirm("Remove this member from project?")) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      await load();
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  if (loading) return <p className="text-center py-4 text-gray-600">Loading...</p>;
  if (!project) return <p className="text-center text-red-600 py-4">Project not found</p>;

  return (
    <div className="bg-white p-6 rounded shadow space-y-6">
      {/* Project Header */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-gray-600">{project.description}</p>
        <p className="text-sm text-gray-500 mt-2">
          Status:{" "}
          <span
            className={`capitalize font-semibold ${
              project.status === "completed" ? "text-green-600" : "text-blue-600"
            }`}
          >
            {project.status || "active"}
          </span>
        </p>
      </div>

      {/* Admin Team Members Section */}
      {user?.role === "admin" && (
        <div className="p-4 border-2 border-blue-200 rounded bg-blue-50">
          <h3 className="font-semibold text-lg mb-3">👥 Team Members</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {(project.members || []).length === 0 ? (
              <p className="text-gray-500 text-sm italic">No members assigned yet</p>
            ) : (
              (project.members || []).map((m) => (
                <div
                  key={m._id}
                  className="bg-white p-3 rounded flex justify-between items-center gap-3 border border-blue-200 shadow-sm"
                >
                  <div>
                    <span className="font-medium text-sm block">{m.name}</span>
                    <p className="text-xs text-gray-500">{m.email}</p>
                  </div>
                  <button
                    onClick={() => removeMember(m._id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded font-bold"
                    title="Remove member"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setShowMemberForm(!showMemberForm)}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded hover:bg-blue-700 font-medium transition"
          >
            {showMemberForm ? "Cancel" : "+ Add Member"}
          </button>

          {showMemberForm && (
            <form onSubmit={assignMember} className="mt-4 flex gap-2 p-3 bg-white rounded border border-blue-300">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="border border-gray-300 p-2 rounded flex-1 text-sm"
                required
              >
                <option value="">Select a member</option>
                {allUsers
                  .filter((u) => !project.members?.some((m) => m._id === u._id))
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
              </select>
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium transition"
              >
                Add
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tasks Section */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">📋 Tasks ({project.tasks?.length || 0})</h3>
          {user?.role === "admin" && (
            <button
              onClick={() => setShowTaskForm(!showTaskForm)}
              className={`px-4 py-2 text-sm rounded font-medium transition ${
                showTaskForm
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {showTaskForm ? "Cancel" : "+ New Task"}
            </button>
          )}
        </div>

        {/* Add Task Form - Always Visible for Admin */}
        {showTaskForm && user?.role === "admin" && (
          <form onSubmit={addTask} className="mb-6 p-5 border-2 border-green-300 rounded bg-green-50 space-y-4 shadow-md">
            <h4 className="font-semibold text-green-700">Create New Task</h4>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Task Title *</label>
              <input
                className="w-full border-2 border-gray-300 p-3 rounded focus:border-green-500 focus:outline-none"
                placeholder="Enter task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Assign To Member</label>
              <select
                className="w-full border-2 border-gray-300 p-3 rounded focus:border-green-500 focus:outline-none"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              >
                <option value="">Unassigned</option>
                {(project.members || []).length === 0 ? (
                  <option disabled>No members in project</option>
                ) : (
                  (project.members || []).map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-600 mt-1">
                {(project.members || []).length === 0
                  ? "⚠️ Add members to project first to assign tasks"
                  : "Leave blank for unassigned tasks"}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={taskLoading}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded hover:bg-green-700 font-medium transition disabled:bg-gray-400"
              >
                {taskLoading ? "Creating..." : "Create Task"}
              </button>
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded hover:bg-gray-700 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {(project.tasks || []).length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-lg">No tasks yet</p>
              {user?.role === "admin" && (
                <p className="text-gray-500 text-sm mt-2">Create a task to get started</p>
              )}
            </div>
          ) : (
            (project.tasks || []).map((t) => {
              const isAssignedToMe = t.assignedTo?._id === user._id;
              const canEdit = user?.role === "admin" || isAssignedToMe;
              const isEditing = editingTaskId === t._id;

              return (
                <div
                  key={t._id}
                  className={`p-4 border-2 rounded transition ${
                    t.status === "done"
                      ? "border-green-200 bg-green-50"
                      : t.status === "in-progress"
                      ? "border-yellow-200 bg-yellow-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  {isEditing && user?.role === "admin" ? (
                    // Edit Mode
                    <form onSubmit={updateTask} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Task Title</label>
                        <input
                          className="w-full border-2 border-gray-300 p-2 rounded focus:border-blue-500 focus:outline-none"
                          value={editTaskTitle}
                          onChange={(e) => setEditTaskTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Assign To</label>
                        <select
                          className="w-full border-2 border-gray-300 p-2 rounded focus:border-blue-500 focus:outline-none"
                          value={editTaskAssignee}
                          onChange={(e) => setEditTaskAssignee(e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {(project.members || []).map((m) => (
                            <option key={m._id} value={m._id}>
                              {m.name} ({m.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={taskLoading}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-medium transition disabled:bg-gray-400"
                        >
                          {taskLoading ? "Saving..." : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="flex-1 bg-gray-600 text-white px-3 py-2 rounded hover:bg-gray-700 text-sm font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // View Mode
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div
                          className={`font-semibold text-lg ${
                            t.status === "done" ? "line-through text-gray-500" : ""
                          }`}
                        >
                          {t.title}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          👤 Assigned to:{" "}
                          <b className={t.assignedTo ? "text-blue-600" : "text-gray-400"}>
                            {t.assignedTo?.name || "Unassigned"}
                          </b>
                        </div>
                        {t.assignedTo && (
                          <div className="text-xs text-gray-500">{t.assignedTo.email}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {canEdit ? (
                          <select
                            value={t.status || "todo"}
                            onChange={(e) => updateTaskStatus(t._id, e.target.value)}
                            className={`border-2 p-2 rounded text-sm font-medium transition cursor-pointer ${
                              t.status === "done"
                                ? "bg-green-200 border-green-400"
                                : t.status === "in-progress"
                                ? "bg-yellow-200 border-yellow-400"
                                : "bg-gray-200 border-gray-400"
                            }`}
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        ) : (
                          <span
                            className={`text-xs px-3 py-2 rounded font-medium ${
                              t.status === "done"
                                ? "bg-green-200 text-green-800"
                                : t.status === "in-progress"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {t.status || "todo"}
                          </span>
                        )}

                        {user?.role === "admin" && (
                          <>
                            <button
                              onClick={() => startEditTask(t)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-1 rounded"
                              title="Edit task"
                            >
                              ✎
                            </button>

                            <button
                              onClick={() => deleteTask(t._id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-1 rounded"
                              title="Delete task"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
