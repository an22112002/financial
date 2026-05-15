import { BACKEND_SERVER } from "./configAPI"

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