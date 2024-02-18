import math

def newton(f:callable, df:callable, init:float, iterations:int=30, tol:float=1e-5):
    prev_p = math.inf
    p = init
    for cnt in range(iterations):
        prev_p = p
        p -= f(p) / df(p)
        if abs(prev_p - p) / p < tol:
            return p