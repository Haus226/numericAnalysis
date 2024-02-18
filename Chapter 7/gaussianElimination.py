import numpy as np

def forwardElimination(A:np.array):
    N, M = A.shape
    for idx in range(N):
        print(A)
        ptr = -1
        for jdx in range(idx, N):
            if A[jdx][idx]:
                ptr = jdx
                break
        if ptr == -1:
            raise ValueError("No Unique Solution Exists...")
        if ptr != idx:
            A[[idx, ptr]] = A[[ptr, idx]]
            
        for jdx in range(idx + 1, N):
            m = A[jdx][idx] / A[idx][idx]
            A[jdx] -= m * A[idx]
    if A[N - 1][N - 1] == 0:
            raise ValueError("No Unique Solution Exists...")
    # Backward Substituition
    x = np.zeros((N, 1), dtype=np.float64)
    x[N - 1][0] = A[N - 1][M - 1] / A[N - 1][N - 1]    
    for jdx in range(N - 2, -1, -1):
        x[jdx] = (A[jdx][M - 1] - np.sum(A[jdx, jdx + 1:N] @ x[jdx + 1:])) / A[jdx][jdx]
    return x



def PartialPivot(A:np.array):
    N, M = A.shape
    for idx in range(N):
        ptr = idx
        for jdx in range(idx, N):
            if np.abs(A[jdx][idx]) > np.abs(A[ptr][idx]):
                ptr = jdx
        if A[ptr][idx] == 0:
            raise ValueError("No Unique Solution Exists...")
        if ptr != idx:
            t = A[idx].copy()
            A[idx] = A[ptr] 
            A[ptr] = t
        for jdx in range(idx + 1, N):
            m = A[jdx][idx] / A[idx][idx]
            A[jdx] -= m * A[idx]
    if A[N - 1][N - 1] == 0:
            raise ValueError("No Unique Solution Exists...")
    x = np.zeros((N, 1), dtype=np.float64)
    x[N - 1][0] = A[N - 1][M - 1] / A[N - 1][N - 1]
    for jdx in range(N - 2, -1, -1):
        x[jdx] = (A[jdx][M - 1] - np.sum(A[jdx][jdx + 1:N] @ x[jdx + 1:])) / A[jdx][jdx]
    return x

# A = np.array([
#     [0.003, 59.14, 59.17],
#     [5.291, -6.130, 46.78]
# ])
A = np.array([
    [25, 2, 9],
    [12,31, 124],
    [124, 2, 141]
], dtype=np.float32)
# A_ = np.array([
#     [1, 2, 3],
#     [12,31,41],
#     [124, 2, 141]
# ], dtype=np.float32)

