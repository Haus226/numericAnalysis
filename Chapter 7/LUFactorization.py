import numpy as np

# def LUFactorization(A:np.array):
#     if A[0][0] == 0:
#         raise ValueError("Factorization impossible")
#     L = np.eye(A.shape[0], A.shape[1])
#     U = np.zeros_like(A)
#     U[0][0] = A[0][0] / L[0][0]
#     for idx in range(1, A.shape[0]):
#         U[0][idx] = A[0][idx] / L[0][0]
#         L[idx][0] = A[idx][0] / U[0][0]
#     for idx in range(1, A.shape[0] - 1):
#         if A[idx][idx] - (L[idx, :idx] @ U[:idx, idx]) == 0:
#             raise ValueError("Factorization impossible")
#         U[idx][idx] = A[idx][idx] - (L[idx, :idx] @ U[:idx, idx])
#         for jdx in range(idx + 1, A.shape[0]):
#             U[idx][jdx] = (A[idx][jdx] - (L[idx, :idx] @ U[:idx, jdx])) / L[idx][idx]
#             L[jdx][idx] = (A[jdx][idx] - (L[jdx, :idx] @ U[:idx, idx])) / U[idx][idx]
#     N = A.shape[0] - 1
#     U[N][N] = A[N][N] - (L[N, :N] @ U[:N, N])
#     return L, U

def LUDecomposition(A):
    n = A.shape[0]
    if not np.all(np.diag(A)):
        raise ValueError("Decomposition impossible, some diagonals are zeros")
    L = np.eye(n)
    U = np.copy(A)
    for idx in range(n - 1):
        for jdx in range(idx + 1, n):
            factor = U[jdx, idx] / U[idx, idx]
            L[jdx, idx] = factor
            U[jdx, :] -= factor * U[idx, :]
    return L, U


def PLUDecomposition(A):
    n = A.shape[0]
    P = np.eye(n)
    L = np.zeros_like(A)
    U = np.copy(A)
    
    for idx in range(n - 1):
        pivot_row = np.argmax(np.abs(U[idx:, idx])) + idx
        if pivot_row != idx:
            P[[idx, pivot_row]] = P[[pivot_row, idx]]
            U[[idx, pivot_row]] = U[[pivot_row, idx]]
            L[[idx, pivot_row]] = L[[pivot_row, idx]]
        for jdx in range(idx + 1, n):
            factor = U[jdx, idx] / U[idx, idx]
            L[jdx, idx] = factor
            U[jdx, :] -= factor * U[idx, :]
    for idx in range(n):
        L[idx, idx] = 1
    return P, L, U

def LUDecomposition_(A:np.array):
    N = A.shape[0]
    A_ = np.copy(A)
    for k in range(N):
        A_[k + 1:, k] /= A_[k, k]
        A_[k + 1:, k + 1:] -= np.outer(A_[k + 1:, k], A_[k, k + 1:])
    np.fill_diagonal(L := np.tril(A_), 1)
    return L, np.triu(A_)

def PLUDecomposition_(A:np.array):
    N = A.shape[0]
    A_ = np.copy(A)
    P = np.eye(N, N)
    for k in range(N):
        piv = np.argmax(np.abs(A_[k:, k])) + k
        if piv != k:
            A_[[k, piv]] = A_[[piv, k]]
            P[[k, piv]] = P[[piv, k]]
        if A_[k, k] != 0:
            A_[k + 1:, k] /= A_[k, k]
            A_[k + 1:, k + 1:] -= np.outer(A_[k + 1:, k], A_[k, k + 1:])
    np.fill_diagonal(L := np.tril(A_), 1)
    return P, L, np.triu(A_)


A = np.array([
    [1, 1, 0, 3],
    [2, 1, -1, 1],
    [3, -1, -1, 2],
    [-1, 2, 3, -1]
], dtype=float)

A_ = np.array([
    [0, 0, -1, 1],
    [1, 1, -1, 2],
    [-1, -1, 2, 0],
    [1, 2, 0, 2]
], dtype=float)

A__ = np.array([
    [3, 17, 10],
    [2, 4, -2],
    [6, 18, -12]
], dtype=float)

# A_[[0, 1]] = A_[[1, 0]]
# print(A_)
# P, L, U = PLUDecomposition(A_)
# print(P)
# print(L)
# print(U)
# print(P.T @ L @ U)
L, U = LUDecomposition_(A.copy())
print(L)
print(U)
print(L@U)
P, L, U = PLUDecomposition_(A)
print(P)
print(L)
print(U)
print(P.T@L@U)
# L, U = LUFactorization(A)
# print(L)
# print(U)
