import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "./lib/auth";
import { ProtectedRoute } from "./lib/ProtectedRoute";

import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import PortalLayout from "./layouts/PortalLayout";

import HomePage from "./pages/website/HomePage";
import ContactPage from "./pages/website/ContactPage";
import { ServicesListPage, ServiceDetailPage } from "./pages/website/ServicesPages";
import IndustriesPage from "./pages/website/IndustriesPage";
import WorkPage from "./pages/website/WorkPage";
import PricingPage from "./pages/website/PricingPage";
import { InsightsListPage, InsightsDetailPage } from "./pages/website/InsightsPages";
import {
    AboutPage,
    PrivacyPage,
    TermsPage,
    NotFoundPage,
    UnauthorizedPage,
} from "./pages/website/StaticPages";

import LoginPage from "./pages/auth/LoginPage";
import { ForgotPasswordPage, ResetPasswordPage } from "./pages/auth/PasswordPages";

import OverviewPage from "./pages/dashboard/OverviewPage";
import LeadsPage from "./pages/dashboard/LeadsPage";
import ClientsPage from "./pages/dashboard/ClientsPage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import TasksPage from "./pages/dashboard/TasksPage";
import TeamPage from "./pages/dashboard/TeamPage";
import ContentPage from "./pages/dashboard/ContentPage";
import InvoicesPage from "./pages/dashboard/InvoicesPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

import {
    PortalOverview,
    PortalProjects,
    PortalTasks,
    PortalInvoices,
    PortalProfile,
} from "./pages/portal/PortalPages";

import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Toaster richColors position="top-right" />
                <Routes>
                    {/* Public website */}
                    <Route element={<PublicLayout />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/about" element={<AboutPage />} />
                        <Route path="/services" element={<ServicesListPage />} />
                        <Route path="/services/:slug" element={<ServiceDetailPage />} />
                        <Route path="/industries" element={<IndustriesPage />} />
                        <Route path="/work" element={<WorkPage />} />
                        <Route path="/pricing" element={<PricingPage />} />
                        <Route path="/insights" element={<InsightsListPage />} />
                        <Route path="/insights/:slug" element={<InsightsDetailPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPage />} />
                        <Route path="/terms-and-conditions" element={<TermsPage />} />
                        <Route path="/unauthorized" element={<UnauthorizedPage />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>

                    {/* Auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Admin dashboard */}
                    <Route
                        path="/app"
                        element={
                            <ProtectedRoute allow="staff">
                                <DashboardLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<OverviewPage />} />
                        <Route path="leads" element={<LeadsPage />} />
                        <Route path="clients" element={<ClientsPage />} />
                        <Route path="projects" element={<ProjectsPage />} />
                        <Route path="tasks" element={<TasksPage />} />
                        <Route path="team" element={<TeamPage />} />
                        <Route path="content" element={<ContentPage />} />
                        <Route path="invoices" element={<InvoicesPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>

                    {/* Client portal */}
                    <Route
                        path="/portal"
                        element={
                            <ProtectedRoute allow="client">
                                <PortalLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<PortalOverview />} />
                        <Route path="projects" element={<PortalProjects />} />
                        <Route path="tasks" element={<PortalTasks />} />
                        <Route path="invoices" element={<PortalInvoices />} />
                        <Route path="profile" element={<PortalProfile />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
