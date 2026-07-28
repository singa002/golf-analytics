import { defineTool } from "@lovable.dev/mcp-js";
import { getSessionAnalytics } from "@/lib/analyticsService";

export default defineTool({
  name: "get_session_analytics",
  title: "Get session analytics",
  description:
    "Return the current putting session summary: make %, total/made/missed putts, averages (distance, speed, start line, break), start-line accuracy, speed distribution, and putt map points.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const analytics = getSessionAnalytics();
    return {
      content: [{ type: "text", text: JSON.stringify(analytics, null, 2) }],
      structuredContent: analytics,
    };
  },
});
