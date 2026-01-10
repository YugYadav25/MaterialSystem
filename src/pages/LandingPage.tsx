import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="relative flex min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark text-[#111816] dark:text-white transition-colors duration-200">
            <div className="layout-container flex h-full grow flex-col">
                {/* Navigation Bar */}
                <header className="flex flex-col border-b border-solid border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-background-dark sticky top-0 z-50">
                    <div className="flex items-center justify-between px-4 md:px-10 py-3">
                        <div className="flex items-center gap-4 text-[#111816] dark:text-white">
                            <div className="size-8 text-primary">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174 34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571 41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722 13.8261 17.4264Z" fill="currentColor"></path>
                                    <path clipRule="evenodd" d="M39.998 12.236C39.9944 12.2537 39.9875 12.2845 39.9748 12.3294C39.9436 12.4399 39.8949 12.5741 39.8346 12.7175C39.8168 12.7597 39.7989 12.8007 39.7813 12.8398C38.5103 13.7113 35.9788 14.9393 33.7095 15.4811C30.9875 16.131 27.6413 16.5217 24 16.5217C20.3587 16.5217 17.0125 16.131 14.2905 15.4811C12.0012 14.9346 9.44505 13.6897 8.18538 12.8168C8.17384 12.7925 8.16216 12.767 8.15052 12.7408C8.09919 12.6249 8.05721 12.5114 8.02977 12.411C8.00356 12.3152 8.00039 12.2667 8.00004 12.2612C8.00004 12.261 8 12.2607 8.00004 12.2612C8.00004 12.2359 8.0104 11.9233 8.68485 11.3686C9.34546 10.8254 10.4222 10.2469 11.9291 9.72276C14.9242 8.68098 19.1919 8 24 8C28.8081 8 33.0758 8.68098 36.0709 9.72276C37.5778 10.2469 38.6545 10.8254 39.3151 11.3686C39.9006 11.8501 39.9857 12.1489 39.998 12.236ZM4.95178 15.2312L21.4543 41.6973C22.6288 43.5809 25.3712 43.5809 26.5457 41.6973L43.0534 15.223C43.0709 15.1948 43.0878 15.1662 43.104 15.1371L41.3563 14.1648C43.104 15.1371 43.1038 15.1374 43.104 15.1371L43.1051 15.135L43.1065 15.1325L43.1101 15.1261L43.1199 15.1082C43.1276 15.094 43.1377 15.0754 43.1497 15.0527C43.1738 15.0075 43.2062 14.9455 43.244 14.8701C43.319 14.7208 43.4196 14.511 43.5217 14.2683C43.6901 13.8679 44 13.0689 44 12.2609C44 10.5573 43.003 9.22254 41.8558 8.2791C40.6947 7.32427 39.1354 6.55361 37.385 5.94477C33.8654 4.72057 29.133 4 24 4C18.867 4 14.1346 4.72057 10.615 5.94478C8.86463 6.55361 7.30529 7.32428 6.14419 8.27911C4.99695 9.22255 3.99999 10.5573 3.99999 12.2609C3.99999 13.1275 4.29264 13.9078 4.49321 14.3607C4.60375 14.6102 4.71348 14.8196 4.79687 14.9689C4.83898 15.0444 4.87547 15.1065 4.9035 15.1529C4.91754 15.1762 4.92954 15.1957 4.93916 15.2111L4.94662 15.223L4.95178 15.2312ZM35.9868 18.996L24 38.22L12.0131 18.996C12.4661 19.1391 12.9179 19.2658 13.3617 19.3718C16.4281 20.1039 20.0901 20.5217 24 20.5217C27.9099 20.5217 31.5719 20.1039 34.6383 19.3718C35.082 19.2658 35.5339 19.1391 35.9868 18.996Z" fill="currentColor" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] font-display">MaterialSystem</h2>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2">
                                <span className="material-symbols-outlined text-3xl">menu</span>
                            </button>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex flex-1 justify-end gap-8">
                            <nav className="flex items-center gap-9">
                                <a className="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Home</a>
                                <a className="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Materials</a>
                                <a className="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#about">About</a>
                            </nav>
                            <div className="flex gap-2">
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                                            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-[#111816] text-sm font-bold leading-normal hover:opacity-90 transition-opacity"
                                        >
                                            {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                logout();
                                                navigate('/');
                                            }}
                                            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f0f4f3] dark:bg-[#2a3c36] text-[#111816] dark:text-white text-sm font-bold leading-normal hover:bg-[#e0e6e4] dark:hover:bg-[#344a42] transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-[#f0f4f3] dark:bg-[#2a3c36] text-[#111816] dark:text-white text-sm font-bold leading-normal hover:bg-[#e0e6e4] dark:hover:bg-[#344a42] transition-colors"
                                    >
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMenuOpen && (
                        <div className="md:hidden flex flex-col items-center gap-4 py-6 border-t border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-background-dark animate-in slide-in-from-top-2">
                            <a className="text-base font-medium leading-normal hover:text-primary transition-colors" href="#">Home</a>
                            <a className="text-base font-medium leading-normal hover:text-primary transition-colors" href="#">Materials</a>
                            <a className="text-base font-medium leading-normal hover:text-primary transition-colors" href="#about">About</a>
                            <div className="flex gap-4 pt-4 border-t w-full justify-center border-[#dbe6e2] dark:border-[#2a3c36]">
                                {isAuthenticated ? (
                                    <button
                                        onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                                        className="rounded-lg h-12 px-6 bg-primary text-[#111816] font-bold"
                                    >
                                        {user?.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="rounded-lg h-12 px-6 bg-[#f0f4f3] dark:bg-[#2a3c36] text-[#111816] dark:text-white font-bold"
                                    >
                                        Login
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                <main className="flex flex-col flex-1">
                    {/* Hero Section */}
                    <section className="flex flex-col items-center justify-center bg-white dark:bg-background-dark py-12 @container">
                        <div className="max-w-[1200px] w-full px-4 md:px-10 flex flex-col lg:flex-row items-center gap-12">
                            <div className="flex flex-col gap-6 lg:w-1/2">
                                <div className="flex flex-col gap-4 text-left">
                                    <h1 className="text-[#111816] dark:text-white text-5xl font-black leading-tight tracking-[-0.033em] @[480px]:text-6xl font-display">
                                        The Central Hub for <span className="text-primary">Unique</span> Material Data
                                    </h1>
                                    <p className="text-[#4b635a] dark:text-[#aabcb5] text-lg font-normal leading-relaxed max-w-[540px]">
                                        Efficiently manage, submit, and track industrial materials with our high-integrity database system. Built for professionals who value precision.
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <button
                                        onClick={() => navigate(user && user.role === 'admin' ? '/admin' : '/dashboard')}
                                        className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-[#111816] text-base font-bold tracking-wide shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        {user && user.role === 'admin' ? 'Admin Panel' : 'Submit Materials'}
                                    </button>
                                    <button className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-[#2a3c36] border-2 border-[#dbe6e2] dark:border-[#344a42] text-[#111816] dark:text-white text-base font-bold hover:bg-[#f6f8f7] dark:hover:bg-[#3d554c] transition-all">
                                        View All Materials
                                    </button>
                                </div>
                            </div>
                            <div className="lg:w-1/2 w-full">
                                <div
                                    className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-2xl shadow-2xl border-4 border-white dark:border-[#2a3c36]"
                                    data-alt="Abstract 3D crystalline structures and industrial textures"
                                    style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC4fcr1sADDKETmkVx8oWRQGXSfocmwqdGJuiqdioHbtBvUlBVLsBRNRCpn5NLmUIezUNC-ASFpiB-Z4L_R9RE6Hrhseau3_YzeYtNI8rpz6X393rXGRi1_WE8WGiEcnO4QorEwd9IcIOouS-jpPpuF0q6iZ2oJ1xKB5Bomythu2p4lWs1qToQAIfio4lYqk3acVwRXlGf3MdlCkUd8pzqNxe55x5zlAHeufDIn1YrknIv9ncMa62ne7hV6jc11PQBHeSdhwQQsB_0")' }}
                                >
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section Header */}
                    <section className="max-w-[1200px] mx-auto w-full px-4 md:px-10 pt-20">
                        <div className="flex flex-col gap-2">
                            <span className="text-primary font-bold tracking-widest text-xs uppercase">Process & Standards</span>
                            <h2 className="text-[#111816] dark:text-white text-3xl font-black leading-tight tracking-[-0.015em] font-display">How It Works</h2>
                        </div>
                    </section>

                    {/* Feature/Policy Section */}
                    <section className="max-w-[1200px] mx-auto w-full px-4 md:px-10 py-10">
                        <div className="flex flex-col gap-10 @container">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Card 1 */}
                                <div className="flex flex-col gap-4 rounded-2xl border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#152a23] p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[32px]">list_alt</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-[#111816] dark:text-white text-xl font-bold leading-tight">15-Material Rule</h2>
                                        <p className="text-[#61897c] dark:text-[#aabcb5] text-sm font-normal leading-relaxed">
                                            Every submission batch must adhere to our volume standard for consistency. We process batches of 15 to ensure data integrity during ingest.
                                        </p>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="flex flex-col gap-4 rounded-2xl border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#152a23] p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[32px]">verified_user</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-[#111816] dark:text-white text-xl font-bold leading-tight">Zero Duplication</h2>
                                        <p className="text-[#61897c] dark:text-[#aabcb5] text-sm font-normal leading-relaxed">
                                            Our proprietary matching engine automatically flags existing entries. We only store unique, high-value data points for our members.
                                        </p>
                                    </div>
                                </div>
                                {/* Card 3 */}
                                <div className="flex flex-col gap-4 rounded-2xl border border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-[#152a23] p-8 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[32px]">gavel</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-[#111816] dark:text-white text-xl font-bold leading-tight">Admin Verification</h2>
                                        <p className="text-[#61897c] dark:text-[#aabcb5] text-sm font-normal leading-relaxed">
                                            Nothing goes live without a human touch. All submissions are reviewed by industry experts to ensure technical accuracy and quality.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* About Section */}
                    <section id="about" className="max-w-[1200px] mx-auto w-full px-4 md:px-10 py-12 bg-white dark:bg-background-dark scroll-mt-20">
                        <div className="flex flex-col gap-6 items-center">
                            <h2 className="text-[#111816] dark:text-white text-2xl font-black leading-tight tracking-[-0.015em] font-display">Creators</h2>
                            <div className="flex flex-wrap justify-center gap-6 w-full max-w-[800px]">
                                {/* User Card */}
                                <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-[#dbe6e2] dark:border-[#2a3c36] bg-[#f8fcfb] dark:bg-[#152a23] shadow-sm w-full sm:w-[280px]">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                                        YY
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center w-full">
                                        <h3 className="text-[#111816] dark:text-white text-lg font-bold">Yug Yadav</h3>
                                        <a href="https://www.linkedin.com/in/yug-yadav-b27366248/" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:opacity-90 transition-opacity text-xs font-bold w-full">
                                            <span>Connect</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Friend Card (Vishwesh) */}
                                <div className="flex flex-col items-center gap-3 p-5 rounded-2xl border border-[#dbe6e2] dark:border-[#2a3c36] bg-[#f8fcfb] dark:bg-[#152a23] shadow-sm w-full sm:w-[280px]">
                                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                                        VP
                                    </div>
                                    <div className="flex flex-col items-center gap-1 text-center w-full">
                                        <h3 className="text-[#111816] dark:text-white text-lg font-bold">Vishwesh Patel</h3>
                                        <a href="https://www.linkedin.com/in/vishwesh-patel-589022294/" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg hover:opacity-90 transition-opacity text-xs font-bold w-full">
                                            <span>Connect</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* CTA Section */}
                    <section className="max-w-[1200px] mx-auto w-full px-4 md:px-10 py-20 mb-20">
                        <div className="rounded-[2rem] bg-[#111816] dark:bg-[#0c1814] p-10 md:p-16 flex flex-col items-center text-center gap-8 relative overflow-hidden">
                            {/* Abstract Background Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
                            <div className="flex flex-col gap-4 z-10">
                                <h2 className="text-white text-4xl font-black font-display tracking-tight md:text-5xl">Ready to contribute?</h2>
                                <p className="text-[#aabcb5] text-lg font-normal max-w-[600px] mx-auto">
                                    Join our community of 5,000+ professionals and help build the most comprehensive, high-integrity material database in the world.
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4 z-10">
                                <button
                                    onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                                    className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-[#111816] text-base font-bold shadow-xl shadow-primary/10 hover:opacity-90 transition-all"
                                >
                                    {user?.role === 'admin' ? 'Go to Admin Panel' : 'Submit Materials'}
                                </button>
                                <button className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-transparent border-2 border-[#aabcb5]/30 text-white text-base font-bold hover:bg-white/10 transition-all">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t border-[#dbe6e2] dark:border-[#2a3c36] bg-white dark:bg-background-dark px-10 py-12">
                    <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-[#111816] dark:text-white">
                                <span className="material-symbols-outlined text-primary">database</span>
                                <span className="text-lg font-bold font-display">MaterialSystem</span>
                            </div>
                            <p className="text-[#61897c] dark:text-[#aabcb5] text-sm max-w-[300px]">
                                The standard for industrial material data integrity and unique entry management.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                            <div className="flex flex-col gap-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#111816] dark:text-white">Platform</h4>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Materials</a>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Submission API</a>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Integrations</a>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#111816] dark:text-white">Company</h4>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">About Us</a>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Careers</a>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Blog</a>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-[#111816] dark:text-white">Legal</h4>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Privacy Policy</a>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Terms of Service</a>
                                <a className="text-sm text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-[1200px] mx-auto mt-12 pt-8 border-t border-[#dbe6e2]/50 dark:border-[#2a3c36]/50 flex flex-col md:flex-row justify-between gap-4">
                        <p className="text-xs text-[#61897c] dark:text-[#aabcb5]">© 2024 Material System. All rights reserved.</p>
                        <div className="flex gap-4">
                            <a className="text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-xl">language</span></a>
                            <a className="text-[#61897c] dark:text-[#aabcb5] hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined text-xl">share</span></a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default LandingPage;
