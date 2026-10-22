const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const fs = require("fs");
(async () => {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const credentials = fs
    .readFileSync(process.env.ERP_TEST_CREDENTIALS, "utf8")
    .trim()
    .split("\n")
    .map((l) => l.split("\t"));
  const errors = [];
  for (const [email, password, role] of credentials) {
    const context = await browser.newContext({
      viewport: { width: 1360, height: 900 },
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:5174/login");
    await page.locator("input[type=email]").fill(email);
    await page.locator("input[type=password]").fill("incorrecta");
    await page
      .getByRole("button", { name: "Iniciar Sesión", exact: true })
      .click();
    await page.getByText("Correo o contraseña incorrectos").waitFor();
    await page.locator("input[type=password]").fill(password);
    await page
      .getByRole("button", { name: "Iniciar Sesión", exact: true })
      .click();
    const expected =
      role === "administrador"
        ? "Rendimiento por edad"
        : role === "encargado_galpon"
          ? "Galpones y postura"
          : "Inventario y almacén";
    await page.getByRole("heading", { name: expected, exact: true }).waitFor();
    if (role === "encargado_almacen") {
      const section = page
        .locator("section")
        .filter({
          has: page.getByRole("heading", { name: "Crear insumo", exact: true }),
        });
      await section
        .getByLabel("Nombre / fase")
        .fill("Alimento navegador " + Date.now());
      await section.locator("select[name=tipo]").selectOption("ALIMENTO");
      await section.locator("select[name=unidad]").selectOption("kg");
      await section.getByRole("button", { name: "Guardar registro" }).click();
      await section.getByText("Registro guardado.").waitFor();
      await page.getByRole("link", { name: "Notas de remisión" }).click();
      await page
        .getByRole("heading", { name: "Notas de remisión", exact: true })
        .waitFor();
      await page.getByText("Total: Bs 0,00").waitFor();
    }
    await page
      .getByRole("button", { name: "Notificaciones", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Notificaciones semanales" })
      .waitFor();
    await page.getByRole("button", { name: "Cerrar", exact: true }).click();
    await page
      .getByRole("link", {
        name: role === "administrador" ? "Caja y arqueos" : "Mis gastos",
        exact: true,
      })
      .click();
    await page
      .getByRole("heading", {
        name:
          role === "administrador"
            ? "Caja chica y arqueo"
            : "Mis gastos de caja",
        exact: true,
      })
      .waitFor();
    await page.getByRole("button", { name: "Descargar informe CSV" }).click();
    await page.screenshot({
      path: (process.env.ERP_SCREENSHOTS || "/tmp") + "/" + role + ".png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await page
      .getByRole("link", {
        name:
          role === "administrador"
            ? "Rendimiento y análisis"
            : role === "encargado_galpon"
              ? "Galpones y postura"
              : "Inventario y almacén",
        exact: true,
      })
      .click();
    await page.getByRole("heading", { name: expected, exact: true }).waitFor();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    if (overflow) throw Error(role + " horizontal page overflow");
    await page.screenshot({
      path:
        (process.env.ERP_SCREENSHOTS || "/tmp") + "/" + role + "-mobile.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await page
      .getByRole("button", { name: "Iniciar Sesión", exact: true })
      .waitFor();
    console.log("PASS browser desktop/mobile: " + role);
    await context.close();
  }
  if (errors.length) throw Error(errors.join("\n"));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
