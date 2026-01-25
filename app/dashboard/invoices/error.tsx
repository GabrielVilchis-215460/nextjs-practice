"use client";

import { useEffect } from "react";

/*
Acepta 2 propiedades este componente:
- Error: Este objeto es una instancia de un objecto Error de JS nativo
- reset: esta es una funcion que resetea el limite de error. Cuando se ejecuta, la funcion va a intentar re-renderizar el segmento de ruta
*/
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Algo salio mal!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Attempt to recover by trying to re-render the invoices route
          () => reset()
        }
      >
        Try again
      </button>
    </main>
  );
}
