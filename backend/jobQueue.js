const Queue = require('bull');

const Job = require('./models/Job');
const { runCpp } = require('./runCpp');
const { runPy } = require('./runPy');

const jobQueue = new Queue("job-runner-queue");
const NUM_WORKERS = 5;

jobQueue.process(NUM_WORKERS, async ({data}) => {
    console.log(data);
    const {id: jobId} = data;
    const job = await Job.findById(jobId);
    if(job === undefined) {
        throw Error("Job not found");
    } 
    console.log("Fetched Job: ", job);
try {
    let output;
    job["startedAt"] = new Date();
    if (job.language === "cpp" ) {
        output = await runCpp(job.filepath);
    } else if (job.language === "py") {
        output = await runPy(job.filepath);
    }
    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;
    await job.save();
    console.log(job);
} catch(err) {
    job["completedAt"] = new Date();
    job["output"] = JSON.stringify(err);
    job["status"] = "error";
    await job.save();
    throw Error(JSON.stringify(err));
}
});

jobQueue.on("failed", (error) => {
    console.error(error.data.id, error.failedReason);
});
  
const addJobToQueue = async (jobId) => {
    jobQueue.add({
      id: jobId,
    });
};

module.exports = {
    addJobToQueue,
}