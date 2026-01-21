import SideNav from "@/app/ui/dashboard/sidenav";

/*
El componente Layout recibe una propiedad children que puede ser una pagina o cualquier
otro layout. En este caso, las paginas dentro de /dashboard estaran automaticamente anidadas
dentro de este layout o <Layout />.
*/
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="grow p-6 md:overflow-y-auto md:p-12">{children}</div>
    </div>
  );
}

export default Layout;
