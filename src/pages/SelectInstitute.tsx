/**
 * @file SelectInstitute.tsx
 * @description The Institute Selection screen for multi-tenant users.
 * Allows users to choose an organizational context before routing to roles.
 * Implements an auto-jump feature if only a single institute is mapped.
 */

import React, { useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/logo_black.png";
import logoWhite from "../assets/images/logo_white.png";
import { User, Institute } from "../utils/auth";
import { API_URL } from "../utils/api";
import { APP_STRINGS } from "../utils/strings";

// Inline SVG components to replace react-icons
interface IconProps {
    size: number;
    color?: string;
}

const SchoolIcon: React.FC<IconProps> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
    </svg>
);

const ChevronRightIcon: React.FC<IconProps> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);

const LocationIcon: React.FC<IconProps> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
    </svg>
);

const SearchIcon: React.FC<IconProps> = ({ size, color }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

/**
 * Institute Selection Component
 * Handles searching, filtering, and selecting the user's active institute.
 */
const SelectInstitute: React.FC = () => {
    const navigate = useNavigate();

    // Data parsing for the header profile display
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    const user = storedUser ? JSON.parse(storedUser) : { full_name: "User", email: "", id: 0 };
    const userName = user.full_name || user.name || "User";
    const firstName = userName.split(" ")[0];
    const initials = userName.substring(0, 2).toUpperCase();

    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [search, setSearch] = useState<string>("");
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    /**
     * Component Mount Effect:
     * Validates authentication state, calls the backend for assigned institutes,
     * and performs short-circuit automatic routing if only one institute exists.
     */
    React.useEffect(() => {
        if (!token) {
            navigate("/");
            return;
        }

        fetch(`${API_URL}/auth/my-institutes-roles`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(async (res) => {
                const contentType = res.headers.get("content-type");
                const isJson = contentType && contentType.includes("application/json");
                const data = isJson ? await res.json() : null;

                if (!res.ok) {
                    const errorMsg = data?.error || data?.message || `Failed to fetch institutes (${res.status})`;
                    throw new Error(errorMsg);
                }

                if (!isJson) throw new Error("Invalid response format from server");
                return data;
            })
            .then((res) => {
                // Map backend fields (institute_id -> id, institute_name -> name)
                const mappedData = res.data.map((inst: any) => ({
                    ...inst,
                    id: inst.institute_id,
                    name: inst.institute_name
                }));
                setInstitutes(mappedData);
                setIsLoading(false);

                // AUTO-JUMP: If only 1 institute is found, jump automatically
                if (mappedData.length === 1) {
                    const inst = mappedData[0];
                    localStorage.setItem("selectedInstitute", JSON.stringify(inst));
                    navigate("/role-selection", { state: { roles: inst.roles } });
                }
            })
            .catch((err) => {
                setError(err.message);
                setIsLoading(false);
            });
    }, [token, navigate]);

    // Filter institutes
    const filteredInstitutes = institutes.filter((inst) =>
        inst.name.toLowerCase().includes(search.toLowerCase())
    );

    // Click logic
    const handleInstituteClick = (inst: Institute, e: React.MouseEvent) => {
        e.stopPropagation();
        localStorage.setItem("selectedInstitute", JSON.stringify(inst));
        navigate("/role-selection", { state: { roles: inst.roles } });
    };

    // const showSearchBar = institutes.length >= 5;
    const showSearchBar = institutes.length >= 5;

    return (
        <div style={styles.container}>

            {/* HEADER */}
            <div style={styles.header}>
                <div style={styles.logoBox}>
                    <img src={logoBlack} alt="logo" className="logo-light" style={{ width: "28px" }} />
                    <img src={logoWhite} alt="logo" className="logo-dark" style={{ width: "28px" }} />
                    <span style={styles.logoText}>{APP_STRINGS.COMMON.APP_NAME}</span>
                </div>
                <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                    <div style={styles.profile}>{initials}</div>
                </div>
            </div>

            {/* CONTENT */}
            <div style={styles.content}>
                <h1 style={styles.title}>{APP_STRINGS.SELECT_INSTITUTE.GREETING_PREFIX}{firstName}{APP_STRINGS.SELECT_INSTITUTE.GREETING_SUFFIX}</h1>
                <p style={styles.subtitle}>
                    {APP_STRINGS.SELECT_INSTITUTE.SUBTITLE}
                </p>

                {/* SEARCH */}
                {showSearchBar && (
                    <div style={styles.searchWrapper}>
                        <SearchIcon size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder={APP_STRINGS.SELECT_INSTITUTE.SEARCH_PLACEHOLDER}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>
                )}

                {/* LIST */}
                <div style={styles.list}>
                    {filteredInstitutes.map((inst, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => setHoverIndex(i)}
                            onMouseLeave={() => setHoverIndex(null)}
                            onClick={(e) => handleInstituteClick(inst, e)}
                            style={{
                                ...(styles.card as CSSProperties),
                                ...(hoverIndex === i ? (styles.hoverCard as CSSProperties) : {})
                            }}
                        >
                            <div style={styles.left}>
                                <div style={styles.logoCircle}>
                                    {inst.logo ? (
                                        <img
                                            src={inst.logo}
                                            alt="logo"
                                            style={{ width: "40px", height: "40px", objectFit: "contain", borderRadius: "6px" }}
                                            onError={(e) => {
                                                // If image fails to load, fallback to icon
                                                (e.target as any).style.display = 'none';
                                                (e.target as any).parentElement.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="#4f46e5"><path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" /></svg>';
                                            }}
                                        />
                                    ) : (
                                        <SchoolIcon size={30} color="#4f46e5" />
                                    )}
                                </div>

                                <div style={{ textAlign: "left" }}>
                                    <h3 style={styles.instName}>{inst.name}</h3>
                                    <p style={styles.location}>
                                        <LocationIcon size={12} color="#94a3b8" />
                                        {inst.location || APP_STRINGS.COMMON.LOCATION_NOT_SET}
                                    </p>
                                </div>
                            </div>

                            <div style={styles.right}>
                                <span style={styles.type}>{inst.type || "School"}</span>
                                <span style={styles.arrow}>
                                    <ChevronRightIcon size={16} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* EMPTY STATE */}
                {filteredInstitutes.length === 0 && (
                    <p style={styles.empty}>{APP_STRINGS.SELECT_INSTITUTE.NO_MATCH}</p>
                )}

                {/* FOOTER */}
                <footer style={styles.footer}>
                    {APP_STRINGS.SELECT_INSTITUTE.SUPPORT_TEXT_1}<br />
                    {APP_STRINGS.SELECT_INSTITUTE.SUPPORT_TEXT_2} <a href={`mailto:${APP_STRINGS.COMMON.SUPPORT_EMAIL}`} style={styles.link}>{APP_STRINGS.COMMON.SUPPORT_EMAIL}</a>
                </footer>
            </div>
        </div>
    );
}

const styles: Record<string, CSSProperties> = {
    container: {
        minHeight: "100vh",
        background: "var(--bg-color)",
        padding: "20px",
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
        marginBottom: "30px",
    },
    logoBox: { display: "flex", alignItems: "center", gap: "10px", fontWeight: "600" },
    logoText: { fontSize: "16px", color: "var(--text-primary)" },
    profile: {
        width: "36px", height: "36px", borderRadius: "50%", background: "var(--profile-bg)",
        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)", fontWeight: "600"
    },
    content: {
        maxWidth: "600px",
        width: "100%",
        margin: "0 auto",
        textAlign: "center" as const,
        flex: 1,
        padding: "1.25rem",
        boxSizing: "border-box"
    },
    title: { fontSize: "28px", fontWeight: "700", marginBottom: "12px", color: "var(--text-title)" },
    subtitle: { color: "var(--text-secondary)", marginBottom: "30px", fontSize: "16px" },
    searchWrapper: {
        display: "flex",
        alignItems: "center",
        background: "var(--search-wrapper-bg)",
        border: "1px solid var(--border-input)",
        borderRadius: "10px", // Matched with screenshots
        padding: "0 16px",
        height: "56px",
        marginBottom: "20px",
    },
    searchInput: {
        flex: 1,
        border: "none",
        outline: "none",
        background: "transparent",
        fontSize: "16px",
        marginLeft: "12px",
        color: "var(--text-primary)"
    },
    list: { display: "flex", flexDirection: "column", gap: "14px", width: "100%" },
    card: {
        width: "100%", height: "80px", boxSizing: "border-box", padding: "0 18px", borderRadius: "15px",
        display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-primary)",
        cursor: "pointer", transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        borderWidth: "1px", borderStyle: "solid", borderColor: "var(--border-card)",
        background: "var(--bg-card)",
        boxShadow: "var(--shadow-sm)",
    },
    hoverCard: { boxShadow: "var(--shadow-md)", transform: "translateY(-2px)", borderColor: "var(--text-secondary)" },
    left: { display: "flex", alignItems: "center", gap: "14px" },
    logoCircle: {
        width: "56px",
        height: "56px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    instName: { margin: "0 0 4px 0", fontSize: "16px", fontWeight: "700", color: "var(--text-title)" },
    location: {
        margin: 0,
        fontSize: "13px",
        color: "var(--text-secondary)",
        display: "flex",
        alignItems: "center",
        gap: "4px",
        marginTop: "2px"
    },
    right: { display: "flex", alignItems: "center", gap: "12px" },
    type: { fontSize: "13px", color: "var(--text-secondary)", fontWeight: "600" },
    arrow: {
        background: "var(--icon-container-bg)",
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    empty: { marginTop: "10px", color: "var(--text-secondary)" },
    footer: {
        marginTop: "40px",
        paddingBottom: "32px",
        fontSize: "13px",
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: "1.6"
    },
    link: { color: "#3b82f6", textDecoration: "none" },
};

export default SelectInstitute;