'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const nav = [
  { href: '/', label: 'Dashboard', icon: '◼' },
  { href: '/empresas', label: 'Empresas', icon: '⬡' },
  { href: '/diagnostico', label: 'Diagnóstico', icon: '◈' },
  { href: '/plano', label: 'Plano de Ação', icon: '◻' },
  { href: '/relatorios', label: 'Relatórios', icon: '▤' },
  { href: '/assinatura', label: 'Assinatura', icon: '◇' },
  { href: '/configuracoes', label: 'Configurações', icon: '⊙' },
]

export default function Sidebar({ userName, plan }: { userName?: string; plan?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="flex flex-col min-h-screen sticky top-0 w-[280px] shrink-0 p-6 gap-7"
      style={{ background: 'var(--sidebar)', color: '#edf6f0' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl grid place-items-center text-white font-black text-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--green), var(--gold))' }}
        >
          4R
        </div>
        <div>
          <p className="font-bold text-sm leading-tight text-white">Repens4R Pro</p>
          <p className="text-xs mt-0.5" style={{ color: '#aebdb6' }}>Painel consultivo</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1">
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-semibold transition-colors"
              style={{
                color: active ? '#ffffff' : '#d7e5de',
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
              }}
            >
              <span className="text-base leading-none opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div
        className="mt-auto rounded-2xl p-4 text-sm"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <p style={{ color: '#aebdb6' }} className="text-xs">Plano atual</p>
        <p className="font-bold text-white mt-1">{plan || 'Gratuito'}</p>
        <p style={{ color: '#aebdb6' }} className="text-xs mt-1 truncate">{userName || 'Consultor'}</p>
        <button
          onClick={handleLogout}
          className="mt-3 w-full text-xs py-1.5 rounded-xl font-semibold transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#d7e5de' }}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
