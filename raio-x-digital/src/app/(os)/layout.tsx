import { Sidebar } from "@/core/components/Sidebar";

export default function OSLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Aqui no futuro vamos checar sessão do Supabase:
    // const session = await getSession();
    // if (!session) redirect('/login');

    return (
        <div className="min-h-screen bg-brand-dark flex">
            {/* Navigation Layer */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-20 md:ml-64 min-h-screen relative overflow-x-hidden transition-all duration-300">
                {/* Global Glow background pattern for OS */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-brand-purple/10 blur-[120px] rounded-full pointer-events-none -z-10 translate-y-[-50%] translate-x-[20%]"></div>
                <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-brand-cyan/10 blur-[100px] rounded-full pointer-events-none -z-10 translate-x-[30%]"></div>

                {/* Content Wrapper */}
                <div className="p-4 md:p-8 pb-32 transition-all duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
}
