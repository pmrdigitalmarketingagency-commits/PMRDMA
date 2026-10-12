import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null = loading, false = logged out, object = logged in
    const [error, setError] = useState("");

    const refresh = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me");
            setUser(data);
            return data;
        } catch {
            setUser(false);
            return null;
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const login = async (email, password) => {
        setError("");
        try {
            const { data } = await api.post("/auth/login", { email, password });
            setUser(data.user);
            return data.user;
        } catch (e) {
            const msg = formatApiError(e);
            setError(msg);
            throw new Error(msg);
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch {}
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, error, login, logout, refresh, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

export const STAFF_ROLES = [
    "super_admin",
    "admin",
    "sales_manager",
    "project_manager",
    "marketing_executive",
    "finance_manager",
    "employee",
];

export function isStaff(role) {
    return STAFF_ROLES.includes(role);
}
