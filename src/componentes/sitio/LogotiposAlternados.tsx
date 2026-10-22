import Image from "next/image";

export function LogotiposAlternados({
  logotipo,
  inquiserca,
  claro = false,
}: {
  logotipo: string;
  inquiserca: string | null;
  claro?: boolean;
}) {
  return (
    <div className={`banner-logos ${inquiserca ? "alterna" : ""} ${claro ? "en-claro" : ""}`}>
      <Image src={logotipo} alt="INCOVSA Químicos" width={300} height={150} unoptimized />
      {inquiserca && <Image src={inquiserca} alt="Inquiserca" width={300} height={150} unoptimized />}
    </div>
  );
}
