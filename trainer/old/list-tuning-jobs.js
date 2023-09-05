import { openai } from "./openai-setup.js";

const result = await openai.fineTuning.jobs.list({});

console.log({ result: result.data });

const result2 = await openai.fineTuning.jobs.listEvents(
  "ftjob-vOzt363CJNNgfl7bwMUI5Ayj"
);

console.log({ result2 });
