# Subphase 2 Report: Job Scheduling Optimization

## Problem Statement

The Job Scheduling Optimization problem, also known as Weighted Job Scheduling, selects the best set of non-overlapping tasks to maximize total profit. Each task has a start time, end time, and profit.

## Algorithms Used

Two dynamic programming approaches are implemented:

- Bottom-Up Dynamic Programming using tabulation.
- Top-Down Dynamic Programming using memoization.

## Data Structures Used

- Array of objects to store task details.
- 1D DP array for tabulation.
- Map/hash table for memoized recursive results.

## Complexity

Sorting jobs by end time takes O(n log n). For every job, the algorithm searches backward for the latest non-conflicting job, which takes O(n). Therefore, the total time complexity is O(n^2).

The auxiliary space complexity is O(n).

## Justification

A naive recursive solution checks include/exclude possibilities repeatedly and can reach O(2^n). Dynamic programming avoids recomputation by storing solved subproblems, improving performance to O(n^2).

## GUI Implementation

The project uses HTML, CSS, and JavaScript. It includes task entry, sample data, live scheduler status, automatic re-optimization, manual algorithm selection, optimal schedule display, execution time, and complexity explanation.
