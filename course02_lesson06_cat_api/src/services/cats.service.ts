import { request } from "./api";
import { Cat } from "../models/Cat";

export const CatsService = {
    getAll() {
        return request<Cat[]>("/cats");
    },

    get(id: string) {
        return request<Cat>(`/cats/${id}`);
    },

    create(cat: Cat) {
        return request<Cat>("/cats", {
            method: "POST",
            body: JSON.stringify(cat),
        });
    },

    update(id: string, cat: Cat) {
        return request<Cat>(`/cats/${id}`, {
            method: "PUT",
            body: JSON.stringify(cat),
        });
    },

    delete(id: string) {
        return request<void>(`/cats/${id}`, {
            method: "DELETE",
        });
    },
};
