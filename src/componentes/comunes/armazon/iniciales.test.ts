import { expect, it } from "vitest";
import { iniciales } from "./iniciales";

it("RF-SW-26 / H-31: las iniciales omiten palabras que no empiezan con letra y usan U si no quedan", () => {
  expect(iniciales("  01 --- Ángela Núñez García ")).toBe("ÁN");
  expect(iniciales("123 _ ---")).toBe("U");
  expect(iniciales("")).toBe("U");
  expect(iniciales("Usuario de ejemplo 01")).toBe("UD");
});
