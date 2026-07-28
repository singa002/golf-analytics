import { defineTool } from "@lovable.dev/mcp-js";
import { getPrePuttRead } from "@/lib/previewService";

export default defineTool({
  name: "get_pre_putt_read",
  title: "Get pre-putt read",
  description:
    "Return the current pre-putt read: distance, speed, break, start line, stimp, aim point, and an AI coaching sentence.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const read = getPrePuttRead();
    return {
      content: [{ type: "text", text: JSON.stringify(read, null, 2) }],
      structuredContent: read,
    };
  },
});
