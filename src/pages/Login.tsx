/**
 * @file Login.tsx
 * @description The primary authentication entry point for MentrixOS.
 */

import React, { useState, KeyboardEvent, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

import logoBlack from "../assets/images/logo_black.png";
import logoWhite from "../assets/images/logo_white.png";
import ThemeToggle from "../components/ThemeToggle";

import { authService } from "../services/authService";
import { validateEmail } from "../utils/validation";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { COLORS } from "../theme/colors";
import { APP_STRINGS } from "../constants/strings";

const AlertIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--utility-btn-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
);

const Login: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("123");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    
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

    const handleLogin = async (): Promise<void> => {
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

        try {
            const loginData = await authService.login({ email, password });
            const preContextToken = loginData.data.pre_context_token;
            
            localStorage.setItem("user", JSON.stringify(loginData.data.user));
            localStorage.setItem("token", preContextToken);

            const instData = await authService.getInstitutesAndRoles();
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
                    const selData = await authService.selectContext({
                        tenant_id: inst.tenant_id,
                        institute_id: inst.institute_id,
                        role_id: role.role_id
                    });

                    const accessToken = selData.data?.access_token || selData.access_token;
                    localStorage.setItem("token", accessToken);
                    localStorage.setItem("selectedRole", JSON.stringify({
                        id: role.role_id,
                        name: role.role_name
                    }));
                    
                    stopProgress(true);
                    setTimeout(() => navigate("/dashboard"), 400);
                } else {
                    stopProgress(true);
                    setTimeout(() => navigate("/role-selection", { state: { roles: inst.roles } }), 400);
                }
            } else {
                stopProgress(true);
                setTimeout(() => navigate("/institute-selection"), 400);
            }
        } catch (err: any) {
            stopProgress(false);
            setError(err.response?.data?.message || err.message || APP_STRINGS.LOGIN.ERR_TIMEOUT);
            setIsLoading(false);
        }
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

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", marginTop: "74px" }}>
                <section className="login-card">
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "32px", width: "100%" }}>
                        <div style={{ marginBottom: "10px" }}>
                            <img src={logoBlack} alt="logo" className="logo-light" style={{ width: "48px", height: "auto" }} />
                            <img src={logoWhite} alt="logo" className="logo-dark" style={{ width: "48px", height: "auto" }} />
                        </div>
                        <div style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-title)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                            Mentrix<span style={{color: COLORS.accentBlue}}>OS</span>
                        </div>
                        <div style={{ textAlign: "center", fontSize: "13px", color: "var(--text-title)", fontWeight: "700" }}>
                            {APP_STRINGS.LOGIN.FORMULA_MENTRIX_OS} <span style={{color: COLORS.accentOrange}}>{APP_STRINGS.LOGIN.FORMULA_MENTOR}</span> {APP_STRINGS.LOGIN.FORMULA_MATRIX} <span style={{color: COLORS.accentBlue}}>{APP_STRINGS.LOGIN.FORMULA_METRICS}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: COLORS.textSecondary, fontWeight: "500", textAlign: "center", marginTop: "6px" }}>
                            {APP_STRINGS.LOGIN.COMBINED_TEXT_PREFIX} <span style={{fontWeight: "700", color: "var(--text-title)"}}>{APP_STRINGS.LOGIN.OPERATING_SYSTEM}</span>{APP_STRINGS.LOGIN.FOR_YOUR_INSTITUTE}
                        </div>
                    </div>

                    <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                        <Input
                            type="text"
                            placeholder={APP_STRINGS.LOGIN.USERNAME_PLACEHOLDER}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder={APP_STRINGS.LOGIN.PASSWORD_PLACEHOLDER}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            error={error}
                            onIconClick={() => setShowPassword(!showPassword)}
                            icon={showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        />

                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px", marginTop: "-8px" }}>
                            <a href="#" style={{ color: COLORS.accentBlue, fontSize: "13px", fontWeight: "600", textDecoration: "underline" }}>{APP_STRINGS.LOGIN.FORGOT_PASSWORD}</a>
                        </div>

                        <Button 
                            onClick={handleLogin}
                            isLoading={isLoading}
                            loadingProgress={loadingProgress}
                            loadingText={APP_STRINGS.LOGIN.BTN_AUTHENTICATING}
                        >
                            {APP_STRINGS.LOGIN.BTN_CONTINUE}
                        </Button>
                    </div>
                </section>

                {/* Viewport Footer */}
                <footer style={{...styles.footer, position: "relative", bottom: "auto", marginTop: "40px", paddingBottom: "32px"}}>
                    {APP_STRINGS.COMMON.TERMS_PREFIX} <span style={styles.link}>{APP_STRINGS.COMMON.TERMS_LINK}</span>
                </footer>
            </div>
        </main>
    );
};

const styles: Record<string, CSSProperties> = {
    container: {
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
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
    footer: {
        position: "absolute",
        bottom: "32px",
        fontSize: "12px",
        color: COLORS.textSecondary,
        textAlign: "center",
        width: "100%",
    },
    link: {
        color: COLORS.accentBlue,
        fontWeight: "600",
        cursor: "pointer",
    }
};

export default Login;