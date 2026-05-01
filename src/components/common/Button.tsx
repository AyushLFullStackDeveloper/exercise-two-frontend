/**
 * @file Button.tsx
 * @description A reusable, highly customizable button component supporting loading states.
 */

import React, { CSSProperties } from 'react';
import { COLORS } from '../../theme/colors';

/**
 * Props for the Button component, extending standard HTML button attributes.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Toggles the internal progress-bar loading state */
    isLoading?: boolean;
    /** Text displayed while loading */
    loadingText?: string;
    /** Current progress percentage (0-100) */
    loadingProgress?: number;
    /** Visual style variant */
    variant?: 'primary' | 'secondary';
}

/**
 * A standardized Button component used throughout the application.
 * Features an integrated progress bar for async operations (like login).
 * 
 * @param {ButtonProps} props - Component properties
 * @returns {JSX.Element} The styled button element
 */
const Button: React.FC<ButtonProps> = ({
    children,
    isLoading,
    loadingText = 'Authenticating...',
    loadingProgress = 0,
    variant = 'primary',
    style,
    disabled,
    ...props
}) => {
    const isMobile = window.innerWidth <= 768; // We will remove this later with CSS, but keep for exact sizing fallback
    const baseStyle: CSSProperties = {
        width: '100%',
        height: '46px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        background: variant === 'primary' ? COLORS.primary : 'transparent',
        color: variant === 'primary' ? '#FFFFFF' : COLORS.textPrimary,
        opacity: disabled && !isLoading ? 0.7 : 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
    };

    if (isLoading) {
        return (
            <div style={{ ...baseStyle, background: 'var(--icon-container-bg)', cursor: 'wait' }}>
                <div style={{
                    position: 'absolute',
                    left: 0, top: 0, bottom: 0,
                    width: `${loadingProgress}%`,
                    background: COLORS.primary,
                    transition: 'width 0.15s ease-out'
                }}></div>
                <span style={{ 
                    position: 'relative', 
                    zIndex: 1, 
                    color: loadingProgress > 50 ? '#ffffff' : COLORS.textTitle, 
                    fontWeight: '600', 
                    transition: 'color 0.15s ease-out'
                }}>
                    {loadingText.replace('...', '')}... {loadingProgress}%
                </span>
            </div>
        );
    }

    return (
        <button style={baseStyle} disabled={disabled} {...props}>
            {children}
        </button>
    );
};

export default Button;
