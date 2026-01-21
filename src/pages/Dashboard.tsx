import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<string[]>(Array(15).fill(''));
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || ''
  });
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ matches: string[], query: string } | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResult(null);
    try {
      const res = await axios.get(`/api/materials/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResult({
        matches: res.data.matches,
        query: searchQuery
      });
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  };

  // Fetch existing status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get('/api/materials');
        if (res.data.hasSubmitted) {
          setHasSubmitted(true);
          setMaterials(res.data.materials);
          setConfirmed(true);
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  // Failsafe: Redirect Admin to /admin if they somehow reach here
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  // Update name if user context loads later
  useEffect(() => {
    if (user) {
      setPersonalInfo(prev => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);

  // Helper to update material at index
  const updateMaterial = (index: number, value: string) => {
    if (hasSubmitted && !isEditing) return; // Prevent edits if submitted and not editing
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
    setError('');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset error when toggling
    setError('');
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (materials.some(m => !m.trim())) {
      setError('Please fill in all 15 material fields.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.put('/api/materials', { materials });
      setSuccess('Materials updated successfully!');
      setMaterials(res.data.materials);
      setIsEditing(false); // Lock again
      window.scrollTo(0, 0);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Update failed.';
      if (err.response?.data?.duplicates) {
        setError(`${msg} Duplicates: ${err.response.data.duplicates.join(', ')}`);
      } else {
        setError(msg);
      }
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    // Frontend Validation
    if (materials.some(m => !m.trim())) {
      setError('Please fill in all 15 material fields.');
      setSubmitting(false);
      return;
    }
    if (!confirmed) {
      setError('You must confirm that your materials are unique.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await axios.post('/api/materials', { materials });
      setSuccess('Submission Successful! Your materials have been locked.');
      setHasSubmitted(true);
      setMaterials(res.data.materials);
      // Scroll to top to see success
      window.scrollTo(0, 0);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      if (err.response?.data?.duplicates) {
        setError(`${msg} Duplicates: ${err.response.data.duplicates.join(', ')}`);
      } else {
        setError(msg);
      }
      // Scroll to top to see error
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (user && user.role === 'admin')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark text-[#111816] dark:text-white">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col w-full group/design-root overflow-x-hidden min-h-screen bg-background-light dark:bg-background-dark text-[#111816] dark:text-white">
      <main className="flex flex-1 justify-center py-10 px-4 md:px-10 lg:px-40">
        <div className="max-w-[960px] w-full flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white dark:bg-[#1a2e28] rounded-xl shadow-sm border border-[#dbe6e2] dark:border-[#2a3c36]">
            <div className="flex flex-col gap-2">
              <p className="text-[#111816] dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
                {hasSubmitted ? 'My Submitted Materials' : 'Submit Unique Materials'}
              </p>
              <p className="text-[#61897c] dark:text-[#a0c4b8] text-base font-normal leading-normal">
                {hasSubmitted
                  ? "Materials locked and saved."
                  : "Register your 15 unique materials."
                }
              </p>
            </div>
            {hasSubmitted && (
              <button
                onClick={handleEditToggle}
                className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors"
              >
                {isEditing ? 'Cancel Editing' : 'Edit Materials'}
              </button>
            )}
          </div>

          {/* Alerts */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-800 dark:text-red-200 text-sm">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 rounded-lg text-green-800 dark:text-green-200 text-sm">
              <span className="material-symbols-outlined">check_circle</span>
              <p>{success}</p>
            </div>
          )}

          {!hasSubmitted && !error && !success && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
              <span className="material-symbols-outlined">warning</span>
              <p>System Check: all 15 materials must be unique.</p>
            </div>
          )}

          {/* Submission Form Container */}
          <div className="bg-white dark:bg-[#1a2e28] rounded-xl border border-[#dbe6e2] dark:border-[#2a3c36] overflow-hidden shadow-sm">
            {/* Section: Personal Information */}
            <div className="p-4 md:p-8 border-b border-[#f0f4f3] dark:border-[#2a3c36]">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">person</span>
                <h2 className="text-[#111816] dark:text-white text-xl font-bold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-[#111816] dark:text-white text-sm font-semibold">Full Name</span>
                  <input
                    className="form-input flex w-full rounded-lg text-[#111816] focus:outline-0 focus:ring-2 focus:ring-primary border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base font-normal disabled:opacity-70 disabled:cursor-not-allowed"
                    value={personalInfo.fullName}
                    disabled
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[#111816] dark:text-white text-sm font-semibold">Email Address</span>
                  <input
                    className="form-input flex w-full rounded-lg text-[#111816] focus:outline-0 focus:ring-2 focus:ring-primary border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base font-normal disabled:opacity-70 disabled:cursor-not-allowed"
                    value={personalInfo.email}
                    disabled
                  />
                </label>
              </div>
            </div>

            {/* Section: Material Search */}
            <div className="p-4 md:p-8 border-b border-[#f0f4f3] dark:border-[#2a3c36] bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">search</span>
                  <h2 className="text-[#111816] dark:text-white text-xl font-bold">Check Availability</h2>
                </div>
                <p className="text-sm text-[#61897c] dark:text-[#a0c4b8]">Check if a material has already been submitted.</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <input
                    className="form-input flex-1 rounded-lg border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base focus:ring-primary focus:border-primary"
                    placeholder="Type material name (e.g. Aluminum 6061)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching || !searchQuery.trim()}
                    className="flex items-center justify-center gap-2 rounded-lg px-6 bg-primary text-[#10221c] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                  >
                    {searching ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined">search</span>
                    )}
                    <span className="hidden md:inline">Check</span>
                  </button>
                </div>

                {/* Search Results */}
                {searchResult && (
                  <div className={`p-4 rounded-lg border ${searchResult.matches.length > 0
                    ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-200'
                    : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-200'
                    }`}>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined">
                        {searchResult.matches.length > 0 ? 'cancel' : 'check_circle'}
                      </span>
                      <div>
                        <p className="font-bold">
                          {searchResult.matches.length > 0
                            ? 'Material(s) found!'
                            : 'Material appears to be available!'
                          }
                        </p>
                        <p className="text-sm mt-1">
                          {searchResult.matches.length > 0
                            ? `The following materials have already been submitted: ${searchResult.matches.join(', ')}`
                            : `No matches found for "${searchResult.query}". It seems safe to use.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Material List */}
            <div className="p-4 md:p-8 bg-background-light/30 dark:bg-background-dark/10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <h2 className="text-[#111816] dark:text-white text-xl font-bold">Material List</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#61897c]">Progress: {materials.filter(m => m.length > 0).length} / 15</span>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="flex items-center gap-2 cursor-pointer rounded-lg h-9 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold text-xs transition-all"
                  >
                    Logout
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {/* Column 1: Items 1-8 */}
                <div className="flex flex-col gap-6">
                  {materials.slice(0, 8).map((material, index) => {
                    const actualIndex = index; // 0-7
                    return (
                      <div className="relative group" key={actualIndex}>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-black text-primary/30 group-focus-within:text-primary transition-colors">
                            {String(actualIndex + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                            <input
                              className="form-input w-full rounded-lg border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base focus:ring-primary focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder="Enter material name"
                              value={material}
                              onChange={(e) => updateMaterial(actualIndex, e.target.value)}
                              disabled={hasSubmitted && !isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Column 2: Items 9-15 */}
                <div className="flex flex-col gap-6">
                  {materials.slice(8, 15).map((material, index) => {
                    const actualIndex = index + 8; // 8-14
                    return (
                      <div className="relative group" key={actualIndex}>
                        <div className="flex items-center gap-4">
                          <span className="text-2xl font-black text-primary/30 group-focus-within:text-primary transition-colors">
                            {String(actualIndex + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                            <input
                              className="form-input w-full rounded-lg border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base focus:ring-primary focus:border-primary disabled:opacity-70 disabled:cursor-not-allowed"
                              placeholder="Enter material name"
                              value={material}
                              onChange={(e) => updateMaterial(actualIndex, e.target.value)}
                              disabled={hasSubmitted && !isEditing}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Action Area */}
            {(!hasSubmitted || isEditing) && (
              <div className="p-8 border-t border-[#f0f4f3] dark:border-[#2a3c36] flex flex-col items-center gap-6">
                {!hasSubmitted && (
                  <div className="flex items-start gap-3 w-full max-w-lg">
                    <input
                      className="mt-1 rounded border-[#dbe6e2] text-primary focus:ring-primary"
                      id="confirm"
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                    />
                    <label className="text-sm text-[#61897c] dark:text-[#a0c4b8]" htmlFor="confirm">
                      I confirm that all materials listed are unique and I understand that I can only submit this form once.
                    </label>
                  </div>
                )}

                {isEditing ? (
                  <button
                    onClick={handleUpdate}
                    disabled={submitting}
                    className="flex w-full max-w-lg items-center justify-center gap-2 rounded-xl h-14 bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 transition-all shadow-lg items-center disabled:opacity-70 disabled:cursor-not-allowed">
                    <span>{submitting ? 'Updating...' : 'Update Materials'}</span>
                    {!submitting && <span className="material-symbols-outlined">save</span>}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex w-full max-w-lg items-center justify-center gap-2 rounded-xl h-14 bg-primary text-[#10221c] text-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed">
                    <span>{submitting ? 'Submitting...' : 'Submit Materials'}</span>
                    {!submitting && <span className="material-symbols-outlined">send</span>}
                  </button>
                )}

                <p className="text-xs text-[#61897c] dark:text-[#a0c4b8] text-center">
                  By clicking submit, you agree to our Material Management Terms & Services.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
