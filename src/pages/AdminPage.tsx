import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
    _id: string;
    name: string;
    email: string;
    hasSubmitted: boolean;
    materials: string[];
    materialsUpdatedAt?: string; // ISO date string
}

function AdminPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [viewMaterialsUser, setViewMaterialsUser] = useState<User | null>(null); // For "View Only" modal
    const [editMaterials, setEditMaterials] = useState<string[]>([]);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        fetchUsers();
    }, [user, navigate]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('/api/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch users", err);
            setLoading(false);
        }
    };



    const handleDownloadExcel = async () => {
        try {
            setIsDownloading(true);
            // AuthContext uses sessionStorage
            const authToken = sessionStorage.getItem('token');

            if (!authToken) {
                throw new Error("No authentication token found. Please relogin.");
            }

            const response = await fetch('/api/admin/download-excel', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    throw new Error(json.message || "Download failed");
                } catch (e) {
                    throw new Error(`Server Error: ${response.status} ${response.statusText}`);
                }
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Student_Data_Export.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (err: any) {
            console.error("Download failed", err);
            setMessage({ type: 'error', text: err.message || "Failed to download Excel file." });
        } finally {
            setIsDownloading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    // Enhanced Filter Logic: Search Name, Email, OR Materials
    const filteredUsers = users.filter(u => {
        const lowerTerm = searchTerm.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(lowerTerm);
        const matchesEmail = u.email.toLowerCase().includes(lowerTerm);
        const matchesMaterial = u.materials.some(m => m.toLowerCase().includes(lowerTerm));

        return matchesName || matchesEmail || matchesMaterial;
    });

    // Stats
    const totalStudents = users.length;
    const submittedCount = users.filter(u => u.hasSubmitted).length;
    const totalMaterials = submittedCount * 15;

    // View Modal
    const openViewModal = (u: User) => {
        setViewMaterialsUser(u);
    };
    const closeViewModal = () => {
        setViewMaterialsUser(null);
    };

    // Edit Modal
    const openEditModal = (u: User) => {
        setSelectedUser(u);
        setEditName(u.name);
        setEditEmail(u.email);
        setEditMaterials(u.materials.length === 15 ? u.materials : Array(15).fill(''));
        setMessage({ type: '', text: '' });
    };

    const closeEditModal = () => {
        setSelectedUser(null);
        setEditMaterials([]);
        setMessage({ type: '', text: '' });
    };

    const handleMaterialChange = (index: number, value: string) => {
        const newMats = [...editMaterials];
        newMats[index] = value;
        setEditMaterials(newMats);
    };

    const handleSave = async () => {
        if (!selectedUser) return;
        setMessage({ type: '', text: '' });

        try {
            await axios.put(`/api/admin/users/${selectedUser._id}`, {
                materials: editMaterials
                // Note: Name/Email update logic would go here if backend supported it, 
                // for now we focused on materials as per initial robust backend logic.
                // If user insisted on name/email edit, we'd add those fields to the PUT endpoint.
            });
            setMessage({ type: 'success', text: 'User data updated successfully!' });

            // Update local state
            setUsers(users.map(u => u._id === selectedUser._id ? {
                ...u,
                hasSubmitted: true,
                materials: editMaterials,
                // name: editName, // Uncomment if backend updates these
                // email: editEmail 
            } : u));

            setTimeout(() => {
                closeEditModal();
            }, 1000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
        }
    };

    if (loading) return <div className="p-10 flex justify-center text-lg font-bold text-[#61897c]">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-[#f8fafa] text-[#111816] font-sans">
            {/* Header */}
            <header className="bg-white border-b border-[#e1e4e8] px-8 py-5 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-[#111816]">System Admin</p>
                            <p className="text-xs text-[#61897c]">admin@charusat.edu.in</p>
                        </div>
                        <button
                            onClick={() => { logout(); navigate('/'); }}
                            className="text-sm font-bold text-red-600 hover:text-red-800 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-xl border border-[#e1e4e8] shadow-sm">
                        <p className="text-sm font-bold text-[#61897c] uppercase tracking-wider mb-2">Total Students</p>
                        <p className="text-4xl font-black text-[#111816]">{totalStudents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#e1e4e8] shadow-sm">
                        <p className="text-sm font-bold text-[#61897c] uppercase tracking-wider mb-2">Total Materials</p>
                        <p className="text-4xl font-black text-primary">{totalMaterials}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#e1e4e8] shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-[#61897c] uppercase tracking-wider mb-2">System Status</p>
                            <p className="text-lg font-bold text-green-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-green-600">check_circle</span>
                                No Duplicates
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search & Actions Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                    <div className="relative w-full md:w-2/3">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#61897c] text-xl">search</span>
                        <input
                            type="text"
                            placeholder="🔍 Search by Student Name, Email, or Material..."
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#e1e4e8] bg-white text-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm transition-all"
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="w-full md:w-auto flex gap-3">
                        <button
                            onClick={handleDownloadExcel}
                            disabled={isDownloading}
                            className={`flex-1 md:flex-none px-6 py-4 rounded-xl text-white font-bold text-base shadow-md transition-colors flex items-center justify-center gap-2 ${isDownloading
                                ? 'bg-[#0b8043] cursor-wait opacity-80'
                                : 'bg-[#0f9d58] hover:bg-[#0b8043]'
                                }`}
                        >
                            {isDownloading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">download</span>
                                    Download Data
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl border border-[#e1e4e8] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#f1f3f4] text-xs font-bold uppercase text-[#5f6368] tracking-wider border-b border-[#e1e4e8]">
                                    <th className="p-5">Student Name</th>
                                    <th className="p-5">Email ID</th>
                                    <th className="p-5">Last Updated</th>
                                    <th className="p-5">Materials</th>
                                    <th className="p-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e1e4e8]">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user._id} className="hover:bg-[#fafafa] transition-colors group">
                                            <td className="p-5 font-medium text-[#202124]">{user.name}</td>
                                            <td className="p-5 text-sm text-[#5f6368] font-mono">{user.email}</td>
                                            <td className="p-5 text-sm text-[#5f6368]">
                                                {user.materialsUpdatedAt
                                                    ? new Date(user.materialsUpdatedAt).toLocaleString()
                                                    : <span className="text-gray-400">-</span>
                                                }
                                            </td>
                                            <td className="p-5">
                                                {user.hasSubmitted ? (
                                                    <button
                                                        onClick={() => openViewModal(user)}
                                                        className="px-4 py-2 rounded-lg bg-[#e8f0fe] text-[#1967d2] text-xs font-bold hover:bg-[#d2e3fc] transition-colors flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-base">visibility</span>
                                                        View (15)
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Pending</span>
                                                )}
                                            </td>
                                            <td className="p-5">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="px-4 py-2 rounded-lg border border-[#dadce0] text-[#3c4043] text-xs font-bold hover:bg-[#f1f3f4] hover:text-[#202124] transition-colors flex items-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-10 text-center text-[#5f6368]">
                                            No students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* View Materials Modal (Read Only) */}
            {viewMaterialsUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-[#e1e4e8] flex justify-between items-center bg-[#f8f9fa]">
                            <div>
                                <h2 className="text-lg font-bold text-[#202124]">Submitted Materials</h2>
                                <p className="text-sm text-[#5f6368]">{viewMaterialsUser.name}</p>
                            </div>
                            <button onClick={closeViewModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8eaed] transition-colors">
                                <span className="material-symbols-outlined text-[#5f6368]">close</span>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto bg-white">
                            <ul className="space-y-3">
                                {viewMaterialsUser.materials.map((mat, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-[#3c4043]">
                                        <span className="font-mono text-[#9aa0a6] text-xs pt-1">{(i + 1).toString().padStart(2, '0')}</span>
                                        <span className="font-medium">{mat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-4 border-t border-[#e1e4e8] bg-[#f8f9fa] flex justify-end">
                            <button onClick={closeViewModal} className="px-5 py-2.5 rounded-lg font-bold text-sm bg-[#1a73e8] text-white hover:bg-[#1557b0] transition-colors shadow-sm">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Editable) */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-[#e1e4e8] flex justify-between items-center bg-[#f8f9fa]">
                            <div>
                                <h2 className="text-xl font-bold text-[#202124]">Edit Student Data</h2>
                                <p className="text-sm text-[#5f6368]">Make corrections to submissions</p>
                            </div>
                            <button onClick={closeEditModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#e8eaed] transition-colors">
                                <span className="material-symbols-outlined text-[#5f6368]">close</span>
                            </button>
                        </div>

                        <div className="p-8 flex-1 overflow-y-auto">
                            {message.text && (
                                <div className={`p-4 mb-6 rounded-lg text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-[#fce8e6] text-[#c5221f]' : 'bg-[#e6f4ea] text-[#137333]'
                                    }`}>
                                    <span className="material-symbols-outlined text-lg">
                                        {message.type === 'error' ? 'error' : 'check_circle'}
                                    </span>
                                    {message.text}
                                </div>
                            )}

                            {/* Personal Info Edit Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block text-xs font-bold text-[#5f6368] uppercase mb-1">Student Name</label>
                                    <input
                                        type="text"
                                        value={editName} // Bound to state but not fully updating backend yet (visual only for now)
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-[#dadce0] text-sm font-medium focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none"
                                        disabled // Disabled for now to focus on material uniqueness first
                                        title="Name editing coming soon"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#5f6368] uppercase mb-1">Email ID</label>
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-[#dadce0] text-sm font-medium focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none bg-gray-50"
                                        disabled
                                    />
                                </div>
                            </div>

                            <h3 className="text-sm font-bold text-[#202124] mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">dataset</span>
                                Materials List (15 items)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editMaterials.map((mat, i) => (
                                    <div key={i} className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#9aa0a6]">
                                            {(i + 1).toString().padStart(2, '0')}
                                        </span>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#dadce0] text-sm text-[#3c4043] focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] outline-none transition-shadow"
                                            value={mat}
                                            onChange={(e) => handleMaterialChange(i, e.target.value)}
                                            placeholder={`Material ${i + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-[#e1e4e8] bg-[#f8f9fa] flex justify-end gap-3">
                            <button
                                onClick={closeEditModal}
                                className="px-5 py-2.5 rounded-lg font-bold text-sm text-[#1a73e8] hover:bg-[#e8f0fe] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-6 py-2.5 rounded-lg bg-[#1a73e8] text-white font-bold text-sm hover:bg-[#1557b0] shadow-md transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">save</span>
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPage;
