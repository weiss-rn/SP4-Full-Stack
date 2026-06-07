"use client";

import { useState, useEffect } from "react";

export default function Home() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [form, setForm] = useState({ name: "", email: "" });
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });

    const API_URL = "/api/users";

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError("Failed to connect to the server. Make sure the server is running.");
        } finally {
            setLoading(false);
        }
    }

    function showMessage(type, text) {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name || !form.email) {
            showMessage("error", "Name and email are required");
            return;
        }

        try {
            let res;
            if (editingId) {
                res = await fetch(API_URL, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingId, ...form })
                });
            } else {
                res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form)
                });
            }

            const data = await res.json();
            if (data.success) {
                showMessage("success", data.message);
                setForm({ name: "", email: "" });
                setEditingId(null);
                fetchUsers();
            } else {
                showMessage("error", data.message);
            }
        } catch (err) {
            showMessage("error", "Operation failed");
        }
    }

    async function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this user?")) return;

        try {
            const res = await fetch(API_URL, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            const data = await res.json();
            if (data.success) {
                showMessage("success", data.message);
                fetchUsers();
            } else {
                showMessage("error", data.message);
            }
        } catch (err) {
            showMessage("error", "Delete failed");
        }
    }

    function handleEdit(user) {
        setForm({ name: user.name, email: user.email });
        setEditingId(user.id);
    }

    function handleCancel() {
        setForm({ name: "", email: "" });
        setEditingId(null);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
            <div className="max-w-4xl mx-auto p-6 py-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                        User Management
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        Pertemuan 10 — Full CRUD with Next.js + MySQL
                    </p>
                </div>

                {/* Notification */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                        message.type === "success"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-300"
                            : "bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300"
                    }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-zinc-800/80 rounded-2xl shadow-lg p-6 border border-zinc-200/50 dark:border-zinc-700/50">
                            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-5">
                                {editingId ? "Edit User" : "Add New User"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Enter name"
                                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="Enter email"
                                        className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        {editingId ? "Update" : "Create"}
                                    </button>
                                    {editingId && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-4 py-2.5 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-600 dark:hover:bg-zinc-500 text-zinc-700 dark:text-zinc-200 font-medium rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-zinc-800/80 rounded-2xl shadow-lg p-6 border border-zinc-200/50 dark:border-zinc-700/50">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                                    Users
                                </h2>
                                <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2.5 py-1 rounded-full">
                                    {users.length} total
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-lg p-4">
                                    <p className="text-red-700 dark:text-red-300 font-medium text-sm">Connection Error</p>
                                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>
                                    <p className="text-red-500 dark:text-red-400 text-xs mt-2">
                                        Ensure MySQL is running and the database <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">db_next_mysql</code> exists.
                                    </p>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3">👤</div>
                                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">No users yet</p>
                                    <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">
                                        Add your first user using the form.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                                    {users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="group flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-700/30 border border-zinc-100 dark:border-zinc-700/50 hover:border-indigo-200 dark:hover:border-indigo-700/50 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-zinc-800 dark:text-zinc-100 text-sm">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* API Reference */}
                <div className="mt-8 bg-white dark:bg-zinc-800/80 rounded-2xl shadow-lg p-6 border border-zinc-200/50 dark:border-zinc-700/50">
                    <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
                        API Reference
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
                            <span className="text-xs font-mono font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">GET</span>
                            <code className="block text-xs text-zinc-600 dark:text-zinc-400 mt-1.5">/api/users</code>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Fetch all users</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
                            <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">POST</span>
                            <code className="block text-xs text-zinc-600 dark:text-zinc-400 mt-1.5">/api/users</code>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Create a user</p>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/50">
                            <span className="text-xs font-mono font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded">PUT</span>
                            <code className="block text-xs text-zinc-600 dark:text-zinc-400 mt-1.5">/api/users</code>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Update a user</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                            <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded">DELETE</span>
                            <code className="block text-xs text-zinc-600 dark:text-zinc-400 mt-1.5">/api/users</code>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">Delete a user</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
