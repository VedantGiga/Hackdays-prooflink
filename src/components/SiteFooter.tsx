export function SiteFooter() {
  return (
    <footer className="border-t-[2px] border-foreground bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 md:flex-row md:items-center md:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 grid-cols-2 grid-rows-2 border-[2px] border-foreground">
            <span className="bg-foreground" />
            <span className="bg-electric" />
            <span className="bg-neon" />
            <span className="bg-grape" />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest">
            ProofLink © {new Date().getFullYear()}
          </span>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          One link. Real capability.
        </p>
      </div>
    </footer>
  );
}
