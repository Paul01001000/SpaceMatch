export const isPasswordStrong = (pwd: string | undefined | null): boolean => {
    if (!pwd || typeof pwd !== 'string') return false;

    const hasMinLength = pwd.length >= 8;
    const hasUpper = /\p{Lu}/u.test(pwd);
    const hasLower = /\p{Ll}/u.test(pwd);
    const hasDigit = /\p{Nd}/u.test(pwd);
    const hasSpecial = /[^\p{L}\p{N}]/u.test(pwd);

    const complexityChecks = [hasUpper, hasLower, hasDigit, hasSpecial];
    const passedChecks = complexityChecks.filter(Boolean).length;

    return hasMinLength && passedChecks >= 3;
};

