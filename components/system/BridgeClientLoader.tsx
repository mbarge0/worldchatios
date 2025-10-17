'use client'
import { installCcTools } from '@/lib/ai/bridge'
import { useEffect } from 'react'

export default function BridgeClientLoader() {
    useEffect(() => {
        installCcTools()
        console.log('🧩 ccTools installed and ready.')
    }, [])
    return null
}