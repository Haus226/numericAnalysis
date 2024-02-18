import math
import matplotlib.pyplot as plt
import numpy as np

def Newton(func:callable, *args):
    def interpolation(x):
        F = np.zeros((len(args), len(args)))
        for idx in range(len(args)):
            F[idx][0] = func(args[idx])
        for idx in range(1, len(args)):
            for jdx in range(1, idx + 1):
                F[idx][jdx] = (F[idx][jdx - 1] - F[idx - 1][jdx - 1]) / (args[idx] - args[idx - jdx])
        print(F)
        approximation = F[0][0]
        for idx in range(1, len(args)):
            c = 1
            for jdx in range(idx):
                c *= x - args[jdx]
            approximation += F[idx][idx] * c
        return approximation
    return interpolation

approximation = Newton(math.log, 2.0, 2.2, 2.3)    
print(approximation(2.1))

def Newton_(y, args):
    def interpolation(x):
        F = np.zeros((len(args), len(args)))
        for idx in range(len(args)):
            F[idx][0] = y[idx]
        for idx in range(1, len(args)):
            for jdx in range(1, idx + 1):
                F[idx][jdx] = (F[idx][jdx - 1] - F[idx - 1][jdx - 1]) / (args[idx] - args[idx - jdx])
        print(F)
        approximation = F[0][0]
        for idx in range(1, len(args)):
            c = 1
            for jdx in range(idx):
                c *= x - args[jdx]
            approximation += F[idx][idx] * c
        return approximation
    return interpolation

y = [
    0.7651977,
    0.6200860,
    0.4554022,
    0.2818186,
    0.1103623
]

x = [
    1.0, 1.3, 1.6, 1.9, 2.2
]

approximation = Newton_(y, x)
approximation(1.5)