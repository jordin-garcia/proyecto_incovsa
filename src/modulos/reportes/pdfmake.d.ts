declare module "pdfmake" {
  type Fuente = { normal: string; bold: string; italics: string; bolditalics: string };

  const pdfmake: {
    addFonts(fuentes: Record<string, Fuente>): void;
    setUrlAccessPolicy(regla: (url: string) => boolean): void;
    setLocalAccessPolicy(regla: (ruta: string) => boolean): void;
    createPdf(definicion: unknown): { getBuffer(): Promise<Buffer> };
  };

  export default pdfmake;
}
