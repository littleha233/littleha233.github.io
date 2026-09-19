---
title: 量子计算2：叠加、相位、干涉与纠缠
date: '2026-09-20 03:47:17'
description: ''
categories:
  - 量子计算
tags: []
content_type: article
disableNunjucks: true
---

量子计算真正开始显现出与经典计算不同的地方，并不只是“一个 qubit 可以处于叠加态”。

单纯的叠加并不足以带来量子加速。

一个量子算法真正有价值的部分，是让大量概率振幅经历精心设计的相位变化，使错误答案之间发生相消干涉，让目标答案之间发生相长干涉，最终在测量时以较高概率得到需要的信息。

多 qubit 系统中还会出现经典概率系统不存在的另一种结构：**纠缠**。

因此，从量子算法的角度，可以先建立这样一条主线：

$$
\text{Superposition}
\rightarrow
\text{Phase}
\rightarrow
\text{Interference}
\rightarrow
\text{Measurement}
$$

对于多 qubit 系统，还会加入：

$$
\text{Entanglement}
$$

这些概念将在后面的 Quantum Fourier Transform 和 Shor Algorithm 中反复出现。

理解这一课，实际上是在回答一个核心问题：

> 既然量子测量最终只能得到一个经典结果，量子计算究竟是如何利用指数维状态空间完成计算的？

答案不是“同时计算所有答案然后全部读出来”，而是：

> 利用概率振幅及其相位，让不同计算路径发生干涉，把需要的全局结构编码进最终的测量概率分布。

---

## 一、Superposition 到底意味着什么

单个经典 bit 只能处于两个确定状态之一：

$$
0
$$

或者：

$$
1
$$

而一个 qubit 可以处于一般状态：

$$
|\psi\rangle
=
\alpha|0\rangle+\beta|1\rangle
$$

其中 $\alpha,\beta\in\mathbb C$，并满足归一化条件：

$$
|\alpha|^2+|\beta|^2=1
$$

$\alpha$ 和 $\beta$ 被称为 **probability amplitude，概率振幅**。

测量时：

$$
P(0)=|\alpha|^2
$$

$$
P(1)=|\beta|^2
$$

例如：

$$
|\psi\rangle
=
\frac{1}{\sqrt 2}|0\rangle
+
\frac{1}{\sqrt 2}|1\rangle
$$

测量得到 $0$ 和 $1$ 的概率分别为：

$$
P(0)=P(1)=\frac12
$$

这就是最简单的叠加态。

但这里非常容易产生一个错误直觉：

> qubit 既是 0 又是 1，所以量子计算机可以同时计算 0 和 1，然后把两个结果都读出来。

这并不成立。

测量：

$$
\frac{1}{\sqrt2}
\left(
|0\rangle+|1\rangle
\right)
$$

只能得到：

$$
0
$$

或者：

$$
1
$$

一次测量不会输出：

$$
0,1
$$

两个答案。

因此，**叠加只是量子计算的起点，而不是量子加速本身。**

---

# 二、经典随机与量子叠加完全不是一回事

考虑一个经典随机 bit。

假设一个 bit：

* 50% 概率为 $0$
* 50% 概率为 $1$

经典概率分布可以写成：

$$
P(0)=\frac12,\qquad P(1)=\frac12
$$

再考虑量子态：

$$
|+\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

如果直接在 computational basis 中测量，同样得到：

$$
P(0)=\frac12,\qquad P(1)=\frac12
$$

从测量结果看，两者似乎完全相同。

但它们其实有本质区别。

考虑另一个量子态：

$$
|-\rangle
=
\frac{|0\rangle-|1\rangle}{\sqrt2}
$$

直接测量时仍然有：

$$
P(0)=\frac12
$$

$$
P(1)=\frac12
$$

因此如果只观察 computational basis 的统计结果：

$$
|+\rangle
$$

和：

$$
|-\rangle
$$

完全一样。

但这两个量子态实际上不同。

区别就在于：

$$
|1\rangle
$$

前面的符号不同。

一个是：

$$
+1
$$

另一个是：

$$
-1
$$

这就是**相位信息**最简单的体现。

经典概率只记录：

$$
P(x)
$$

而量子态记录的是：

$$
\alpha_x
$$

概率来自：

$$
P(x)=|\alpha_x|^2
$$

但在测量之前，真正参与量子计算的是 $\alpha_x$，而不是 $P(x)$。

这是理解量子算法的关键分界线。

---

# 三、Probability Amplitude 与 Probability

经典概率必须是一个非负实数：

$$
0\le P(x)\le1
$$

而概率振幅可以是复数：

$$
\alpha\in\mathbb C
$$

例如：

$$
\frac1{\sqrt2}
$$

$$
-\frac1{\sqrt2}
$$

$$
\frac{i}{\sqrt2}
$$

$$
\frac{e^{i\theta}}{\sqrt2}
$$

都可以成为合法的概率振幅。

测量概率通过 Born Rule 得到：

$$
P(x)=|\alpha_x|^2
$$

如果：

$$
\alpha=\frac1{\sqrt2}
$$

那么：

$$
|\alpha|^2=\frac12
$$

如果：

$$
\alpha=-\frac1{\sqrt2}
$$

仍然有：

$$
|\alpha|^2=\frac12
$$

如果：

$$
\alpha=\frac{i}{\sqrt2}
$$

同样：

$$
|\alpha|^2=\frac12
$$

因此单独观察某个 basis state 的测量概率时，很多不同的振幅看起来完全相同。

真正的差异只有当不同振幅被重新组合时才会显现出来。

这正是 **interference** 的来源。

---

# 四、Phase 的数学含义

复数可以表示为：

$$
\alpha=re^{i\theta}
$$

其中：

* $r$ 是振幅大小；
* $\theta$ 是 phase，相位。

根据 Euler 公式：

$$
e^{i\theta}
=
\cos\theta+i\sin\theta
$$

因此复数可以理解成复平面上的一个向量。

例如：

$$
1=e^{i0}
$$

$$
i=e^{i\pi/2}
$$

$$
-1=e^{i\pi}
$$

$$
-i=e^{i3\pi/2}
$$

从几何上看：

```text
          i
          ↑
          |
     -1 ← + → 1
          |
          ↓
         -i
```

因此量子振幅不只是“大小”，还带有“方向”。

例如两个振幅：

$$
\frac1{\sqrt2}
$$

和：

$$
-\frac1{\sqrt2}
$$

大小完全相同，但相位相差：

$$
\pi
$$

如果两条计算路径最终汇聚到同一个状态，这两个振幅可能互相抵消。

这就是 destructive interference。

---

# 五、Global Phase 与 Relative Phase

相位还需要进一步区分：

* global phase
* relative phase

## 5.1 Global Phase

考虑：

$$
|\psi\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

整体乘上：

$$
e^{i\theta}
$$

得到：

$$
|\psi'\rangle
=
e^{i\theta}
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

测量概率为：

$$
\left|
\frac{e^{i\theta}}{\sqrt2}
\right|^2
=
\frac12
$$

因此：

$$
|\psi\rangle
$$

与：

$$
e^{i\theta}|\psi\rangle
$$

在物理上表示同一个纯量子态。

这种整体共同乘上的相位称为 **global phase**。

例如：

$$
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

与：

$$
-\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

物理上没有区别。

因为：

$$
-1=e^{i\pi}
$$

只是整个量子态整体旋转了 $\pi$。

---

## 5.2 Relative Phase

现在比较：

$$
|+\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

与：

$$
|-\rangle
=
\frac{|0\rangle-|1\rangle}{\sqrt2}
$$

这里不能通过给整个状态乘一个共同的复数，把一个变成另一个。

两项之间的相对关系不同：

$$
|+\rangle
:
\quad
\text{relative phase}=0
$$

而：

$$
|-\rangle
:
\quad
\text{relative phase}=\pi
$$

这种不同 basis component 之间的相位差叫做 **relative phase**。

量子算法真正关心的通常正是 relative phase。

可以粗略记住：

> Global phase 看不见，relative phase 能够通过 interference 被观测到。

---

# 六、为什么相位如此重要

只观察：

$$
|+\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

和：

$$
|-\rangle
=
\frac{|0\rangle-|1\rangle}{\sqrt2}
$$

在 computational basis 中测量，两者完全没有区别：

$$
P(0)=P(1)=\frac12
$$

但如果分别施加 Hadamard Gate：

$$
H|+\rangle
$$

和：

$$
H|-\rangle
$$

结果完全不同。

因为：

$$
H|0\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

以及：

$$
H|1\rangle
=
\frac{|0\rangle-|1\rangle}{\sqrt2}
$$

于是：

$$
\begin{aligned}
H|+\rangle
&=
H\frac{|0\rangle+|1\rangle}{\sqrt2}\\
&=
\frac1{\sqrt2}
\left(
H|0\rangle+H|1\rangle
\right)\\
&=
\frac12
\left(
|0\rangle+|1\rangle
+
|0\rangle-|1\rangle
\right)\\
&=
|0\rangle
\end{aligned}
$$

而：

$$
\begin{aligned}
H|-\rangle
&=
H\frac{|0\rangle-|1\rangle}{\sqrt2}\\
&=
\frac1{\sqrt2}
\left(
H|0\rangle-H|1\rangle
\right)\\
&=
\frac12
\left(
|0\rangle+|1\rangle
-
|0\rangle+|1\rangle
\right)\\
&=
|1\rangle
\end{aligned}
$$

因此：

$$
\boxed{
H|+\rangle=|0\rangle
}
$$

$$
\boxed{
H|-\rangle=|1\rangle
}
$$

原本隐藏在相位中的信息，通过 Hadamard Gate 被转换成了测量概率。

这是整个量子计算中一个非常重要的思想：

> Phase 本身无法直接测量，但可以通过 interference 转化为可测量的 probability difference。

后面的 QFT 本质上会把这个思想扩展到规模更大的状态空间。

---

# 七、Interference：振幅先相加，再计算概率

经典概率组合时，通常直接把概率相加。

假设两个互斥路径到达结果 $x$：

$$
P(x)
=
P_1(x)+P_2(x)
$$

量子计算不是这样。

量子系统首先把**概率振幅相加**：

$$
\alpha(x)
=
\alpha_1(x)+\alpha_2(x)
$$

然后才根据 Born Rule 得到概率：

$$
P(x)
=
|\alpha_1(x)+\alpha_2(x)|^2
$$

这意味着相位会产生交叉项。

展开：

$$
\begin{aligned}
P(x)
&=
|\alpha_1+\alpha_2|^2\\
&=
|\alpha_1|^2
+
|\alpha_2|^2
+
2\operatorname{Re}
\left(
\alpha_1^*\alpha_2
\right)
\end{aligned}
$$

最后这一项：

$$
2\operatorname{Re}
\left(
\alpha_1^*\alpha_2
\right)
$$

就是干涉项。

经典概率理论中没有对应结构。

---

# 八、Constructive Interference

假设两条路径贡献：

$$
\alpha_1=\frac12
$$

$$
\alpha_2=\frac12
$$

总振幅：

$$
\alpha
=
\frac12+\frac12
=
1
$$

于是：

$$
P=|1|^2=1
$$

虽然每一条路径单独贡献的概率只有：

$$
\left|\frac12\right|^2
=
\frac14
$$

但两个同相振幅叠加后，最终概率可以达到：

$$
1
$$

这叫：

**constructive interference，相长干涉。**

---

# 九、Destructive Interference

现在假设：

$$
\alpha_1=\frac12
$$

$$
\alpha_2=-\frac12
$$

两者大小相同，但相位相差 $\pi$。

总振幅：

$$
\alpha
=
\frac12-\frac12
=
0
$$

因此：

$$
P=0
$$

这就是：

**destructive interference，相消干涉。**

因此量子算法经常试图做到：

```text
错误答案：

path 1  ── +A ──┐
                 ├── 0
path 2  ── -A ──┘


目标答案：

path 1  ── +A ──┐
                 ├── 2A
path 2  ── +A ──┘
```

真正精妙的量子算法，并不是简单地“制造大量计算路径”，而是设计这些路径的相位关系。

---

# 十、最简单的量子干涉：H·H

Hadamard Gate 是理解量子干涉最重要的例子之一。

Hadamard 矩阵为：

$$
H
=
\frac1{\sqrt2}
\begin{pmatrix}
1&1\\
1&-1
\end{pmatrix}
$$

作用在 $|0\rangle$ 上：

$$
H|0\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

现在如果立刻测量：

$$
P(0)=\frac12
$$

$$
P(1)=\frac12
$$

看起来似乎：

> Hadamard 只是制造了一个随机 bit。

但如果不测量，而是再施加一次 $H$：

$$
H
\left(
H|0\rangle
\right)
$$

结果却一定恢复到：

$$
|0\rangle
$$

即：

$$
\boxed{
H^2=I
}
$$

---

## 十一、为什么 H|0⟩ 是随机，而 H·H|0⟩ 却一定恢复

第一次 Hadamard：

$$
|0\rangle
\xrightarrow{H}
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

此时如果测量，得到 $0$ 或 $1$ 的概率都是 $1/2$。

但如果不测量，再经过一个 Hadamard：

$$
\begin{aligned}
H
\left(
\frac{|0\rangle+|1\rangle}{\sqrt2}
\right)
&=
\frac1{\sqrt2}
\left(
H|0\rangle+H|1\rangle
\right)\\
&=
\frac12
\left[
(|0\rangle+|1\rangle)
+
(|0\rangle-|1\rangle)
\right]\\
&=
\frac12
\left[
2|0\rangle
\right]\\
&=
|0\rangle
\end{aligned}
$$

关键就在这里：

对于 $|0\rangle$：

$$
\frac12+\frac12=1
$$

发生相长干涉。

对于 $|1\rangle$：

$$
\frac12-\frac12=0
$$

发生相消干涉。

因此：

```text
                   +1/2 ─────────────┐
               ┌── |0⟩              │
|0⟩ ── H ──────┤                     ├── |0⟩
               └── |1⟩              │
                   +1/2 ─────────────┘


对于输出 |0⟩：

1/2 + 1/2 = 1


对于输出 |1⟩：

1/2 - 1/2 = 0
```

量子计算中所谓“干涉”，本质上就是这种概率振幅的加减。

---

# 十二、为什么中途测量会破坏干涉

考虑：

$$
|0\rangle
\xrightarrow{H}
\frac{|0\rangle+|1\rangle}{\sqrt2}
\xrightarrow{H}
|0\rangle
$$

如果中间不测量：

$$
P(0)=1
$$

但如果第一次 Hadamard 后立即测量：

$$
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

会以 $1/2$ 概率坍缩成：

$$
|0\rangle
$$

也会以 $1/2$ 概率坍缩成：

$$
|1\rangle
$$

随后再施加 Hadamard。

如果第一次测量得到 $0$：

$$
H|0\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

第二次测量：

$$
P(0)=P(1)=\frac12
$$

如果第一次测量得到 $1$：

$$
H|1\rangle
=
\frac{|0\rangle-|1\rangle}{\sqrt2}
$$

第二次测量仍然：

$$
P(0)=P(1)=\frac12
$$

因此最终：

$$
P(0)=P(1)=\frac12
$$

原本确定性的：

$$
H^2|0\rangle=|0\rangle
$$

消失了。

原因是：

> 中间测量破坏了不同计算路径之间保持的相干相位关系。

这就是 **quantum coherence** 的意义。

---

# 十三、Quantum Coherence

量子叠加真正有计算意义，需要不同分量之间保持稳定的 relative phase。

例如：

$$
|\psi\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

并不是简单表示：

> 有一半概率是 0，一半概率是 1。

它还保存：

$$
|0\rangle
$$

和：

$$
|1\rangle
$$

之间确定的相位关系。

这种能够保持稳定 relative phase、从而继续产生 interference 的性质称为：

**quantum coherence。**

一旦环境噪声不断获取量子系统的信息，relative phase 逐渐失去控制，就会发生：

**decoherence。**

这也是现实量子计算机极其困难的原因之一。

量子算法需要经历很多 gate 操作，同时保持：

$$
\alpha_x
$$

之间极其精确的相位关系。

---

# 十四、Mach-Zehnder 干涉仪的直觉

经典光学中的 Mach-Zehnder Interferometer 可以很好地帮助理解量子干涉。

可以想象一个光子经过第一个 beam splitter：

```text
                 ┌──────── upper path ────────┐
Photon ── BS1 ───┤                             ├── BS2 ── Detector
                 └──────── lower path ────────┘
```

第一个 beam splitter 类似 Hadamard：

$$
|0\rangle
\rightarrow
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

两个路径获得不同 probability amplitude。

随后再次在第二个 beam splitter 汇合。

如果两个路径相位恰好一致：

```text
Detector A：constructive interference
Detector B：destructive interference
```

于是一个探测器可能总是收到光子，另一个永远收不到。

如果在其中一条路径上增加 phase shift，结果就会改变。

例如加入：

$$
e^{i\theta}
$$

最终输出概率可能变成：

$$
P(A)
=
\cos^2\frac{\theta}{2}
$$

$$
P(B)
=
\sin^2\frac{\theta}{2}
$$

这说明：

> 原本不可直接测量的 phase，可以通过 interference 转化成 observable probability。

Quantum Fourier Transform 使用的就是同一类思想，只是把两个路径扩展到了大量 basis states。

---

# 十五、量子算法真正计算的是什么

经典算法通常可以理解为：

$$
x
\rightarrow
f(x)
$$

输入一个确定的 $x$，计算一个确定的 $f(x)$。

量子算法处理的却往往是：

$$
\sum_x\alpha_x|x\rangle
$$

量子电路对整个状态做线性变换：

$$
U
\sum_x\alpha_x|x\rangle
=
\sum_x\alpha_xU|x\rangle
$$

因此所有 basis state 的振幅都会参与演化。

但算法最终并不是把所有：

$$
f(x)
$$

直接读取出来。

真正目标往往是：

> 调整大量 $\alpha_x$ 的 phase，使某种全局结构对应的状态发生 constructive interference，而其他状态发生 destructive interference。

这也是理解 Shor Algorithm 时非常重要的一点。

Shor 并不是：

> 同时试遍所有私钥，然后读取正确私钥。

它寻找的是隐藏的代数结构。

后面将看到：

$$
\text{period}
$$

或：

$$
\text{hidden subgroup}
$$

会被编码进 phase structure。

QFT 再通过 interference 把这种结构转化成可以测量的 frequency information。

---

# 十六、进入多个 qubit

单个 qubit 的 Hilbert Space 为：

$$
\mathcal H_1
\cong
\mathbb C^2
$$

两个 qubit：

$$
\mathcal H_2
=
\mathbb C^2
\otimes
\mathbb C^2
\cong
\mathbb C^4
$$

computational basis 为：

$$
|00\rangle,\quad
|01\rangle,\quad
|10\rangle,\quad
|11\rangle
$$

一般状态为：

$$
|\psi\rangle
=
\alpha_{00}|00\rangle
+
\alpha_{01}|01\rangle
+
\alpha_{10}|10\rangle
+
\alpha_{11}|11\rangle
$$

并满足：

$$
|\alpha_{00}|^2
+
|\alpha_{01}|^2
+
|\alpha_{10}|^2
+
|\alpha_{11}|^2
=
1
$$

$n$ 个 qubit 一般状态：

$$
|\psi\rangle
=
\sum_{x=0}^{2^n-1}
\alpha_x|x\rangle
$$

因此状态空间维度达到：

$$
2^n
$$

但再次需要强调：

> 指数维状态空间不等于可以一次测量得到 $2^n$ 个经典结果。

真正有用的是这些：

$$
2^n
$$

个 probability amplitudes 可以共同经历一个 unitary transformation，并通过 interference 编码全局结构。

---

# 十七、Product State

并不是所有多 qubit 状态都是纠缠态。

例如两个 qubit：

$$
|\psi_1\rangle
=
\alpha|0\rangle+\beta|1\rangle
$$

以及：

$$
|\psi_2\rangle
=
\gamma|0\rangle+\delta|1\rangle
$$

联合状态：

$$
|\psi\rangle
=
|\psi_1\rangle\otimes|\psi_2\rangle
$$

展开：

$$
\begin{aligned}
|\psi\rangle
&=
(\alpha|0\rangle+\beta|1\rangle)
\otimes
(\gamma|0\rangle+\delta|1\rangle)\\
&=
\alpha\gamma|00\rangle
+
\alpha\delta|01\rangle\\
&\quad+
\beta\gamma|10\rangle
+
\beta\delta|11\rangle
\end{aligned}
$$

这种能够写成：

$$
|\psi_1\rangle\otimes|\psi_2\rangle
$$

形式的状态叫做：

**Product State，乘积态。**

例如：

$$
|+\rangle|0\rangle
$$

就是 product state。

因为可以明确说：

* 第一个 qubit 是 $|+\rangle$；
* 第二个 qubit 是 $|0\rangle$。

它们分别拥有独立的 quantum state。

---

# 十八、Entangled State

现在考虑：

$$
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

这个状态称为一个 Bell State。

测量结果：

$$
P(00)=\frac12
$$

$$
P(11)=\frac12
$$

而：

$$
P(01)=0
$$

$$
P(10)=0
$$

因此两个 qubit 的结果永远一致：

```text
第一个 qubit    第二个 qubit

0               0

或者

1               1
```

关键并不仅仅是“它们相关”。

经典系统也可以产生相关性。

例如提前生成两个相同的随机 bit：

```text
coin A = 0
coin B = 0
```

或者：

```text
coin A = 1
coin B = 1
```

这种 correlation 并不需要 quantum entanglement。

纠缠真正特殊的地方是：

> 整个系统拥有一个确定的量子态，但无法为两个子系统分别赋予独立纯态，使整体状态成为它们的 tensor product。

---

# 十九、为什么 Bell State 无法拆成两个独立 qubit

假设：

$$
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

可以拆成：

$$
(\alpha|0\rangle+\beta|1\rangle)
\otimes
(\gamma|0\rangle+\delta|1\rangle)
$$

展开右侧：

$$
\alpha\gamma|00\rangle
+
\alpha\delta|01\rangle
+
\beta\gamma|10\rangle
+
\beta\delta|11\rangle
$$

为了等于 Bell State，需要：

$$
\alpha\gamma
=
\frac1{\sqrt2}
$$

$$
\alpha\delta=0
$$

$$
\beta\gamma=0
$$

$$
\beta\delta
=
\frac1{\sqrt2}
$$

因为：

$$
\alpha\gamma\neq0
$$

所以：

$$
\alpha\neq0,\qquad\gamma\neq0
$$

又因为：

$$
\alpha\delta=0
$$

得到：

$$
\delta=0
$$

但是：

$$
\beta\delta
=
\frac1{\sqrt2}
$$

又要求：

$$
\delta\neq0
$$

产生矛盾。

因此不存在：

$$
|\psi_1\rangle
$$

和：

$$
|\psi_2\rangle
$$

满足：

$$
|\Phi^+\rangle
=
|\psi_1\rangle\otimes|\psi_2\rangle
$$

所以：

$$
\boxed{
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
}
$$

是一个真正的 entangled state。

---

# 二十、CNOT Gate

构造 Bell State 时最重要的双 qubit gate 是：

**CNOT，Controlled-NOT。**

它有两个输入：

* control qubit；
* target qubit。

规则是：

如果 control 为 $0$：

$$
\text{target 不变}
$$

如果 control 为 $1$：

$$
\text{target 翻转}
$$

因此：

$$
|00\rangle
\rightarrow
|00\rangle
$$

$$
|01\rangle
\rightarrow
|01\rangle
$$

$$
|10\rangle
\rightarrow
|11\rangle
$$

$$
|11\rangle
\rightarrow
|10\rangle
$$

矩阵形式为：

$$
\operatorname{CNOT}
=
\begin{pmatrix}
1&0&0&0\\
0&1&0&0\\
0&0&0&1\\
0&0&1&0
\end{pmatrix}
$$

---

# 二十一、从 |00⟩ 构造 Bell State

初始状态：

$$
|00\rangle
$$

第一步，对第一个 qubit 施加 Hadamard：

$$
(H\otimes I)|00\rangle
$$

由于：

$$
H|0\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

所以：

$$
\begin{aligned}
(H\otimes I)|00\rangle
&=
\frac{|0\rangle+|1\rangle}{\sqrt2}
\otimes
|0\rangle\\
&=
\frac{|00\rangle+|10\rangle}{\sqrt2}
\end{aligned}
$$

此时仍然是 product state：

$$
|+\rangle|0\rangle
$$

然后施加 CNOT：

$$
|00\rangle
\rightarrow
|00\rangle
$$

$$
|10\rangle
\rightarrow
|11\rangle
$$

于是：

$$
\operatorname{CNOT}
\frac{|00\rangle+|10\rangle}{\sqrt2}
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

得到 Bell State：

$$
\boxed{
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
}
$$

电路可以表示为：

```text
q0: |0⟩ ─── H ───●───
                  │
q1: |0⟩ ───────── X───
```

第一步：

```text
|00⟩
  ↓ H
(|00⟩ + |10⟩) / √2
```

第二步：

```text
|00⟩ → |00⟩
|10⟩ → |11⟩
```

最终：

```text
(|00⟩ + |11⟩) / √2
```

这就是最经典的 Bell Circuit。

---

# 二十二、纠缠中的测量

假设状态：

$$
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

如果测量第一个 qubit。

以概率：

$$
\frac12
$$

得到：

$$
0
$$

整体状态对应变成：

$$
|00\rangle
$$

此时第二个 qubit 一定为：

$$
0
$$

另一种情况，以概率：

$$
\frac12
$$

得到：

$$
1
$$

整体状态变成：

$$
|11\rangle
$$

第二个 qubit 一定为：

$$
1
$$

因此两个 measurement outcome 具有强相关性。

---

# 二十三、纠缠为什么不能用于超光速通信

Bell State 经常会导致一个误解：

> 测量第一个 qubit 后，第二个 qubit 的结果立即确定，因此是不是可以瞬间传递信息？

答案是否定的。

关键原因在于：

> 测量者无法控制自己的测量结果。

假设 Alice 和 Bob 分别持有 Bell pair：

$$
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

Alice 想给 Bob 发送一个 bit。

如果 Alice 测量自己的 qubit，她得到：

$$
0
$$

还是：

$$
1
$$

完全随机。

概率：

$$
P(0)=P(1)=\frac12
$$

她无法决定：

> “现在需要发送 0，所以让测量结果变成 0。”

因此 Bob 单独观察自己的 qubit，只会看到一个随机 bit：

$$
P(0)=P(1)=\frac12
$$

无论 Alice：

* 是否测量；
* 什么时候测量；
* 得到了什么结果；

Bob 本地都无法从自己的统计分布中判断。

只有当 Alice 和 Bob 通过普通经典通信比较结果之后，才会发现：

> 两边结果之间存在异常强的量子相关性。

因此：

$$
\text{Entanglement}
\neq
\text{Faster-than-light Communication}
$$

纠缠提供的是 correlation structure，而不是可控的超光速信号。

---

# 二十四、纠缠在量子计算中的作用

纠缠的计算意义并不是简单地：

> 两个 qubit 会得到一样的结果。

它真正意味着：

> 整个多 qubit 系统必须作为一个整体状态描述，不能拆成彼此独立的单 qubit 状态。

对于 $n$ 个互不纠缠的 qubit，可以写成：

$$
|\psi\rangle
=
|\psi_1\rangle
\otimes
|\psi_2\rangle
\otimes
\cdots
\otimes
|\psi_n\rangle
$$

每个 qubit 只需要两个 complex amplitudes 描述。

但一般纠缠态需要：

$$
2^n
$$

个振幅：

$$
|\psi\rangle
=
\sum_{x=0}^{2^n-1}
\alpha_x|x\rangle
$$

这意味着多 qubit 系统可以形成复杂的全局 correlation structure。

在量子算法中，这种结构经常承担一个重要任务：

> 把两个寄存器之间的函数关系编码成联合量子态。

---

# 二十五、Shor 中会出现怎样的纠缠

考虑一个抽象函数：

$$
f(x)
$$

首先准备叠加态：

$$
\frac1{\sqrt N}
\sum_{x=0}^{N-1}
|x\rangle|0\rangle
$$

然后量子计算：

$$
|x\rangle|0\rangle
\rightarrow
|x\rangle|f(x)\rangle
$$

于是得到：

$$
\frac1{\sqrt N}
\sum_{x=0}^{N-1}
|x\rangle|f(x)\rangle
$$

通常这个状态已经发生纠缠。

第一个寄存器中的：

$$
x
$$

与第二个寄存器中的：

$$
f(x)
$$

不再能够独立描述。

如果：

$$
f(x)
$$

具有周期：

$$
f(x+r)=f(x)
$$

那么联合量子态中就保存了：

$$
x
$$

与周期函数值之间的整体结构。

Shor 随后利用 Fourier Transform 提取这种结构。

因此纠缠并不是 Shor 的最终答案，而是：

> 帮助量子系统保留输入和函数值之间全局关系的一种状态结构。

---

# 二十六、Superposition、Phase、Interference、Entanglement 的分工

这几个概念经常混在一起。

实际上它们在量子算法中承担着不同角色。

## Superposition：建立计算空间

例如：

$$
H^{\otimes n}|0^n\rangle
=
\frac1{\sqrt{2^n}}
\sum_{x=0}^{2^n-1}
|x\rangle
$$

这一步生成大量 basis state 的 coherent superposition。

可以理解为：

> 为后续量子计算准备一个巨大的状态空间。

但这一步本身并没有解决问题。

---

## Phase：编码信息

算法通过量子 gate 改变：

$$
\alpha_x
$$

尤其是 relative phase。

很多量子算法会把函数性质编码成类似：

$$
(-1)^{f(x)}
$$

这样的 phase。

例如：

$$
\frac1{\sqrt N}
\sum_x
|x\rangle
$$

经过某种操作后变为：

$$
\frac1{\sqrt N}
\sum_x
(-1)^{f(x)}
|x\rangle
$$

注意：

如果立即在 computational basis 测量，仍然可能完全看不到：

$$
(-1)^{f(x)}
$$

因为：

$$
|+1|^2=|-1|^2=1
$$

信息此时储存在 phase 中。

---

## Interference：提取信息

接下来通过 Hadamard、QFT 等变换，使不同 basis state 的振幅重新组合。

于是：

* 某些振幅相加；
* 某些振幅相消。

最终把：

$$
\text{phase information}
$$

转换为：

$$
\text{probability distribution}
$$

这一步才使隐藏信息能够被 measurement 获取。

---

## Entanglement：建立全局关联结构

多寄存器计算时：

$$
|x\rangle
$$

与：

$$
|f(x)\rangle
$$

可以形成 entangled state。

它允许量子系统保存经典独立变量无法表示的全局 correlation。

因此可以粗略总结为：

| 概念            | 量子算法中的作用                                              |
| ------------- | ----------------------------------------------------- |
| Superposition | 创建大量 coherent computational paths                     |
| Phase         | 编码计算结构与函数信息                                           |
| Interference  | 放大或消除不同计算路径                                           |
| Entanglement  | 建立多个 qubit / register 之间的整体关联                         |
| Measurement   | 把最终 probability distribution 转成 classical information |

这张表非常重要，但还可以进一步压缩成一句话：

> Superposition 提供路径，Phase 携带信息，Interference 筛选结构，Entanglement 建立全局关联，Measurement 输出经典结果。

---

# 二十七、为什么“量子并行”不是答案

经常可以看到一种解释：

> $n$ 个 qubit 能表示 $2^n$ 个状态，所以量子计算机能够同时做 $2^n$ 次计算。

这个说法只有很有限的启发意义，严格来说很容易产生误导。

例如：

$$
\frac1{\sqrt N}
\sum_x|x\rangle
$$

经过一个 quantum oracle：

$$
|x\rangle|0\rangle
\rightarrow
|x\rangle|f(x)\rangle
$$

得到：

$$
\frac1{\sqrt N}
\sum_x
|x\rangle|f(x)\rangle
$$

从线性代数意义上，确实所有 $f(x)$ 都被编码进了联合量子态。

但如果直接测量：

$$
\frac1{\sqrt N}
\sum_x
|x\rangle|f(x)\rangle
$$

只能随机得到一个：

$$
(x,f(x))
$$

因此如果目标只是：

> 把所有 $f(x)$ 都读取出来，

量子计算没有神奇捷径。

量子算法必须找到一种更加聪明的问题表示：

> 不需要读取每个 $f(x)$，而只需要提取它们共同具有的某种 global property。

例如：

* period；
* parity；
* hidden subgroup；
* marked state；
* eigenphase。

Shor 寻找的正是：

$$
\text{period}
$$

而不是完整函数表。

---

# 二十八、为什么 Shor 特别重视“周期”

假设某个函数满足：

$$
f(x+r)=f(x)
$$

那么真正需要的信息不是：

$$
f(0),f(1),f(2),\ldots
$$

而是隐藏参数：

$$
r
$$

经典算法可能需要计算很多：

$$
f(x)
$$

才能发现：

$$
r
$$

而量子算法可以让大量输入：

$$
x
$$

形成 coherent superposition。

函数计算后，周期关系会形成非常规则的 amplitude structure。

之后 QFT 会把：

$$
\text{periodic structure}
$$

转化为：

$$
\text{frequency peaks}
$$

最后通过 measurement 得到与：

$$
\frac1r
$$

相关的信息。

因此 Shor 的核心思想并不是：

```text
输入很多 x
↓
同时计算很多 f(x)
↓
读取全部答案
```

而是：

```text
输入很多 x 的 coherent superposition
↓
计算周期函数
↓
形成具有周期结构的量子态
↓
QFT
↓
不同路径发生 interference
↓
周期对应的频率被增强
↓
measurement
↓
classical post-processing
↓
恢复 period
```

这正是下一课 Quantum Fourier Transform 要解决的问题。

---

# 二十九、一个重要思想：量子算法是“振幅工程”

从工程视角，可以把量子算法理解成一种：

**Amplitude Engineering。**

初始状态可能是：

$$
|\psi_0\rangle
=
\sum_x\alpha_x|x\rangle
$$

算法经过一系列 unitary transformations：

$$
|\psi_t\rangle
=
U_tU_{t-1}\cdots U_1|\psi_0\rangle
$$

真正需要设计的是最终的 amplitudes：

$$
\alpha_x'
$$

使得目标相关状态满足：

$$
|\alpha_x'|^2
$$

较大，而无关状态的：

$$
|\alpha_x'|^2
$$

较小。

但 unitary transformation 必须保持总概率：

$$
\sum_x|\alpha_x|^2=1
$$

因此量子算法不能凭空“制造概率”。

它做的是：

> 通过 phase rotation 和 interference，把 probability amplitude 从不需要的结果重新分配到需要的结果。

从这个角度看：

* Grover 是 amplitude amplification；
* QFT 是 frequency-domain amplitude redistribution；
* Shor 是通过 Fourier interference 提取 hidden periodic structure。

这比“量子计算机同时计算所有答案”的直觉更加接近现代量子算法的本质。

---

# 三十、常见误区

## 误区一：Superposition 就是经典随机

不是。

经典随机只描述：

$$
P(x)
$$

量子状态还包含：

$$
\alpha_x
$$

以及 amplitudes 之间的 relative phase。

量子 interference 正来自这些 phase information。

---

## 误区二：一个 qubit 同时保存 0 和 1，所以能读取两个值

不能。

测量一个 qubit 最终只能获得一个经典结果。

真正有价值的是在测量前操控 amplitudes。

---

## 误区三：量子计算能力来自指数多个并行计算

不完整。

指数维 Hilbert Space 很重要，但单独拥有巨大状态空间并不产生算法优势。

量子算法必须利用：

* coherent superposition；
* phase；
* interference；
* problem structure。

---

## 误区四：Probability amplitude 就是 probability 的平方根

只在非常特殊的正实数情形下可以这样粗略理解。

一般情况下：

$$
\alpha\in\mathbb C
$$

概率才是：

$$
P=|\alpha|^2
$$

振幅还携带 phase information。

---

## 误区五：负 probability amplitude 意味着负概率

不是。

例如：

$$
-\frac1{\sqrt2}
$$

是合法 probability amplitude。

其概率为：

$$
\left|
-\frac1{\sqrt2}
\right|^2
=
\frac12
$$

负号代表 phase difference，而不是负概率。

---

## 误区六：Global phase 和 relative phase 都可以被观测

Global phase 本身没有可观测物理意义。

真正影响 interference 的是 relative phase。

---

## 误区七：Entanglement 就是两个随机变量具有相关性

经典系统也可以具有 correlation。

纠缠更严格的数学条件是：

> 联合纯态不能写成各子系统量子态的 tensor product。

---

## 误区八：纠缠可以进行超光速通信

不能。

纠缠能够产生非经典相关性，但单个观察者的本地测量结果仍然随机，无法用来发送可控信息。

---

# 三十一、从这一课走向 Quantum Fourier Transform

这一课建立了四个关键概念：

$$
\text{Superposition}
$$

$$
\text{Phase}
$$

$$
\text{Interference}
$$

$$
\text{Entanglement}
$$

下一步需要回答的问题是：

> 如果一个量子态中存在某种周期结构，如何设计 interference，让这个周期变得可测量？

例如假设某种 amplitude pattern：

```text
位置：

0 1 2 3 4 5 6 7

振幅：

A 0 0 0 A 0 0 0
```

这里存在周期：

$$
r=4
$$

如果直接测量，只会看到：

$$
0
$$

或者：

$$
4
$$

单次测量并不能告诉周期一定是 $4$。

需要一种变换，把“位置空间中的周期”转换成“频率空间中的峰值”。

这就是 Fourier Transform 的任务。

经典信号处理中：

$$
\text{Time Domain}
\rightarrow
\text{Frequency Domain}
$$

可以揭示隐藏频率。

量子计算中：

$$
\text{Computational Basis}
\rightarrow
\text{Fourier Basis}
$$

可以揭示隐藏周期。

Quantum Fourier Transform 的本质并不是神秘地“搜索周期”，而是：

> 根据不同 basis state 的 phase relationship，让与周期匹配的频率发生 constructive interference，让其他频率发生 destructive interference。

因此从本课到下一课的逻辑非常自然：

$$
\boxed{
\text{Phase}
+
\text{Interference}
\rightarrow
\text{Quantum Fourier Transform}
}
$$

而从 QFT 再向后一步，就是整个课程最重要的一条主线：

$$
\text{Hidden Period}
\rightarrow
\text{QFT}
\rightarrow
\text{Fourier Sampling}
\rightarrow
\text{Shor Algorithm}
$$

---

# 三十二、本课总结

单纯的 quantum superposition 并不会自动产生量子加速。

例如：

$$
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

直接测量只能随机获得：

$$
0
$$

或者：

$$
1
$$

真正使量子计算不同于经典概率计算的是 probability amplitude。

量子态保存的是：

$$
\alpha_x
$$

而不是只有：

$$
P(x)
$$

测量概率满足：

$$
P(x)=|\alpha_x|^2
$$

概率振幅可以携带 complex phase。

其中 global phase 不影响物理状态，而 relative phase 可以通过 interference 转化成测量概率的差异。

最简单的例子是：

$$
H|+\rangle=|0\rangle
$$

以及：

$$
H|-\rangle=|1\rangle
$$

虽然：

$$
|+\rangle
$$

和：

$$
|-\rangle
$$

直接在 computational basis 测量时具有完全相同的概率分布，但 Hadamard 可以通过 interference 把隐藏的 relative phase 转换成确定性的经典结果。

对于多个 qubit，系统还可以形成 entanglement。

例如：

$$
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

无法表示为：

$$
|\psi_1\rangle\otimes|\psi_2\rangle
$$

因此两个 qubit 必须作为一个整体 quantum state 描述。

从量子算法角度，可以把这一整套机制概括为：

$$
\boxed{
\text{Superposition}
\rightarrow
\text{Phase Encoding}
\rightarrow
\text{Interference}
\rightarrow
\text{Measurement}
}
$$

多寄存器算法中，还会通过：

$$
\text{Entanglement}
$$

保存不同变量之间的全局关联。

这也给出了理解 Shor Algorithm 的第一个真正重要的直觉：

> Shor 并不是依靠“同时暴力搜索很多答案”获得指数级优势，而是先把隐藏代数结构编码到量子态的振幅和相位中，再通过 Fourier interference 提取这种结构。

下一步，就是理解这个过程里最重要的工具：

# Quantum Fourier Transform

它需要回答一个核心问题：

> 为什么一个隐藏在状态空间中的周期，可以通过相位和干涉转化成几个显著的 frequency peaks？

这正是 Shor Algorithm 能够从“难以搜索秘密”转向“高效提取隐藏结构”的关键一步。

---

# 课后思考

### 1. 为什么下面两个状态直接测量无法区分？

$$
|\psi_1\rangle
=
\frac{|0\rangle+|1\rangle}{\sqrt2}
$$

$$
|\psi_2\rangle
=
\frac{|0\rangle-|1\rangle}{\sqrt2}
$$

进一步思考：

为什么在两者前面增加 Hadamard 后就可以完全区分？

---

### 2. 为什么下面两个状态在物理上等价？

$$
|\psi\rangle
=
\alpha|0\rangle+\beta|1\rangle
$$

$$
|\psi'\rangle
=
-e^{i\theta}
\left(
\alpha|0\rangle+\beta|1\rangle
\right)
$$

这里改变的是 global phase 还是 relative phase？

---

### 3. 考虑状态

$$
|\psi\rangle
=
\frac{|0\rangle+i|1\rangle}{\sqrt2}
$$

直接在 computational basis 测量时：

$$
P(0)
$$

与：

$$
P(1)
$$

分别是多少？

其中：

$$
i
$$

携带的信息为什么不会直接体现在这两个概率中？

---

### 4. 验证

$$
H^2=I
$$

并从 interference 的角度解释：

为什么：

$$
|0\rangle
\xrightarrow{H}
\frac{|0\rangle+|1\rangle}{\sqrt2}
\xrightarrow{H}
|0\rangle
$$

而不是再次得到一个随机状态？

---

### 5. 判断下面哪个状态是 product state，哪个是 entangled state

状态 A：

$$
\frac{|00\rangle+|01\rangle}{\sqrt2}
$$

状态 B：

$$
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

提示：尝试寻找是否存在：

$$
|\psi_1\rangle
$$

和：

$$
|\psi_2\rangle
$$

满足：

$$
|\psi\rangle
=
|\psi_1\rangle\otimes|\psi_2\rangle
$$

---

### 6. 从 |00⟩ 出发，写出 Bell Circuit 每一步的量子态

初始：

$$
|00\rangle
$$

经过：

$$
H\otimes I
$$

再经过：

$$
\operatorname{CNOT}
$$

最终验证：

$$
|\Phi^+\rangle
=
\frac{|00\rangle+|11\rangle}{\sqrt2}
$$

---

### 7. 为什么 Bell pair 不能用来传输一个超光速 bit？

关键不是回答“因为相对论禁止”，而是从 Bob 的本地 measurement distribution 出发分析：

$$
P_B(0)
$$

和：

$$
P_B(1)
$$

是否会因为 Alice 的操作而变成可区分的概率分布。

---

### 8. 最重要的一道思考题

假设量子计算机能够构造：

$$
\frac1{\sqrt N}
\sum_x
|x\rangle|f(x)\rangle
$$

为什么不能直接认为：

> “量子计算机已经在一次操作中计算出了全部 $f(x)$，因此问题已经解决。”

进一步思考：

如果无法读取所有 $f(x)$，那么 Shor Algorithm 真正试图从这个 quantum state 中提取的究竟是什么？

理解这个问题，就是从“量子并行计算”的朴素认识迈向 Shor Algorithm 真正工作原理的关键一步。
