import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('Auth callback error:', error)
            // Redirect to login with error
            return NextResponse.redirect(new URL('/?error=auth_failed', requestUrl.origin))
        }
    }

    // Redirect to chat page after successful authentication
    // Onboarding check will happen on the chat page
    return NextResponse.redirect(new URL('/chat', requestUrl.origin))
}

