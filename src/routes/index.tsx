import type { ComponentType } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import CrmLayout from "@/layouts/CrmLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import RequireRole from "@/components/RequireRole";
import HomePage from "@/features/public/HomePage";
import { ADMIN_ROLES, CLINICAL_STAFF_ROLES, CRM_ROLES } from "@/lib/roles";

/** Route-level code splitting: each page is downloaded the first time it is visited. */
function page(loader: () => Promise<{ default: ComponentType }>) {
  return { lazy: async () => ({ Component: (await loader()).default }) };
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "product", ...page(() => import("@/features/public/ProductPage")) },
      { path: "benefits", ...page(() => import("@/features/public/BenefitsPage")) },
      { path: "how-it-works", ...page(() => import("@/features/public/HowItWorksPage")) },
      { path: "our-doctors", ...page(() => import("@/features/public/PublicDoctorsPage")) },
      { path: "faq", ...page(() => import("@/features/public/FaqPage")) },
      { path: "contact", ...page(() => import("@/features/public/ContactPage")) },
      { path: "enquiry", ...page(() => import("@/features/public/EnquiryPage")) },
    ],
  },
  { path: "/login", ...page(() => import("@/features/auth/LoginPage")) },
  { path: "/register", ...page(() => import("@/features/auth/RegisterPage")) },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <CrmLayout />,
        children: [
          // Available to every signed-in role
          { path: "/products", ...page(() => import("@/features/products/ProductsPage")) },
          { path: "/doctors", ...page(() => import("@/features/clinical/DoctorsPage")) },
          { path: "/consultations", ...page(() => import("@/features/clinical/ConsultationsPage")) },
          { path: "/consultations/:id", ...page(() => import("@/features/clinical/ConsultationDetailPage")) },
          { path: "/profile", ...page(() => import("@/features/users/ProfilePage")) },
          {
            element: <RequireRole roles={CRM_ROLES} />,
            children: [
              { path: "/dashboard", ...page(() => import("@/features/dashboard/DashboardPage")) },
              { path: "/leads", ...page(() => import("@/features/leads/pages/LeadsPage")) },
              { path: "/leads/:id", ...page(() => import("@/features/leads/pages/LeadDetailPage")) },
              { path: "/followups", ...page(() => import("@/features/followups/FollowUpsPage")) },
              { path: "/campaigns", ...page(() => import("@/features/campaigns/CampaignsPage")) },
              { path: "/reports", ...page(() => import("@/features/reports/ReportsPage")) },
            ],
          },
          {
            element: <RequireRole roles={CLINICAL_STAFF_ROLES} />,
            children: [
              { path: "/patients", ...page(() => import("@/features/clinical/PatientsPage")) },
              { path: "/patients/:id", ...page(() => import("@/features/clinical/PatientDetailPage")) },
            ],
          },
          {
            element: <RequireRole roles={["DOCTOR"]} />,
            children: [{ path: "/doctor", ...page(() => import("@/features/clinical/DoctorHomePage")) }],
          },
          {
            element: <RequireRole roles={["PATIENT"]} />,
            children: [
              { path: "/my-health", ...page(() => import("@/features/clinical/MyHealthPage")) },
              { path: "/book", ...page(() => import("@/features/clinical/BookPage")) },
            ],
          },
          {
            element: <RequireRole roles={ADMIN_ROLES} />,
            children: [
              { path: "/users", ...page(() => import("@/features/users/UsersPage")) },
              { path: "/audit-logs", ...page(() => import("@/features/users/AuditLogPage")) },
            ],
          },
          {
            element: <RequireRole roles={["SUPER_ADMIN"]} />,
            children: [
              { path: "/settings/theme", ...page(() => import("@/features/settings/ThemeSettingsPage")) },
              { path: "/settings/messaging", ...page(() => import("@/features/settings/MessagingPage")) },
            ],
          },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
