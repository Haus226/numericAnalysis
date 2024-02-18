import math
import numpy as np
from typing import Iterable

def Hermite(func:callable|Iterable, *args):
    def interpolation(x):
        Q = np.zeros((2 * len(args), 2 * len(args)))

        for idx in range(len(args)):
            Q[idx][0] = func(args[idx])
        for idx in range(1, len(args)):
            for jdx in range(1, idx + 1):
                Q[idx][jdx] = ((x - args[idx - jdx]) * Q[idx][jdx - 1] - (x - args[idx]) * Q[idx - 1][jdx - 1]) / (args[idx] - args[idx - jdx])
        return Q
    return interpolation