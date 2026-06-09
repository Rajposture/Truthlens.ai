import AppSidebar from "../sidebar/AppSidebar";
import Navbar from "../navbar/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#080808] text-white">

      <AppSidebar />

      <div className="flex flex-1 flex-col min-w-0">

        <Navbar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>

      </div>

    </div>
  );
}