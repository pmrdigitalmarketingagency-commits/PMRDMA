import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, isStaff } from "./auth";

export function ProtectedRoute({ children, allow }) {
    const { user } = useAuth();
    const location = useLocation();

    if (user === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
                <div className="text-white/60 font-mono text-sm" data-testid="auth-loading">
                    Authenticating…
                </div>
            </div>
        );
    }
    if (user === false) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (allow === "staff" && !isStaff(user.role)) {
        return <Navigate to="/portal" replace />;
    }
    if (allow === "client" && user.role !== "client") {
        return <Navigate to="/app" replace />;
    }
    if (Array.isArray(allow) && !allow.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }
    return children;
}
