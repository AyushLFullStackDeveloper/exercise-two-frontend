/**
 * @file Login.tsx
 * @description The primary authentication entry point for SchoolCoreOS.
 * Handles credential submission, API token exchange, and dynamic routing
 * based on the user's multi-tenant access rights (Institute/Role selection).
 */

import React, { useState, KeyboardEvent, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import logoBlack from "../assets/images/logo_black.png";
import logoWhite from "../assets/images/logo_white.png";
import ThemeToggle from "../components/ThemeToggle";
import { API_URL } from "../utils/api";
import { APP_STRINGS } from "../utils/strings";

const AlertIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--utility-btn-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

/**
 * Login Component
 * Renders a responsive login form equipped with light/dark theme support 
 * and an integrated percentage loading bar.
 */
const Login: React.FC = () => {
    const navigate = useNavigate();

    // Authentication States
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("123");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // UI States
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Dynamic Loader States
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    const startProgress = () => {
        setLoadingProgress(0);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setLoadingProgress(prev => {
                const next = prev + 15;
                return next >= 99 ? 99 : next;
            });
        }, 150);
    };

    const stopProgress = (success: boolean) => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (success) {
            setLoadingProgress(100);
        } else {
            setLoadingProgress(0);
        }
    };

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const validateEmail = (emailStr: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    };

    /**
     * Executes the primary login sequence.
     * Validates input, initiates the visual progress bar, executes the authentication fetch, 
     * and processes subsequent profile queries to determine correct app routing.
     */
    const handleLogin = (): void => {
        if (!email || !password) {
            setError(APP_STRINGS.LOGIN.ERR_EMPTY_FIELDS);
            return;
        }
        if (!validateEmail(email)) {
             setError(APP_STRINGS.LOGIN.ERR_INVALID_EMAIL);
             return;
        }

        setIsLoading(true);
        setError("");
        startProgress();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            signal: controller.signal,
        })
            .then(async (response) => {
                clearTimeout(timeoutId);
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || "Invalid credentials");
                return data;
            })
            .then(async (res) => {
                const responseData = res.data;
                const preContextToken = responseData.pre_context_token;
                
                localStorage.setItem("user", JSON.stringify(responseData.user));
                localStorage.setItem("token", preContextToken);

                try {
                    const instRes = await fetch(`${API_URL}/auth/my-institutes-roles`, {
                        headers: { "Authorization": `Bearer ${preContextToken}` }
                    });
                    const instData = await instRes.json();
                    if (!instRes.ok) throw new Error("Failed to load account details");

                    const institutes = instData.data || [];

                    if (institutes.length === 0) {
                        stopProgress(false);
                        setError(APP_STRINGS.LOGIN.ERR_NO_INSTITUTES);
                        setIsLoading(false);
                        return;
                    } 

                    if (institutes.length === 1) {
                        const inst = institutes[0];
                        localStorage.setItem("selectedInstitute", JSON.stringify({
                            ...inst,
                            id: inst.institute_id,
                            name: inst.institute_name
                        }));

                        if (inst.roles.length === 1) {
                            const role = inst.roles[0];
                            const selRes = await fetch(`${API_URL}/auth/select-context`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${preContextToken}`
                                },
                                body: JSON.stringify({
                                    tenant_id: inst.tenant_id,
                                    institute_id: inst.institute_id,
                                    role_id: role.role_id
                                }),
                            });
                            const selData = await selRes.json();
                            if (!selRes.ok) throw new Error("Context selection failed");

                            localStorage.setItem("token", selData.data.access_token);
                            localStorage.setItem("selectedRole", JSON.stringify({
                                id: role.role_id,
                                name: role.role_name
                            }));
                            stopProgress(true);
                            setTimeout(() => {
                                navigate("/dashboard");
                            }, 400);
                        } else {
                            stopProgress(true);
                            setTimeout(() => {
                                navigate("/role-selection", { state: { roles: inst.roles } });
                            }, 400);
                        }
                    } else {
                        stopProgress(true);
                        setTimeout(() => {
                            navigate("/institute-selection");
                        }, 400);
                    }
                } catch (err: any) {
                    stopProgress(false);
                    setError(err.message);
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                clearTimeout(timeoutId);
                stopProgress(false);
                setError(err.name === "AbortError" ? APP_STRINGS.LOGIN.ERR_TIMEOUT : err.message);
                setIsLoading(false);
            });
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <main style={styles.container}>
            {/* Top Right Utilities */}
            <nav style={styles.utilityBar}>
                <button style={styles.utilityBtn}>
                    <AlertIcon />
                </button>
                <div style={styles.themeWrapper}>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Rectangle 2893 */}
            <section style={{
                ...styles.card,
                background: isMobile ? "transparent" : "var(--bg-card)",
                boxShadow: isMobile ? "none" : "var(--login-card-shadow)",
                border: isMobile ? "none" : "var(--login-card-border)",
                minHeight: isMobile ? "auto" : "430px",
                padding: isMobile ? "20px 24px" : "40px",
            }}>
                <div style={styles.header}>
                    <div style={styles.logoBox}>
                        <img src={logoBlack} alt="logo" className="logo-light" style={{...styles.logo, width: isMobile ? "140px" : "97px", height: isMobile ? "auto" : "90px"}} />
                        <img src={logoWhite} alt="logo" className="logo-dark" style={{...styles.logo, width: isMobile ? "140px" : "97px", height: isMobile ? "auto" : "90px"}} />
                    </div>
                    {!isMobile && <h1 style={styles.branding}>{APP_STRINGS.COMMON.APP_NAME}</h1>}
                </div>

                <div style={styles.form}>
                    <input
                        type="email"
                        placeholder={APP_STRINGS.LOGIN.USERNAME_PLACEHOLDER}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            ...styles.input, 
                            height: isMobile ? "56px" : "50px",
                            borderRadius: isMobile ? "10px" : "8px",
                            border: isMobile ? "1px solid var(--border-input-mobile)" : "1px solid var(--border-input)",
                            fontSize: isMobile ? "16px" : "14px",
                            background: isMobile ? "var(--input-bg-mobile)" : "var(--input-bg)",
                            marginBottom: isMobile ? "20px" : "22px",
                            color: "var(--text-primary)"
                        }}
                    />
                    
                    <div style={styles.passwordWrapper}>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder={APP_STRINGS.LOGIN.PASSWORD_PLACEHOLDER}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                ...styles.inputPassword, 
                                height: isMobile ? "56px" : "50px",
                                borderRadius: isMobile ? "10px" : "8px",
                                border: isMobile ? "1px solid var(--border-input-mobile)" : "1px solid var(--border-input)",
                                fontSize: isMobile ? "16px" : "14px",
                                background: isMobile ? "var(--input-bg-mobile)" : "var(--input-bg)",
                                color: "var(--text-primary)"
                            }}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={styles.passwordToggle}
                        >
                            {showPassword ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
                    </div>

                    {error && <p style={styles.errorMessage}>{error}</p>}

                    {isLoading ? (
                        <div style={{
                            width: "100%",
                            height: isMobile ? "56px" : "50px",
                            borderRadius: isMobile ? "10px" : "8px",
                            marginTop: isMobile ? "20px" : "10px",
                            background: "var(--icon-container-bg)",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <div style={{
                                position: "absolute",
                                left: 0, top: 0, bottom: 0,
                                width: `${loadingProgress}%`,
                                background: "#044b48",
                                transition: "width 0.15s ease-out"
                            }}></div>
                            <span style={{ 
                                position: "relative", 
                                zIndex: 1, 
                                color: loadingProgress > 50 ? "#ffffff" : "var(--text-title)", 
                                fontWeight: "600", 
                                fontSize: isMobile ? "18px" : "16px",
                                transition: "color 0.15s ease-out"
                            }}>
                                {APP_STRINGS.LOGIN.BTN_AUTHENTICATING.replace("...", "")}... {loadingProgress}%
                            </span>
                        </div>
                    ) : (
                        <button 
                            style={{
                                ...styles.submitBtn, 
                                height: isMobile ? "56px" : "50px",
                                borderRadius: isMobile ? "10px" : "8px",
                                fontSize: isMobile ? "18px" : "16px",
                                marginTop: isMobile ? "20px" : "10px",
                                opacity: 1
                            }} 
                            onClick={handleLogin}
                            disabled={isLoading}
                        >
                            {APP_STRINGS.LOGIN.BTN_CONTINUE}
                        </button>
                    )}
                </div>
            </section>

            {/* Viewport Footer */}
            <footer style={styles.footer}>
                {APP_STRINGS.COMMON.TERMS_PREFIX} <span style={styles.link}>{APP_STRINGS.COMMON.TERMS_LINK}</span>
            </footer>
        </main>
    );
};

const styles: Record<string, CSSProperties> = {
    container: {
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start", // Changed from center to allow for top-alignment
        background: "var(--bg-color)",
        position: "relative",
        fontFamily: "'Inter', sans-serif",
    },
    utilityBar: {
        position: "absolute",
        top: "32px",
        right: "32px",
        display: "flex",
        gap: "12px",
    },
    utilityBtn: {
        background: "var(--utility-btn-bg)",
        color: "var(--utility-btn-color)",
        border: "1px solid var(--utility-btn-border)",
        borderRadius: "8px",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "var(--shadow-sm)",
    },
    themeWrapper: {
        display: "flex",
    },
    card: {
        width: "min(100%, 662px)",
        marginTop: "74px", 
        
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        borderRadius: "20px", 
    },
    header: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "40px", 
        width: "100%",
    },
    logoBox: {
        marginBottom: "10px",
    },
    logo: {
        width: "140px",
        height: "auto",
        display: "block",
        objectFit: "contain"
    },
    branding: {
        fontSize: "22px",
        height: "29px", // FIGMA TITLE SPAN HEIGHT
        fontWeight: "700",
        color: "var(--text-title)", // FIGMA TEXT COLOR
        margin: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    form: {
        width: "100%",
        display: "flex",
        flexDirection: "column",
    },
    input: {
        width: "100%",
        padding: "0 16px",
        boxSizing: "border-box",
        outline: "none",
        color: "#334155",
    },
    passwordWrapper: {
        position: "relative",
        width: "100%",
        marginBottom: "22px",
    },
    inputPassword: {
        width: "100%",
        padding: "0 46px 0 16px",
        boxSizing: "border-box",
        outline: "none",
        color: "#334155",
    },
    passwordToggle: {
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#64748b",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4px",
    },
    errorMessage: {
        color: "#ef4444",
        fontSize: "12px",
        marginTop: "-16px",
        marginBottom: "16px",
        textAlign: "center",
    },
    submitBtn: {
        width: "100%",
        border: "none",
        background: "#044b48",
        color: "#FFFFFF",
        fontWeight: "600",
        cursor: "pointer",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    },
    footer: {
        position: "absolute",
        bottom: "32px",
        fontSize: "12px",
        color: "#94a3b8",
        textAlign: "center",
        width: "100%",
    },
    link: {
        color: "#3b82f6",
        fontWeight: "600",
        cursor: "pointer",
    }
};

export default Login;