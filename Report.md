# Subphase 2 Report: Job Scheduling Optimization

## 1. Problem Statement
The **Job Scheduling Optimization** problem (often referred to as Weighted Job Scheduling) requires finding the optimal subset of tasks to maximize total profit such that no two tasks overlap. Each task has a defined *Start Time*, *End Time*, and *Profit*. Furthermore, since tasks depend on previous results (i.e., whether a prior task is included or excluded dictates the current available time frame), the problem exhibits optimal substructure and overlapping subproblems. 

## 2. Algorithms and Data Structures Used
To fulfill the requirements, two different dynamic programming techniques are implemented:

### 2.1 Algorithm 1: Bottom-Up Dynamic Programming (Tabulation)
- **Data Structures**: 
  - An array of objects to store the jobs.
  - A 1D Array (`dp`) to store the maximum profit achievable up to the `i`-th job.
- **Implementation**: The algorithm iteratively solves for each subproblem starting from the base case (job 0) up to the `n`-th job. It avoids recursion overhead and builds a table of solutions.

### 2.2 Algorithm 2: Top-Down Dynamic Programming (Memoization)
- **Data Structures**: 
  - An array of objects to store the jobs.
  - A Map/Hash Table (`memo`) to store the results of expensive function calls and return the cached result when the same inputs occur again.
- **Implementation**: The algorithm uses a recursive approach starting from the last job, working its way down to the base case. It checks the `memo` table before computing a subproblem.

## 3. Time and Space Complexity Analysis

For both algorithms:
1. **Sorting**: The initial step involves sorting the tasks based on their end times. This takes **O(n log n)** time.
2. **Finding the latest non-conflicting job**: For every job `i`, we linearly search backwards `(j = i - 1 down to 0)` to find the most recent job `j` that finishes before job `i` starts. In the worst case, this linear search takes **O(n)** time.
3. **Subproblem Evaluation**:
   - In the **Bottom-Up** approach, we iterate through all `n` jobs, and for each job, we perform the **O(n)** linear search. Thus, the DP evaluation takes **O(n²)** time.
   - In the **Top-Down** approach, there are exactly `n` unique subproblems to solve (thanks to memoization). For each subproblem, we perform the **O(n)** linear search. Thus, the total recursive calls evaluate in **O(n²)** time.

**Overall Time Complexity**: O(n log n) + O(n²) = **O(n²)**
**Space Complexity**: Both approaches require **O(n)** auxiliary space (the `dp` array for tabulation, and the `memo` table + recursion stack for memoization).

## 4. Justification and Evaluation
- **Why Dynamic Programming?**: A naive recursive approach would explore all subsets (include or exclude each job), leading to an exponential **O(2^n)** time complexity. The problem has overlapping subproblems (the maximum profit for the first `i` jobs is calculated multiple times). By using Dynamic Programming (both Tabulation and Memoization), we completely avoid recomputation, bringing the time complexity down to a highly efficient **O(n²)**.
- **Bottom-Up vs Top-Down Evaluation**:
  - The *Bottom-Up* approach is evaluated to be slightly faster in practice for this specific problem due to the lack of recursion stack overhead. It builds the solution sequentially.
  - The *Top-Down* approach is conceptually easier to design as it closely mimics the mathematical recurrence relation, but it incurs function call overhead and uses extra stack space.
- Both methods successfully reconstruct the sequence of optimal jobs, demonstrating the capability of DP to trace back decisions.

## 5. GUI Design and Implementation
A web-based premium Graphical User Interface (GUI) was developed using HTML, CSS, and Vanilla JavaScript. 
- **Features**: 
  - Form validation to ensure logical start/end times.
  - Dynamic visual injection of task items.
  - Interactive selection between Bottom-Up and Top-Down algorithms.
  - Visualization of the optimal schedule alongside the calculated maximum profit and execution time metrics.
- **Aesthetics**: Glassmorphism, a modern font (Outfit), and micro-animations were utilized to create an engaging and clean layout.
