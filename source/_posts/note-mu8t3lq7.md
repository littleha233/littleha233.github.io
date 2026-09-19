---
title: 量子计算 Lesson 3：Quantum Fourier Transform
date: '2026-09-20 03:55:11'
description: ''
categories:
  - 量子计算
tags: []
content_type: article
disableNunjucks: true
---

Quantum Fourier Transform——如何从量子态中提取隐藏周期

在量子算法中，叠加态本身并不能直接带来计算优势。

真正关键的是：如何利用概率振幅的相位，让具有某种数学结构的计算路径发生相长干涉，而让其他路径发生相消干涉。

Quantum Fourier Transform，简称 QFT，正是完成这件事的核心工具之一。

它在 Shor Algorithm 中承担一个极其关键的任务：

> 把隐藏在量子态中的周期结构，转化成可以通过测量观察到的频率结构。

因此，理解 QFT 的重点并不是死记它的矩阵形式，而是回答三个问题：

1. Fourier Transform 为什么能够发现周期？
2. QFT 究竟对概率振幅做了什么？
3. 为什么 QFT 能成为 Shor Algorithm 的核心步骤？

从经典 Fourier Transform 开始，逐步进入量子情形，会更容易看清它的本质。

---

## 一、为什么周期问题天然适合 Fourier Transform

考虑一个最简单的周期序列：

```text
1 0 0 0 1 0 0 0
```

长度为：

$$
N=8
$$

非零元素出现在：

$$
0,\ 4
$$

因此它的周期是：

$$
r=4
$$

如果只看原始序列，可以直接观察出周期。

但如果序列非常长，例如：

$$
N=2^{2048}
$$

并且周期隐藏在复杂函数中，那么直接寻找重复结构会非常困难。

Fourier Transform 提供了一种完全不同的视角。

它不再问：

> 哪些位置出现了相同值？

而是问：

> 哪些“频率模式”与这个序列最匹配？

一个具有周期 $r$ 的信号，在 frequency domain 中通常会集中在与：

$$
\frac1r
$$

相关的频率附近。

所以 Fourier Transform 的核心思想可以概括为：

$$
\boxed{
\text{周期结构}
\longrightarrow
\text{频率结构}
}
$$

这正是 Shor Algorithm 所需要的。

---

# 二、从声音理解 Fourier Transform

可以先从一个经典直觉出发。

假设录制一段钢琴声音。

在 time domain 中，记录的是：

$$
x(t)
$$

也就是：

> 每个时刻的声音振幅是多少。

但一段声音实际上可能由多个不同频率组成：

```text
440 Hz
+
880 Hz
+
1320 Hz
```

从时间波形本身，并不容易直接看出这些频率。

Fourier Transform 做的事情是：

```text
Time Domain
↓
Fourier Transform
↓
Frequency Domain
```

转换之后，可以看到：

```text
440 Hz   ██████████
880 Hz   ████
1320 Hz  ██
```

也就是说：

> Fourier Transform 把隐藏在复杂波形中的周期性，转换成频率空间中的峰值。

Shor Algorithm 中的 QFT，本质上也是类似过程。

区别在于：

经典 Fourier Transform 处理经典数值序列；

QFT 处理的是：

$$
\text{quantum probability amplitudes}
$$

---

# 三、从周期到频率

考虑一个离散序列：

$$
x_0,x_1,\ldots,x_{N-1}
$$

如果满足：

$$
x_{j+r}=x_j
$$

那么它存在周期 $r$。

例如：

```text
index:  0 1 2 3 4 5 6 7

value:  1 0 0 0 1 0 0 0
```

周期：

$$
r=4
$$

从另一个角度看，也可以把它理解成：

> 在长度为 8 的空间中，模式重复了 2 次。

因此对应的基本频率大约是：

$$
\frac{N}{r}
=
\frac84
=
2
$$

后面会看到，这个整数：

$$
\frac Nr
$$

正是 QFT 结果中非常重要的位置间隔。

---

# 四、为什么 Fourier Transform 要用复数

Fourier Transform 中最容易让人困惑的一点，是为什么一定要出现：

$$
e^{i\theta}
$$

这样的复数。

原因是：

> Fourier Transform 本质上是在比较不同周期模式之间的相位关系。

复数：

$$
e^{i\theta}
=
\cos\theta+i\sin\theta
$$

可以看成复平面上的单位向量。

不同的 $\theta$ 表示不同方向。

例如：

$$
e^{i0}=1
$$

$$
e^{i\pi/2}=i
$$

$$
e^{i\pi}=-1
$$

$$
e^{i3\pi/2}=-i
$$

因此一个完整旋转可以写成：

$$
e^{i2\pi}=1
$$

Fourier Transform 正是利用这些均匀分布在单位圆上的复数相位，检测周期结构。

---

# 五、Roots of Unity：单位根

定义：

$$
\omega_N
=
e^{2\pi i/N}
$$

称为 $N$ 次单位根。

它满足：

$$
\omega_N^N=1
$$

例如当：

$$
N=4
$$

时：

$$
\omega_4
=
e^{2\pi i/4}
=
e^{i\pi/2}
=
i
$$

于是：

$$
\omega_4^0=1
$$

$$
\omega_4^1=i
$$

$$
\omega_4^2=-1
$$

$$
\omega_4^3=-i
$$

$$
\omega_4^4=1
$$

几何上：

```text
          i
          ↑
          |
     -1 ← + → 1
          |
          ↓
         -i
```

这些点均匀分布在单位圆上。

这带来了一个极其重要的性质：

$$
1+\omega_N+\omega_N^2+\cdots+\omega_N^{N-1}=0
$$

为什么？

因为这些向量在单位圆上均匀分布，全部相加会互相抵消。

这正是 Fourier Transform 中 destructive interference 的数学基础。

---

# 六、离散 Fourier Transform

对于长度为 $N$ 的经典序列：

$$
x_0,x_1,\ldots,x_{N-1}
$$

Discrete Fourier Transform，DFT，定义为：

$$
X_k
=
\sum_{j=0}^{N-1}
x_j
e^{-2\pi i jk/N}
$$

其中：

* $j$ 表示原始位置；
* $k$ 表示频率编号；
* $X_k$ 表示该频率上的强度和相位。

可以把：

$$
e^{-2\pi i jk/N}
$$

理解成一个“频率探针”。

对于每个 $k$，DFT 都在问：

> 原始信号与第 $k$ 个周期模式匹配得有多好？

如果匹配：

不同位置贡献的复数相位会趋向同方向。

于是发生：

$$
\text{constructive interference}
$$

如果不匹配：

不同位置贡献的相位会分散在单位圆上。

于是：

$$
\text{destructive interference}
$$

因此 Fourier peak 本质上就是：

> 某个频率模式让很多复数振幅同相叠加。

---

# 七、一个极简例子：长度 4 的周期信号

考虑：

$$
x=(1,0,1,0)
$$

也就是：

```text
index: 0 1 2 3
value: 1 0 1 0
```

周期为：

$$
r=2
$$

DFT 为：

$$
X_k
=
\sum_{j=0}^{3}
x_j e^{-2\pi i jk/4}
$$

因为只有：

$$
j=0
$$

和：

$$
j=2
$$

非零，所以：

$$
X_k
=
1
+
e^{-2\pi i(2k)/4}
$$

化简：

$$
X_k
=
1+e^{-i\pi k}
$$

而：

$$
e^{-i\pi k}=(-1)^k
$$

所以：

$$
X_k
=
1+(-1)^k
$$

当 $k$ 为偶数：

$$
X_k=2
$$

当 $k$ 为奇数：

$$
X_k=0
$$

因此：

$$
X_0=2
$$

$$
X_1=0
$$

$$
X_2=2
$$

$$
X_3=0
$$

频率峰值出现在：

$$
k=0,\ 2
$$

间隔：

$$
2
$$

而：

$$
\frac Nr
=
\frac42
=
2
$$

周期信息已经转换成了 frequency peak spacing。

---

# 八、从 DFT 到 QFT

经典 DFT 处理的是一个经典向量：

$$
(x_0,x_1,\ldots,x_{N-1})
$$

QFT 则作用于量子态：

$$
|\psi\rangle
=
\sum_{j=0}^{N-1}
\alpha_j|j\rangle
$$

QFT 的定义是：

$$
\boxed{
\operatorname{QFT}_N|j\rangle
=
\frac1{\sqrt N}
\sum_{k=0}^{N-1}
e^{2\pi i jk/N}|k\rangle
}
$$

对一般量子态：

$$
|\psi\rangle
=
\sum_{j=0}^{N-1}
\alpha_j|j\rangle
$$

根据线性性：

$$
\begin{aligned}
\operatorname{QFT}_N|\psi\rangle
&=
\sum_{j=0}^{N-1}
\alpha_j\operatorname{QFT}_N|j\rangle\\
&=
\frac1{\sqrt N}
\sum_{k=0}^{N-1}
\left(
\sum_{j=0}^{N-1}
\alpha_j e^{2\pi i jk/N}
\right)
|k\rangle
\end{aligned}
$$

因此新的振幅为：

$$
\beta_k
=
\frac1{\sqrt N}
\sum_{j=0}^{N-1}
\alpha_j
e^{2\pi i jk/N}
$$

这几乎就是 DFT。

区别只是归一化因子以及符号约定。

---

# 九、QFT 究竟改变了什么

QFT 并不是：

> 把每个 basis state 变成另一个唯一 basis state。

相反，一个输入 basis state：

$$
|j\rangle
$$

会被转换成所有：

$$
|k\rangle
$$

的叠加：

$$
|j\rangle
\rightarrow
\frac1{\sqrt N}
\sum_k
e^{2\pi i jk/N}|k\rangle
$$

每一个输出：

$$
|k\rangle
$$

得到一个不同的 phase。

如果输入本身已经是多个：

$$
|j\rangle
$$

的叠加态，那么这些贡献就会在每一个输出 $|k\rangle$ 上进行振幅相加。

因此：

$$
\beta_k
=
\frac1{\sqrt N}
\sum_j
\alpha_j e^{2\pi i jk/N}
$$

这个公式真正表达的是：

> 每个原始位置 $j$ 都向每个频率位置 $k$ 贡献一个带相位的 amplitude。

如果这些 phase 对齐：

$$
|\beta_k|
$$

会很大。

如果 phase 互相抵消：

$$
|\beta_k|
$$

会很小甚至为零。

测量概率就是：

$$
P(k)=|\beta_k|^2
$$

于是 QFT 完成了：

$$
\text{phase structure}
\rightarrow
\text{measurement probability}
$$

---

# 十、basis state 经过 QFT 会发生什么

考虑：

$$
N=4
$$

以及输入：

$$
|1\rangle
$$

根据定义：

$$
\operatorname{QFT}_4|1\rangle
=
\frac12
\sum_{k=0}^{3}
e^{2\pi i k/4}|k\rangle
$$

分别计算：

$$
k=0:
\quad
e^0=1
$$

$$
k=1:
\quad
e^{i\pi/2}=i
$$

$$
k=2:
\quad
e^{i\pi}=-1
$$

$$
k=3:
\quad
e^{i3\pi/2}=-i
$$

所以：

$$
\operatorname{QFT}_4|1\rangle
=
\frac12
\left(
|0\rangle
+i|1\rangle
-|2\rangle
-i|3\rangle
\right)
$$

注意：

四个 basis state 的 amplitude magnitude 都是：

$$
\frac12
$$

所以直接测量：

$$
P(k)=\frac14
$$

没有任何偏好。

QFT 对单个 basis state 并不会神奇地产生某个 frequency peak。

真正重要的是：

> 输入态中多个 basis states 之间具有规律结构时，它们在 QFT 后才会发生有意义的 interference。

---

# 十一、真正重要的情况：周期叠加态

假设量子态为：

$$
|\psi\rangle
=
\frac1{\sqrt2}
\left(
|0\rangle+|4\rangle
\right)
$$

这里：

$$
N=8
$$

两个位置相差：

$$
4
$$

可以理解为一个周期结构。

对它执行 QFT：

$$
\operatorname{QFT}_8|\psi\rangle
$$

根据线性性：

$$
\begin{aligned}
\operatorname{QFT}_8|\psi\rangle
&=
\frac1{\sqrt2}
\left(
\operatorname{QFT}_8|0\rangle
+
\operatorname{QFT}_8|4\rangle
\right)
\end{aligned}
$$

其中：

$$
\operatorname{QFT}_8|0\rangle
=
\frac1{\sqrt8}
\sum_{k=0}^{7}|k\rangle
$$

而：

$$
\operatorname{QFT}_8|4\rangle
=
\frac1{\sqrt8}
\sum_{k=0}^{7}
e^{2\pi i4k/8}|k\rangle
$$

因为：

$$
e^{2\pi i4k/8}
=
e^{i\pi k}
=
(-1)^k
$$

所以：

$$
\operatorname{QFT}_8|4\rangle
=
\frac1{\sqrt8}
\sum_{k=0}^{7}
(-1)^k|k\rangle
$$

合并：

$$
\operatorname{QFT}_8|\psi\rangle
=
\frac1{4}
\sum_{k=0}^{7}
\left(
1+(-1)^k
\right)
|k\rangle
$$

如果 $k$ 为偶数：

$$
1+(-1)^k=2
$$

如果 $k$ 为奇数：

$$
1+(-1)^k=0
$$

因此：

$$
\operatorname{QFT}_8|\psi\rangle
=
\frac12
\left(
|0\rangle
+
|2\rangle
+
|4\rangle
+
|6\rangle
\right)
$$

最终测量只能得到：

$$
0,\ 2,\ 4,\ 6
$$

每个概率：

$$
\frac14
$$

这就是 QFT 提取周期结构最重要的一个例子。

---

# 十二、刚才到底发生了什么

输入：

$$
\frac{|0\rangle+|4\rangle}{\sqrt2}
$$

对于某个输出频率 $k$，有两条路径贡献 amplitude：

```text
|0⟩ ───────────→ |k⟩
|4⟩ ───────────→ |k⟩
```

第一条贡献相位：

$$
1
$$

第二条贡献：

$$
e^{2\pi i4k/8}
=
(-1)^k
$$

于是：

如果 $k$ 是偶数：

$$
1+1=2
$$

发生 constructive interference。

如果 $k$ 是奇数：

$$
1-1=0
$$

发生 destructive interference。

所以：

```text
k = 0   强
k = 1   消失
k = 2   强
k = 3   消失
k = 4   强
k = 5   消失
k = 6   强
k = 7   消失
```

周期信息已经被转换成：

$$
\text{frequency spacing}=2
$$

而：

$$
2=\frac Nr
$$

因为：

$$
N=8,\qquad r=4
$$

---

# 十三、推广：周期为 r 的状态

考虑一个更加一般的周期状态：

$$
|\psi\rangle
=
\frac1{\sqrt M}
\sum_{m=0}^{M-1}
|x_0+mr\rangle
$$

其中：

* $r$ 是周期；
* $M$ 大约满足 $Mr\approx N$；
* $x_0$ 是某个起始偏移。

应用 QFT：

$$
\begin{aligned}
\operatorname{QFT}_N|\psi\rangle
&=
\frac1{\sqrt{MN}}
\sum_{m=0}^{M-1}
\sum_{k=0}^{N-1}
e^{2\pi i(x_0+mr)k/N}|k\rangle
\end{aligned}
$$

把与 $m$ 无关的部分提出：

$$
\operatorname{QFT}_N|\psi\rangle
=
\frac1{\sqrt{MN}}
\sum_{k=0}^{N-1}
e^{2\pi ix_0k/N}
\left(
\sum_{m=0}^{M-1}
e^{2\pi imrk/N}
\right)
|k\rangle
$$

核心部分是：

$$
\sum_{m=0}^{M-1}
e^{2\pi imrk/N}
$$

这是一个复数几何级数。

如果：

$$
\frac{rk}{N}
$$

接近整数，那么：

$$
e^{2\pi irk/N}
\approx1
$$

于是每一项都指向几乎相同方向：

$$
1+1+1+\cdots
$$

产生 constructive interference。

因此 peak 出现在：

$$
\frac{rk}{N}
\approx s
$$

也就是：

$$
k
\approx
s\frac Nr
$$

其中 $s$ 是整数。

这就是 QFT 中最重要的规律：

$$
\boxed{
k
\approx
s\frac Nr
}
$$

于是只要测量出 $k$，就获得了：

$$
\frac{k}{N}
\approx
\frac{s}{r}
$$

这正是 Shor Algorithm 后续 classical post-processing 的入口。

---

# 十四、为什么“周期”会变成“峰值”

从向量角度来看最容易理解。

考虑和式：

$$
S
=
\sum_{m=0}^{M-1}
e^{2\pi imrk/N}
$$

每一项都是复平面上的单位向量。

如果：

$$
\frac{rk}{N}=1
$$

那么：

$$
e^{2\pi irk/N}=1
$$

所有向量完全同方向：

```text
→ → → → → → →
```

总长度约为：

$$
M
$$

因此 probability amplitude 很大。

如果：

$$
\frac{rk}{N}
$$

不是整数，向量会不断旋转。

例如：

```text
→
  ↗
   ↑
  ↖
←
```

它们会逐渐互相抵消。

最终：

$$
|S|
$$

很小。

因此 QFT 本质上是在做：

> 对所有候选频率进行相位匹配。

匹配周期的频率：

$$
\text{phase alignment}
\rightarrow
\text{constructive interference}
$$

不匹配的频率：

$$
\text{phase cancellation}
\rightarrow
\text{destructive interference}
$$

---

# 十五、为什么起始位置不重要

考虑：

$$
|\psi\rangle
=
\frac1{\sqrt M}
\sum_m
|x_0+mr\rangle
$$

QFT 后出现因子：

$$
e^{2\pi ix_0k/N}
$$

它只给每个：

$$
|k\rangle
$$

整体乘上一个 phase。

测量概率为：

$$
P(k)=|\beta_k|^2
$$

而：

$$
\left|
e^{2\pi ix_0k/N}
\right|^2
=
1
$$

所以：

$$
x_0
$$

只影响 phase，不影响 probability peak 的位置。

这非常重要。

意味着 QFT 不需要知道周期序列从哪里开始。

只要间隔：

$$
r
$$

保持规律，QFT 就能捕捉到它。

这正是周期寻找算法所需要的性质。

---

# 十六、一个 N=8 的完整例子

取：

$$
N=8
$$

输入：

$$
|\psi\rangle
=
\frac12
\left(
|0\rangle
+
|2\rangle
+
|4\rangle
+
|6\rangle
\right)
$$

这里位置间隔为：

$$
r=2
$$

计算 QFT 后第 $k$ 个振幅：

$$
\beta_k
=
\frac1{\sqrt{32}}
\left(
1
+
e^{2\pi i2k/8}
+
e^{2\pi i4k/8}
+
e^{2\pi i6k/8}
\right)
$$

提取：

$$
z=e^{2\pi i2k/8}
$$

则：

$$
\beta_k
=
\frac1{\sqrt{32}}
\left(
1+z+z^2+z^3
\right)
$$

观察不同的 $k$。

---

## k = 0

$$
z=1
$$

因此：

$$
1+1+1+1=4
$$

强相长干涉。

---

## k = 1

$$
z=e^{i\pi/2}=i
$$

所以：

$$
1+i-1-i=0
$$

完全相消。

---

## k = 2

$$
z=e^{i\pi}=-1
$$

于是：

$$
1-1+1-1=0
$$

相消。

---

## k = 3

同样相消。

---

## k = 4

$$
z=e^{i2\pi}=1
$$

所以：

$$
1+1+1+1=4
$$

再次形成峰值。

最终只会在：

$$
k=0
$$

和：

$$
k=4
$$

产生非零概率。

而：

$$
\frac Nr
=
\frac82
=
4
$$

两个峰值之间的距离恰好是：

$$
4
$$

---

# 十七、周期和 Fourier peak 的互为倒数关系

如果 position space 的周期较大，那么 frequency spacing 较小。

如果 position space 的周期较小，那么 frequency spacing 较大。

因为：

$$
\Delta k
=
\frac Nr
$$

这和经典 Fourier Transform 中：

$$
\text{period}
\propto
\frac1{\text{frequency}}
$$

是一致的。

可以直观理解：

```text
Position Domain:

period = 2

█ · █ · █ · █ ·

↓

Frequency Domain:

峰值间隔较大


Position Domain:

period = 4

█ · · · █ · · ·

↓

Frequency Domain:

峰值间隔较小
```

因此：

$$
\boxed{
\text{大周期}
\leftrightarrow
\text{低频}
}
$$

$$
\boxed{
\text{小周期}
\leftrightarrow
\text{高频}
}
$$

---

# 十八、QFT 不是直接输出周期

这一点尤其重要。

QFT 不会直接输出：

$$
r
$$

它输出的是一个随机测量值：

$$
k
$$

这个 $k$ 满足：

$$
\frac{k}{N}
\approx
\frac{s}{r}
$$

其中：

$$
s
$$

通常是未知整数。

所以真实过程不是：

```text
QFT
↓
得到 r
```

而是：

```text
周期结构
↓
QFT
↓
测量 k
↓
k/N ≈ s/r
↓
经典数学算法
↓
恢复 r
```

Shor Algorithm 中用于完成最后一步的重要工具就是：

**continued fractions，连分数。**

例如如果测量得到：

$$
\frac{k}{N}
\approx
\frac38
$$

那么通过连分数可能恢复：

$$
r=8
$$

当然，实际还需要验证候选周期。

---

# 十九、为什么 QFT 中需要 Measurement

QFT 完成之后，量子态通常仍然是：

$$
\sum_k\beta_k|k\rangle
$$

如果周期结构明显，那么：

$$
|\beta_k|^2
$$

会集中在若干峰值附近。

例如：

```text
probability

│              █
│
│      █
│
│  █                   █
└────────────────────────
   k
```

测量会随机得到其中一个 peak。

单次测量得到：

$$
k
$$

并不一定唯一确定：

$$
r
$$

但通过：

* 数论关系；
* 连分数；
* classical verification；
* 必要时重复运行；

通常可以恢复正确周期。

所以 QFT 的职责并不是直接给出最终答案，而是：

> 重新塑造 probability distribution，让隐藏周期变成可以通过少量测量获得的信息。

---

# 二十、QFT 的矩阵形式

QFT 也可以写成一个 $N\times N$ 的 unitary matrix：

$$
F_N
=
\frac1{\sqrt N}
\begin{pmatrix}
1 & 1 & 1 & \cdots & 1\\
1 & \omega_N & \omega_N^2 & \cdots & \omega_N^{N-1}\\
1 & \omega_N^2 & \omega_N^4 & \cdots & \omega_N^{2(N-1)}\\
\vdots & \vdots & \vdots & \ddots & \vdots\\
1 & \omega_N^{N-1} & \omega_N^{2(N-1)} & \cdots & \omega_N^{(N-1)^2}
\end{pmatrix}
$$

其中：

$$
\omega_N
=
e^{2\pi i/N}
$$

第：

$$
j,k
$$

项为：

$$
(F_N)_{jk}
=
\frac1{\sqrt N}
e^{2\pi ijk/N}
$$

QFT 是 unitary transformation：

$$
F_N^\dagger F_N=I
$$

因此不会破坏量子态归一化：

$$
\sum_j|\alpha_j|^2
=
\sum_k|\beta_k|^2
=
1
$$

这也是它能够作为 quantum gate network 实现的根本原因。

---

# 二十一、为什么 QFT 是 Unitary

Fourier basis 中不同 frequency vectors 彼此正交。

考虑两个不同频率：

$$
k
$$

和：

$$
l
$$

对应向量内积：

$$
\sum_{j=0}^{N-1}
e^{2\pi ij(k-l)/N}
$$

如果：

$$
k=l
$$

则：

$$
\sum_{j=0}^{N-1}1=N
$$

如果：

$$
k\neq l
$$

则利用单位根求和：

$$
\sum_{j=0}^{N-1}
e^{2\pi ij(k-l)/N}
=
0
$$

因此不同 Fourier modes 正交。

归一化后就得到一组 orthonormal basis。

所以 QFT 本质上是在做：

$$
\text{computational basis}
\rightarrow
\text{Fourier basis}
$$

这只是量子态的一次 basis transformation。

---

# 二十二、QFT 不等于经典 FFT

Quantum Fourier Transform 和 Fast Fourier Transform 名字很像，但必须严格区分。

经典 FFT 输入一个长度为：

$$
N
$$

的经典数组：

$$
x_0,x_1,\ldots,x_{N-1}
$$

输出完整 Fourier coefficients：

$$
X_0,X_1,\ldots,X_{N-1}
$$

复杂度约为：

$$
O(N\log N)
$$

QFT 输入的是：

$$
\sum_j\alpha_j|j\rangle
$$

输出：

$$
\sum_k\beta_k|k\rangle
$$

对于：

$$
N=2^n
$$

QFT 可以由大约：

$$
O(n^2)
$$

个基础量子门实现。

由于：

$$
n=\log_2N
$$

所以门复杂度为：

$$
O((\log N)^2)
$$

看起来极其惊人。

但这里有一个关键限制：

> QFT 并不会把所有 $\beta_k$ 作为经典数字输出。

最终只能测量得到一个：

$$
k
$$

因此不能说：

> QFT 用多项式时间计算出了经典 DFT 的全部结果。

如果想把全部：

$$
\beta_k
$$

恢复成经典数据，需要大量重复测量，优势会消失。

QFT 真正强大的地方在于：

> 某些算法只需要从 Fourier distribution 中采样，而不需要输出完整 Fourier spectrum。

Shor 就属于这种情况。

---

# 二十三、为什么经典 FFT 不能直接替代 QFT

一个自然的问题是：

> 如果 Fourier Transform 本身是经典算法，为什么 Shor 不能直接使用 FFT？

原因在于 QFT 操作的对象不同。

在 Shor 中，周期结构存在于一个量子态：

$$
|\psi\rangle
=
\sum_x\alpha_x|x\rangle
$$

其 amplitudes：

$$
\alpha_x
$$

并没有被完整输出成经典数组。

经典 FFT 需要显式获得：

$$
\alpha_0,\alpha_1,\ldots,\alpha_{N-1}
$$

然后才能计算 Fourier Transform。

但当：

$$
N=2^n
$$

时，这个数组有：

$$
2^n
$$

个元素。

仅仅读出它们就需要指数时间。

QFT 则直接对量子态自身进行 basis transformation，不需要先把指数多个 amplitudes 读取出来。

因此优势来自：

$$
\boxed{
\text{对量子态直接进行 Fourier basis transformation}
}
$$

而不是经典意义上的“更快计算一组 Fourier 系数”。

---

# 二十四、QFT Circuit 为什么高效

假设：

$$
N=2^n
$$

输入 basis state：

$$
|x\rangle
$$

其中：

$$
x
=
x_1x_2\cdots x_n
$$

是一个 $n$ bit 二进制数。

QFT 可以分解成：

* Hadamard Gate；
* Controlled Phase Rotation；
* SWAP。

核心 phase rotation gate 通常写为：

$$
R_k
=
\begin{pmatrix}
1&0\\
0&e^{2\pi i/2^k}
\end{pmatrix}
$$

例如：

$$
R_2
=
\begin{pmatrix}
1&0\\
0&e^{i\pi/2}
\end{pmatrix}
$$

$$
R_3
=
\begin{pmatrix}
1&0\\
0&e^{i\pi/4}
\end{pmatrix}
$$

QFT 电路本质上通过这些 gate，逐步把二进制输入编码成精确的 phase。

---

# 二十五、3-qubit QFT 的基本结构

对于三个 qubit：

```text
q0 ──H──R2────R3────────────×──
        │     │              │
q1 ─────●─────┼──H──R2──────┼──
              │      │       │
q2 ───────────●──────●──H────×──
```

实际教材中可能因为 qubit ordering 不同而画法略有差异。

其核心结构不变：

1. Hadamard 创建 phase-sensitive superposition；
2. controlled rotations 注入不同尺度的 phase；
3. 最后通过 swap 调整 bit order。

gate 数量大约是：

$$
\frac{n(n+1)}2
$$

因此：

$$
O(n^2)
$$

---

# 二十六、QFT 的另一种表达

QFT 对 basis state：

$$
|x\rangle
$$

还可以写成 tensor product 形式。

假设：

$$
x=x_1x_2\cdots x_n
$$

则 QFT 可以写成类似：

$$
\operatorname{QFT}|x\rangle
=
\frac1{2^{n/2}}
\bigotimes_{j=1}^{n}
\left(
|0\rangle
+
e^{2\pi i\,0.x_jx_{j+1}\cdots x_n}
|1\rangle
\right)
$$

这里：

$$
0.x_jx_{j+1}\cdots x_n
$$

表示二进制小数。

例如：

$$
0.101_2
=
\frac12
+
0
+
\frac18
=
\frac58
$$

所以 phase 为：

$$
e^{2\pi i(5/8)}
$$

这个表达揭示了 QFT 电路为什么可以逐 qubit 构造。

每个输出 qubit 都编码输入 bits 的一个不同精度 phase。

---

# 二十七、QFT 为什么适合 Hidden Period

现在回到 Shor 的核心问题。

假设一个函数满足：

$$
f(x+r)=f(x)
$$

量子计算可以先创建：

$$
\frac1{\sqrt N}
\sum_{x=0}^{N-1}
|x\rangle|f(x)\rangle
$$

由于函数是周期性的，相同的：

$$
f(x)
$$

会对应多个输入：

$$
x_0,\ x_0+r,\ x_0+2r,\ldots
$$

于是第一个寄存器中会出现周期性结构：

$$
|x_0\rangle
+
|x_0+r\rangle
+
|x_0+2r\rangle
+\cdots
$$

QFT 正好能够把这种等间隔结构转换成：

$$
k
\approx
s\frac Nr
$$

附近的 peaks。

因此：

```text
Hidden Period
↓
Periodic Quantum State
↓
QFT
↓
Fourier Peaks
↓
Measurement
↓
Rational Approximation
↓
Recover Period
```

这就是 Shor 中 QFT 的角色。

---

# 二十八、一个重要细节：Shor 中并不一定需要测量第二寄存器

很多教材为了方便理解，会描述：

1. 创建：

$$
\sum_x|x\rangle|f(x)\rangle
$$

2. 测量第二个寄存器；
3. 第一个寄存器坍缩成：

$$
|x_0\rangle
+
|x_0+r\rangle
+
|x_0+2r\rangle
+\cdots
$$

4. 对第一个寄存器执行 QFT。

这是一个非常好的教学模型。

但从算法本质上看：

> 实际实现中通常并不需要显式测量第二寄存器后再继续。

可以直接对第一个寄存器做 QFT，然后测量。

因为最终得到的 Fourier sampling distribution 与显式先测量第二寄存器的分析是一致的。

但在学习阶段，先测量第二寄存器的模型非常有价值，因为可以清晰看到：

$$
\text{periodic superposition}
$$

到底是怎么出现的。

---

# 二十九、Fourier Sampling

QFT 在量子算法中的使用方式经常被称为：

**Fourier Sampling。**

过程不是：

> 完整计算 Fourier spectrum。

而是：

$$
|\psi\rangle
\xrightarrow{\operatorname{QFT}}
\sum_k\beta_k|k\rangle
\xrightarrow{\text{measure}}
k
$$

获得一个按照：

$$
|\beta_k|^2
$$

分布的 sample。

因此量子算法利用的是：

$$
\text{sampling from a structured Fourier distribution}
$$

而不是：

$$
\text{output every Fourier coefficient}
$$

这一区别非常重要。

Shor 的优势也建立在这里。

---

# 三十、从周期到 Shor 的桥梁

Shor Algorithm 最著名的应用是整数分解。

目标是分解：

$$
N
$$

例如：

$$
N=15
$$

选择：

$$
a=2
$$

定义：

$$
f(x)=2^x\bmod15
$$

计算：

$$
2^0\bmod15=1
$$

$$
2^1\bmod15=2
$$

$$
2^2\bmod15=4
$$

$$
2^3\bmod15=8
$$

$$
2^4\bmod15=1
$$

于是：

```text
x:     0 1 2 3 4 5 6 7 ...
f(x):  1 2 4 8 1 2 4 8 ...
```

周期：

$$
r=4
$$

Shor Algorithm 的量子部分，本质上就是高效求出：

$$
r
$$

因此下一课真正要解决的问题将不再是：

> Fourier Transform 如何发现周期？

而是：

> 为什么“整数分解”可以被转化为“周期寻找”？

这一步是 Shor 最重要的数论桥梁。

---

# 三十一、Shor 为什么如此重视寻找周期

Shor 的天才之处并不只是使用 QFT。

真正核心的思想是先把一个困难问题转化成：

$$
\text{Period Finding}
$$

然后让量子计算机解决周期问题。

对于整数分解：

$$
N
$$

选择：

$$
a
$$

考虑：

$$
f(x)=a^x\bmod N
$$

因为模 $N$ 的乘法群是有限的，所以这个函数具有周期。

最小正整数：

$$
r
$$

满足：

$$
a^r\equiv1\pmod N
$$

称为：

$$
a
$$

模：

$$
N
$$

的 order。

只要获得：

$$
r
$$

在满足一些条件时就可以进一步分解：

$$
N
$$

因此 Shor 的结构是：

$$
\boxed{
\text{Factoring}
\rightarrow
\text{Order Finding}
\rightarrow
\text{Period Finding}
}
$$

而 QFT 解决的正是最后一步。

---

# 三十二、为什么 ECDLP 也会进入 Fourier Transform

对于椭圆曲线密码学：

$$
Q=dG
$$

目标是从：

$$
G,Q
$$

恢复：

$$
d
$$

这是 ECDLP。

它看起来和：

$$
f(x)=a^x\bmod N
$$

完全不同。

但 Shor 对 ECDLP 的处理仍然会把问题转换成：

$$
\text{Hidden Period}
$$

更准确地说，是：

$$
\text{Hidden Subgroup}
$$

会构造：

$$
f(a,b)=aG+bQ
$$

由于：

$$
Q=dG
$$

所以：

$$
\begin{aligned}
f(a,b)
&=aG+bQ\\
&=aG+bdG\\
&=(a+bd)G
\end{aligned}
$$

于是存在隐藏关系：

$$
f(a-d,b+1)=f(a,b)
$$

这个二维结构的隐藏方向为：

$$
(-d,1)
$$

之后需要使用二维 Fourier Sampling。

因此 Lesson 3 学习的核心思想将原样延续：

$$
\text{Hidden Algebraic Structure}
\rightarrow
\text{Phase Structure}
\rightarrow
\text{Fourier Sampling}
\rightarrow
\text{Recover Secret}
$$

区别只是：

RSA 中寻找的是一维周期；

ECDLP 中寻找的是更一般的 hidden subgroup。

---

# 三十三、QFT 与 interference 的关系

QFT 不能脱离上一课的 interference 单独理解。

QFT 的每个输出 amplitude：

$$
\beta_k
$$

都是大量输入 amplitude 的复数和：

$$
\beta_k
=
\frac1{\sqrt N}
\sum_j
\alpha_j
e^{2\pi ijk/N}
$$

因此：

$$
\beta_k
$$

就是一个 interference result。

QFT 并不是简单地：

> 给数据换一个表示形式。

它实际上让所有输入路径按照特定 phase rule 汇聚。

某个 $k$：

如果所有路径 phase 对齐：

$$
\beta_k
$$

被放大。

如果 phase 均匀分散：

$$
\beta_k
$$

被抵消。

因此可以写成：

$$
\boxed{
\text{QFT}
=
\text{Structured Global Interference}
}
$$

这是理解 QFT 最值得记住的一句话之一。

---

# 三十四、一个更准确的直觉：QFT 是相位匹配器

把 QFT 想成一组候选 frequency detectors。

对于每个：

$$
k
$$

它都假设一个 phase progression：

$$
1,
e^{2\pi ik/N},
e^{2\pi i2k/N},
\ldots
$$

然后与输入状态中的结构进行比较。

如果输入恰好具有对应周期：

所有项相位能够对齐。

于是：

$$
|\beta_k|
$$

变大。

如果不匹配：

相位绕单位圆分散。

于是：

$$
|\beta_k|
$$

趋近于零。

因此：

> QFT 不是在“搜索每一种周期”，而是通过线性量子演化，同时构造所有频率模式之间的相位比较，并让干涉自动筛选匹配频率。

这比“量子计算机并行尝试所有频率”更加准确。

---

# 三十五、QFT 的真正量子优势在哪里

QFT 经常被描述为：

> 指数级快于 FFT。

这种说法需要非常谨慎。

如果：

$$
N=2^n
$$

经典 FFT 复杂度：

$$
O(N\log N)
$$

也就是：

$$
O(n2^n)
$$

QFT gate complexity：

$$
O(n^2)
$$

表面上确实是指数差距。

但两者输出完全不同。

FFT 输出：

$$
N
$$

个经典 Fourier coefficients。

QFT 输出的是一个 quantum state：

$$
\sum_k\beta_k|k\rangle
$$

无法一次读取所有：

$$
\beta_k
$$

因此真正的量子优势必须依赖这样的问题：

> 最终不需要知道完整 Fourier spectrum，只需要从特定 Fourier distribution 中获得少量 samples。

Shor 正好满足这一条件。

所以 QFT 本身不是一个自动产生指数加速的万能工具。

真正的算法优势来自：

$$
\text{Problem Structure}
+
\text{Quantum State Preparation}
+
\text{QFT}
+
\text{Measurement}
+
\text{Classical Post-processing}
$$

缺一不可。

---

# 三十六、Approximate QFT

完整 QFT 需要很多很小角度的 controlled phase rotations。

例如：

$$
R_k
=
\begin{pmatrix}
1&0\\
0&e^{2\pi i/2^k}
\end{pmatrix}
$$

当：

$$
k
$$

很大时，相位旋转角度：

$$
\frac{2\pi}{2^k}
$$

非常小。

实际量子计算中，可以忽略一部分极小的旋转。

这样得到：

**Approximate QFT。**

它能够显著减少 gate 数量，同时只引入较小误差。

这是因为 Shor 并不需要得到无限精确的 Fourier spectrum。

只需要足够精确地识别：

$$
\frac{k}{N}
\approx
\frac{s}{r}
$$

即可。

因此 QFT 还有一个重要工程性质：

> 它允许在精度与电路深度之间做 trade-off。

---

# 三十七、常见误区

## 误区一：QFT 直接计算并输出周期

不是。

QFT 输出一个 Fourier domain quantum state。

测量得到：

$$
k
$$

随后还需要：

$$
\frac{k}{N}
\approx
\frac{s}{r}
$$

以及 classical post-processing 才能恢复：

$$
r
$$

---

## 误区二：QFT 会读取指数多个输入值

不会。

输入本身是量子态：

$$
\sum_j\alpha_j|j\rangle
$$

QFT 直接作用于这个状态，不需要将所有：

$$
\alpha_j
$$

读成经典数据。

---

## 误区三：QFT 的优势只是“计算速度更快”

不准确。

真正优势是：

> 可以在不显式读取指数多个 amplitudes 的情况下，对整个量子态进行 Fourier basis transformation。

---

## 误区四：periodic state 经过 QFT 后直接得到一个频率

通常不是。

通常会得到多个 peaks：

$$
k
\approx
s\frac Nr
$$

其中：

$$
s=0,1,\ldots,r-1
$$

一次 measurement 只得到其中一个。

---

## 误区五：QFT 本身就是 Shor Algorithm

不是。

QFT 只是 Shor 的一个核心组件。

Shor 还依赖：

* 数论 reduction；
* modular exponentiation；
* quantum state preparation；
* Fourier sampling；
* continued fractions；
* gcd；
* classical verification。

---

## 误区六：QFT 的作用是找最大值

不是。

QFT 是 basis transformation。

peak 是因为输入本身具有周期结构，导致某些 Fourier basis components 发生 constructive interference。

---

# 三十八、从“量子并行”升级到“结构提取”

经过这一课，可以进一步修正对量子计算的理解。

初级理解通常是：

> 量子计算机可以同时计算大量输入。

更准确的理解应该是：

> 量子计算通过 unitary evolution 操纵指数维 probability amplitudes，并利用 phase 和 interference 提取某种全局数学结构。

在 QFT 中，这个结构就是：

$$
\text{periodicity}
$$

所以：

```text
大量 basis states
并不是目的
        ↓
保持 coherence
        ↓
编码 phase structure
        ↓
QFT
        ↓
global interference
        ↓
特定 frequency 被增强
        ↓
measurement
        ↓
获得 global structure
```

真正被量子算法提取的，不是每一个局部函数值，而是整个函数共有的代数结构。

---

# 三十九、理解 Shor 前必须形成的一条完整链路

目前已经可以把前三课连接起来。

Lesson 1 给出了量子态的数学表示：

$$
|\psi\rangle
=
\sum_x\alpha_x|x\rangle
$$

Lesson 2 说明：

$$
\alpha_x
$$

不仅具有 magnitude，还具有 phase。

不同计算路径可以发生：

$$
\text{constructive interference}
$$

和：

$$
\text{destructive interference}
$$

Lesson 3 则进一步说明：

> 可以设计一种全局 unitary transformation，让具有相同周期结构的路径在特定频率上发生系统性的相长干涉。

这就是：

$$
\operatorname{QFT}
$$

因此整个逻辑已经形成：

$$
\boxed{
\text{Superposition}
\rightarrow
\text{Phase}
\rightarrow
\text{Interference}
\rightarrow
\text{QFT}
\rightarrow
\text{Period Information}
}
$$

下一步就是：

$$
\text{为什么整数分解可以转化为周期寻找？}
$$

---

# 四十、本课总结

Quantum Fourier Transform 的核心作用不是简单地“把数据转换到频域”。

在量子计算中，它是一种：

$$
\text{structured global interference}
$$

它把输入状态中不同 basis states 的 probability amplitudes 按照：

$$
e^{2\pi ijk/N}
$$

进行 phase rotation 和组合。

输出第 $k$ 个 basis state 的振幅为：

$$
\boxed{
\beta_k
=
\frac1{\sqrt N}
\sum_{j=0}^{N-1}
\alpha_j
e^{2\pi ijk/N}
}
$$

如果输入 amplitudes 具有周期：

$$
r
$$

那么对于：

$$
k
\approx
s\frac Nr
$$

不同计算路径的 phase 会趋于一致，从而发生 constructive interference。

其他：

$$
k
$$

则会因为 phase cancellation 而被压低。

因此：

$$
\boxed{
\text{Period in position space}
\rightarrow
\text{Peaks in Fourier space}
}
$$

Measurement 获得：

$$
k
$$

随后利用：

$$
\frac{k}{N}
\approx
\frac{s}{r}
$$

进行 classical post-processing，就可以恢复周期。

这就是 QFT 在 Shor Algorithm 中的根本价值。

更进一步，QFT 揭示了量子算法最重要的一种设计哲学：

> 不需要读取指数多个计算结果，而是设计相位关系，让需要的全局结构通过 interference 自动集中到少数可测量结果中。

因此 Shor Algorithm 并不是：

$$
\text{Quantum Brute Force}
$$

而更接近：

$$
\boxed{
\text{Hidden Structure}
\rightarrow
\text{Fourier Sampling}
\rightarrow
\text{Classical Recovery}
}
$$

下一课将进入这一课程的第一个核心算法：

# Lesson 4：Shor Algorithm——从周期寻找破解 RSA

需要完整解释：

$$
\text{Integer Factorization}
\rightarrow
\text{Order Finding}
\rightarrow
\text{Period Finding}
\rightarrow
\text{QFT}
\rightarrow
\text{Continued Fractions}
\rightarrow
\gcd
\rightarrow
\text{Factors}
$$

其中最关键的问题将是：

> 为什么知道 $a^x\bmod N$ 的周期 $r$，就可能分解整数 $N$？

这一步将把前三课学习的量子计算机制，第一次真正连接到现代密码学安全性。

---

# 课后思考

### 1. 单个 basis state 经过 QFT 后为什么通常不会产生 frequency peak？

考虑：

$$
|j\rangle
$$

经过 QFT 后：

$$
\frac1{\sqrt N}
\sum_k
e^{2\pi ijk/N}|k\rangle
$$

分析每个：

$$
|k\rangle
$$

的 measurement probability。

---

### 2. 为什么周期态才会产生 Fourier peaks？

考虑：

$$
|\psi\rangle
=
\frac1{\sqrt M}
\sum_m
|x_0+mr\rangle
$$

说明：

$$
e^{2\pi imrk/N}
$$

为什么在：

$$
k\approx sN/r
$$

附近趋向同相。

---

### 3. 对状态

$$
|\psi\rangle
=
\frac1{\sqrt2}
\left(
|1\rangle+|5\rangle
\right)
$$

假设：

$$
N=8
$$

判断它的间隔是多少，并预测 QFT 后哪些：

$$
k
$$

具有较大概率。

进一步分析：

为什么起始偏移从：

$$
0
$$

变成：

$$
1
$$

不会改变 peak 的位置？

---

### 4. 为什么下面的和可能为零？

$$
1+\omega+\omega^2+\cdots+\omega^{N-1}
$$

其中：

$$
\omega=e^{2\pi i/N}
$$

分别从：

* 几何图形；
* 等比数列；

两个角度解释。

---

### 5. 为什么 QFT 不能简单称为“指数级更快的 FFT”？

重点回答：

* 两者输入是什么；
* 两者输出是什么；
* QFT 是否能够直接读取所有 Fourier coefficients。

---

### 6. 如果周期为 r，为什么 QFT 的峰值大约出现在

$$
k
\approx
s\frac Nr
$$

？

尝试从条件：

$$
e^{2\pi irk/N}\approx1
$$

开始推导。

---

### 7. 为什么 Measurement 不会破坏 Shor 的量子优势？

Measurement 最终只得到一个：

$$
k
$$

为什么一个随机 Fourier sample 仍然可能携带足够的信息恢复：

$$
r
$$

？

---

### 8. 最重要的一道思考题

假设函数：

$$
f(x)
$$

满足：

$$
f(x+r)=f(x)
$$

量子计算机准备：

$$
\frac1{\sqrt N}
\sum_x
|x\rangle|f(x)\rangle
$$

为什么真正有价值的信息不是所有：

$$
f(x)
$$

本身，而是这些函数值之间共同形成的：

$$
r
$$

？

进一步思考：

这与现代密码学中的：

$$
Q=dG
$$

有什么潜在联系？

也就是说，Shor 是否可能不直接“搜索”：

$$
d
$$

而是找到某个与：

$$
d
$$

等价的隐藏代数结构，再通过 Fourier Sampling 恢复：

$$
d
$$

？

这正是后续破解 ECDLP 时最核心的思想。
