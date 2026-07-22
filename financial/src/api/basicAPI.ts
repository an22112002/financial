import axios from "axios";
import { BACKEND_SERVER } from "./configAPI"

export const api = axios.create({
    baseURL: BACKEND_SERVER,
    timeout: 180000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/auth/refresh-token")
        ) {
            originalRequest._retry = true;

            try {
                const refreshRes = await api.post("/auth/refresh-token", {
                    refresh_token: localStorage.getItem("refresh_token")
                });

                const newToken = refreshRes.data.token;

                localStorage.setItem("token", newToken);

                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                return api(originalRequest);
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");

                window.location.href = ""; // Quay về trang đăng nhập

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export type SimpleResponse = {
    message: string;
}

export function get<TResponse>(
    url: string,
): Promise<TResponse | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch(`${BACKEND_SERVER}${url}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(async (response) => {
                if (isResponseError(response.status)) {
                    resolve(null);
                } else {
                    const data = await response.json() as TResponse;

                    resolve(data);
                }
            })
            .catch(() => {
                resolve(null);
            })
        }, 1000)
    })
}

export function post<TRequest, TResponse>(
    url: string, 
    data: TRequest | null = null
): Promise<TResponse | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch(`${BACKEND_SERVER}${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: data ? JSON.stringify(data) : undefined
            })
            .then(async (response) => {
                if (isResponseError(response.status)) {
                    resolve(null);
                } else {
                    const data = await response.json() as TResponse;
                    resolve(data);
                }
            })
            .catch(() => {
                resolve(null);
            })
        }, 1000)
    })
}

export function put<TRequest, TResponse>(
    url: string, 
    data: TRequest | null = null
): Promise<TResponse | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch(`${BACKEND_SERVER}${url}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: data ? JSON.stringify(data) : undefined
            })
            .then(async (response) => {
                if (isResponseError(response.status)) {
                    resolve(null);
                } else {
                    const data = await response.json() as TResponse;
                    resolve(data);
                }
            })
            .catch(() => {
                resolve(null);
            })
        }, 1000)
    })
}

export function del<TRequest, TResponse>(
    url: string, 
    data: TRequest | null = null
): Promise<TResponse | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            fetch(`${BACKEND_SERVER}${url}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: data ? JSON.stringify(data) : undefined
            })
            .then(async (response) => {
                if (isResponseError(response.status)) {
                    resolve(null);
                } else {
                    const data = await response.json() as TResponse;
                    resolve(data);
                }
            })
            .catch(() => {
                resolve(null);
            })
        }, 1000)
    })
}

export function isResponseError(status: number): boolean {
    if (status >= 400) {
        return true;
    }
    return false;
}