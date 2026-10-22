const assert = require("node:assert/strict");
const fs = require("node:fs");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
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
  async function login(email, password) {
    const context = await browser.newContext({
        viewport: { width: 1360, height: 900 },
      }),
      page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://127.0.0.1:5174/login");
    await page.getByLabel("Correo Electrónico").fill(email);
    await page.getByLabel("Contraseña", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Iniciar Sesión", exact: true })
      .click();
    return { context, page };
  }
  for (const [email, password, role] of credentials) {
    const { context, page } = await login(email, password);
    const initial =
      role === "administrador"
        ? "Rendimiento por edad"
        : role === "encargado_galpon"
          ? "Galpones y postura"
          : "Inventario y almacén";
    await page.getByRole("heading", { name: initial, exact: true }).waitFor();
    if (role !== "encargado_galpon") {
      await page.goto("http://127.0.0.1:5174/inventario");
      const panel = page
        .locator("section")
        .filter({
          has: page.getByRole("heading", {
            name: "Clasificar huevos recolectados",
            exact: true,
          }),
        });
      await panel
        .getByText("No hay huevos pendientes de clasificar.", { exact: false })
        .last()
        .waitFor();
      assert.equal(
        await panel.locator("select[name=produccionId]").isDisabled(),
        true,
      );
      assert.equal(
        await panel
          .getByRole("button", { name: "Guardar registro" })
          .isDisabled(),
        true,
      );
      await page.goto("http://127.0.0.1:5174/ventas");
      const pago = page
        .locator("section")
        .filter({
          has: page.getByRole("heading", {
            name: "Anotar pago / abono",
            exact: true,
          }),
        });
      await pago
        .getByText("No hay remisiones pendientes de pago.", { exact: false })
        .last()
        .waitFor();
      assert.equal(
        await pago
          .getByRole("button", { name: "Guardar registro" })
          .isDisabled(),
        true,
      );
    }
    if (role !== "encargado_almacen") {
      await page.goto("http://127.0.0.1:5174/produccion");
      const panel = page
        .locator("section")
        .filter({
          has: page.getByRole("heading", {
            name: "Registrar recolección diaria",
            exact: true,
          }),
        });
      await panel.waitFor();
      assert.equal(
        await panel
          .locator(
            "input[name=kgAlimento],input[name=aguaL],select[name=insumoId]",
          )
          .count(),
        0,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Abrir menú" }).click();
    await page.getByRole("link", { name: "Mi cuenta", exact: true }).click();
    await page
      .getByRole("heading", { name: "Mi cuenta", exact: true })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
      false,
    );
    console.log("PASS empty states / simple collection / mobile: " + role);
    await context.close();
  }
  const [email, password] = credentials.find((r) => r[2] === "administrador");
  const { context, page } = await login(email, password);
  await page.getByRole("link", { name: "Cuentas y acceso" }).click();
  const create = page
    .locator("section")
    .filter({
      has: page.getByRole("heading", { name: "Crear cuenta", exact: true }),
    });
  const newEmail = "browser-" + Date.now() + "@example.com";
  await create.locator("input[name=nombre]").fill("Usuario navegador");
  await create.locator("input[name=email]").fill(newEmail);
  await create
    .getByRole("button", { name: "Crear cuenta", exact: true })
    .click();
  const issued = page
    .locator("section")
    .filter({
      has: page.getByRole("heading", {
        name: "Entrega esta contraseña temporal de forma privada",
      }),
    });
  await issued.locator("code").waitFor();
  const temporary = await issued.locator("code").innerText();
  await context.close();
  const user = await login(newEmail, temporary);
  await user.page
    .getByRole("heading", { name: "Mi cuenta", exact: true })
    .waitFor();
  await user.page
    .getByText("Tu contraseña es temporal.", { exact: false })
    .waitFor();
  const change = user.page
    .locator("section")
    .filter({
      has: user.page.getByRole("heading", {
        name: "Cambiar contraseña",
        exact: true,
      }),
    });
  await change.locator("input[name=actual]").fill(temporary);
  await change
    .locator("input[name=password]")
    .fill("Clave-navegador-segura-2026!");
  await change
    .locator("input[name=repetir]")
    .fill("Clave-navegador-segura-2026!");
  await change
    .getByRole("button", { name: "Guardar nueva contraseña" })
    .click();
  try {
    await user.page
      .getByRole("heading", { name: "Contraseña actualizada" })
      .waitFor();
  } catch (e) {
    console.log("Password form URL:", user.page.url());
    console.log(
      "Password form errors:",
      await user.page.locator("[role=alert]").allTextContents(),
    );
    throw e;
  }
  const code = await user.page.locator("code").innerText();
  assert.ok(code.length > 30);
  await user.page
    .getByRole("button", { name: "Guardé mi código. Iniciar sesión" })
    .click();
  await user.page.getByRole("link", { name: "Olvidé mi contraseña" }).click();
  await user.page.getByLabel("Correo", { exact: true }).fill(newEmail);
  await user.page.getByLabel("Código de recuperación").fill(code);
  await user.page
    .getByLabel("Nueva contraseña", { exact: true })
    .fill("Clave-recuperada-segura-2026!");
  await user.page
    .getByLabel("Repetir contraseña", { exact: true })
    .fill("Clave-recuperada-segura-2026!");
  await user.page
    .getByRole("button", { name: "Restablecer contraseña" })
    .click();
  await user.page
    .getByText("Contraseña restablecida.", { exact: false })
    .waitFor();
  await user.context.close();
  console.log(
    "PASS account creation, forced password, backup code and recovery UI",
  );
  if (errors.length) throw Error(errors.join("\n"));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
