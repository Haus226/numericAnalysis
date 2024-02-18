import numpy as np


def Gaussian(A:np.array):
    for idx in range(A.shape[0]):
        ptr = -1
        for jdx in range(idx, A.shape[0]):
            if A[jdx][idx]:
                ptr = jdx
                break
        if ptr == -1:
            raise ValueError("No Unique Solution Exists...")
        if ptr != idx:
            t = A[idx].copy()
            A[idx] = A[ptr] 
            A[ptr] = t
        for jdx in range(idx + 1, A.shape[0]):
            m = A[jdx][idx] / A[idx][idx]
            A[jdx] -= m * A[idx]
    if A[A.shape[0] - 1][A.shape[0] - 1] == 0:
            raise ValueError("No Unique Solution Exists...")
    x = np.zeros((A.shape[0], 1), dtype=np.float64)
    x[A.shape[0] - 1][0] = A[A.shape[0] - 1][A.shape[1] - 1] / A[A.shape[0] - 1][A.shape[0] - 1]
    for jdx in range(A.shape[0] - 2, -1, -1):
        x[jdx] = (A[jdx][A.shape[1] - 1] - np.sum(A[jdx][jdx + 1:A.shape[0]] @ x[jdx + 1:])) / A[jdx][jdx]
    return x

def partialPivot(A:np.array):
    pass

def Jacobi(A:np.array, x:np.array, b:np.array, iter:int, tol:float=1e-5):
    x_ = np.copy(x)
    for iter in range(iter):
        prev_x = np.copy(x_)
        for idx in range(A.shape[0]):
            mask = np.arange(len(x_)) != idx
            x_[idx] = 1 / (A[idx][idx]) * (b[idx] - np.sum(A[idx][mask] @ prev_x[mask]))
        if np.linalg.norm(x_ - prev_x) < tol:
            print("Iteration stopped, norm difference < tolerance.")
            break
    return x_

def GaussSeidel(A:np.array, x:np.array, b:np.array, iter:int, tol:float=1e-5):
    x_ = np.copy(x)
    for iter in range(iter):
        prev_x = np.copy(x_)
        for idx in range(A.shape[0]):
            mask = np.arange(len(x_)) != idx
            x_[idx] = 1 / (A[idx][idx]) * (b[idx] - np.sum(A[idx][mask] @ x_[mask]))
        if np.linalg.norm(x_ - prev_x) < tol:
            print("Iteration stopped, norm difference < tolerance.")
            break
    return x_

def ConjugateGradient(A:np.array, x:np.array, b:np.array):
    pass

# A = np.array([
#     [1, -1, 2, -1, -8],
#     [2, -2, 3, -3, -20],
#     [1, 1, 1, 0, -2],
#     [1, -1, 4, 3, 4]
# ], dtype=np.float64)

# print(Gaussian(A))


A = np.array([
    [10, -1, 2, 0],
    [-1, 11, -1, 3],
    [2, -1, 10, -1],
    [0, 3, -1, 8]
])

b = np.array([
    [6],
    [25],
    [-11],
    [15]
])

x = np.array([
    [0],
    [0],
    [0],
    [0]
], dtype=np.float32)

print("Jacobi Method")
print(Jacobi(A, x, b, 10))

print("Gauss-Seidel Method")
x = np.array([
    [0],
    [0],
    [0],
    [0]
], dtype=np.float32)
print(GaussSeidel(A, x, b, 10))