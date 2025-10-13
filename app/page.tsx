import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Welcome to Slack Lite
                    </h1>
                    <p className="text-lg text-gray-600">
                        Sign in to start collaborating
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10">
                    <LoginForm />
                </div>

                {/* Footer */}
                <div className="text-center text-sm text-gray-500">
                    <p>A lightweight Slack clone built with Next.js and Supabase</p>
                </div>
            </div>
        </div>
    )
}

