import { getUsers } from "@/lib/api";

export default async function Home() {
    let result;
    try {
        result = await getUsers();
    } catch (error) {
        result = { success: false, data: [], message: error.message };
    }
    const users = result.success ? result.data : [];

    return (
        <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black min-h-screen p-8">
            <main className="w-full max-w-4xl">
                <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-zinc-50">
                    User Management — Pertemuan 9
                </h1>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
                        Users from Database
                    </h2>

                    {!result.success && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
                            <p className="font-semibold">Database connection failed</p>
                            <p className="text-sm mt-1">{result.message}</p>
                            <p className="text-sm mt-2">
                                Make sure MySQL is running and the database &apos;db_next_mysql&apos; exists.
                                Copy <code className="bg-red-100 px-1 rounded">.env.example</code> to <code className="bg-red-100 px-1 rounded">.env</code> if needed.
                            </p>
                        </div>
                    )}

                    {users.length === 0 && result.success ? (
                        <p className="text-zinc-500 dark:text-zinc-400">
                            No users found. Add some using the API.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">ID</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="py-3 px-4 text-sm text-zinc-800 dark:text-zinc-200">{user.id}</td>
                                            <td className="py-3 px-4 text-sm text-zinc-800 dark:text-zinc-200 font-medium">{user.name}</td>
                                            <td className="py-3 px-4 text-sm text-zinc-600 dark:text-zinc-400">{user.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-black dark:text-zinc-50">
                        Available API Endpoints
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="bg-green-100 text-green-700 text-xs font-mono px-2 py-1 rounded">GET</span>
                            <code className="text-sm text-zinc-700 dark:text-zinc-300">/api/users</code>
                            <span className="text-xs text-zinc-500">— Fetch all users</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-700 text-xs font-mono px-2 py-1 rounded">POST</span>
                            <code className="text-sm text-zinc-700 dark:text-zinc-300">/api/users</code>
                            <span className="text-xs text-zinc-500">— Create a user (JSON: name, email)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-yellow-100 text-yellow-700 text-xs font-mono px-2 py-1 rounded">PUT</span>
                            <code className="text-sm text-zinc-700 dark:text-zinc-300">/api/users</code>
                            <span className="text-xs text-zinc-500">— Update a user (JSON: id, name, email)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="bg-red-100 text-red-700 text-xs font-mono px-2 py-1 rounded">DELETE</span>
                            <code className="text-sm text-zinc-700 dark:text-zinc-300">/api/users</code>
                            <span className="text-xs text-zinc-500">— Delete a user (JSON: id)</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
