import math
import matplotlib.pyplot as plt
import numpy as np

def Neville(func:callable, *args):
    def interpolation(x):
        Q = np.zeros((len(args), len(args)))
        for idx in range(len(args)):
            Q[idx][0] = func(args[idx])
        for idx in range(1, len(args)):
            for jdx in range(1, idx + 1):
                Q[idx][jdx] = ((x - args[idx - jdx]) * Q[idx][jdx - 1] - (x - args[idx]) * Q[idx - 1][jdx - 1]) / (args[idx] - args[idx - jdx])
        print(Q)
        return Q[-1][-1]
    return interpolation

approximation = Neville(math.log, 2.0, 2.2, 2.3)    
print(approximation(2.1))
