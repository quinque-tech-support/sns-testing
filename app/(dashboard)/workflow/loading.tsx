export default function WorkflowLoading() {
    return (
        <div className="space-y-8 animate-pulse max-w-7xl mx-auto py-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-5 bg-gray-100 rounded w-72" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-32 bg-gray-100 rounded-xl" />
                    <div className="h-10 w-10 bg-gray-100 rounded-xl" />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex gap-4">
                    <div className="h-8 bg-gray-100 rounded w-1/4" />
                    <div className="h-8 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="divide-y divide-gray-50">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-4 flex gap-6">
                            <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                <div className="h-4 bg-gray-100 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
