let jobs = [];
let jobIdCounter = 1;
let liveTimer = null;

const jobForm = document.getElementById("job-form");
const jobList = document.getElementById("job-list");
const optimalSchedule = document.getElementById("optimal-schedule");
const resultsContainer = document.getElementById("results-container");
const btnBottomUp = document.getElementById("btn-bottom-up");
const btnTopDown = document.getElementById("btn-top-down");
const schedulerStatus = document.getElementById("scheduler-status");
const lastOptimized = document.getElementById("last-optimized");
const dependsOnSelect = document.getElementById("dependsOn");

jobForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("taskName").value.trim();
    const start = Number.parseInt(document.getElementById("startTime").value, 10);
    const end = Number.parseInt(document.getElementById("endTime").value, 10);
    const profit = Number.parseInt(document.getElementById("profit").value, 10);
    const dependsOn = dependsOnSelect.value;

    if (start >= end) {
        alert("End time must be greater than start time.");
        return;
    }

    jobs.push({ id: jobIdCounter++, name, start, end, profit, dependsOn });
    renderJobs(jobs, jobList);
    updateDependencyOptions();
    jobForm.reset();
    dependsOnSelect.value = "";
    document.getElementById("taskName").focus();
    queueLiveOptimization();
});

document.getElementById("load-sample-btn").addEventListener("click", () => {
    const sampleData = [
        { name: "Task A", start: 1, end: 4, profit: 50 },
        { name: "Task B", start: 3, end: 5, profit: 20 },
        { name: "Task C", start: 0, end: 6, profit: 60 },
        { name: "Task D", start: 4, end: 7, profit: 30 },
        { name: "Task E", start: 3, end: 8, profit: 50 },
        { name: "Task F", start: 5, end: 9, profit: 40 },
        { name: "Task G", start: 6, end: 10, profit: 70 },
        { name: "Task H", start: 8, end: 11, profit: 40 }
    ];

    sampleData.forEach((item) => {
        jobs.push({ id: jobIdCounter++, dependsOn: "", ...item });
    });

    renderJobs(jobs, jobList);
    updateDependencyOptions();
    queueLiveOptimization();
});

document.getElementById("clear-btn").addEventListener("click", () => {
    jobs = [];
    renderJobs(jobs, jobList);
    updateDependencyOptions();
    renderJobs([], optimalSchedule);
    resultsContainer.classList.add("hidden");
    schedulerStatus.textContent = "Monitoring incoming tasks...";
    lastOptimized.textContent = "Waiting for tasks";
});

function renderJobs(jobArray, container) {
    container.innerHTML = "";

    if (jobArray.length === 0) {
        container.innerHTML = '<p class="empty-state">No tasks added yet.</p>';
        return;
    }

    jobArray.forEach((job) => {
        const div = document.createElement("div");
        div.className = "job-item";
        const dependencyText = getDependencyText(job);
        div.innerHTML = `
            <div class="job-info">
                <span class="job-name">${job.name}</span>
                <span class="job-details">Start: ${job.start} | End: ${job.end}</span>
                <span class="dependency-tag">${dependencyText}</span>
            </div>
            <div class="job-profit">₹${job.profit}</div>
        `;
        container.appendChild(div);
    });
}

function updateDependencyOptions() {
    dependsOnSelect.innerHTML = '<option value="">No dependency</option>';

    jobs.forEach((job) => {
        const option = document.createElement("option");
        option.value = String(job.id);
        option.textContent = job.name;
        dependsOnSelect.appendChild(option);
    });
}

function getDependencyText(job) {
    if (!job.dependsOn) return "No dependency";

    const parentJob = jobs.find((item) => String(item.id) === String(job.dependsOn));
    return parentJob ? `Depends on ${parentJob.name}` : "Dependency recorded";
}

function bottomUpDP(jobsArray) {
    if (jobsArray.length === 0) return { maxProfit: 0, sequence: [] };

    const arr = [...jobsArray].sort((a, b) => a.end - b.end);
    const n = arr.length;
    const dp = new Array(n).fill(0);
    dp[0] = arr[0].profit;

    for (let i = 1; i < n; i++) {
        let includeProfit = arr[i].profit;
        const latest = findLatestNonConflict(arr, i);

        if (latest !== -1) includeProfit += dp[latest];
        dp[i] = Math.max(includeProfit, dp[i - 1]);
    }

    const result = [];
    let i = n - 1;

    while (i >= 0) {
        if (i === 0) {
            if (dp[0] > 0) result.push(arr[0]);
            break;
        }

        const latest = findLatestNonConflict(arr, i);
        const includeProfit = arr[i].profit + (latest !== -1 ? dp[latest] : 0);

        if (includeProfit === dp[i]) {
            result.push(arr[i]);
            i = latest;
        } else {
            i -= 1;
        }
    }

    return { maxProfit: dp[n - 1], sequence: result.reverse() };
}

function topDownDP(jobsArray) {
    if (jobsArray.length === 0) return { maxProfit: 0, sequence: [] };

    const arr = [...jobsArray].sort((a, b) => a.end - b.end);
    const memo = new Map();
    const choice = new Map();

    function solve(i) {
        if (i < 0) return 0;
        if (i === 0) return arr[0].profit;
        if (memo.has(i)) return memo.get(i);

        const latest = findLatestNonConflict(arr, i);
        const includeProfit = arr[i].profit + solve(latest);
        const excludeProfit = solve(i - 1);

        if (includeProfit > excludeProfit) {
            memo.set(i, includeProfit);
            choice.set(i, true);
        } else {
            memo.set(i, excludeProfit);
            choice.set(i, false);
        }

        return memo.get(i);
    }

    const maxProfit = solve(arr.length - 1);
    const result = [];
    let current = arr.length - 1;

    while (current >= 0) {
        if (current === 0) {
            result.push(arr[0]);
            break;
        }

        if (choice.get(current)) {
            result.push(arr[current]);
            current = findLatestNonConflict(arr, current);
        } else {
            current -= 1;
        }
    }

    return { maxProfit, sequence: result.reverse() };
}

function findLatestNonConflict(arr, index) {
    for (let j = index - 1; j >= 0; j--) {
        if (arr[j].end <= arr[index].start) return j;
    }
    return -1;
}

function queueLiveOptimization() {
    window.clearTimeout(liveTimer);
    schedulerStatus.textContent = "Task change detected. Re-optimizing schedule...";

    liveTimer = window.setTimeout(() => {
        executeAndRender(bottomUpDP, "Live Scheduler - Bottom-Up DP");
        schedulerStatus.textContent = "Optimal schedule updated automatically.";
    }, 450);
}

function executeAndRender(algorithmFn, algoName) {
    if (jobs.length === 0) {
        alert("Please add at least one task.");
        return;
    }

    const t0 = performance.now();
    const result = algorithmFn(jobs);
    const t1 = performance.now();
    const timeTaken = (t1 - t0).toFixed(4);

    document.getElementById("res-profit").innerText = `₹${result.maxProfit}`;
    document.getElementById("res-time").innerText = `${timeTaken} ms`;
    document.getElementById("res-algo-name").innerText = algoName;
    lastOptimized.textContent = new Date().toLocaleTimeString();

    renderJobs(result.sequence, optimalSchedule);
    resultsContainer.classList.remove("hidden");
}

btnBottomUp.addEventListener("click", () => {
    executeAndRender(bottomUpDP, "Bottom-Up DP (Tabulation)");
    schedulerStatus.textContent = "Manual bottom-up optimization completed.";
});

btnTopDown.addEventListener("click", () => {
    executeAndRender(topDownDP, "Top-Down DP (Memoization)");
    schedulerStatus.textContent = "Manual top-down optimization completed.";
});

renderJobs(jobs, jobList);
updateDependencyOptions();
