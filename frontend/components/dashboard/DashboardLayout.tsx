import AppSidebar from "../sidebar/AppSidebar";
import Navbar from "../navbar/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-black text-white">

      <AppSidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 p-8">
          {children}
        </main>

      </div>

    </div>
  );
}