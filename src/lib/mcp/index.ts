import { defineMcp } from "@lovable.dev/mcp-js";
import getPrePuttReadTool from "./tools/get-pre-putt-read";
import getSessionAnalyticsTool from "./tools/get-session-analytics";

export default defineMcp({
  name: "putt-vector-mcp",
  title: "Putt Vector MCP",
  version: "0.1.0",
  instructions:
    "Tools for Putt Vector, a golf putting analytics app. Use `get_pre_putt_read` for the current pre-putt read (distance, speed, break, coaching). Use `get_session_analytics` for the current session summary (make %, averages, distributions).",
  tools: [getPrePuttReadTool, getSessionAnalyticsTool],
});
