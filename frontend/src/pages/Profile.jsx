import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [preview, setPreview] = useState(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Sync with user context changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPreview(user.avatarUrl || null);
      setAvatarFile(null);
      setRemoveAvatar(false);
    }
  }, [user]);

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setPreview(URL.createObjectURL(f)); // local preview
    setRemoveAvatar(false);
  };

  const clearFile = () => {
    setAvatarFile(null);
    setPreview(user?.avatarUrl || null); // revert to server avatar
  };

  const handleRemoveAvatarToggle = () => {
    setRemoveAvatar((v) => !v);
    if (!removeAvatar) {
      // checked: show no preview
      setAvatarFile(null);
      setPreview(null);
    } else {
      // unchecked: show current server avatar
      setPreview(user?.avatarUrl || null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    // Validate password change
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (!currentPassword) {
        setError("Current password is required to change password");
        return;
      }
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name || "");
      if (avatarFile) fd.append("avatar", avatarFile);
      if (removeAvatar) fd.append("removeAvatar", "true");
      if (currentPassword) fd.append("currentPassword", currentPassword);
      if (newPassword) fd.append("newPassword", newPassword);

      // Call updateProfile which sets user in AuthContext
      const updated = await updateProfile(fd);

      // Update preview with persisted server URL
      if (updated && updated.avatarUrl) {
        setPreview(updated.avatarUrl);
      } else if (removeAvatar) {
        setPreview(null);
      }

      setMessage("Profile updated successfully ✓");
      setAvatarFile(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setRemoveAvatar(false);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName(user?.name || "");
    setAvatarFile(null);
    setPreview(user?.avatarUrl || null);
    setRemoveAvatar(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setMessage(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h2>

        {/* Profile Header */}
        <div className="flex gap-6 items-center mb-8 pb-8 border-b">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden border-4 border-purple-200 shadow-md">
            {preview ? (
              <img src={preview} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="text-4xl font-bold text-purple-600">
                {user?.name ? user.name.split(" ").map(n => n[0]).join("").slice(0, 2) : "U"}
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-lg mb-2"><span className="font-semibold text-gray-700">Name:</span> <span className="text-gray-600">{user?.name}</span></p>
            <p className="text-lg mb-2"><span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-600">{user?.email}</span></p>
            <p className="text-lg"><span className="font-semibold text-gray-700">Role:</span> <span className={`px-3 py-1 rounded-full text-sm font-medium ${user?.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{user?.role === "admin" ? "👑 Admin" : "👤 Member"}</span></p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Messages */}
          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-2 border-gray-300 p-3 rounded-lg focus:border-purple-500 focus:outline-none bg-gray-50 transition"
              placeholder="Your name"
              disabled={loading}
            />
          </div>

          {/* Avatar Upload */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Avatar</label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={onFile}
                disabled={loading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              />
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={clearFile}
                  disabled={loading || !avatarFile}
                  className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 text-sm hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    checked={removeAvatar}
                    onChange={handleRemoveAvatarToggle}
                    disabled={loading}
                    className="w-4 h-4 cursor-pointer"
                  />
                  Remove current avatar
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">📎 Supported: jpg, png, gif. Max 3MB.</p>
          </div>

          {/* Password Section */}
          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">Change Password</p>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current password (required to change)"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg bg-white focus:border-purple-500 focus:outline-none transition"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg bg-white focus:border-purple-500 focus:outline-none transition"
                disabled={loading}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border-2 border-gray-300 p-3 rounded-lg bg-white focus:border-purple-500 focus:outline-none transition"
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "💾 Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-6 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
