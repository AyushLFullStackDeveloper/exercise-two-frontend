export const validateEmail = (emailStr: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
};
