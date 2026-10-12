import React from "react";
import { Outlet } from "react-router-dom";
import PublicNav from "../components/website/PublicNav";
import PublicFooter from "../components/website/PublicFooter";

export default function PublicLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <PublicNav />
            <main className="flex-1">
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
}
