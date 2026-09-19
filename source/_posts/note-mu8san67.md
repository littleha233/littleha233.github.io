---
title: 量子计算 lesson 1：从经典 bit 到 qubit
date: '2026-09-20 03:39:28'
description: ''
categories:
  - 量子计算
tags: []
content_type: article
disableNunjucks: true
---

现代密码学长期建立在经典计算模型之上。

RSA、ECDSA、AES、SHA 等算法虽然数学结构不同，但它们背后都有一个共同前提：攻击者使用的是经典计算机。

经典计算机最基本的信息单位是 **bit**。一个 bit 在任意时刻只能处于两个状态之一：$0$ 或 $1$。

量子计算使用的基本信息单位则是 **qubit**，即 quantum bit，量子比特。

qubit 与 bit 的区别，并不是简单地把：

```text
0
1
```

扩展成：

```text
0
1
0 和 1
```

更准确地说：

> 经典 bit 的状态是一个离散值，而 qubit 的状态是复向量空间中的一个单位向量。

正是这种状态描述方式的改变，进一步产生了量子计算中最重要的一系列概念：

* Superposition：量子叠加
* Phase：相位
* Interference：量子干涉
* Entanglement：量子纠缠
* Quantum Fourier Transform：量子傅里叶变换
* Shor Algorithm
* Grover Algorithm

因此，理解量子计算的第一步，不是直接进入 Shor 算法，而是先回答一个最基础的问题：

> 一个 qubit 究竟是什么？

---

## 一、经典 bit

### 1. bit 的状态

经典计算机中的一个 bit 只有两个可能状态：

$$
b\in\{0,1\}
$$

也就是说，一个 bit 在某个确定时刻要么是 $0$，要么是 $1$。

可以把它简单理解为一个开关：

```text
0 = OFF
1 = ON
```

在真实计算机中，bit 可以通过电压、电荷、磁性状态等物理机制实现，但这些底层实现并不影响抽象计算模型。

---

### 2. 多个 bit

两个 bit 可以表示四种状态：

$$
00,\quad 01,\quad 10,\quad 11
$$

总共有：

$$
2^2=4
$$

种可能配置。

三个 bit 有：

$$
2^3=8
$$

种可能配置。

一般来说，$n$ 个经典 bit 可以表示：

$$
2^n
$$

种不同的 bit string。

例如 256-bit 数据拥有：

$$
2^{256}
$$

种可能取值。

这也是密码学中经常出现 $2^{128}$、$2^{256}$ 这类巨大搜索空间的原因。

但有一点非常重要：

> $n$ 个经典 bit 虽然存在 $2^n$ 种可能配置，但在某一个确定时刻，只处于其中一种状态。

例如三个 bit 当前为：

```text
101
```

那么系统当前的状态就是 `101`，而不是八种状态同时存在。

---

## 二、经典随机性不等于量子叠加

这是理解量子计算时最容易混淆的地方之一。

假设抛一枚公平硬币，并规定：

```text
正面 = 0
反面 = 1
```

在抛硬币之前，可以写：

$$
P(0)=\frac{1}{2},\qquad P(1)=\frac{1}{2}
$$

这只是说明结果具有随机性。

经典概率描述的是：

> 对最终结果的不确定性。

例如：

```text
0 的概率：50%
1 的概率：50%
```

但量子叠加并不是普通概率随机。

量子态除了与概率相关的信息之外，还携带一个非常重要的信息：

**Phase，相位。**

后续会看到，正是相位使量子态能够产生 interference，也就是量子干涉。

因此需要首先建立一个基本认识：

$$
\text{Quantum Superposition}
\neq
\text{Classical Randomness}
$$

---

## 三、qubit 的基本表示

量子计算通常使用 **Dirac notation**，也就是狄拉克记号。

qubit 的两个基本状态写成：

$$
|0\rangle
$$

和：

$$
|1\rangle
$$

一般的量子态使用：

$$
|\psi\rangle
$$

表示，读作 **ket psi**。

为什么不直接使用普通的 $0$ 和 $1$？

因为 $|0\rangle$ 和 $|1\rangle$ 本质上不是普通整数，而是两个向量：

$$
|0\rangle=
\begin{bmatrix}
1\\
0
\end{bmatrix}
$$

$$
|1\rangle=
\begin{bmatrix}
0\\
1
\end{bmatrix}
$$

因此，一个 qubit 的状态空间本质上是：

$$
\mathcal{H}_1\cong\mathbb{C}^2
$$

其中：

* $\mathcal{H}_1$ 表示单 qubit 的 Hilbert Space
* $\mathbb{C}$ 表示复数集合
* $\mathbb{C}^2$ 表示二维复向量空间

这是理解量子计算非常重要的一步：

> 量子计算中的状态，本质上首先是一个线性代数对象。

---

## 四、一般 qubit 状态

一个 qubit 并不一定只能处于 $|0\rangle$ 或 $|1\rangle$。

它可以处于两者的线性组合：

$$
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle
$$

其中：

$$
\alpha,\beta\in\mathbb{C}
$$

也就是说，$\alpha$ 和 $\beta$ 可以是复数。

这种状态称为：

**Quantum Superposition，量子叠加。**

---

### 从向量角度理解

因为：

$$
|0\rangle=
\begin{bmatrix}
1\\
0
\end{bmatrix}
$$

以及：

$$
|1\rangle=
\begin{bmatrix}
0\\
1
\end{bmatrix}
$$

所以：

$$
|\psi\rangle
=
\alpha
\begin{bmatrix}
1\\
0
\end{bmatrix}
+
\beta
\begin{bmatrix}
0\\
1
\end{bmatrix}
$$

最终得到：

$$
|\psi\rangle=
\begin{bmatrix}
\alpha\\
\beta
\end{bmatrix}
$$

因此，qubit 可以理解成一个二维复向量。

这也解释了为什么后面的 quantum gate 都可以使用矩阵表示。

---

## 五、Probability Amplitude

$\alpha$ 和 $\beta$ 并不是概率。

它们叫做：

**Probability Amplitude，概率振幅。**

如果：

$$
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle
$$

那么在计算基底中进行测量时：

$$
P(0)=|\alpha|^2
$$

$$
P(1)=|\beta|^2
$$

这就是量子力学中的 **Born Rule**。

可以简单记成：

```text
α、β
↓
probability amplitude

|α|²、|β|²
↓
probability
```

概率振幅本身可以是复数，而真正能够被测量到的是它的模平方。

---

## 六、Normalization：量子态为什么必须归一化

概率总和必须等于 $1$。

因此，一个合法的 qubit 状态必须满足：

$$
|\alpha|^2+|\beta|^2=1
$$

这称为 **Normalization，归一化**。

从向量角度来看，这意味着：

$$
\lVert|\psi\rangle\rVert=1
$$

也就是说：

> 合法的纯量子态，本质上是复向量空间中的单位向量。

---

## 七、第一个典型的量子叠加态

考虑：

$$
|\psi\rangle=
\frac{1}{\sqrt{2}}|0\rangle+
\frac{1}{\sqrt{2}}|1\rangle
$$

此时：

$$
\alpha=\beta=\frac{1}{\sqrt{2}}
$$

因此：

$$
P(0)=\frac{1}{2}
$$

$$
P(1)=\frac{1}{2}
$$

这个状态通常记作：

$$
|+\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

如果进行测量：

```text
|0⟩ → 50%
|1⟩ → 50%
```

这里为什么一定要有 $\sqrt{2}$？

如果直接写成：

$$
|0\rangle+|1\rangle
$$

那么两个概率分别会变成 $1$ 和 $1$，概率总和等于 $2$，不满足归一化条件。

---

## 八、一个不均匀叠加的例子

考虑状态：

$$
|\psi\rangle=
\frac{\sqrt{3}}{2}|0\rangle+
\frac{1}{2}|1\rangle
$$

首先检查归一化条件：

$$
\left|\frac{\sqrt{3}}{2}\right|^2+
\left|\frac{1}{2}\right|^2
=
\frac{3}{4}+\frac{1}{4}
=
1
$$

因此这是一个合法量子态。

测量概率分别为：

$$
P(0)=\frac{3}{4}=75\%
$$

$$
P(1)=\frac{1}{4}=25\%
$$

因此：

> 量子叠加并不意味着一定是 50% 对 50%。

不同 probability amplitude 可以对应不同的测量概率。

---

## 九、Measurement：量子测量

假设一个 qubit 处于：

$$
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle
$$

如果在 computational basis 中进行 measurement，那么最终只会得到两个经典结果之一：

$$
0
$$

或者：

$$
1
$$

对应概率：

$$
P(0)=|\alpha|^2
$$

$$
P(1)=|\beta|^2
$$

---

### 测量之后发生什么

假设测量结果是 $0$。

那么原来的量子态会变成：

$$
|0\rangle
$$

如果测量结果是 $1$，那么状态会变成：

$$
|1\rangle
$$

这通常称为：

**State Collapse，状态坍缩。**

例如：

$$
|+\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

第一次测量：

```text
50% → 0
50% → 1
```

假设得到了 $0$，那么系统状态已经变成：

$$
|0\rangle
$$

如果立刻再次使用相同基底进行 measurement：

$$
P(0)=1
$$

因此：

```text
|+⟩
 ↓
measurement
 ↓
0

状态变成 |0⟩

 ↓
再次 measurement
 ↓
0
```

这与普通内存读取存在明显区别。

---

## 十、qubit 不是“同时存储 0 和 1”

“qubit 同时是 0 和 1”是一种非常常见的说法，但并不严谨。

更准确的表达是：

> qubit 可以处于 $|0\rangle$ 和 $|1\rangle$ 的线性叠加态。

例如：

$$
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

这是一个新的量子状态。

它并不等价于：

```text
内存中同时存储一个 0 和一个 1
```

真正存在的是一个向量：

$$
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1\\
1
\end{bmatrix}
$$

---

## 十一、为什么量子态不能只用概率描述

考虑下面两个状态：

$$
|+\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

以及：

$$
|-\rangle=
\frac{|0\rangle-|1\rangle}{\sqrt{2}}
$$

如果直接在 computational basis 中测量，两者都是：

$$
P(0)=\frac{1}{2}
$$

$$
P(1)=\frac{1}{2}
$$

也就是说：

```text
|+⟩
0 → 50%
1 → 50%

|−⟩
0 → 50%
1 → 50%
```

如果量子态只是普通概率分布，那么两个状态应该完全相同。

但实际上：

$$
|+\rangle\neq|-\rangle
$$

而且可以通过后续量子操作完全区分。

两者真正的差异就在：

$$
+
$$

和：

$$
-
$$

也就是 **Relative Phase，相对相位**。

---

## 十二、为什么量子计算需要复数

一个概率振幅通常可以写成复数：

$$
z=a+bi
$$

其中：

$$
i^2=-1
$$

复数还可以写成极坐标形式：

$$
z=re^{i\theta}
$$

根据 Euler Formula：

$$
e^{i\theta}=\cos\theta+i\sin\theta
$$

因此，probability amplitude 实际携带两类信息：

```text
Probability Amplitude
        │
        ├── Magnitude
        │      ↓
        │   决定概率
        │
        └── Phase
               ↓
            决定干涉
```

可以把这一点概括成：

> Magnitude 决定测量概率，Phase 决定量子路径之间如何发生干涉。

这是后续理解 Shor Algorithm 和 Quantum Fourier Transform 的关键。

---

## 十三、一个带复数相位的状态

考虑：

$$
|\psi\rangle=
\frac{1}{\sqrt{2}}|0\rangle+
\frac{i}{\sqrt{2}}|1\rangle
$$

因为：

$$
|i|=1
$$

所以：

$$
P(0)=\frac{1}{2}
$$

$$
P(1)=\frac{1}{2}
$$

直接测量仍然是：

```text
0 → 50%
1 → 50%
```

但是：

$$
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

与：

$$
\frac{|0\rangle+i|1\rangle}{\sqrt{2}}
$$

并不是同一个量子态。

原因就是它们携带不同的 phase。

---

## 十四、Global Phase 与 Relative Phase

考虑一般量子态：

$$
|\psi\rangle=\alpha|0\rangle+\beta|1\rangle
$$

如果整个状态乘一个共同的相位：

$$
e^{i\theta}|\psi\rangle
$$

得到：

$$
e^{i\theta}\alpha|0\rangle+
e^{i\theta}\beta|1\rangle
$$

这种整体相位称为：

**Global Phase，全局相位。**

全局相位不会产生可观察的物理差异。

因此：

$$
|\psi\rangle
$$

与：

$$
e^{i\theta}|\psi\rangle
$$

描述的是同一个物理纯态。

但是：

$$
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

与：

$$
\frac{|0\rangle-|1\rangle}{\sqrt{2}}
$$

之间的差异不能通过统一乘一个 phase 消除。

变化的是两个 basis state 之间的相对关系。

这就是：

**Relative Phase，相对相位。**

量子计算中真正具有计算意义的，通常是 relative phase。

---

## 十五、Basis：量子态的坐标系

前面一直使用：

$$
|0\rangle,\quad|1\rangle
$$

描述 qubit。

它们组成：

**Computational Basis，计算基底。**

记作：

$$
\{|0\rangle,|1\rangle\}
$$

任意单 qubit 状态都可以写成：

$$
|\psi\rangle=
\alpha|0\rangle+\beta|1\rangle
$$

但计算基底并不是唯一的基底。

还可以定义：

$$
|+\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

以及：

$$
|-\rangle=
\frac{|0\rangle-|1\rangle}{\sqrt{2}}
$$

于是：

$$
\{|+\rangle,|-\rangle\}
$$

也是一组合法的基底。

它通常被称为：

**Hadamard Basis** 或 **X Basis**。

---

## 十六、同一个量子态可以使用不同基底表示

根据：

$$
|+\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

以及：

$$
|-\rangle=
\frac{|0\rangle-|1\rangle}{\sqrt{2}}
$$

可以得到：

$$
|0\rangle=
\frac{|+\rangle+|-\rangle}{\sqrt{2}}
$$

以及：

$$
|1\rangle=
\frac{|+\rangle-|-\rangle}{\sqrt{2}}
$$

这和二维几何中的坐标系非常相似。

同一个向量可以使用普通的 $x$-$y$ 坐标描述，也可以使用旋转后的坐标轴描述。

量子态也是如此：

> 状态本身没有改变，只是使用了不同的 basis 表达。

---

## 十七、测量必须指定基底

所谓：

> “测量一个 qubit”

严格来说并不完整。

更准确的说法是：

> 在某一组 basis 中测量一个 qubit。

例如状态：

$$
|+\rangle
$$

如果在 computational basis：

$$
\{|0\rangle,|1\rangle\}
$$

中测量，则：

$$
P(0)=P(1)=\frac{1}{2}
$$

但如果在 Hadamard basis：

$$
\{|+\rangle,|-\rangle\}
$$

中测量，则：

$$
P(+)=1
$$

$$
P(-)=0
$$

因此：

> measurement 的结果与 measurement basis 密切相关。

这一性质后面会直接用于理解 BB84 量子密钥分发。

---

## 十八、Bloch Sphere：单 qubit 的几何表示

忽略 global phase 后，任意单 qubit 纯态都可以写成：

$$
|\psi\rangle=
\cos\frac{\theta}{2}|0\rangle+
e^{i\phi}\sin\frac{\theta}{2}|1\rangle
$$

其中：

$$
0\leq\theta\leq\pi
$$

$$
0\leq\phi<2\pi
$$

这个状态可以映射到一个单位球面上，也就是著名的：

**Bloch Sphere，Bloch 球。**

可以做一个简单的二维示意：

```text
                  |0⟩
                   ●
                   │
                   │
        |−⟩ ●──────┼──────● |+⟩
                   │
                   │
                   ●
                  |1⟩
```

其中：

* 北极对应 $|0\rangle$
* 南极对应 $|1\rangle$
* 赤道上可以找到 $|+\rangle$、$|-\rangle$ 以及其他具有不同 phase 的状态

Bloch Sphere 给出了一个重要直觉：

> qubit 并不是只有两个状态。

$|0\rangle$ 和 $|1\rangle$ 只是整个单 qubit 状态空间中的两个特殊点。

---

## 十九、一个 qubit 能否存储无限信息

由于 $\alpha$、$\beta$ 是复数，而复数可以连续变化，看起来一个 qubit 似乎能够编码无限精度的信息。

从数学描述上说，确实需要连续参数描述一般 qubit 状态。

但这并不意味着：

> 一个 qubit 可以输出无限多经典信息。

原因在于 measurement。

如果在 computational basis 中测量一个 qubit，最终只能得到：

$$
0
$$

或者：

$$
1
$$

因此，量子态内部拥有连续参数，并不意味着这些信息可以被完整读取出来。

---

## 二十、Holevo Bound 的直观意义

量子信息论中有一个重要结论：

**Holevo Bound。**

粗略地说：

> $n$ 个 qubit 不能被直接读取成任意超过 $n$ bit 的经典信息。

这里暂时不展开其严格证明。

需要建立的核心认知是：

$$
\text{巨大的量子状态空间}
\neq
\text{可以直接读取指数级经典信息}
$$

因此，下面这种常见说法是不准确的：

> 量子计算机同时计算所有答案，然后一次全部读取出来。

真正的量子算法要复杂得多。

---

## 二十一、Quantum Gate

经典计算中存在：

* NOT
* AND
* OR
* XOR

量子计算中对应的是：

**Quantum Gate，量子门。**

量子门在数学上通常是一个 **unitary transformation**：

$$
|\psi'\rangle=U|\psi\rangle
$$

其中 $U$ 是 unitary matrix，也就是酉矩阵。

---

## 二十二、为什么量子门必须是 Unitary

如果矩阵 $U$ 满足：

$$
U^\dagger U=I
$$

那么 $U$ 就是 unitary matrix。

其中 $U^\dagger$ 表示共轭转置。

量子态必须保持归一化：

$$
\lVert|\psi\rangle\rVert=1
$$

经过量子门：

$$
|\psi'\rangle=U|\psi\rangle
$$

之后仍然必须满足：

$$
\lVert|\psi'\rangle\rVert=1
$$

酉变换恰好保持向量长度不变。

同时：

$$
U^{-1}=U^\dagger
$$

所以 unitary transformation 本身也是可逆的。

因此：

> 封闭量子系统中的确定性演化由酉变换描述。

---

## 二十三、Pauli-X Gate

最简单的单 qubit quantum gate 之一是 Pauli-X：

$$
X=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}
$$

作用于 $|0\rangle$：

$$
X|0\rangle=
\begin{bmatrix}
0&1\\
1&0
\end{bmatrix}
\begin{bmatrix}
1\\
0
\end{bmatrix}
=
\begin{bmatrix}
0\\
1
\end{bmatrix}
=
|1\rangle
$$

同理：

$$
X|1\rangle=|0\rangle
$$

因此 Pauli-X gate 类似经典计算中的 NOT gate：

```text
|0⟩ ──X──→ |1⟩
|1⟩ ──X──→ |0⟩
```

---

## 二十四、Hadamard Gate

量子计算中最重要的 gate 之一是 Hadamard gate：

$$
H=
\frac{1}{\sqrt{2}}
\begin{bmatrix}
1&1\\
1&-1
\end{bmatrix}
$$

作用于 $|0\rangle$：

$$
H|0\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
=
|+\rangle
$$

作用于 $|1\rangle$：

$$
H|1\rangle=
\frac{|0\rangle-|1\rangle}{\sqrt{2}}
=
|-\rangle
$$

因此 Hadamard gate 可以把一个确定的 computational basis state 转换成叠加态。

---

## 二十五、Hadamard 并不只是制造随机

从：

$$
|0\rangle
$$

开始执行一次 Hadamard：

$$
|0\rangle
\xrightarrow{H}
|+\rangle
$$

如果立刻测量：

```text
0 → 50%
1 → 50%
```

看起来很像普通随机数发生器。

但如果不测量，而是再执行一次 Hadamard：

$$
|0\rangle
\xrightarrow{H}
|+\rangle
\xrightarrow{H}
|0\rangle
$$

因为：

$$
H^2=I
$$

最终一定返回 $|0\rangle$。

这说明中间状态 $|+\rangle$ 并不是普通的：

```text
50% 是 0
50% 是 1
```

它仍然保留完整的 quantum coherence 和 phase information。

这正是后续理解 interference 的关键。

---

## 二十六、Quantum Circuit

量子算法通常可以表示成量子电路。

例如：

```text
|0⟩ ─── H ─── M ───
```

其中：

* `|0⟩` 表示初始状态
* `H` 表示 Hadamard gate
* `M` 表示 measurement

状态变化为：

$$
|0\rangle
\xrightarrow{H}
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

之后进行 measurement：

$$
P(0)=P(1)=\frac{1}{2}
$$

---

## 二十七、多个 qubit

单个 qubit 的状态空间是：

$$
\mathcal{H}_1\cong\mathbb{C}^2
$$

两个 qubit 的状态空间是两个单 qubit 空间的 Tensor Product：

$$
\mathcal{H}_2
=
\mathbb{C}^2\otimes\mathbb{C}^2
\cong
\mathbb{C}^4
$$

它的 computational basis 是：

$$
|00\rangle,\quad
|01\rangle,\quad
|10\rangle,\quad
|11\rangle
$$

一般来说，$n$ 个 qubit 的状态空间为：

$$
\mathcal{H}_n
=
\left(\mathbb{C}^2\right)^{\otimes n}
\cong
\mathbb{C}^{2^n}
$$

这条公式是理解量子计算状态空间的核心。

---

## 二十八、两个 qubit 的一般状态

两个 qubit 的一般纯态可以写成：

$$
|\psi\rangle
=
\alpha|00\rangle
+
\beta|01\rangle
+
\gamma|10\rangle
+
\delta|11\rangle
$$

满足：

$$
|\alpha|^2
+
|\beta|^2
+
|\gamma|^2
+
|\delta|^2
=
1
$$

测量得到四个 basis state 的概率分别为：

$$
|\alpha|^2,\quad
|\beta|^2,\quad
|\gamma|^2,\quad
|\delta|^2
$$

---

## 二十九、Tensor Product

两个独立 qubit 的联合状态使用 Tensor Product，也就是张量积描述。

例如：

$$
|0\rangle\otimes|1\rangle
$$

通常简写为：

$$
|01\rangle
$$

因为：

$$
|0\rangle=
\begin{bmatrix}
1\\
0
\end{bmatrix}
$$

$$
|1\rangle=
\begin{bmatrix}
0\\
1
\end{bmatrix}
$$

所以：

$$
|0\rangle\otimes|1\rangle
=
\begin{bmatrix}
0\\
1\\
0\\
0
\end{bmatrix}
$$

这正是 $|01\rangle$ 在四维空间中的表示。

---

## 三十、为什么量子状态空间会指数增长

一个 qubit 的状态空间维度是：

$$
2
$$

两个 qubit：

$$
2^2=4
$$

三个 qubit：

$$
2^3=8
$$

一般来说：

$$
n\text{ qubits}
\longrightarrow
2^n\text{-dimensional Hilbert Space}
$$

因此，一个 $n$-qubit 一般纯态可以写成：

$$
|\psi\rangle=
\sum_{x=0}^{2^n-1}\alpha_x|x\rangle
$$

并满足：

$$
\sum_{x=0}^{2^n-1}|\alpha_x|^2=1
$$

因此：

```text
1 qubit  → 2 amplitudes
2 qubits → 4 amplitudes
3 qubits → 8 amplitudes
n qubits → 2ⁿ amplitudes
```

这就是量子系统具有巨大状态空间的数学来源。

---

## 三十一、三个 qubit 的均匀叠加

初始状态为：

$$
|000\rangle
$$

对三个 qubit 分别应用 Hadamard gate：

$$
H^{\otimes3}|000\rangle
$$

得到：

$$
\frac{1}{\sqrt{8}}
(
|000\rangle+
|001\rangle+
|010\rangle+
|011\rangle+
|100\rangle+
|101\rangle+
|110\rangle+
|111\rangle
)
$$

也可以简写为：

$$
\frac{1}{\sqrt{8}}
\sum_{x=0}^{7}|x\rangle
$$

这种状态称为：

**Uniform Superposition，均匀叠加态。**

Shor Algorithm 和 Grover Algorithm 都会大量使用类似结构。

---

## 三十二、为什么不能直接读取所有叠加结果

虽然上面的状态包含：

$$
|000\rangle
$$

到：

$$
|111\rangle
$$

共八个 basis state，但进行 measurement 后，只会得到其中一个。

例如得到：

$$
101
$$

概率为：

$$
\frac{1}{8}
$$

并不会一次输出：

```text
000
001
010
011
100
101
110
111
```

因此：

> Superposition 本身并不能自动带来计算优势。

量子算法真正需要做的是：

```text
建立 Superposition
        ↓
操纵 Probability Amplitude
        ↓
修改 Phase
        ↓
产生 Interference
        ↓
让有用结果的振幅增强
        ↓
Measurement
```

这也是下一课的核心主题。

---

## 三十三、Hilbert Space

量子计算中经常出现 **Hilbert Space，希尔伯特空间**。

对于量子计算入门，可以暂时把它理解成：

> 带有内积结构的复向量空间。

单 qubit：

$$
\mathcal{H}_1\cong\mathbb{C}^2
$$

两个 qubit：

$$
\mathcal{H}_2\cong\mathbb{C}^4
$$

$n$ 个 qubit：

$$
\mathcal{H}_n\cong\mathbb{C}^{2^n}
$$

因此，很多看起来十分神秘的量子操作，从数学视角看，本质上是在：

> 一个高维复向量空间中，对状态向量执行特定的线性变换。

---

## 三十四、Bra、Ket 与 Inner Product

前面使用：

$$
|\psi\rangle
$$

表示 ket。

对应的：

$$
\langle\psi|
$$

称为 bra。

如果：

$$
|\psi\rangle=
\begin{bmatrix}
a\\
b
\end{bmatrix}
$$

那么：

$$
\langle\psi|=
\begin{bmatrix}
a^*&b^*
\end{bmatrix}
$$

其中 $a^*$ 表示复共轭。

两个量子态之间的内积写作：

$$
\langle\phi|\psi\rangle
$$

可以把它理解成两个量子态之间的“重叠程度”。

---

## 三十五、Orthogonality

计算基底满足：

$$
\langle0|0\rangle=1
$$

$$
\langle1|1\rangle=1
$$

以及：

$$
\langle0|1\rangle=0
$$

$$
\langle1|0\rangle=0
$$

因此 $|0\rangle$ 和 $|1\rangle$ 互相正交。

也就是说：

$$
\{|0\rangle,|1\rangle\}
$$

构成一组 orthonormal basis。

---

## 三十六、从内积重新理解 Born Rule

假设：

$$
|\psi\rangle=
\alpha|0\rangle+\beta|1\rangle
$$

那么测量得到 $|0\rangle$ 的概率可以写成：

$$
P(0)=|\langle0|\psi\rangle|^2
$$

因为：

$$
\langle0|\psi\rangle
=
\alpha\langle0|0\rangle
+
\beta\langle0|1\rangle
$$

而：

$$
\langle0|0\rangle=1
$$

$$
\langle0|1\rangle=0
$$

因此：

$$
\langle0|\psi\rangle=\alpha
$$

最终：

$$
P(0)=|\alpha|^2
$$

同理：

$$
P(1)=|\beta|^2
$$

这就是 Born Rule 更正式的线性代数表达。

---

## 三十七、经典 bit 与 qubit 的核心区别

| 特性          | Classical Bit        | Qubit                     |                |           |
| ----------- | -------------------- | ------------------------- | -------------- | --------- |
| 基础状态        | $0,1$                | $                         | 0\rangle,      | 1\rangle$ |
| 一般状态        | 0 或 1                | $\alpha                   | 0\rangle+\beta | 1\rangle$ |
| 数学对象        | 离散值                  | 复向量                       |                |           |
| 状态空间        | 两个状态                 | $\mathbb{C}^2$            |                |           |
| 概率描述        | 普通概率                 | amplitude 的模平方            |                |           |
| Phase       | 无                    | 有                         |                |           |
| Measurement | 通常不改变数据              | 通常会改变量子态                  |                |           |
| 多系统组合       | bit string           | Tensor Product            |                |           |
| $n$ 个系统     | 一个确定的 $n$-bit string | $\mathbb{C}^{2^n}$ 中的状态向量 |                |           |
| 状态演化        | Boolean Logic        | Unitary Transformation    |                |           |

---

## 三十八、量子计算的第一条核心认知

经典计算主要处理的是确定的值。

例如：

```text
x = 101101
```

量子计算处理的是一个状态向量：

$$
|\psi\rangle=
\sum_x\alpha_x|x\rangle
$$

其中每一个 $\alpha_x$ 都可能同时包含：

* Magnitude
* Phase

因此：

> 量子算法真正操作的是整个状态向量中的 probability amplitude 结构。

这与经典计算只处理离散值的思维方式存在根本区别。

---

## 三十九、与密码学的第一次连接

假设存在一个 128-bit 搜索问题：

$$
x\in\{0,1\}^{128}
$$

经典搜索空间大小为：

$$
2^{128}
$$

量子计算可以建立：

$$
\frac{1}{\sqrt{2^{128}}}
\sum_{x=0}^{2^{128}-1}|x\rangle
$$

这意味着所有候选 $x$ 都参与了同一个量子状态。

但是，如果立刻进行 measurement，只会随机得到一个 $x$。

成功率仍然只有：

$$
\frac{1}{2^{128}}
$$

因此：

> 把所有候选放入 superposition，并没有直接解决搜索问题。

真正关键的问题是：

> 如何通过量子操作重新安排不同候选对应的 probability amplitude？

Grover Algorithm 会通过 amplitude amplification 解决这一类搜索问题。

而 Shor Algorithm 采取了一条更加特殊的路线：

> 不直接搜索秘密，而是寻找数学问题中的隐藏周期结构。

---

## 四十、从 qubit 到 Shor

后续学习 Shor Algorithm 时，会看到类似：

$$
\frac{1}{\sqrt{N}}
\sum_{x=0}^{N-1}|x\rangle
$$

这样的均匀叠加态。

随后执行函数计算：

$$
|x\rangle|0\rangle
\longrightarrow
|x\rangle|f(x)\rangle
$$

然后利用 Quantum Fourier Transform 操纵不同状态的 phase。

最终：

```text
不符合周期结构的状态
        ↓
Destructive Interference
        ↓
Probability Amplitude 抵消
```

而：

```text
符合周期结构的状态
        ↓
Constructive Interference
        ↓
Probability Amplitude 增强
```

最后通过 measurement 提取与隐藏周期相关的信息。

因此，Shor Algorithm 并不是凭空出现的。

它直接建立在本节已经出现的这些概念之上：

$$
|\psi\rangle,\quad
\alpha_x,\quad
\otimes,\quad
U,\quad
\text{Measurement}
$$

---

## 四十一、几个常见误区

### 误区一：qubit 就是同时为 0 和 1

不准确。

更准确的表达是：

$$
|\psi\rangle=
\alpha|0\rangle+\beta|1\rangle
$$

即 qubit 可以处于不同 basis state 的线性叠加态。

---

### 误区二：量子叠加就是随机

错误。

经典随机变量只保存 probability。

量子状态还保存 phase，而 phase 可以产生 interference。

---

### 误区三：量子计算可以一次读出所有答案

错误。

即使：

$$
|\psi\rangle=
\sum_x\alpha_x|x\rangle
$$

包含指数数量的 basis state，measurement 通常仍然只输出一个经典结果。

---

### 误区四：量子计算快是因为同时运行指数多个线程

这种理解不准确。

真正的量子算法优势通常来自：

$$
\text{Superposition}
+
\text{Phase}
+
\text{Interference}
+
\text{Problem Structure}
$$

单纯建立 superposition 并不会自动产生量子加速。

---

### 误区五：256 个 qubit 等于存储了 $2^{256}$ 个经典数字

错误。

虽然描述一个一般的 256-qubit 纯态需要 $2^{256}$ 个 amplitude，但这些 amplitude 无法通过一次 measurement 全部读取。

---

## 四十二、本节最重要的六个公式

### 1. qubit 的一般状态

$$
|\psi\rangle=
\alpha|0\rangle+\beta|1\rangle
$$

### 2. 归一化条件

$$
|\alpha|^2+|\beta|^2=1
$$

### 3. Born Rule

$$
P(0)=|\alpha|^2,\qquad
P(1)=|\beta|^2
$$

### 4. 量子状态演化

$$
|\psi'\rangle=U|\psi\rangle
$$

### 5. 多 qubit Hilbert Space

$$
\mathcal{H}_n
=
\left(\mathbb{C}^2\right)^{\otimes n}
\cong
\mathbb{C}^{2^n}
$$

### 6. $n$-qubit 一般纯态

$$
|\psi\rangle=
\sum_{x=0}^{2^n-1}\alpha_x|x\rangle
$$

并满足：

$$
\sum_{x=0}^{2^n-1}|\alpha_x|^2=1
$$

---

## 四十三、课后思考

### 问题 1

状态：

$$
|\psi\rangle=
\frac{3}{5}|0\rangle+
\frac{4}{5}|1\rangle
$$

是否合法？

如果合法，在 computational basis 中测量得到 $0$ 和 $1$ 的概率分别是多少？

### 问题 2

为什么：

$$
|+\rangle=
\frac{|0\rangle+|1\rangle}{\sqrt{2}}
$$

和：

$$
|-\rangle=
\frac{|0\rangle-|1\rangle}{\sqrt{2}}
$$

直接测量时具有完全相同的概率分布，却仍然是不同的量子态？

### 问题 3

三个 qubit 的一般状态需要多少个 probability amplitude 描述？

十个 qubit 呢？

### 问题 4

为什么 256 个 qubit 的状态空间维数是：

$$
2^{256}
$$

却不能说：

> 256 个 qubit 可以一次输出 $2^{256}$ 个答案？

### 问题 5

为什么量子门采用 unitary transformation？

如果状态变换不是 unitary，会破坏什么性质？

### 问题 6

为什么：

$$
H|0\rangle=|+\rangle
$$

之后立刻 measurement 是随机的，但：

$$
H(H|0\rangle)=|0\rangle
$$

却一定能够恢复 $|0\rangle$？

这个问题将直接通向下一课的核心概念：**Quantum Interference**。

---

## 四十四、总结

从经典 bit 到 qubit 的变化，本质上不是把二进制从两个状态扩展成更多状态，而是彻底改变了“计算状态”的数学表示方式。

经典 bit 满足：

$$
b\in\{0,1\}
$$

而 qubit 的一般状态是：

$$
|\psi\rangle=
\alpha|0\rangle+\beta|1\rangle
$$

其中 $\alpha,\beta\in\mathbb{C}$，并且：

$$
|\alpha|^2+|\beta|^2=1
$$

Measurement 遵循 Born Rule：

$$
P(0)=|\alpha|^2
$$

$$
P(1)=|\beta|^2
$$

多个 qubit 通过 Tensor Product 组合，使 $n$-qubit 系统拥有：

$$
\mathbb{C}^{2^n}
$$

这样的指数维状态空间。

但指数维状态空间并不意味着可以直接读取指数数量的答案。

真正使量子计算产生特殊计算能力的，是 probability amplitude 中除了 magnitude 之外还存在 **phase**。

不同计算路径之间的 phase 可以：

* 相互增强；
* 相互抵消。

这就是下一节真正进入量子计算核心的主题：

# Lesson 2：叠加、相位、干涉与纠缠

量子计算真正的关键问题并不是“如何同时表示很多状态”，而是：

> **如何利用 phase 和 interference，让有用的信息被增强，让无用的信息互相抵消。**

理解这一点之后，Quantum Fourier Transform 与 Shor Algorithm 的核心思想才会真正变得自然。
