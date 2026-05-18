let jobs = [];
let jobIdCounter = 1;

// DOM Elements
const jobForm = document.getElementById('job-form');
const jobList = document.getElementById('job-list');
const optimalSchedule = document.getElementById('optimal-schedule');
const resultsContainer = document.getElementById('results-container');
const btnBottomUp = document.getElementById('btn-bottom-up');
const btnTopDown = document.getElementById('btn-top-down');

// Form Submit
jobForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('taskName').value;
    const start = parseInt(document.getElementById('startTime').value);
    const end = parseInt(document.getElementById('endTime').value);
    const profit = parseInt(document.getElementById('profit').value);

    if (start >= end) {
        alert("End time must be greater than start time.");
        return;
    }

    const job = { id: jobIdCounter++, name, start, end, profit };
    jobs.push(job);
    renderJobs(jobs, jobList);
    jobForm.reset();
    document.getElementById('taskName').focus();
});

// Load Sample Data
document.getElementById('load-sample-btn').addEventListener('click', () => {
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

    sampleData.forEach(d => {
        jobs.push({ id: jobIdCounter++, name: d.name, start: d.start, end: d.end, profit: d.profit });
    });
    renderJobs(jobs, jobList);
});

// Render Jobs
function renderJobs(jobArray, container) {
    container.innerHTML = '';
    if (jobArray.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No tasks added yet.</p>';
        return;
    }

    jobArray.forEach(job => {
        const div = document.createElement('div');
        div.className = 'job-item';
        div.innerHTML = `
            <div class="job-info">
                <span class="job-name">${job.name}</span>
                <span class="job-details">Start: ${job.start} | End: ${job.end}</span>
            </div>
            <div class="job-profit">₹${job.profit}</div>
        `;
        container.appendChild(div);
    });
}

// ----------------------------------------------------
// ALGORITHM 1: Bottom-Up DP (Tabulation) - O(n^2)
// ----------------------------------------------------
function bottomUpDP(jobsArray) {
    if (jobsArray.length === 0) return { maxProfit: 0, sequence: [] };
    
    // Sort by end time
    let arr = [...jobsArray].sort((a, b) => a.end - b.end);
    let n = arr.length;
    let dp = new Array(n).fill(0);

    dp[0] = arr[0].profit;

    for (let i = 1; i < n; i++) {
        let inclProf = arr[i].profit;
        let l = -1;
        // O(n) search for latest non-conflicting job -> total O(n^2)
        for (let j = i - 1; j >= 0; j--) {
            if (arr[j].end <= arr[i].start) {
                l = j;
                break;
            }
        }
        
        if (l !== -1) {
            inclProf += dp[l];
        }
        
        dp[i] = Math.max(inclProf, dp[i - 1]);
    }

    // Reconstruct sequence
    let result = [];
    let i = n - 1;
    while (i >= 0) {
        if (i === 0) {
            if (dp[0] > 0) result.push(arr[0]);
            break;
        }
        
        let l = -1;
        for (let j = i - 1; j >= 0; j--) {
            if (arr[j].end <= arr[i].start) {
                l = j;
                break;
            }
        }
        
        let inclProf = arr[i].profit + (l !== -1 ? dp[l] : 0);
        if (inclProf === dp[i]) {
            result.push(arr[i]);
            i = l;
        } else {
            i = i - 1;
        }
    }

    return { maxProfit: dp[n - 1], sequence: result.reverse() };
}

// ----------------------------------------------------
// ALGORITHM 2: Top-Down DP (Memoization) - O(n^2)
// ----------------------------------------------------
function topDownDP(jobsArray) {
    if (jobsArray.length === 0) return { maxProfit: 0, sequence: [] };
    
    // Sort by end time
    let arr = [...jobsArray].sort((a, b) => a.end - b.end);
    let memo = new Map();
    let choice = new Map(); 

    function solve(i) {
        if (i < 0) return 0;
        if (i === 0) return arr[0].profit;
        if (memo.has(i)) return memo.get(i);

        let l = -1;
        // O(n) search -> total O(n^2)
        for (let j = i - 1; j >= 0; j--) {
            if (arr[j].end <= arr[i].start) {
                l = j;
                break;
            }
        }

        let inclProf = arr[i].profit + solve(l);
        let exclProf = solve(i - 1);

        if (inclProf > exclProf) {
            memo.set(i, inclProf);
            choice.set(i, true);
        } else {
            memo.set(i, exclProf);
            choice.set(i, false);
        }

        return memo.get(i);
    }

    let maxProfit = solve(arr.length - 1);

    // Reconstruct sequence
    let result = [];
    let curr = arr.length - 1;
    while (curr >= 0) {
        if (curr === 0) {
            result.push(arr[0]);
            break;
        }
        if (choice.get(curr)) {
            result.push(arr[curr]);
            let l = -1;
            for (let j = curr - 1; j >= 0; j--) {
                if (arr[j].end <= arr[curr].start) {
                    l = j;
                    break;
                }
            }
            curr = l;
        } else {
            curr = curr - 1;
        }
    }

    return { maxProfit, sequence: result.reverse() };
}

// ----------------------------------------------------
// Event Handlers
// ----------------------------------------------------
function executeAndRender(algorithmFn, algoName) {
    if (jobs.length === 0) {
        alert("Please add at least one task.");
        return;
    }

    const t0 = performance.now();
    const result = algorithmFn(jobs);
    const t1 = performance.now();
    const timeTaken = (t1 - t0).toFixed(4);

    // Update UI
    document.getElementById('res-profit').innerText = `₹${result.maxProfit}`;
    document.getElementById('res-time').innerText = `${timeTaken} ms`;
    document.getElementById('res-algo-name').innerText = algoName;
    
    renderJobs(result.sequence, optimalSchedule);
    
    resultsContainer.classList.remove('hidden');
}

btnBottomUp.addEventListener('click', () => {
    executeAndRender(bottomUpDP, "Bottom-Up DP (Tabulation)");
});

btnTopDown.addEventListener('click', () => {
    executeAndRender(topDownDP, "Top-Down DP (Memoization)");
});
