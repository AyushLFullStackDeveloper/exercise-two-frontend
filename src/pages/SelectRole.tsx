/**
 * @file SelectRole.tsx
 * @description The Role Selection screen for multi-tenant users.
 * Renders dynamically based on the institute selected in the previous layer.
 * Includes an interaction guard mechanism to prevent accidental multi-clicks.
 */

import React, { useState, CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoBlack from "../assets/images/logo_black.png";
import logoWhite from "../assets/images/logo_white.png";
import { User, Institute } from "../utils/auth";
import { API_URL } from "../utils/api";
import { APP_STRINGS } from "../utils/strings";

// SVGs
const ShieldIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <circle cx="12" cy="11" r="3"></circle>
    </svg>
);

const AwardIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7"></circle>
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
        <circle cx="12" cy="8" r="3" fill="#7c3aed" stroke="#7c3aed"></circle>
        <path d="M12 5v2" stroke="white" strokeWidth="2"></path>
    </svg>
);

const CapIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2.7 3 6 3s6-1 6-3v-5" />
    </svg>
);

const PresentationIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21l4-4 4 4" />
        <path d="M12 17v4" />
        <path d="M7 8h10" />
        <path d="M7 12h5" />
    </svg>
);

const PeopleIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const ArrowLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const LocationIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const CheckBadgeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="#2563eb" />
        <polyline points="8 12.5 11 15.5 16 9.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const InstituteLogoSVG = () => (
    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
        <path d="M50 20L80 80H20L50 20Z" fill="#0f172a" />
        <circle cx="50" cy="65" r="10" fill="#fcd34d" />
    </svg>
);

interface RoleData {
    desc: string;
    icon: React.ReactNode;
}

const roleMapping: Record<string, RoleData> = {
    "Super Admin": { desc: "Full system access", icon: <ShieldIcon /> },
    "Institute Admin": { desc: "Institute management", icon: <ShieldIcon /> },
    "Administrator": { desc: "Full system access", icon: <ShieldIcon /> },
    "Admin": { desc: "Full system access", icon: <ShieldIcon /> },
    "Principal": { desc: "Institute oversight", icon: <AwardIcon /> },
    "Teacher": { desc: "Class & grading", icon: <PresentationIcon /> },
    "Trainer": { desc: "In-class leading", icon: <PresentationIcon /> },
    "Parent": { desc: "Child progress", icon: <PeopleIcon /> },
    "Driver": { desc: "Transportation access", icon: <ShieldIcon /> },
    "Student": { desc: "Learning resources", icon: <CapIcon /> },
    "Staff": { desc: "Institute operations", icon: <ShieldIcon /> }
};

/**
 * Role Selection Component
 * Handles mapping roles against icons and descriptions for UI representation.
 */
const SelectRole: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [roles, setRoles] = useState<any[]>(location.state?.roles || []);
    const [isLoading, setIsLoading] = useState<boolean>(!location.state?.roles);
    const [error, setError] = useState<string>("");
    const [canInteract, setCanInteract] = useState<boolean>(false);

    // Interaction Guard: Prevent accidental clicks immediately after mounting
    React.useEffect(() => {
        const timer = setTimeout(() => setCanInteract(true), 800); // Increased to 800ms for safety
        return () => clearTimeout(timer);
    }, []);

    const storedUserData = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const user = storedUserData ? JSON.parse(storedUserData) : { full_name: "User", email: "", id: 0 };
    const userName = user.full_name || user.name || "User";
    const initials = userName.substring(0, 2).toUpperCase();

    const storedInstituteData = localStorage.getItem("selectedInstitute");
    const selectedInstitute: Institute | null = storedInstituteData ? JSON.parse(storedInstituteData) : null;

    /**
     * Executes the /select-context backend call to mint the user's dedicated dashboard access token.
     */
    const handleRoleClick = React.useCallback((role: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        // STRICT MANUAL: Block all clicks until guard is cleared
        if (!canInteract) return;

        setIsLoading(true);
        const roleId = role.role_id || role.id;
        const roleName = role.role_name || role.name;

        fetch(`${API_URL}/auth/select-context`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                tenant_id: selectedInstitute?.tenant_id,
                institute_id: selectedInstitute?.institute_id || selectedInstitute?.id,
                role_id: roleId
            })
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                const isJson = contentType && contentType.includes("application/json");
                const data = isJson ? await res.json() : null;

                if (!res.ok) {
                    const errorMsg = data?.message || data?.error || `Context selection failed (${res.status})`;
                    throw new Error(errorMsg);
                }

                if (!isJson) throw new Error("Invalid response format from server");
                return data;
            })
            .then((res) => {
                const data = res.data;
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("selectedRole", JSON.stringify({
                    id: roleId,
                    name: roleName
                }));

                navigate("/dashboard");
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [token, selectedInstitute?.tenant_id, selectedInstitute?.id, selectedInstitute?.institute_id, navigate, canInteract, roles.length]);

    React.useEffect(() => {
        if (!token || !selectedInstitute) {
            navigate("/");
            return;
        }

        // If roles were already passed via state, we skip the fetch
        if (roles.length > 0) {
            setIsLoading(false);
            return;
        }

        fetch(`${API_URL}/auth/roles?institute_id=${selectedInstitute?.id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                const isJson = contentType && contentType.includes("application/json");
                const data = isJson ? await res.json() : null;

                if (!res.ok) {
                    const errorMsg = data?.error || data?.message || `Failed to fetch roles (${res.status})`;
                    throw new Error(errorMsg);
                }

                if (!isJson) throw new Error("Invalid response format from server");
                return data;
            })
            .then((data) => {
                const rolesList = data.data || data;
                setRoles(rolesList);
                setIsLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [token, selectedInstitute?.id, navigate, roles.length]);

    /* 
    // AUTO-JUMP COMPLETELY DISABLED: User wants strict manual selection
    React.useEffect(() => {
        if (!isLoading && roles.length === 1) {
            handleRoleClick(roles[0]);
        }
    }, [isLoading, roles, handleRoleClick]);
    */

    if (!selectedInstitute) {
        return <p style={{ textAlign: "center", marginTop: "50px", color: "var(--text-primary)" }}>No institute selected.</p>;
    }

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.logoBox}>
                    <img src={logoBlack} alt="logo" className="logo-light" style={{ width: "1.5rem" }} />
                    <img src={logoWhite} alt="logo" className="logo-dark" style={{ width: "1.5rem" }} />
                    <span style={styles.logoText}>{APP_STRINGS.COMMON.APP_NAME}</span>
                </div>
                <div style={styles.profile}>{initials}</div>
            </div>

            {/* CONTENT */}
            <div style={styles.content}>

                {/* Change Institute Button */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                    <button style={styles.changeInstituteBtn} onClick={() => navigate("/institute-selection")}>
                        <ArrowLeftIcon />
                        {APP_STRINGS.SELECT_ROLE.BTN_CHANGE_INSTITUTE}
                    </button>
                </div>

                {/* Selected Institute Card */}
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
                    <div>
                        <CheckBadgeIcon />
                    </div>
                </div>

                <h1 style={styles.title}>{APP_STRINGS.SELECT_ROLE.TITLE}</h1>
                <p style={styles.subtitle}>
                    {APP_STRINGS.SELECT_ROLE.SUBTITLE_PREFIX}{selectedInstitute.name}
                </p>

                {/* LIST */}
                <div style={styles.list}>
                    {roles.map((role, i) => {
                        const roleName = role.name || role.role_name;
                        const rData = roleMapping[roleName] || { desc: "Access platform", icon: <ShieldIcon /> };
                        return (
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
                                    cursor: canInteract ? "pointer" : "default",
                                    pointerEvents: canInteract ? "auto" : "none"
                                }}
                            >
                                <div style={styles.left}>
                                    <div style={styles.logoCircle}>
                                        {role.logo ? (
                                            <img src={role.logo} alt="role logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
                                        ) : (
                                            rData.icon
                                        )}
                                    </div>
                                    <div style={{ textAlign: "left" }}>
                                        <h3 style={styles.roleName}>{roleName}</h3>
                                        <p style={styles.roleDesc}>{rData.desc}</p>
                                    </div>
                                </div>
                                <div style={styles.right}>
                                    <span style={styles.arrow}>
                                        <ChevronRightIcon />
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* EMPTY STATE - if roles are somehow empty */}
                {roles.length === 0 && !isLoading && (
                    <p style={styles.empty}>{APP_STRINGS.SELECT_ROLE.NO_ROLES}</p>
                )}
            </div>

            {/* FOOTER */}
            <footer style={styles.footer}>
                {APP_STRINGS.SELECT_ROLE.SUPPORT_TEXT_1}<br />
                {APP_STRINGS.SELECT_ROLE.SUPPORT_TEXT_2} <a href={`mailto:${APP_STRINGS.COMMON.SUPPORT_EMAIL}`} style={styles.link}>{APP_STRINGS.COMMON.SUPPORT_EMAIL}</a>
            </footer>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {

    container: {
        minHeight: "100vh",
        background: "var(--bg-color)",
        fontFamily: "'Inter', Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.25rem 1.875rem",
    },

    logoBox: {
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        fontWeight: "700"
    },

    logoText: {
        fontSize: "1rem",
        color: "var(--text-primary)"
    },

    profile: {
        width: "2.25rem",
        height: "2.25rem",
        borderRadius: "50%",
        background: "var(--profile-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "600",
        color: "var(--text-primary)",
        boxShadow: "var(--shadow-sm)"
    },

    content: {
        maxWidth: "600px",
        width: "100%",
        margin: "0 auto",
        padding: "1.25rem",
        textAlign: "center" as const,
        boxSizing: "border-box",
        flex: 1
    },

    changeInstituteBtn: {
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        background: "var(--pill-bg)",
        color: "var(--pill-text)",
        border: "1px solid var(--border-color)",
        padding: "6px 16px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "500",
        cursor: "pointer",
        boxShadow: "var(--shadow-sm)"
    },

    title: {
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "12px",
        color: "var(--text-title)"
    },
    subtitle: {
        color: "var(--text-secondary)",
        marginBottom: "30px",
        fontSize: "16px"
    },

    list: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "0.875rem",
        marginBottom: "3.125rem",
    },

    card: {
        width: "100%",
        height: "80px",
        boxSizing: "border-box",
        background: "var(--bg-card)",
        padding: "0 18px",
        borderRadius: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border-card)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        boxShadow: "var(--shadow-sm)",
    },

    roleCardHover: {
        borderColor: "var(--text-secondary)",
        boxShadow: "var(--shadow-md)",
        transform: "translateY(-2px)",
    },

    selectedInstCard: {
        width: "100%",
        height: "80px",
        boxSizing: "border-box",
        background: "var(--banner-bg)",
        padding: "0 18px",
        borderRadius: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid var(--banner-border)",
        marginBottom: "40px",
        cursor: "default",
        boxShadow: "var(--shadow-sm)"
    },

    left: {
        display: "flex",
        alignItems: "center",
        gap: "14px"
    },

    logoCircle: {
        width: "56px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    instName: {
        margin: "0 0 4px 0",
        fontSize: "16px",
        fontWeight: "700",
        color: "var(--text-title)"
    },

    location: {
        margin: 0,
        fontSize: "0.8125rem",
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem"
    },

    roleName: {
        margin: "0 0 4px 0",
        fontSize: "16px",
        fontWeight: "700",
        color: "var(--text-title)"
    },
    roleDesc: {
        margin: 0,
        fontSize: "0.8125rem",
        color: "var(--text-secondary)"
    },

    right: { display: "flex", alignItems: "center", gap: "0.75rem" },
    arrow: {
        background: "var(--icon-container-bg)",
        width: "32px",
        height: "32px",
        borderRadius: "8px", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    footer: {
        marginTop: "auto",
        padding: "40px 0 32px 0",
        fontSize: "13px",
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: "1.6"
    },
    link: { color: "#3b82f6", textDecoration: "none" },
};

export default SelectRole;
