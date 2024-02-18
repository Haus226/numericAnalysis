import math
import matplotlib.pyplot as plt
import numpy as np

def LagrangeInterpolation(func:callable, *args):
    def interpolation(x):
        approximation = 0
        for i in range(len(args)):
            l_i = 1
            for k, x_k in enumerate(args):
                if k != i:
                    l_i *= (x - x_k) 
                    l_i /= (args[i] - x_k)
            print("coef:", l_i)
            print("f:", func(args[i]))
            print(func(args[i]) * l_i)
            approximation += func(args[i]) * l_i
        return approximation
    return interpolation

f = lambda x: (1 + x) ** (1 / 2)
# g = LagrangeInterpolation(f, 0.5, math.pi / 2, math.pi)
# g_p = LagrangeInterpolation(f, 0.5, math.pi, math.pi / 2)
# x = np.linspace(0.5, math.pi, 100)
# y_a = np.array([g(x) for x in x])
# y_p = np.array([g(x) for x in x])
# y = np.array([f(x) for x in x])
# plt.plot(x, y_a, "r")
# plt.plot(x, y, "b")
# plt.plot(x, y_p, "g")

# plt.show()
g = LagrangeInterpolation(f, 0, 0.3)
print(g(0.45))
g = LagrangeInterpolation(f, 0, 0.3, 0.9)
print(g(0.45))
