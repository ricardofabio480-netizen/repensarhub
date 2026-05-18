'use client'

import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import { createClient } from '@/lib/supabase-browser'

export default function DashboardLayout({
  children,
  title,
  eyebrow,
  actions,
}: {
  children: React.ReactNode
  title: string
  eyebrow?: string
  actions?: React.ReactNode
}) {
  const [userName, setUserName] = useState('')
  const [plan, setPlan] = useState('Gratuito')
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('name, plan')
        .eq('id', user.id)
        .single()

      if (data) {
        setUserName(data.name || user.email || '')
        setPlan(data.plan || 'Gratuito')
      }
    }
    loadProfile()
  }, [])

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} plan={plan} />

      <main className="flex-1 min-w-0 p-7">
        <header className="flex items-start justify-between gap-5 mb-6 no-print">
          <div>
            {eyebrow && (
              <p
                className="text-xs font-black uppercase tracking-widest mb-1"
                style={{ color: 'var(--green-dark)' }}
              >
                {eyebrow}
              </p>
            )}
            <h1
              className="text-3xl font-black tracking-tight leading-tight"
              style={{ color: 'var(--ink)' }}
            >
              {title}
            </h1>
          </div>
          {actions && <div className="flex items-center gap-2 flex-wrap shrink-0">{actions}</div>}
        </header>

        {children}
      </main>
    </div>
  )
}
