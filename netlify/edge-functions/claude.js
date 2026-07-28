export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable is not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let upstream;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: body.max_tokens || 4000,
        thinking: { type: "disabled" },
        stream: true,
        messages: body.messages
      })
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const errorText = await upstream.text();
    return new Response(
      JSON.stringify({ error: `Anthropic API error: ${upstream.status}`, details: errorText }),
      { status: upstream.status, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }

  // Relay Anthropic's SSE stream as it arrives, forwarding only the text
  // deltas. Running on Netlify's Edge runtime (not the Lambda-based
  // Functions runtime) avoids the ~26s hard execution ceiling that
  // regular Functions have, so longer menus can finish generating.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data) continue;
            let evt;
            try {
              evt = JSON.parse(data);
            } catch (e) {
              continue;
            }
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(evt.delta.text));
            } else if (evt.type === "error") {
              controller.error(new Error(evt.error?.message || "Upstream stream error"));
              return;
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      controller.close();
    }
  });

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" }
  });
};

export const config = { path: "/.netlify/functions/claude" };
