import { useState } from 'react';

function Dashboard() {
  const [materials, setMaterials] = useState<string[]>(Array(15).fill(''));
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: ''
  });
  const [confirmed, setConfirmed] = useState(false);

  // Helper to update material at index
  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
  };

  return (
    <div className="relative flex flex-col w-full group/design-root overflow-x-hidden min-h-screen bg-background-light dark:bg-background-dark text-[#111816] dark:text-white">
      <main className="flex flex-1 justify-center py-10 px-4 md:px-10 lg:px-40">
        <div className="max-w-[960px] w-full flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between items-start gap-4 p-4 bg-white dark:bg-[#1a2e28] rounded-xl shadow-sm border border-[#dbe6e2] dark:border-[#2a3c36]">
            <div className="flex flex-col gap-2">
              <p className="text-[#111816] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Submit Unique Materials</p>
              <p className="text-[#61897c] dark:text-[#a0c4b8] text-base font-normal leading-normal">
                Complete the form below to register your 15 unique materials.{" "}
                <span className="font-semibold text-primary">Only 1 submission is allowed per user.</span>
              </p>
            </div>
            <button className="flex items-center gap-2 cursor-pointer rounded-lg h-10 px-4 bg-primary/10 hover:bg-primary/20 text-[#111816] dark:text-white text-sm font-bold leading-normal transition-all">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>View Guidelines</span>
            </button>
          </div>

          {/* Validation Alert */}
          <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
            <span className="material-symbols-outlined">warning</span>
            <p>System Check: You have not submitted for this period. All 15 materials must be unique.</p>
          </div>

          {/* Submission Form Container */}
          <div className="bg-white dark:bg-[#1a2e28] rounded-xl border border-[#dbe6e2] dark:border-[#2a3c36] overflow-hidden shadow-sm">
            {/* Section: Personal Information */}
            <div className="p-8 border-b border-[#f0f4f3] dark:border-[#2a3c36]">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary">person</span>
                <h2 className="text-[#111816] dark:text-white text-xl font-bold">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2">
                  <span className="text-[#111816] dark:text-white text-sm font-semibold">Full Name</span>
                  <input
                    className="form-input flex w-full rounded-lg text-[#111816] focus:outline-0 focus:ring-2 focus:ring-primary border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base font-normal"
                    placeholder="Enter your full name"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[#111816] dark:text-white text-sm font-semibold">Email Address</span>
                  <input
                    className="form-input flex w-full rounded-lg text-[#111816] focus:outline-0 focus:ring-2 focus:ring-primary border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base font-normal"
                    placeholder="email@example.com"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  />
                </label>
              </div>
            </div>

            {/* Section: Material List */}
            <div className="p-8 bg-background-light/30 dark:bg-background-dark/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span>
                  <h2 className="text-[#111816] dark:text-white text-xl font-bold">Material List</h2>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#61897c]">Progress: {materials.filter(m => m.length > 0).length} / 15</span>
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
                              className="form-input w-full rounded-lg border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base focus:ring-primary focus:border-primary"
                              placeholder="Enter material name"
                              value={material}
                              onChange={(e) => updateMaterial(actualIndex, e.target.value)}
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
                              className="form-input w-full rounded-lg border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#10221c] dark:text-white h-12 px-4 text-base focus:ring-primary focus:border-primary"
                              placeholder="Enter material name"
                              value={material}
                              onChange={(e) => updateMaterial(actualIndex, e.target.value)}
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
            <div className="p-8 border-t border-[#f0f4f3] dark:border-[#2a3c36] flex flex-col items-center gap-6">
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
              <button className="flex w-full max-w-lg items-center justify-center gap-2 rounded-xl h-14 bg-primary text-[#10221c] text-lg font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                <span>Submit Materials</span>
                <span className="material-symbols-outlined">send</span>
              </button>
              <p className="text-xs text-[#61897c] dark:text-[#a0c4b8] text-center">
                By clicking submit, you agree to our Material Management Terms & Services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
