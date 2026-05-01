/**
 * @file SelectRole.tsx
 * @description The Role Selection screen for multi-tenant users.
 * Allows users to select their functional context (e.g., Admin, Student) within a previously selected institute.
 */

import React, { useState, CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoBlack from "../assets/images/logo_black.png";
import logoWhite from "../assets/images/logo_white.png";
import adminIcon from "../assets/icons/admin_icon.png";
import studentIcon from "../assets/icons/students_icon.png";
import trainerIcon from "../assets/icons/trainer_icon.png";
import verifyIcon from "../assets/icons/verify_icon.png";
import { authService } from "../services/authService";
import apiClient from "../services/api";
import { APP_STRINGS } from "../constants/strings";

// SVGs
const ShieldIcon = () => (<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><circle cx="12" cy="11" r="3"></circle></svg>);
const ChevronRightIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>);
const ArrowLeftIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>);
const LocationIcon = () => (<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>);
const CheckBadgeIcon = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2563eb" /><polyline points="8 12.5 11 15.5 16 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const InstituteLogoSVG = () => (<svg width="40" height="40" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" /><path d="M50 20L80 80H20L50 20Z" fill="#0f172a" /><circle cx="50" cy="65" r="10" fill="#fcd34d" /></svg>);

/**
 * Maps a given role string to its corresponding visual asset.
 * @param {string} roleName - The backend-provided role name
 * @returns {string | null} Path to the icon image, or null if no specific match
 */
const getRoleIcon = (roleName: string) => {
    if (!roleName) return null;
    const lower = roleName.toLowerCase();
    if (lower.includes("admin")) return adminIcon;
    if (lower.includes("student")) return studentIcon;
    if (lower.includes("trainer") || lower.includes("teacher")) return trainerIcon;
    return null;
};

/**
 * SelectRole Component
 * 
 * Invoked after Institute Selection (or bypassed if only 1 role exists).
 * Presents the user with available roles within the selected institute.
 * 
 * @returns {JSX.Element} The Role Selection view
 */
const SelectRole: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [roles, setRoles] = useState<any[]>(location.state?.roles || []);
    const [isLoading, setIsLoading] = useState<boolean>(!location.state?.roles);
    const [error, setError] = useState<string>("");
    const [canInteract, setCanInteract] = useState<boolean>(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setCanInteract(true), 800);
        return () => clearTimeout(timer);
    }, []);

    const storedUserData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const user = storedUserData ? JSON.parse(storedUserData) : { full_name: "User" };
    const userName = user.full_name || user.name || "User";
    const initials = userName.substring(0, 2).toUpperCase();

    const storedInstituteData = localStorage.getItem("selectedInstitute");
    const selectedInstitute: any = storedInstituteData ? JSON.parse(storedInstituteData) : null;

    /**
     * Executes the final authentication step: minting an access_token.
     * Submits the pre_context_token, institute_id, and selected role_id to the backend.
     * 
     * @param {any} role - The chosen role object
     * @param {React.MouseEvent} [e] - Optional click event to stop propagation
     */
    const handleRoleClick = React.useCallback(async (role: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!canInteract) return;

        setIsLoading(true);
        const roleId = role.role_id || role.id;
        const roleName = role.role_name || role.name;

        try {
            const data = await authService.selectContext({
                tenant_id: selectedInstitute?.tenant_id,
                institute_id: selectedInstitute?.institute_id || selectedInstitute?.id,
                role_id: roleId
            });

            const accessToken = data.data?.access_token || data.access_token;
            if (!accessToken) throw new Error("No access token received");

            localStorage.setItem("token", accessToken);
            localStorage.setItem("selectedRole", JSON.stringify({ id: roleId, name: roleName }));
            navigate("/dashboard");
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "An error occurred";
            console.error("Context selection failed:", err.response?.data || err);
            setError(errorMsg);
            setIsLoading(false);
        }
    }, [selectedInstitute, navigate, canInteract]);

    React.useEffect(() => {
        if (!token || !selectedInstitute) {
            navigate("/");
            return;
        }

        if (roles.length === 0) {
            apiClient.get(`/auth/roles?institute_id=${selectedInstitute?.id}`)
                .then(res => {
                    setRoles(res.data.data || res.data);
                    setIsLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [token, selectedInstitute?.id, navigate, roles.length]);

    if (!selectedInstitute) {
        return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-primary)" }}>No institute selected.</p>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.logoBox}>
                    <img src={logoBlack} alt="logo" className="logo-light" style={{ width: "24px" }} />
                    <img src={logoWhite} alt="logo" className="logo-dark" style={{ width: "24px" }} />
                    <span style={styles.logoText}>{APP_STRINGS.COMMON.APP_NAME}</span>
                </div>
                <div style={styles.profile}>{initials}</div>
            </div>

            <div style={styles.content}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                    <button style={styles.changeInstituteBtn} onClick={() => navigate("/institute-selection")}>
                        <ArrowLeftIcon /> {APP_STRINGS.SELECT_ROLE.BTN_CHANGE_INSTITUTE}
                    </button>
                </div>

                {error && (
                    <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
                        {error}
                    </div>
                )}

                <div style={styles.selectedInstCard}>
                    <div style={styles.left}>
                        {selectedInstitute.logo ? (
                            <img src={selectedInstitute.logo} alt="Institute Logo" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                        ) : (
                            <InstituteLogoSVG />
                        )}
                        <div style={{ textAlign: "left" }}>
                            <h3 style={styles.instName}>{selectedInstitute.name}</h3>
                            <p style={styles.location}>
                                <LocationIcon /> {selectedInstitute.location || APP_STRINGS.COMMON.LOCATION_NOT_SET}
                            </p>
                        </div>
                    </div>
                    <div><img src={verifyIcon} alt="Verified" style={{ width: "24px", height: "24px", objectFit: "contain" }} /></div>
                </div>

                <h1 style={styles.title}>{APP_STRINGS.SELECT_ROLE.TITLE}</h1>
                <p style={styles.subtitle}>{APP_STRINGS.SELECT_ROLE.SUBTITLE_PREFIX}{selectedInstitute.name}</p>

                <div style={styles.list}>
                    {roles.map((role, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                            onClick={(e) => handleRoleClick(role, e)}
                            style={{
                                ...(styles.card as CSSProperties),
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                ...(hoverIndex === i ? (styles.roleCardHover as CSSProperties) : {}),
                                opacity: canInteract ? 1 : 0.6,
                                transform: canInteract ? "translateY(0)" : "translateY(10px)",
                                cursor: canInteract ? "pointer" : "default"
                            }}
                        >
                            <div style={styles.left}>
                                <div style={styles.logoCircle}>
                                    {role.logo ? (
                                        <img src={role.logo} alt="role logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                                    ) : getRoleIcon(role.name || role.role_name) ? (
                                        <img src={getRoleIcon(role.name || role.role_name)!} alt="role icon" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
                                    ) : (
                                        <ShieldIcon />
                                    )}
                                </div>
                                <div style={{ textAlign: "left" }}>
                                    <h3 style={styles.roleName}>{role.name || role.role_name}</h3>
                                    <p style={styles.roleDesc}>Platform Access</p>
                                </div>
                            </div>
                            <div style={styles.right}>
                                <span style={styles.arrow}><ChevronRightIcon /></span>
                            </div>
                        </div>
                    ))}
                </div>

                {roles.length === 0 && !isLoading && <p style={styles.empty}>{APP_STRINGS.SELECT_ROLE.NO_ROLES}</p>}
            </div>

            <footer style={styles.footer}>
                {APP_STRINGS.SELECT_ROLE.SUPPORT_TEXT_1}<br />
                {APP_STRINGS.SELECT_ROLE.SUPPORT_TEXT_2} <a href={`mailto:${APP_STRINGS.COMMON.SUPPORT_EMAIL}`} style={styles.link}>{APP_STRINGS.COMMON.SUPPORT_EMAIL}</a>
            </footer>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    container: { minHeight: "100vh", background: "var(--bg-color)", fontFamily: "'Inter', Arial, sans-serif", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.875rem" },
    logoBox: { display: "flex", alignItems: "center", gap: "10px", fontWeight: "700" },
    logoText: { fontSize: "16px", color: "var(--text-primary)" },
    profile: { width: "36px", height: "36px", borderRadius: "50%", background: "var(--profile-bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", color: "var(--text-primary)", boxShadow: "var(--shadow-sm)" },
    content: { maxWidth: "600px", width: "100%", margin: "0 auto", padding: "1.25rem", textAlign: "center", boxSizing: "border-box", flex: 1 },
    changeInstituteBtn: { display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--pill-bg)", color: "var(--pill-text)", border: "1px solid var(--border-color)", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "500", cursor: "pointer", boxShadow: "var(--shadow-sm)" },
    title: { fontSize: "28px", fontWeight: "700", marginBottom: "12px", color: "var(--text-title)" },
    subtitle: { color: "var(--text-secondary)", marginBottom: "30px", fontSize: "16px" },
    list: { width: "100%", display: "flex", flexDirection: "column", gap: "14px", marginBottom: "50px" },
    card: { width: "100%", height: "80px", boxSizing: "border-box", background: "var(--bg-card)", padding: "0 18px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border-card)", cursor: "pointer", boxShadow: "var(--shadow-sm)" },
    roleCardHover: { borderColor: "var(--text-secondary)", boxShadow: "var(--shadow-md)", transform: "translateY(-2px)" },
    selectedInstCard: { width: "100%", height: "80px", boxSizing: "border-box", background: "var(--banner-bg)", padding: "0 18px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--banner-border)", marginBottom: "40px", cursor: "default", boxShadow: "var(--shadow-sm)" },
    left: { display: "flex", alignItems: "center", gap: "14px" },
    logoCircle: { width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center" },
    instName: { margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "var(--text-title)" },
    location: { margin: 0, fontSize: "13px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" },
    roleName: { margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "var(--text-title)" },
    roleDesc: { margin: 0, fontSize: "13px", color: "var(--text-secondary)" },
    right: { display: "flex", alignItems: "center", gap: "12px" },
    arrow: { background: "var(--icon-container-bg)", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" },
    footer: { padding: "40px 0 32px 0", fontSize: "13px", color: "#94a3b8", textAlign: "center", lineHeight: "1.6" },
    link: { color: "#3b82f6", textDecoration: "none" },
    empty: { marginTop: "10px", color: "var(--text-secondary)" }
};

export default SelectRole;
