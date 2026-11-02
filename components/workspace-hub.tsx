import Link from "next/link"
import { ArrowUpRight, type LucideIcon } from "lucide-react"

type Tool = { title: string; description: string; href?: string; icon: LucideIcon; soon?: boolean }

export function WorkspaceHub({ eyebrow, title, description, tools }: {
  eyebrow: string; title: string; description: string; tools: Tool[]
}) {
  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 px-5 py-8 sm:px-8 sm:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 via-background to-background px-6 py-9 sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[.24em] text-primary">{eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      </section>
      <section aria-label="Les outils de cet espace" className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => {
          const Icon = tool.icon
          const content = <>
            <div className="flex items-center justify-between"><span className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="h-5 w-5" /></span>{tool.soon ? <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground">À venir</span> : <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />}</div>
            <h2 className="mt-5 text-lg font-semibold tracking-tight">{tool.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>
            {!tool.soon && <p className="mt-6 text-xs font-medium text-primary">Ouvrir l’outil →</p>}
          </>
          const style = "group rounded-2xl border border-border/60 bg-card/50 p-6"
          return tool.href ? <Link key={tool.title} href={tool.href} className={`${style} transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary`}>{content}</Link> : <article key={tool.title} className={`${style} border-dashed`}>{content}</article>
        })}
      </section>
    </main>
  )
}
