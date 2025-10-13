import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Test query to channels table
        const { data: channels, error } = await supabase
            .from('channels')
            .select('*')

        if (error) {
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Database connection successful!',
            channelsCount: channels?.length || 0,
            channels: channels?.map(c => ({
                name: c.name,
                is_private: c.is_private
            })),
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}

