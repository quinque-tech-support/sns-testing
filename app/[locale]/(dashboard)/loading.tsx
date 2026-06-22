export default function Loading() {
    return (
        <div className="flex flex-col h-screen bg-[var(--background)] overflow-hidden font-sans">
            {/* Topbar skeleton */}
            <header className="h-16 bg-card border-b border-card-border flex items-center justify-between px-6 sticky top-0 z-30 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] shrink-0">
                <div className="flex items-center gap-3 md:gap-5 flex-1">
                    {/* hamburger */}
                    <div className="w-9 h-9 rounded-lg bg-surface animate-pulse" />
                    {/* logo mark */}
                    <div className="w-8 h-8 rounded-lg bg-surface animate-pulse" />
                    {/* logo text */}
                    <div className="hidden sm:block w-20 h-5 rounded-md bg-surface animate-pulse" />
                </div>
                <div className="flex items-center gap-3 lg:gap-6">
                    {/* language switcher */}
                    <div className="w-10 h-7 rounded-lg bg-surface animate-pulse" />
                    {/* theme toggle */}
                    <div className="w-14 h-7 rounded-full bg-surface animate-pulse" />
                    {/* account selector */}
                    <div className="w-32 h-8 rounded-xl bg-surface animate-pulse hidden sm:block" />
                    {/* avatar mobile */}
                    <div className="w-9 h-9 rounded-xl bg-surface animate-pulse sm:hidden" />
                </div>
            </header>

            <div className="flex-1 flex min-h-0 overflow-hidden">
                {/* Sidebar skeleton */}
                <aside className="hidden lg:flex flex-col w-20 bg-card border-r border-card-border shrink-0 py-6 px-3 gap-2">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="w-full h-10 rounded-xl bg-surface animate-pulse"
                            style={{ animationDelay: `${i * 40}ms` }}
                        />
                    ))}
                    <div className="mt-auto flex flex-col gap-2">
                        <div className="w-full h-10 rounded-xl bg-surface animate-pulse" />
                        <div className="w-full h-12 rounded-xl bg-surface animate-pulse" />
                    </div>
                </aside>

                {/* Main content skeleton */}
                <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8">
                    <div className="max-w-7xl mx-auto space-y-5 lg:space-y-6">
                        {/* Page header */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="h-7 w-48 rounded-lg bg-surface animate-pulse" />
                                <div className="h-4 w-72 rounded-md bg-surface animate-pulse" />
                            </div>
                            <div className="h-9 w-28 rounded-xl bg-surface animate-pulse" />
                        </div>
                        {/* Content cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-40 rounded-2xl bg-surface animate-pulse border border-card-border"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
