import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import path from 'path'
import { compileMDX } from 'next-mdx-remote/rsc'
import Link from 'next/link'

interface Props {
  params: Promise<{ slug?: string[] }>
}

const NAV_LINKS = [
  { href: '/metodologia', label: 'Visão Geral' },
  { href: '/metodologia/assessment', label: 'Framework de Assessment' },
]

export default async function MetodologiaPage({ params }: Props) {
  const { slug } = await params
  const segments = slug ?? []
  const filePath = segments.length === 0 ? 'index' : segments.join('/')

  let raw: string
  try {
    const fullPath = path.join(process.cwd(), 'src', 'content', 'metodologia', `${filePath}.mdx`)
    raw = await readFile(fullPath, 'utf-8')
  } catch {
    notFound()
  }

  const { content } = await compileMDX({ source: raw })

  return (
    <div className="flex min-h-screen">
      {/* Sidebar nav */}
      <aside className="w-56 shrink-0 border-r border-border px-4 py-6 hidden md:block">
        <p className="font-label text-xs uppercase tracking-wide text-text-muted mb-3">Wiki</p>
        <nav className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-primary transition-colors py-1 px-2 -mx-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-3xl">
        <article className="prose-iaris">
          {content}
        </article>
      </main>
    </div>
  )
}
