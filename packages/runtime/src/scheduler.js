let isScheduled = false;
const jobs = [];

export function enqueueJob(job) {
  jobs.push(job);
  scheduledUpdate();
}

function scheduledUpdate() {
  if (isScheduled) return;

  isScheduled = true;
  queueMicrotask(processJobs);
}

function processJobs() {
  while (jobs.length > 0) {
    const job = jobs.shift();
    const result = job();

    Promise.resolve(result).then(
      () => {
        // Job completed successfully
      },
      (error) => {
        console.log(`[scheduler]: ${error}`);
      }
    );
  }

  isScheduled = false;
}
