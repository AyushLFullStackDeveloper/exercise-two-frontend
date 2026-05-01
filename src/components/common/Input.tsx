/**
 * @file Input.tsx
 * @description A reusable text input component with support for icons and error states.
 */

import React, { CSSProperties } from 'react';
import { COLORS } from '../../theme/colors';

/**
 * Props for the Input component, extending standard HTML input attributes.
 */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Optional React node (SVG/Icon) rendered inside the input (right-aligned) */
    icon?: React.ReactNode;
    /** Callback triggered when the icon is clicked */
    onIconClick?: () => void;
    /** Validation error message to display below the input */
    error?: string;
    /** Override styles for the outer container */
    containerStyle?: CSSProperties;
}

/**
 * Standardized Input component.
 * Supports rendering a trailing icon (e.g., password visibility toggle) and inline error text.
 * 
 * @param {InputProps} props - Component properties
 * @returns {JSX.Element} The styled input element
 */
const Input: React.FC<InputProps> = ({ icon, onIconClick, error, containerStyle, style, ...props }) => {
    const defaultStyle: CSSProperties = {
        width: '100%',
        height: '46px',
        borderRadius: '8px',
        border: `1px solid ${error ? COLORS.error : 'var(--border-input)'}`,
        fontSize: '14px',
        background: 'var(--input-bg)',
        color: 'var(--text-primary)',
        padding: icon ? '0 46px 0 16px' : '0 16px',
        boxSizing: 'border-box',
        outline: 'none',
        ...style
    };

    return (
        <div style={{ position: 'relative', width: '100%', marginBottom: error ? '8px' : '16px', ...containerStyle }}>
            <input style={defaultStyle} {...props} />
            {icon && (
                <button 
                    type="button" 
                    onClick={onIconClick}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: onIconClick ? 'pointer' : 'default',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                    }}
                >
                    {icon}
                </button>
            )}
            {error && <p style={{ color: COLORS.error, fontSize: '12px', marginTop: '4px', marginBottom: '0' }}>{error}</p>}
        </div>
    );
};

export default Input;
