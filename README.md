# numericAnalysis
A repository that implements algorithms in the book "Numerical Analysis", Ninth Edition, by Richard L. Burden and J. Douglas Faires


The progress bar css but unfortunately Github is not allowing the style tag.

<style>
.progress-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-left: 12px;
}

.progress-bar {
    width: 100px;
    height: 16px;
    background-color: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

.progress-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease-in-out;
}

.progress-text {
    color: #000;
    font-size: 12px;
    z-index: 1;
    mix-blend-mode: difference;
    color: white;
}
</style>

## To-Do List:
Next Step: Chapter 5

## Chapter 2: Solutions of Equations in One Variable 
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 100%"></div><span class="progress-text">100%</span></div></div></summary>
  
  - [x] Chapter 2.1 The Bisection Method
  - [x] Chapter 2.2 Fixed-Point Iteration
  - [x] Chapter 2.3 Newtons's Method and Its Extensions
  - [x] Chapter 2.4 Error Analysis for Iterative  Methods
    - [x] Modified Newton Method
  - [x] Chapter 2.5 Accelerating Convergence
    - [x] Aitken's $\Delta^2$ Method
  - [x] Chapter 2.6 Zeros of Polynomials and Muller's Method
    - [x] Horner's method incorperate with Newton's method to find the zeros of polynomial
</details>

## Chapter 3: Interpolation and Polynomial Approximation
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 100%"></div><span class="progress-text">100%</span></div></div></summary>
  
- [x] Chapter 3.1 Interpolation and the Lagrange Polynomial
- [x] Chapter 3.2 Data Approximation and Neville's Method
- [x] Chapter 3.3 Divided Differences
- [x] Chapter 3.4 Hermite Interpolation
- [x] Chapter 3.5 Cubic Spline Interpolation
- [x] Beyond the Book: 
    -[x] Bezier Curve
    -[x] Non-Uniform Rational B-Spline
</details>
      
## Chapter 4: Numerical Differentiation and Integration
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 100%"></div><span class="progress-text">100%</span></div></div></summary>
  
  - [x] Chapter 4.1 Numerical Differentiation
  - [x] Chapter 4.2 Richardson's Extrapolation
    - [x] Implement Richardson's Extrapolation algorithm for even order of $h$
  - [x] Chapter 4.3 Elements of Numerical Integration
    - [x] Newton-Cotes Formula 
  - [x] Chapter 4.4 Composite Numerical Integration
    - [x] Visualization
    - [x] General Composite Integral Algorithm
  - [x] Chapter 4.5 Romberg Integration
  - [x] Chapter 4.6 Adaptive Quadrature Methods
    - [x] Adaptive Trapezoidal rule
    - [x] Adaptive Closed Newton-Cotes
  - [x] Chapter 4.7 Gaussian Quadrature
    - [x] Gaussian-Legendre Quadrature
  - [x] Chapter 4.8 Multiple Integrals
    - [x] Double and Triple Closed Newton-Cotes
</details>

## Chapter 5: Initial-Value Problems for ODEs
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 90%"></div><span class="progress-text">90%</span></div></div></summary>
  
  - [x] Chapter 5.2 Euler's Method
  - [x] Chapter 5.3 Higher-Order Taylor Methods
    - [x] Taylor's method 
  - [x] Chapter 5.4 Runge-Kutta Methods
    - [x] More in detail about _Runge-Kutta Methods_
  - [x] Chapter 5.5 Error Control and the Runge-Kutta-Fehlberg Method
    - [x] Implement Generalized Runge-Kutta Embedded 
  - [x] Chapter 5.6 Multistep Method
    - [x] Generalized Adams-Bashforth Algorithm
    - [x] Milne-Simpson Predictor-Corrector 
    - [x] Generalized Predictor-Corrector Using Newton-Cotes Formulae
  - [x] Chapter 5.7 Variable Step-Size Multistep Method
    - [x] Generalized Variable Step-Size MultiStep Method
  - [ ] Chapter 5.8 Extrapolation
  - [x] Chapter 5.9 Higher-Order Equations and Systems of Differential Equations
  - [x] Chapter 5.11 Stiff Differential Equations
</details>

## Chapter 6: Direct Method for Solving Linear Systems
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 100%"></div><span class="progress-text">100%</span></div></div></summary>

  - [x] Chapter 6.1 Linear Systems of Equations
  - [x] Chapter 6.3 Linear Algebra and Matrix Inversion
    - [x] Algorithm to find the inverse of the matrix
  - [x] Chapter 6.4 The Determinant of a Matrix 
    - [x] Compute determinant using Gaussian Elimination
  - [x] Chapter 6.5 Matrix Factorization
    - [x] _PLU_ Decomposition
  - [x] Chapter 6.6 Special Types of Matrices
  - [x] _PLDL'_ Decomposition (Refer to the book _Matrix Computation_) 
  - [x] Remaining algorithm that solves tridiagonal linear system
</details>

## Chapter 7: Iterative Techniques in Matrix Algebra
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 100%"></div><span class="progress-text">100%</span></div></div></summary>
  
  - [x] Chapter 7.3 The Jacobi and Gauss-Siedel Iterative Techniques
  - [x] Chapter 7.4 Relaxation Techniques for Solving Linear Systems 
  - [x] Chaoter 7.6 The Conjugate Gradient Method
    - [x] Conjugate Gradient Method
    - [x] Biconjugate Gradient Method
    - [x] Biconjuagte Gradient Stabilized Method 
    - [x] Conjugate Gradient Squared Method 
    - [ ] Minimal Residual Method
    - [ ] Generalized Minimal Residual Method
</details>

## Chapter 8: Approximation Theory
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 0%"></div><span class="progress-text">0%</span></div></div></summary>
</details>

## Chapter 9: Approximating Eigenvalues
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 0%"></div><span class="progress-text">0%</span></div></div></summary>
</details>

## Chapter 10: Numerical Solutions of Nonlinear Systems of Equations
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 0%"></div><span class="progress-text">0%</span></div></div></summary>
</details>

## Chapter 11: Boundary-Value Problems for ODE
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 0%"></div><span class="progress-text">0%</span></div></div></summary>
</details>

## Chapter 12: Numerical Solutionns to PDE
<details>
  <summary>Details <div class="progress-wrapper"><div class="progress-bar"><div class="progress-fill" style="width: 0%"></div><span class="progress-text">0%</span></div></div></summary>
</details>
