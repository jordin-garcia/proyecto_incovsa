type OpcionesCsp = { produccion: boolean; urlImagenes?: string; nonce?: string };

/** Las únicas fuentes externas son las imágenes configuradas y los marcos aprobados en specs/05. */
export function crearCsp({ produccion, urlImagenes, nonce }: OpcionesCsp): string {
  let origenImagenes = "";
  if (urlImagenes) {
    const url = new URL(urlImagenes);
    if (url.protocol !== "https:" || url.username || url.password || /[\s;]/.test(urlImagenes)) {
      throw new Error("URL_IMAGENES debe ser una dirección HTTPS sin credenciales.");
    }
    origenImagenes = ` ${url.origin}`;
  }
  return [
    "default-src 'self'",
    `script-src 'self'${nonce ? ` 'nonce-${nonce}'` : ""}${produccion ? "" : " 'unsafe-eval'"}`,
    // dnd-kit y los componentes posicionados escriben estilos mediante el DOM.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${origenImagenes}`,
    "font-src 'self'",
    `connect-src 'self'${produccion ? "" : " ws://localhost:* ws://127.0.0.1:*"}`,
    "frame-src https://www.google.com/maps/embed https://maps.google.com/maps/embed https://drive.google.com/file/d/",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function cabecerasDeSeguridad(produccion: boolean) {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ...(produccion ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
  ];
}
