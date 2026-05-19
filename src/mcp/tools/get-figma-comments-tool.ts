import { z } from "zod";
import { FigmaService } from "~/services/figma.js";
import { Logger } from "~/utils/logger.js";
import type { ToolExtra } from "~/mcp/progress.js";

const parameters = {
  fileKey: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, "File key must be alphanumeric")
    .describe(
      "The key of the Figma file to fetch comments from, often found in a provided URL like figma.com/(file|design)/<fileKey>/...",
    ),
  nodeId: z
    .string()
    .optional()
    .describe(
      "Optional node ID to filter comments for a specific node.",
    ),
};

const parametersSchema = z.object(parameters);
export type GetFigmaCommentsParams = z.infer<typeof parametersSchema>;

async function getFigmaComments(
  params: GetFigmaCommentsParams,
  figmaService: FigmaService,
  _extra: ToolExtra,
) {
  try {
    const { fileKey, nodeId } = parametersSchema.parse(params);

    Logger.log(`Fetching comments for file ${fileKey}${nodeId ? ` (node: ${nodeId})` : ""}`);

    const comments = await figmaService.getComments(fileKey);

    // Filter by nodeId if provided
    const filtered = nodeId
      ? comments.filter((c: any) => c.client_meta?.node_id === nodeId)
      : comments;

    const formatted = JSON.stringify(filtered, null, 2);

    return {
      content: [{ type: "text" as const, text: formatted }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : JSON.stringify(error);
    Logger.error(`Error fetching comments for file ${params.fileKey}:`, message);
    return {
      isError: true,
      content: [{ type: "text" as const, text: `Error fetching comments: ${message}` }],
    };
  }
}

export const getFigmaCommentsTool = {
  name: "get_figma_comments",
  description:
    "Get comments from a Figma file. Returns comment threads including author, message, timestamp, and position.",
  parametersSchema,
  handler: getFigmaComments,
} as const;
