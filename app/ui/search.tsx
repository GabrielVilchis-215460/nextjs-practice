"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  // Funcion para capturar el input del usuario
  function handleSearch(term: string) {
    //console.log(term);
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    // pathname = /dashboard/invoices
    // cuando el usuario ingrese algo al searchbar, paramss.toString() actuailza el URL con los datos
    // de busqueda del usaurio : /dashboard/invoices?query=lee
    // el url es actualizdo sin tener que hacer refresh de la pagina, gracias a la navegacion del lado de cliente
    // o client-side navigation de Next.js
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value);
          /*
defaultValue (controlado)  vs value (no-controlado)
Si se esta usando un estado para manejar el valor de un input, entonces se usuaria un atributo value para hacerlo un componente controlado, esto quiere decir que React se encargaria del estado del input.

Sin embargo, si no esta usando un estado, se puede usar un defaultValue. Esto quiere decir que el valor nativo del input va a manejar su propio estado. Esto esta bien porque se esta guardando la consulta de la busqueda al URl en lugar del estado.
*/
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
