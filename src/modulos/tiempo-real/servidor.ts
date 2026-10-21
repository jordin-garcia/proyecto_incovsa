// Un único proceso Node.js (decisión 10). globalThis comparte el canal entre los bundles de las acciones y
// de la ruta SSE, también tras una recarga de desarrollo. Con varios procesos, usar LISTEN/NOTIFY de PostgreSQL.
const globalCanal = globalThis as typeof globalThis & { cambiosIncovsa?: Map<number, Set<() => void>> };
const canales = (globalCanal.cambiosIncovsa ??= new Map());

/** Solo después de confirmar la transacción. Un navegador desconectado no puede hacer fallar la mutación. */
export function avisarCambio(sede: number): void {
  for (const avisar of canales.get(sede) ?? []) {
    try {
      avisar();
    } catch {
      // Los consumidores del flujo también se liberan al cancelar o abortar su petición.
    }
  }
}

/** Uso interno del transporte; la ruta autoriza la sede antes de suscribirse. */
export function suscribirCambios(sede: number, avisar: () => void): () => void {
  const consumidores = canales.get(sede) ?? new Set<() => void>();
  canales.set(sede, consumidores);
  consumidores.add(avisar);
  return () => {
    consumidores.delete(avisar);
    if (consumidores.size === 0) canales.delete(sede);
  };
}

/** Envía avisos mínimos; vuelve a autorizar antes de cada aviso o latido para respetar las revocaciones. */
export function crearFlujoDeCambios(sede: number, signal: AbortSignal, autorizar: () => Promise<void>) {
  const codificar = new TextEncoder();
  let liberar = () => {};
  return new ReadableStream<Uint8Array>({
    start(controlador) {
      if (signal.aborted) {
        controlador.close();
        return;
      }
      let cerrado = false;
      let cancelado = false;
      let validando = false;
      let cambioPendiente = false;
      let quitar = () => {};
      const cerrar = () => {
        if (cerrado) return;
        cerrado = true;
        quitar();
        clearInterval(latido);
        signal.removeEventListener("abort", cerrar);
        if (!cancelado) controlador.close();
      };
      liberar = () => {
        cancelado = true;
        cerrar();
      };
      const enviar = async (cambio: boolean) => {
        if (cerrado) return;
        cambioPendiente ||= cambio;
        // Agrupa ráfagas mientras se comprueban permisos; no acumula consultas ni mensajes sin límite.
        if (validando) return;
        validando = true;
        try {
          await autorizar();
          if (cerrado) return;
          if ((controlador.desiredSize ?? 0) <= 0) {
            cerrar();
            return;
          }
          const mensaje = cambioPendiente ? `data: ${JSON.stringify({ sede })}\n\n` : ": latido\n\n";
          cambioPendiente = false;
          controlador.enqueue(codificar.encode(mensaje));
        } catch {
          cerrar();
        } finally {
          validando = false;
        }
      };
      controlador.enqueue(codificar.encode(": conectado\nretry: 5000\n\n"));
      quitar = suscribirCambios(sede, () => {
        void enviar(true);
      });
      const latido = setInterval(() => {
        void enviar(false);
      }, 25000);
      signal.addEventListener("abort", cerrar, { once: true });
    },
    cancel() {
      liberar();
    },
  });
}
