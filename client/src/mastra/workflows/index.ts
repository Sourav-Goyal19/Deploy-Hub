import { z } from "zod";
import { Workflow } from "@mastra/core/workflows";

const myWorkflow = new Workflow({
  name: "my-workflow",
  triggerSchema: z.object({
    inputValue: z.string(),
  }),
});
