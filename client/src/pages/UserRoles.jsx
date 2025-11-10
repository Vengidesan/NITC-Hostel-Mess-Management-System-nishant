import React, { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function UserRoles() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dummy Data (Replace with backend call later)
  const [users, setUsers] = useState([
    { id: 1, name: "Aarav Kumar", email: "aarav@nitc.edu", role: "Student" },
    { id: 2, name: "Sneha Patil", email: "sneha@nitc.edu", role: "Student" },
    { id: 3, name: "Riya Shah", email: "riya@nitc.edu", role: "Mess Manager" },
    { id: 4, name: "Aditya Menon", email: "aditya@nitc.edu", role: "Hostel Admin" },
  ]);

  const roles = ["Student", "Mess Manager", "Hostel Admin"];

  const updateRole = (id, newRole) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, role: newRole } : user
      )
    );
  };

  const saveChanges = () => {
    // Later send to backend
    console.log("Updated Roles:", users);
    alert("✅ Roles updated successfully!");
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="container-narrow py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">User Roles & Permissions</h1>
          <p className="text-neutral-600 mt-1">
            Assign and modify user access roles across the system.
          </p>
        </header>

        {/* Users Table */}
        <section className="bg-white border border-neutral-200 shadow-sm rounded-xl p-6">
          <table className="w-full text-left">
            <thead>
              <tr className="text-neutral-600 text-sm border-b">
                <th className="py-3">Name</th>
                <th className="py-3">Email</th>
                <th className="py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-none">
                  <td className="py-3 font-medium">{user.name}</td>
                  <td className="py-3 text-neutral-700">{user.email}</td>
                  <td className="py-3">
                    <select
                      className="border border-neutral-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-600"
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-6">
            <button
              onClick={saveChanges}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
