const CorsPreflightRes = Symbol("CORS");

export function res(
  txtOrJson: string | Record<string, any> | Symbol,
  status?: number
): Response | undefined {
  if (txtOrJson == null) return undefined;
  const isString = typeof txtOrJson === "string";
  const isCorsPreflight = txtOrJson === CorsPreflightRes;
  const isJson = !isString && !isCorsPreflight;
  return new Response(
    isString ? txtOrJson : isCorsPreflight ? "" : JSON.stringify(txtOrJson),
    {
      ...(status ? { status } : undefined),
      headers: {
        ...(isJson
          ? { "Content-Type": "application/json;charset=utf-8" }
          : undefined),
        "Access-Control-Allow-Origin": "https://doistbot.invntrm.ru",
        "Access-Control-Allow-Headers": "authorization",
      },
    }
  );
}
