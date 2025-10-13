export function deriveDisplayName(email?: string | null): string {
    if (!email) return 'Anonymous'
    const atIndex = email.indexOf('@')
    if (atIndex <= 0) return 'User'
    const name = email.slice(0, atIndex)
    // Capitalize first letter, keep rest
    return name.charAt(0).toUpperCase() + name.slice(1)
}


