export function TabPlaceholder({ name }: { name: string }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem-5rem)] flex items-center justify-center px-8">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
          Putt Vector
        </div>
        <h1 className="text-7xl font-bold text-foreground tracking-tight">{name}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Coming soon.</p>
      </div>
    </div>
  );
}
