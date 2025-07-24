export const getProfile = async (token: string) => {
    const res = await fetch('/api/auth/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error('Profil konnte nicht geladen werden');
    return res.json();
};

export async function updateProfile(data: any, token: string) {
    const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error('Fehler beim Speichern des Profils');
    return response.json();
}
