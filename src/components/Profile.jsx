import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);

      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);

      setMessage("Unable to load profile.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setMessage("");
  };

  const handlePasswordChangeInput = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });

    setPasswordMessage("");
    setPasswordError("");
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || "",
      email: profile?.email || "",
    });

    setEditMode(false);
    setMessage("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setMessage("Name cannot be empty.");
      setMessageType("error");
      return;
    }

    if (!formData.email.trim()) {
      setMessage("Email cannot be empty.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await axios.put(
        "http://localhost:8081/api/users/profile",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedProfile = response.data;

      setProfile(updatedProfile);

      setFormData({
        name: updatedProfile.name,
        email: updatedProfile.email,
      });

      // Email changed
      if (updatedProfile.email !== profile.email) {
        localStorage.removeItem("token");

        alert(
          "Email updated successfully. Please login again with your new email."
        );

        window.location.reload();

        return;
      }

      setEditMode(false);

      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("Profile update error:", error);

      if (error.response) {
        setMessage(
          error.response.data.message ||
            error.response.data ||
            "Unable to update profile."
        );
      } else {
        setMessage("Unable to connect to the backend.");
      }

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!passwordData.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }

    if (!passwordData.confirmPassword) {
      setPasswordError("Please confirm your new password.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axios.put(
        "http://localhost:8081/api/users/change-password",
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPasswordMessage(
        response.data || "Password changed successfully."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Remove JWT because password has changed
      setTimeout(() => {
        localStorage.removeItem("token");

        alert(
          "Password changed successfully. Please login again with your new password."
        );

        window.location.reload();
      }, 1200);
    } catch (error) {
      console.error("Password change error:", error);

      if (error.response) {
        setPasswordError(
          error.response.data.message ||
            error.response.data ||
            "Unable to change password."
        );
      } else {
        setPasswordError(
          "Unable to connect to the backend."
        );
      }
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin mx-auto"></div>

          <p className="text-slate-500 dark:text-slate-400 mt-4">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 transition-colors">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Profile & Account
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage your personal information and account settings.
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10">

            <div className="flex items-center gap-5">

              {/* Profile Icon */}
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-lg">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-11 h-11"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2ZM4 21a8 8 0 1 1 16 0H4Z"
                    clipRule="evenodd"
                  />
                </svg>

              </div>

              {/* Name */}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {profile?.name || "User"}
                </h2>

                <p className="text-blue-100 mt-1">
                  {profile?.email || "Email not available"}
                </p>
              </div>

            </div>

          </div>

          {/* Account Information */}
          <div className="p-8">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Account Information
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Update your personal information.
                </p>
              </div>

              {!editMode && (
                <button
                  onClick={() => {
                    setEditMode(true);
                    setMessage("");
                  }}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
                >
                  Edit Profile
                </button>
              )}

            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Full Name */}
              <div>

                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Full Name
                </label>

                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    {profile?.name || "Not available"}
                  </div>
                )}

              </div>

              {/* Email */}
              <div>

                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                  Email Address
                </label>

                {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                ) : (
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    {profile?.email || "Not available"}
                  </div>
                )}

              </div>

            </div>

            {/* Edit Buttons */}
            {editMode && (
              <div className="flex justify-end gap-3 mt-8">

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:bg-blue-400"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

              </div>
            )}

            {/* Profile Message */}
            {message && (
              <div
                className={`mt-6 p-4 rounded-xl text-sm font-medium ${
                  messageType === "success"
                    ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900"
                    : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900"
                }`}
              >
                {message}
              </div>
            )}

          </div>

        </div>

        {/* Security Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 mt-6 transition-colors">

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Security
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your password and account security.
          </p>

          {/* JWT Authentication */}
          <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center font-bold">
                ✓
              </div>

              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  JWT Authentication
                </p>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your session is securely authenticated.
                </p>
              </div>

            </div>

            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
              Active
            </span>

          </div>

          {/* Change Password */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">

            <div className="mb-5">
              <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                Change Password
              </h4>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Update your account password securely.
              </p>
            </div>

            <form
              onSubmit={handlePasswordChange}
              className="space-y-5"
            >

              {/* Current Password */}
              <div>

                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Current Password
                </label>

                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChangeInput}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* New Password */}
              <div>

                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  New Password
                </label>

                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChangeInput}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Confirm Password */}
              <div>

                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChangeInput}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Error */}
              {passwordError && (
                <div className="p-4 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900">
                  {passwordError}
                </div>
              )}

              {/* Success */}
              {passwordMessage && (
                <div className="p-4 rounded-xl text-sm font-medium bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900">
                  {passwordMessage}
                </div>
              )}

              {/* Button */}
              <div className="flex justify-end">

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-6 py-3 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white font-semibold text-sm transition disabled:bg-slate-400"
                >
                  {changingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Profile;