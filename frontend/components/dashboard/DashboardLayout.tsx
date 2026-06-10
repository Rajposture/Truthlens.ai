import AppSidebar from "../sidebar/AppSidebar";
import Navbar from "../navbar/Navbar";

export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
return ( <div
   className="
     flex
     min-h-screen
     text-white
     overflow-hidden
   "
 > <AppSidebar />


  <div
    className="
      relative
      flex
      flex-1
      flex-col
      min-w-0
    "
  >
    <Navbar />

    <main
      className="
        relative
        flex-1
        overflow-auto
        p-6
      "
    >
      {children}
    </main>
  </div>
</div>


);
}
