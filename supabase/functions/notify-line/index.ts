// แจ้งเตือนออเดอร์ใหม่เข้า LINE OA
// ตั้งค่า secrets: LINE_CHANNEL_TOKEN (Channel access token), LINE_TO (userId หรือ groupId ที่จะรับแจ้งเตือน)
// แล้วสร้าง Database Webhook: table orders, event INSERT → เรียก function นี้

Deno.serve(async (req) => {
  const { record: o } = await req.json();
  if (!o) return new Response("no record", { status: 400 });

  const items = (o.items ?? []).map((i: any) => `• ${i.name} × ${i.qty}`).join("\n");
  const text =
    `🛍️ ออเดอร์ใหม่ ${o.id}\n` +
    `${o.name} · ${o.phone}\n` +
    `${items}\n` +
    `ยอดชำระ ฿${Number(o.total).toLocaleString("th-TH")}\n` +
    `ส่งถึง: ${o.address} ${o.province ?? ""} ${o.zipcode ?? ""}` +
    (o.note ? `\nหมายเหตุ: ${o.note}` : "");

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("LINE_CHANNEL_TOKEN")}`,
    },
    body: JSON.stringify({ to: Deno.env.get("LINE_TO"), messages: [{ type: "text", text }] }),
  });

  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
});
