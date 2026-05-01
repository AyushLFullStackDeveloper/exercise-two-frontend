/**
 * @file Dashboard.tsx
 * @description The main landing interface after successful authentication and context selection.
 * Dynamically renders statistics and layouts based on the active role (e.g., Admin, Student).
 */

import React, { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/logo_black.png";
import logoWhite from "../assets/images/logo_white.png";
import apiClient from "../services/api";
import Button from "../components/common/Button";

const AvatarSVG = () => (<svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#15803d"/><path d="M18 19C20.7614 19 23 16.7614 23 14C23 11.2386 20.7614 9 18 9C15.2386 9 13 11.2386 13 14C13 16.7614 15.2386 19 18 19Z" fill="#fcd34d"/><path d="M26 27C26 23.6863 22.4183 21 18 21C13.5817 21 10 23.6863 10 27" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11C13 9 16 8 18 8C20 8 23 9 24 11C23 10 20 9.5 18 9.5C16 9.5 13 10 12 11Z" fill="#1f2937"/></svg>);
const LogoutIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>);
const MenuIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>);

/**
 * Defines the structure for a single Dashboard statistic card.
 */
interface Stat { id: number; value: string; label: string; desc: string; bg: string; color: string; textBg: string; }

/**
 * Defines the complete panel configuration for a specific role.
 */
interface RolePanel { title: string; stats: Stat[]; }

const rolePanels: Record<string, RolePanel> = {
    Admin: {
        title: "Admin Panel",
        stats: [
            { id: 1, value: "08", label: "Active Institutes", desc: "Institutes actively operating and using the platform for daily management", bg: "var(--stat-bg-1)", color: "var(--stat-text-1)", textBg: "var(--stat-desc-1)" },
            { id: 2, value: "05", label: "Inactive Institutes", desc: "Institutes currently inactive and not participating in system operations", bg: "var(--stat-bg-2)", color: "var(--stat-text-2)", textBg: "var(--stat-desc-2)" },
            { id: 3, value: "15+", label: "Total Modules", desc: "Complete set of features enabling academic and administrative workflows", bg: "var(--stat-bg-3)", color: "var(--stat-text-3)", textBg: "var(--stat-desc-3)" },
            { id: 4, value: "50+", label: "Total Users", desc: "All registered users across institutes using the platform services", bg: "var(--stat-bg-4)", color: "var(--stat-text-4)", textBg: "var(--stat-desc-4)" }
        ]
    },
    Teacher: {
        title: "Teacher Panel",
        stats: [
            { id: 1, value: "04", label: "Classes Assigned", desc: "Total classes you are teaching this semester", bg: "var(--stat-bg-2)", color: "var(--stat-text-2)", textBg: "var(--stat-desc-2)" },
            { id: 2, value: "120", label: "Total Students", desc: "Students enrolled across all your classes", bg: "var(--stat-bg-3)", color: "var(--stat-text-3)", textBg: "var(--stat-desc-3)" },
            { id: 3, value: "12", label: "Pending Assignments", desc: "Assignments waiting to be graded", bg: "#fee2e2", color: "#991b1b", textBg: "#f87171" },
            { id: 4, value: "02", label: "Upcoming Meetings", desc: "Parent-teacher or staff meetings scheduled", bg: "var(--stat-bg-4)", color: "var(--stat-text-4)", textBg: "var(--stat-desc-4)" }
        ]
    },
    Principal: {
        title: "Principal Panel",
        stats: [
            { id: 1, value: "45", label: "Total Teachers", desc: "Registered teaching staff", bg: "var(--stat-bg-1)", color: "var(--stat-text-1)", textBg: "var(--stat-desc-1)" },
            { id: 2, value: "1200", label: "Total Students", desc: "Active students in the institute", bg: "var(--stat-bg-2)", color: "var(--stat-text-2)", textBg: "var(--stat-desc-2)" },
            { id: 3, value: "95%", label: "Average Attendance", desc: "Overall student attendance rate", bg: "var(--stat-bg-3)", color: "var(--stat-text-3)", textBg: "var(--stat-desc-3)" },
            { id: 4, value: "03", label: "Pending Approvals", desc: "Leave requests and administrative approvals", bg: "#fee2e2", color: "#991b1b", textBg: "#f87171" }
        ]
    },
    Parent: {
        title: "Parent Panel",
        stats: [
            { id: 1, value: "02", label: "Children Enrolled", desc: "Your children studying in the institute", bg: "var(--stat-bg-1)", color: "var(--stat-text-1)", textBg: "var(--stat-desc-1)" },
            { id: 2, value: "98%", label: "Attendance", desc: "Average attendance across your children", bg: "var(--stat-bg-2)", color: "var(--stat-text-2)", textBg: "var(--stat-desc-2)" },
            { id: 3, value: "A-", label: "Average Grade", desc: "Latest academic performance", bg: "var(--stat-bg-3)", color: "var(--stat-text-3)", textBg: "var(--stat-desc-3)" },
            { id: 4, value: "01", label: "Upcoming Event", desc: "Next school event or meeting", bg: "var(--stat-bg-4)", color: "var(--stat-text-4)", textBg: "var(--stat-desc-4)" }
        ]
    },
    Student: {
        title: "Student Panel",
        stats: [
            { id: 1, value: "05", label: "Enrolled Courses", desc: "Active subjects you are currently studying", bg: "var(--stat-bg-1)", color: "var(--stat-text-1)", textBg: "var(--stat-desc-1)" },
            { id: 2, value: "92%", label: "Attendance", desc: "Your overall attendance across all classes", bg: "var(--stat-bg-2)", color: "var(--stat-text-2)", textBg: "var(--stat-desc-2)" },
            { id: 3, value: "A", label: "Current Grade", desc: "Overall academic performance", bg: "var(--stat-bg-3)", color: "var(--stat-text-3)", textBg: "var(--stat-desc-3)" },
            { id: 4, value: "03", label: "Pending Assignments", desc: "Tasks you need to complete soon", bg: "#fee2e2", color: "#991b1b", textBg: "#f87171" }
        ]
    },
    Driver: {
        title: "Driver Panel",
        stats: [
            { id: 1, value: "Route A", label: "Current Route", desc: "Your assigned daily transportation route", bg: "var(--stat-bg-1)", color: "var(--stat-text-1)", textBg: "var(--stat-desc-1)" },
            { id: 2, value: "45", label: "Students Assigned", desc: "Total students riding your bus", bg: "var(--stat-bg-2)", color: "var(--stat-text-2)", textBg: "var(--stat-desc-2)" },
            { id: 3, value: "On Time", label: "Status", desc: "Current trip schedule status", bg: "var(--stat-bg-3)", color: "var(--stat-text-3)", textBg: "var(--stat-desc-3)" },
            { id: 4, value: "0", label: "Incidents", desc: "Reported issues on your route", bg: "var(--stat-bg-4)", color: "var(--stat-text-4)", textBg: "var(--stat-desc-4)" }
        ]
    }
};

rolePanels.Administrator = rolePanels.Admin;
rolePanels["Super Admin"] = rolePanels.Admin;
rolePanels["Institute Admin"] = rolePanels.Admin;
rolePanels.Trainer = rolePanels.Teacher;
rolePanels.Staff = rolePanels.Admin;

/**
 * Dashboard Component
 * 
 * The primary authenticated view. Utilizes the selected institute and role 
 * from localStorage to fetch dynamic dashboard stats from the API. Falls back 
 * to hardcoded layouts if the API lacks specific implementations.
 * 
 * @returns {JSX.Element} The rendered Dashboard interface
 */
const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>("");

    const storedUserData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const user = storedUserData ? JSON.parse(storedUserData) : null;
    
    const storedInstituteData = localStorage.getItem("selectedInstitute");
    const selectedInstitute = storedInstituteData ? JSON.parse(storedInstituteData) : null;
    
    const storedRoleData = localStorage.getItem("selectedRole");
    const selectedRole = storedRoleData ? JSON.parse(storedRoleData) : null;

    React.useEffect(() => {
        if (!token || !user) {
            navigate("/");
            return;
        }

        if (!selectedInstitute || !selectedRole) {
            navigate("/select-institute");
            return;
        }

        // Fetch dynamic stats based on context, or use fallback if not provided
        apiClient.get(`/dashboard/stats?institute_id=${selectedInstitute.id}&role_id=${selectedRole.id}`)
            .then((res) => {
                setStats(res.data.data || res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [token, user, selectedInstitute, selectedRole, navigate]);

    /**
     * Clears local session state and redirects to the login screen.
     */
    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    if (!user) {
        return (
            <div style={styles.container}>
                <h2 style={{ textAlign: "center", paddingTop: "50px", color: "var(--text-primary)" }}>Please Login First</h2>
                <div style={{ textAlign: "center", maxWidth: "200px", margin: "0 auto" }}>
                    <Button onClick={() => navigate("/")}>Go to Login</Button>
                </div>
            </div>
        );
    }

    const roleName = selectedRole?.name || "Admin";
    const basePanel = (rolePanels[roleName] || rolePanels.Admin);
    
    const activePanel = {
        ...basePanel,
        stats: basePanel.stats.map((stat, idx) => {
            if (!stats) return stat;
            const backendKeys = Object.keys(stats);
            if (idx < backendKeys.length) {
                return { ...stat, value: stats[backendKeys[idx]] };
            }
            return stat;
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{display: "flex", alignItems: "center"}}>
                    <button className="mobile-menu-btn" style={styles.menuBtn}>
                        <MenuIcon />
                    </button>
                    <div style={styles.logoBox}>
                        <img src={logoBlack} alt="logo" className="logo-light" style={{ width: "24px" }} />
                        <img src={logoWhite} alt="logo" className="logo-dark" style={{ width: "24px" }} />
                        <span className="hide-on-mobile" style={styles.logoText}>MentrixOS</span>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    {selectedInstitute && (
                        <span className="institute-truncate" style={styles.instituteLabel}>{selectedInstitute.name}</span>
                    )}
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <div style={styles.profile} title="Profile">
                            <AvatarSVG />
                        </div>
                        <button style={styles.headerLogoutBtn} onClick={handleLogout}>
                            <LogoutIcon />
                            <span className="hide-on-mobile">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            <div style={styles.content}>
                <h1 style={styles.title}>
                    Hey {user?.full_name || user?.name || "User"} 👋<br />
                    Welcome to MentrixOS {activePanel.title}!
                </h1>
                
                <div style={styles.grid}>
                    {activePanel.stats.map(stat => (
                        <div key={stat.id} style={{...styles.card, background: stat.bg}}>
                            <h2 style={{...styles.cardNumber, color: stat.color}}>{stat.value}</h2>
                            <h3 style={{...styles.cardTitle, color: stat.color}}>{stat.label}</h3>
                            <p style={{...styles.cardDesc, color: stat.textBg}}>
                                {stat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    container: { minHeight: "100vh", background: "var(--bg-color)", fontFamily: "'Inter', Arial, sans-serif" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", background: "var(--header-bg)", borderBottom: "1px solid var(--border-color)" },
    menuBtn: { background: "transparent", border: "none", color: "var(--text-primary)", cursor: "pointer", padding: "4px", marginRight: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
    logoBox: { display: "flex", alignItems: "center", gap: "8px", fontWeight: "700" },
    logoText: { fontSize: "16px", color: "var(--text-primary)" },
    headerRight: { display: "flex", alignItems: "center", gap: "20px" },
    instituteLabel: { fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "300px" },
    profile: { width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" },
    content: { maxWidth: "800px", margin: "60px auto 40px", padding: "0 20px" },
    title: { fontSize: "32px", fontWeight: "700", marginBottom: "40px", color: "var(--text-primary)", textAlign: "center" as const, lineHeight: "1.4" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" },
    card: { padding: "24px", borderRadius: "12px", display: "flex", flexDirection: "column" as const, gap: "8px", textAlign: "left" as const, boxShadow: "var(--shadow-sm)" },
    cardNumber: { margin: "0", fontSize: "24px", fontWeight: "700" },
    cardTitle: { margin: "0", fontSize: "15px", fontWeight: "600" },
    cardDesc: { margin: "0", fontSize: "13px", lineHeight: "1.5" },
    headerLogoutBtn: { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "0.2s" }
};

export default Dashboard;
