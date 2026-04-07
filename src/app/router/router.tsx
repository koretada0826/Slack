import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProtectedLayout } from '@/components/common/ProtectedLayout'
import { LoadingState } from '@/components/common/LoadingState'

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const OnboardingProfilePage = lazy(
  () => import('@/pages/auth/OnboardingProfilePage')
)
const WorkspaceSelectPage = lazy(
  () => import('@/pages/workspaces/WorkspaceSelectPage')
)
const WorkspaceCreatePage = lazy(
  () => import('@/pages/workspaces/WorkspaceCreatePage')
)
const InviteAcceptPage = lazy(
  () => import('@/pages/workspaces/InviteAcceptPage')
)
const MainChatPage = lazy(() => import('@/pages/chat/MainChatPage'))
const MobileThreadPage = lazy(() => import('@/pages/chat/MobileThreadPage'))
const NotificationPage = lazy(
  () => import('@/pages/notifications/NotificationPage')
)
const SearchPage = lazy(() => import('@/pages/search/SearchPage'))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState fullScreen />}>{children}</Suspense>
  )
}

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/login',
    element: (
      <SuspenseWrapper>
        <LoginPage />
      </SuspenseWrapper>
    ),
  },

  // Protected routes
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: '/onboarding',
        element: (
          <SuspenseWrapper>
            <OnboardingProfilePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/workspaces',
        element: (
          <SuspenseWrapper>
            <WorkspaceSelectPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/workspaces/new',
        element: (
          <SuspenseWrapper>
            <WorkspaceCreatePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/invite/:token',
        element: (
          <SuspenseWrapper>
            <InviteAcceptPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/ws/:workspaceSlug',
        element: (
          <SuspenseWrapper>
            <MainChatPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/ws/:workspaceSlug/thread/:messageId',
        element: (
          <SuspenseWrapper>
            <MobileThreadPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/ws/:workspaceSlug/notifications',
        element: (
          <SuspenseWrapper>
            <NotificationPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/ws/:workspaceSlug/search',
        element: (
          <SuspenseWrapper>
            <SearchPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '/settings',
        element: (
          <SuspenseWrapper>
            <SettingsPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Catch-all redirect
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
])
