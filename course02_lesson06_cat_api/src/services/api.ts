const API_URL = import.meta.env.VITE_API_URL;
const isTest = import.meta.env.MODE === "test";
const API = isTest ? API_URL : "";

export async function request<T>(
    url: string,
    options?: RequestInit
): Promise<T> {
    const response = await fetch(`${API}/api/${url}`, {
        headers: {
            "Content-Type": "application/json",
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}
