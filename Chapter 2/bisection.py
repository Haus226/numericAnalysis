import math

def bisection(func:callable, left:float, right:float, iterations:int=30, tol:float=1e-5):
    if func(left) * func(right) > 0:
        raise ValueError("Cannot apply Intermidiate Value Theorem")
    prev_p = math.inf 
    for cnt in range(iterations):
        p = left + (right - left) / 2
        if abs(prev_p - p) / p < tol:
            return p
        if func(left) * func(p) < 0:
            right = p
        elif func(p) * func(right) < 0:    
            left = p
    return p

f = lambda x: x ** 3 + 4 * x ** 2 - 10
print(bisection(f, 1, 2, tol=1e-4))
        
