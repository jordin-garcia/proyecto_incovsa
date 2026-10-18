"use client";

import { CampoTemporal, type PropsCampoTemporal } from "./CampoFecha";

export function CampoHora(props: PropsCampoTemporal) {
  return <CampoTemporal {...props} tipo="hora" />;
}
