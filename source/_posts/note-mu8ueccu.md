---
title: 量子计算4：Shor Algorithm 从周期寻找破解 RSA
date: '2026-09-20 04:32:46'
description: ''
categories:
  - 量子计算
tags: []
content_type: article
disableNunjucks: true
---

Shor Algorithm 是量子计算史上最重要的算法之一。

它真正震撼密码学界的地方，不是“量子计算机可以更快地试除整数”，也不是“量子计算机可以并行尝试很多因子”。

它做的是一件更深刻的事情：

> 把整数分解问题转换为 order finding，再把 order finding 转换为 period finding，最后利用量子 Fourier Sampling 高效恢复隐藏周期。

整个逻辑链条可以概括为：

$$
\boxed{
\text{Integer Factorization}
\rightarrow
\text{Order Finding}
\rightarrow
\text{Period Finding}
\rightarrow
\text{QFT}
\rightarrow
\text{Recover Period}
\rightarrow
\gcd
\rightarrow
\text{Factors}
}
$$

这一课的目标不是只记住 Shor 的流程，而是彻底理解：

1. 为什么分解整数可以转化为寻找周期；
2. 为什么知道周期以后可以得到因子；
3. 量子计算机究竟加速了哪一步；
4. QFT 在其中扮演什么角色；
5. 为什么这会威胁 RSA。

理解这些问题之后，Shor 就不再是一串神秘的量子门，而是一套非常清晰的“数学问题变换 + 量子周期提取”框架。

---

## 一、RSA 真正依赖的困难问题

RSA 的安全性通常和大整数分解问题联系在一起。

假设：

$$
N=pq
$$

其中：

$$
p,q
$$

是两个大素数。

RSA 公钥中可以公开：

$$
N
$$

但攻击者不知道：

$$
p,q
$$

如果能够分解：

$$
N=pq
$$

那么就可以进一步计算：

$$
\varphi(N)
=
(p-1)(q-1)
$$

进而从公开指数 $e$ 恢复私钥指数 $d$：

$$
ed\equiv1\pmod{\varphi(N)}
$$

因此 RSA 的核心安全问题之一就是：

> 已知一个非常大的合数 $N$，如何找到它的非平凡因子？

例如：

$$
15=3\times5
$$

当然很容易。

但如果 $N$ 是两个数百位素数的乘积，经典计算机会非常困难。

目前已知最优秀的通用经典整数分解算法，如 General Number Field Sieve，虽然比暴力试除好得多，但仍然不是关于输入 bit 长度的多项式时间算法。

Shor 改变了这一点。

---

# 二、Shor 并不直接搜索因子

假设目标是分解：

$$
N
$$

一种最直接的思路是：

```text
尝试 2
尝试 3
尝试 4
……
直到找到整除 N 的数
```

Shor 完全没有沿着这个方向工作。

它先随机选择一个整数：

$$
a
$$

满足：

$$
1<a<N
$$

并计算：

$$
\gcd(a,N)
$$

如果：

$$
\gcd(a,N)>1
$$

那么已经直接找到一个因子。

如果：

$$
\gcd(a,N)=1
$$

则考虑函数：

$$
f(x)=a^x\bmod N
$$

接下来真正要寻找的不是因子，而是这个函数的周期。

这一步是整个 Shor Algorithm 最关键的思想转折：

$$
\boxed{
\text{Factoring}
\rightarrow
\text{Period Finding}
}
$$

---

# 三、什么是 order

对于：

$$
\gcd(a,N)=1
$$

寻找最小正整数 $r$，满足：

$$
a^r\equiv1\pmod N
$$

这个：

$$
r
$$

称为：

$$
a
$$

模 $N$ 的 multiplicative order。

记作：

$$
\operatorname{ord}_N(a)=r
$$

例如：

$$
N=15,\qquad a=2
$$

逐次计算：

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

所以：

$$
\operatorname{ord}_{15}(2)=4
$$

也就是说：

$$
r=4
$$

---

# 四、为什么 order 就是周期

定义：

$$
f(x)=a^x\bmod N
$$

如果：

$$
a^r\equiv1\pmod N
$$

那么：

$$
\begin{aligned}
f(x+r)
&=a^{x+r}\bmod N\\
&=a^x a^r\bmod N\\
&=a^x\cdot1\bmod N\\
&=f(x)
\end{aligned}
$$

所以：

$$
f(x+r)=f(x)
$$

因此：

$$
r
$$

既是：

$$
a
$$

模 $N$ 的 order，也是函数：

$$
f(x)=a^x\bmod N
$$

的周期。

这就是：

$$
\boxed{
\text{Order Finding}
=
\text{Period Finding}
}
$$

在 Shor 中成立的原因。

---

# 五、用 N=15、a=2 看完整周期

考虑：

$$
N=15
$$

$$
a=2
$$

定义：

$$
f(x)=2^x\bmod15
$$

依次计算：

$$
\begin{aligned}
f(0)&=1\\
f(1)&=2\\
f(2)&=4\\
f(3)&=8\\
f(4)&=1\\
f(5)&=2\\
f(6)&=4\\
f(7)&=8
\end{aligned}
$$

得到：

```text
x:       0  1  2  3  4  5  6  7  8 ...
f(x):    1  2  4  8  1  2  4  8  1 ...
```

显然：

$$
r=4
$$

这时真正的问题变成：

> 如果不知道 $r=4$，量子计算机如何把它找出来？

这正是前一课 QFT 要解决的问题。

---

# 六、先理解最关键的问题：知道 r 为什么能分解 N

这是整个 Shor 算法里最重要的数论桥梁。

假设已经找到了周期：

$$
r
$$

满足：

$$
a^r\equiv1\pmod N
$$

如果：

$$
r
$$

是偶数，那么可以写成：

$$
a^r-1
=
\left(a^{r/2}\right)^2-1
$$

利用平方差公式：

$$
a^r-1
=
\left(a^{r/2}-1\right)
\left(a^{r/2}+1\right)
$$

而：

$$
a^r\equiv1\pmod N
$$

意味着：

$$
a^r-1\equiv0\pmod N
$$

因此：

$$
N
\mid
\left(a^{r/2}-1\right)
\left(a^{r/2}+1\right)
$$

也就是说：

$$
N
$$

整除这两个数的乘积。

关键机会就在这里出现了。

---

# 七、为什么 gcd 可以得到因子

如果：

$$
a^{r/2}\not\equiv\pm1\pmod N
$$

那么：

$$
a^{r/2}-1
$$

和：

$$
a^{r/2}+1
$$

通常都会与 $N$ 共享一部分因子，但不会各自包含完整的 $N$。

于是计算：

$$
\gcd\left(a^{r/2}-1,N\right)
$$

和：

$$
\gcd\left(a^{r/2}+1,N\right)
$$

就有机会得到 $N$ 的非平凡因子。

这就是 Shor 最核心的数论公式：

$$
\boxed{
p=
\gcd\left(a^{r/2}-1,N\right)
}
$$

$$
\boxed{
q=
\gcd\left(a^{r/2}+1,N\right)
}
$$

这里不一定严格一个就是 $p$、一个就是 $q$，但在成功条件满足时，会得到非平凡因子。

---

# 八、N=15 的完整例子

继续取：

$$
N=15
$$

$$
a=2
$$

已经知道：

$$
r=4
$$

于是：

$$
a^{r/2}
=
2^2
=
4
$$

计算：

$$
4-1=3
$$

$$
4+1=5
$$

于是：

$$
\gcd(3,15)=3
$$

$$
\gcd(5,15)=5
$$

得到：

$$
15=3\times5
$$

整个过程可以写成：

$$
\begin{aligned}
2^4&\equiv1\pmod{15}\\
2^4-1&\equiv0\pmod{15}\\
(2^2-1)(2^2+1)&\equiv0\pmod{15}\\
3\times5&=15
\end{aligned}
$$

于是周期：

$$
r=4
$$

成功暴露了：

$$
3
$$

和：

$$
5
$$

两个因子。

---

# 九、这里真正发生了什么

从代数角度看：

$$
a^r\equiv1\pmod N
$$

相当于：

$$
\left(a^{r/2}\right)^2\equiv1\pmod N
$$

于是：

$$
x=a^{r/2}
$$

是方程：

$$
x^2\equiv1\pmod N
$$

的一个解。

显然总有两个平凡解：

$$
x\equiv1\pmod N
$$

$$
x\equiv-1\pmod N
$$

但当：

$$
N=pq
$$

时，还可能存在非平凡平方根。

Shor 希望找到的正是：

$$
x^2\equiv1\pmod N
$$

的非平凡解。

因为：

$$
x^2-1
=
(x-1)(x+1)
$$

而：

$$
N
\mid
(x-1)(x+1)
$$

一旦 $x$ 既不是：

$$
1
$$

也不是：

$$
-1
$$

模 $N$，这两个因子就会泄露 $N$ 的因子结构。

---

# 十、中国剩余定理下的直觉

假设：

$$
N=pq
$$

其中：

$$
p,q
$$

互素。

模 $N$ 的问题可以分别看作模 $p$ 和模 $q$ 的问题。

如果：

$$
x^2\equiv1\pmod N
$$

那么需要同时满足：

$$
x^2\equiv1\pmod p
$$

$$
x^2\equiv1\pmod q
$$

因为 $p,q$ 为奇素数，每个方程都有：

$$
x\equiv\pm1
$$

两种可能。

所以组合起来有：

```text
mod p     mod q

 +1        +1
 +1        -1
 -1        +1
 -1        -1
```

其中：

```text
(+1,+1)
```

对应：

$$
x\equiv1\pmod N
$$

而：

```text
(-1,-1)
```

对应：

$$
x\equiv-1\pmod N
$$

另外两个组合：

```text
(+1,-1)

(-1,+1)
```

就是非平凡平方根。

而这些非平凡平方根正好可以通过 gcd 拆开：

$$
p
$$

和：

$$
q
$$

这也是 Shor 数论步骤背后更深层的原因。

---

# 十一、为什么 r 必须是偶数

要使用：

$$
a^r-1
=
\left(a^{r/2}-1\right)
\left(a^{r/2}+1\right)
$$

必须保证：

$$
\frac r2
$$

是整数。

所以需要：

$$
r
$$

为偶数。

如果周期：

$$
r
$$

是奇数，这次随机选择的：

$$
a
$$

就不适合直接用于这个分解步骤。

此时重新选择一个新的：

$$
a
$$

即可。

Shor 并不要求每次随机选择都成功。

它是一个带随机性的算法。

---

# 十二、为什么 a^(r/2) 不能等于 -1 mod N

假设：

$$
a^{r/2}\equiv-1\pmod N
$$

那么：

$$
a^{r/2}+1\equiv0\pmod N
$$

于是：

$$
\gcd\left(a^{r/2}+1,N\right)=N
$$

而另一边通常：

$$
\gcd\left(a^{r/2}-1,N\right)=1
$$

最终只得到：

$$
1
$$

和：

$$
N
$$

这种平凡因子。

这对整数分解没有帮助。

所以 Shor 成功的两个核心条件是：

$$
r\text{ 为偶数}
$$

以及：

$$
a^{r/2}\not\equiv-1\pmod N
$$

当然：

$$
a^{r/2}\not\equiv1\pmod N
$$

实际上由 $r$ 是最小正 order 可以自然排除，否则 $r/2$ 就已经是更小周期。

---

# 十三、如果一次失败怎么办

Shor 并不保证任意：

$$
a
$$

都能成功。

可能出现：

1. 直接通过 $\gcd(a,N)$ 找到因子；
2. 周期 $r$ 是奇数；
3. $a^{r/2}\equiv-1\pmod N$；
4. 得到有用的非平凡平方根。

如果遇到失败，只需要重新随机选择：

$$
a
$$

再次运行。

对于满足条件的合数，随机选择合适 $a$ 获得成功的概率足够高，因此只需要重复常数级或少量次数。

所以失败并不会破坏 Shor 的多项式时间性质。

---

# 十四、目前为止还没有量子计算

到这里为止，全部步骤实际上都是经典数学：

```text
选择 a
↓
计算 gcd(a,N)
↓
寻找 r
↓
检查 r 是否为偶数
↓
计算 a^(r/2)
↓
gcd
↓
得到因子
```

真正困难的是：

$$
\boxed{
\text{找到 }r
}
$$

也就是：

$$
\operatorname{ord}_N(a)
$$

经典计算机并不知道如何在一般情况下高效完成 order finding。

量子计算机的价值正是在这里出现。

---

# 十五、Shor 的量子部分究竟做什么

量子部分要解决：

$$
f(x)=a^x\bmod N
$$

的周期：

$$
r
$$

完整逻辑为：

```text
准备输入寄存器
↓
创建均匀叠加
↓
量子计算 a^x mod N
↓
建立周期结构
↓
QFT
↓
Fourier Sampling
↓
测量得到 k
↓
经典连分数恢复 r
```

也就是说：

$$
\boxed{
\text{Quantum Part}
=
\text{Period Finding}
}
$$

这是一条非常重要的边界。

Shor 并没有把整个整数分解过程全部量子化。

大量步骤仍然由经典计算机完成。

---

# 十六、第一步：准备两个寄存器

Shor 需要两个量子寄存器。

第一个寄存器存：

$$
x
$$

第二个寄存器存：

$$
f(x)=a^x\bmod N
$$

初始状态可以写成：

$$
|0\rangle|0\rangle
$$

实际第一个寄存器会选择一个足够大的空间：

$$
Q=2^n
$$

通常要求：

$$
N^2\le Q<2N^2
$$

这样后续能够以足够精度恢复周期。

这一细节在后面的连分数步骤会变得重要。

---

# 十七、第二步：创建均匀叠加

对第一个寄存器施加：

$$
H^{\otimes n}
$$

得到：

$$
\frac1{\sqrt Q}
\sum_{x=0}^{Q-1}|x\rangle
$$

所以联合状态为：

$$
\frac1{\sqrt Q}
\sum_{x=0}^{Q-1}
|x\rangle|0\rangle
$$

这一步利用的是 Lesson 1 和 Lesson 2 的内容：

$$
\text{Superposition}
$$

此时大量：

$$
x
$$

被编码进同一个 coherent quantum state。

但这一步本身还没有得到任何周期信息。

---

# 十八、第三步：量子 Modular Exponentiation

接下来计算：

$$
f(x)=a^x\bmod N
$$

量子电路实现：

$$
|x\rangle|0\rangle
\rightarrow
|x\rangle|a^x\bmod N\rangle
$$

于是联合状态变成：

$$
\boxed{
\frac1{\sqrt Q}
\sum_{x=0}^{Q-1}
|x\rangle|a^x\bmod N\rangle
}
$$

这是 Shor 中计算资源非常重要的一部分。

实际大型 Shor 电路中，modular exponentiation 通常比 QFT 消耗更多量子门。

---

# 十九、为什么这里产生了纠缠

由于：

$$
f(x)
$$

依赖于：

$$
x
$$

第一个寄存器与第二个寄存器之间通常会产生 entanglement。

例如：

$$
N=15,\quad a=2
$$

考虑前几个 $x$：

$$
\begin{aligned}
|0\rangle&\rightarrow|1\rangle\\
|1\rangle&\rightarrow|2\rangle\\
|2\rangle&\rightarrow|4\rangle\\
|3\rangle&\rightarrow|8\rangle\\
|4\rangle&\rightarrow|1\rangle
\end{aligned}
$$

联合状态类似：

$$
\frac1{\sqrt Q}
(
|0\rangle|1\rangle
+
|1\rangle|2\rangle
+
|2\rangle|4\rangle
+
|3\rangle|8\rangle
+
|4\rangle|1\rangle
+\cdots
)
$$

第一个寄存器与第二个寄存器无法分别独立描述。

函数的周期关系已经编码到了这种关联结构中。

---

# 二十、测量第二个寄存器的教学模型

为了看清周期，可以想象测量第二个寄存器。

假设：

$$
N=15,\quad a=2
$$

并且测量结果恰好是：

$$
1
$$

哪些：

$$
x
$$

满足：

$$
2^x\bmod15=1
$$

？

有：

$$
x=0,4,8,12,\ldots
$$

所以第一个寄存器坍缩成类似：

$$
|\psi\rangle
=
\frac1{\sqrt M}
(
|0\rangle
+
|4\rangle
+
|8\rangle
+
|12\rangle
+\cdots
)
$$

它具有非常明显的周期：

$$
r=4
$$

如果测量第二个寄存器得到：

$$
2
$$

则第一个寄存器变成：

$$
|1\rangle
+
|5\rangle
+
|9\rangle
+
|13\rangle
+\cdots
$$

仍然具有：

$$
r=4
$$

的间隔。

所以无论测得哪个函数值：

> 第一个寄存器都会留下一个等间距的 periodic superposition。

---

# 二十一、为什么偏移量不重要

假设第一个寄存器坍缩为：

$$
|\psi\rangle
=
\frac1{\sqrt M}
\sum_m|x_0+mr\rangle
$$

其中：

$$
x_0
$$

可能是：

$$
0
$$

也可能是：

$$
1
$$

或者其他值。

上一课已经证明，对该状态执行 QFT：

$$
\operatorname{QFT}_Q|\psi\rangle
$$

最终概率峰值主要由：

$$
r
$$

决定，而起始偏移：

$$
x_0
$$

只会带来一个 global-to-each-frequency phase factor：

$$
e^{2\pi ix_0k/Q}
$$

其模长始终为：

$$
1
$$

所以不会改变 measurement probability。

因此：

> Shor 不需要知道周期从哪里开始，只需要提取间距 $r$。

---

# 二十二、第四步：执行 QFT

对第一个寄存器执行：

$$
\operatorname{QFT}_Q
$$

输入周期态：

$$
\frac1{\sqrt M}
\sum_m
|x_0+mr\rangle
$$

QFT 后，第 $k$ 个振幅约为：

$$
\beta_k
\propto
\sum_m
e^{2\pi imrk/Q}
$$

当：

$$
\frac{rk}{Q}
$$

接近整数时，各项 phase 接近对齐。

于是发生：

$$
\text{constructive interference}
$$

因此 peak 出现在：

$$
\boxed{
k\approx s\frac Qr
}
$$

其中：

$$
s
$$

是某个整数。

于是测量：

$$
k
$$

以后，有：

$$
\boxed{
\frac{k}{Q}
\approx
\frac{s}{r}
}
$$

这就是量子部分最终交给经典部分的信息。

---

# 二十三、QFT 并不会直接告诉 r

这一点值得再次强调。

假设真实周期：

$$
r=4
$$

QFT 可能测得：

$$
k
$$

对应：

$$
\frac{k}{Q}
\approx
\frac14
$$

也可能是：

$$
\frac24
$$

或者：

$$
\frac34
$$

更一般地：

$$
\frac{k}{Q}
\approx
\frac{s}{r}
$$

但：

$$
s
$$

未知。

所以从一次测量结果并不能简单写：

$$
r=\frac Qk
$$

还需要利用：

**continued fractions，连分数。**

---

# 二十四、为什么需要连分数

测量给出的通常不是精确等式：

$$
\frac{k}{Q}
=
\frac{s}{r}
$$

而只是：

$$
\frac{k}{Q}
\approx
\frac{s}{r}
$$

因为：

$$
r
$$

未必整除：

$$
Q
$$

例如：

$$
Q=256
$$

真实周期：

$$
r=6
$$

那么理想峰值：

$$
\frac Qr
=
\frac{256}{6}
\approx42.67
$$

显然：

$$
k
$$

必须是整数。

所以测量值可能落在：

$$
43
$$

或者附近。

于是：

$$
\frac{43}{256}
\approx
\frac16
$$

问题变成：

> 给定一个有理数近似值，如何恢复分母较小的分数？

连分数正是解决这个问题的经典数学工具。

---

# 二十五、连分数的直觉

考虑一个数：

$$
x=0.3333\ldots
$$

显然它非常接近：

$$
\frac13
$$

但计算机面对一个一般数：

$$
0.42857
$$

如何知道它可能来自：

$$
\frac37
$$

？

Continued Fraction 可以系统地产生一系列“最佳有理近似”。

例如：

$$
x
=
a_0
+
\frac1{
a_1+
\frac1{
a_2+\cdots
}
}
$$

得到一系列 convergents：

$$
\frac{p_1}{q_1},
\frac{p_2}{q_2},
\ldots
$$

其中某个：

$$
q_i
$$

很可能就是周期：

$$
r
$$

或其相关因子。

---

# 二十六、为什么 Q 要取到大约 N²

Shor 通常选择：

$$
Q=2^n
$$

满足：

$$
N^2\le Q<2N^2
$$

目的不是因为 QFT 必须这样。

而是为了保证测量得到：

$$
\frac{k}{Q}
$$

时具有足够精度。

因为周期：

$$
r<N
$$

希望满足：

$$
\left|
\frac{k}{Q}
-
\frac{s}{r}
\right|
<
\frac1{2r^2}
$$

在这样的误差范围内，连分数理论可以保证：

$$
\frac{s}{r}
$$

会出现在：

$$
\frac{k}{Q}
$$

的 continued fraction convergents 中。

所以：

$$
Q
$$

需要大约达到：

$$
N^2
$$

的数量级。

这也是 Shor 经典后处理能够可靠恢复：

$$
r
$$

的重要数学保证。

---

# 二十七、N=15 的理想化 Fourier Sampling

继续考虑：

$$
N=15
$$

$$
a=2
$$

周期：

$$
r=4
$$

为了教学方便，假设选择：

$$
Q=16
$$

因为：

$$
r=4
$$

刚好整除：

$$
Q
$$

周期态可能类似：

$$
\frac12
(
|0\rangle
+
|4\rangle
+
|8\rangle
+
|12\rangle
)
$$

QFT 后 peak 出现在：

$$
k=s\frac Qr
$$

因此：

$$
\frac Qr
=
\frac{16}{4}
=
4
$$

所以：

$$
k=0,4,8,12
$$

可能具有较大概率。

---

# 二十八、如果测量得到 k=4

则：

$$
\frac{k}{Q}
=
\frac4{16}
=
\frac14
$$

所以可以识别出：

$$
\frac sr
=
\frac14
$$

于是：

$$
r=4
$$

成功恢复周期。

---

# 二十九、如果测量得到 k=12

则：

$$
\frac{k}{Q}
=
\frac{12}{16}
=
\frac34
$$

得到：

$$
\frac sr
=
\frac34
$$

因此仍可以得到：

$$
r=4
$$

---

# 三十、如果测量得到 k=8

则：

$$
\frac{k}{Q}
=
\frac8{16}
=
\frac12
$$

这里出现一个问题。

真实情况可能是：

$$
\frac sr
=
\frac24
$$

但约分后：

$$
\frac24=\frac12
$$

分母变成了：

$$
2
$$

而不是：

$$
4
$$

因此单次测量不一定能恢复完整周期。

这也是 Shor 需要：

* 验证 candidate；
* 必要时重复执行；

的原因之一。

---

# 三十一、为什么 s 和 r 的最大公约数很重要

测量产生：

$$
\frac{s}{r}
$$

如果：

$$
\gcd(s,r)=1
$$

那么分数已经是最简形式。

continued fraction 恢复出来的分母就是：

$$
r
$$

但如果：

$$
\gcd(s,r)>1
$$

例如：

$$
\frac24
=
\frac12
$$

那么只能得到：

$$
2
$$

所以需要新的 Fourier sample。

幸运的是，随机：

$$
s
$$

与：

$$
r
$$

互素的概率通常不会低到破坏算法效率。

---

# 三十二、经典验证周期

假设连分数给出候选：

$$
r'
$$

经典计算机可以直接检查：

$$
a^{r'}\bmod N
$$

是否等于：

$$
1
$$

如果：

$$
a^{r'}\not\equiv1\pmod N
$$

说明 candidate 不正确。

于是：

* 尝试另一个 convergent；
* 或重新执行量子部分获取新的 sample。

因此 Shor 不是盲目相信 measurement。

最终结果可以高效验证。

---

# 三十三、Shor 的完整流程

现在可以把所有步骤放在一起。

给定合数：

$$
N
$$

首先随机选择：

$$
1<a<N
$$

计算：

$$
g=\gcd(a,N)
$$

如果：

$$
g>1
$$

直接得到因子。

否则：

$$
\gcd(a,N)=1
$$

量子计算：

$$
f(x)=a^x\bmod N
$$

寻找周期：

$$
r
$$

随后：

如果：

$$
r
$$

为奇数，重新选择：

$$
a
$$

如果：

$$
a^{r/2}\equiv-1\pmod N
$$

也重新选择：

$$
a
$$

否则计算：

$$
p=
\gcd(a^{r/2}-1,N)
$$

$$
q=
\gcd(a^{r/2}+1,N)
$$

得到非平凡因子。

整个算法结构：

```text
Input N
  │
  ▼
随机选择 a
  │
  ▼
gcd(a,N)
  │
  ├── >1 ───────────────→ 得到因子
  │
  ▼
构造 f(x)=a^x mod N
  │
  ▼
Quantum Period Finding
  │
  ├── Superposition
  ├── Modular Exponentiation
  ├── QFT
  └── Measurement
  │
  ▼
Continued Fractions
  │
  ▼
恢复 r
  │
  ▼
检查 r 是否为偶数
  │
  ▼
检查 a^(r/2) ≠ -1 mod N
  │
  ▼
gcd(a^(r/2) ± 1,N)
  │
  ▼
得到因子
```

---

# 三十四、Shor 中各量子概念分别做了什么

前三课中的概念，现在都可以找到具体位置。

## Superposition

构造：

$$
\frac1{\sqrt Q}
\sum_x|x\rangle
$$

允许所有输入：

$$
x
$$

被同时编码到一个量子态中。

但 superposition 本身还没有解决问题。

---

## Entanglement

计算：

$$
a^x\bmod N
$$

之后：

$$
|x\rangle
$$

与：

$$
|a^x\bmod N\rangle
$$

形成关联。

周期信息被编码到联合量子态中。

---

## Phase

QFT 把不同：

$$
x
$$

映射到不同 frequency basis：

$$
|k\rangle
$$

时，引入：

$$
e^{2\pi ixk/Q}
$$

这样的 relative phase。

---

## Interference

周期相同的输入路径，在满足：

$$
k\approx sQ/r
$$

的位置发生 constructive interference。

其他 frequency 则发生 destructive interference。

---

## Measurement

最终随机得到一个：

$$
k
$$

其 probability distribution 已经被 QFT 重新塑造。

这个：

$$
k
$$

不直接是：

$$
r
$$

但携带关于：

$$
r
$$

的强信息。

---

# 三十五、Shor 的真正核心不是“量子并行”

Shor 经常被简化成：

> 量子计算机同时计算大量 $a^x\bmod N$，所以更快。

这不是完整解释。

即使量子计算机得到：

$$
\frac1{\sqrt Q}
\sum_x
|x\rangle|a^x\bmod N\rangle
$$

如果直接测量，只能得到一个：

$$
(x,a^x\bmod N)
$$

这几乎没有价值。

真正关键的是：

> 不读取所有函数值，而是利用这些函数值共同拥有的周期结构。

即：

$$
f(x+r)=f(x)
$$

然后：

$$
\text{QFT}
$$

把这种全局结构映射成 Fourier peaks。

因此 Shor 的加速逻辑是：

$$
\boxed{
\text{Quantum Parallelism}
\neq
\text{Quantum Speedup}
}
$$

而是：

$$
\boxed{
\text{Quantum Speedup}
=
\text{Structure}
+
\text{Coherence}
+
\text{Interference}
}
$$

---

# 三十六、Shor 为什么是 Hidden Structure Algorithm

从更高层理解，Shor 并不是一个“因数搜索算法”。

它是在寻找一个隐藏结构：

$$
r
$$

函数：

$$
f(x)=a^x\bmod N
$$

满足：

$$
f(x+r)=f(x)
$$

也就是说：

$$
r\mathbb Z
$$

构成一个隐藏的周期结构。

这实际上已经非常接近：

**Hidden Subgroup Problem。**

整数分解版本中的 order finding，可以看作 Hidden Subgroup Problem 的一个实例。

在后面的 ECDLP 中，这种思想会变得更加明显。

---

# 三十七、为什么 Shor 对 RSA 是致命的

RSA-2048 之类的安全参数，本质上假设：

> 经典计算机无法在现实资源范围内分解一个 2048-bit 大整数。

但是 Shor 在理想容错量子计算模型中，可以在输入 bit 长度：

$$
n=\log_2N
$$

的多项式时间内完成整数分解。

也就是说：

经典困难度并不是：

$$
O(N)
$$

和：

$$
O(\sqrt N)
$$

之间的小幅改进。

而是复杂度结构本身发生变化：

```text
Classical factoring

sub-exponential in N,
but super-polynomial in log N

        ↓ Shor

polynomial in log N
```

所以：

$$
N
$$

增加几倍 bit 数，并不能从根本上防御 Shor。

---

# 三十八、为什么简单增加 RSA Key Size 不能解决问题

面对经典攻击，可以通过：

```text
RSA-1024
↓
RSA-2048
↓
RSA-3072
↓
RSA-4096
```

提高安全强度。

因为经典分解算法随着 key size 增长变得更难。

但 Shor 的复杂度是：

$$
\operatorname{poly}(\log N)
$$

所以把：

$$
2048\text{-bit}
$$

增加到：

$$
4096\text{-bit}
$$

只是在多项式输入规模上增加常数倍。

这不是安全假设层面的修复。

真正的解决办法是：

> 更换底层 hard problem。

这就是 Post-Quantum Cryptography 的根本动机。

---

# 三十九、现实中今天能破解 RSA-2048 吗

Shor Algorithm 是数学和算法层面的突破。

但从：

$$
\text{Algorithm Exists}
$$

到：

$$
\text{Practical Cryptographic Attack}
$$

之间还有巨大的工程距离。

实际破解 RSA-2048 需要：

* 大规模量子处理器；
* 极低错误率；
* quantum error correction；
* fault-tolerant logical qubits；
* 大规模 modular exponentiation circuit；
* 足够长的 coherent computation。

当前现实量子计算机仍远未达到大规模、稳定破解 RSA-2048 所需的 cryptographically relevant quantum computer 规模。

因此正确的结论不是：

> RSA 现在已经被量子计算机破解。

而是：

> 一旦足够强的容错量子计算机出现，RSA 所依赖的整数分解安全假设将不再成立。

这也是 PQC 迁移必须提前进行的原因。

---

# 四十、为什么现在就需要关注 Shor

密码迁移通常不是等攻击真正出现以后才开始。

尤其是长期机密信息存在：

**Harvest Now, Decrypt Later**

风险。

攻击者今天可以先保存：

$$
\text{RSA/ECDH encrypted traffic}
$$

未来如果量子计算机成熟，再执行解密。

因此对于需要长期保密的数据：

```text
现在被截获
↓
保存十几年
↓
未来运行 Shor
↓
恢复历史私钥或会话密钥
↓
解密历史数据
```

这意味着：

> 量子威胁的时间点，并不等于量子计算机真正可用的时间点。

数据的保密生命周期越长，迁移越应该提前。

---

# 四十一、RSA 中 Shor 的本质链路

现在可以把整个过程压缩成一条完整数学链路。

已知：

$$
N=pq
$$

选择：

$$
a
$$

寻找：

$$
r
$$

满足：

$$
a^r\equiv1\pmod N
$$

于是：

$$
a^r-1\equiv0\pmod N
$$

如果：

$$
r
$$

为偶数：

$$
a^r-1
=
(a^{r/2}-1)(a^{r/2}+1)
$$

如果：

$$
a^{r/2}\not\equiv\pm1\pmod N
$$

则：

$$
\gcd(a^{r/2}-1,N)
$$

和：

$$
\gcd(a^{r/2}+1,N)
$$

可以暴露：

$$
N
$$

的因子。

而：

$$
r
$$

通过量子周期寻找获得：

$$
f(x)=a^x\bmod N
$$

满足：

$$
f(x+r)=f(x)
$$

QFT 将：

$$
r
$$

映射成 Fourier peaks：

$$
k\approx s\frac Qr
$$

于是：

$$
\frac{k}{Q}
\approx
\frac{s}{r}
$$

再通过 continued fractions 恢复：

$$
r
$$

因此最终逻辑为：

$$
\boxed{
N
\rightarrow
a^x\bmod N
\rightarrow
r
\rightarrow
a^{r/2}
\rightarrow
\gcd
\rightarrow
p,q
}
$$

---

# 四十二、这套思想为什么还能破解椭圆曲线

RSA 版本看起来依赖：

$$
a^x\bmod N
$$

这种明显周期函数。

但 Shor 更深层的能力不是“只能寻找整数序列周期”。

真正核心是：

**Hidden Subgroup Problem。**

对于椭圆曲线：

$$
Q=dG
$$

攻击者希望得到：

$$
d
$$

会构造：

$$
f(a,b)=aG+bQ
$$

代入：

$$
Q=dG
$$

得到：

$$
\begin{aligned}
f(a,b)
&=aG+bQ\\
&=aG+bdG\\
&=(a+bd)G
\end{aligned}
$$

因此：

$$
f(a-d,b+1)
=
f(a,b)
$$

这里不再是普通的一维周期：

$$
x\rightarrow x+r
$$

而是二维空间中的隐藏方向：

$$
(-d,1)
$$

下一课将看到：

> Shor 对 ECDLP 的攻击，本质上是把私钥 $d$ 变成一个 hidden subgroup 的方向参数，再通过二维 Fourier Sampling 把它提取出来。

这也解释了为什么 Shor 不仅威胁 RSA，还威胁：

* ECDSA；
* ECDH；
* Ed25519；
* Schnorr；
* BIP340；
* Threshold ECDSA；
* FROST；
* MPC Wallet。

---

# 四十三、常见误区

## 误区一：Shor 在量子计算机上尝试所有因子

不是。

Shor 不做 factor brute force。

它寻找：

$$
a^x\bmod N
$$

的 order。

---

## 误区二：Shor 直接用 QFT 分解 N

不是。

QFT 解决的是：

$$
\text{Period Finding}
$$

period finding 之后，还需要：

* continued fractions；
* parity check；
* modular exponentiation；
* gcd。

---

## 误区三：只要找到任何周期都能分解 N

不一定。

需要：

$$
r
$$

为偶数，并且：

$$
a^{r/2}\not\equiv-1\pmod N
$$

否则本轮可能失败。

---

## 误区四：一次量子测量一定得到 r

不会。

QFT 测量得到：

$$
k
$$

满足：

$$
\frac{k}{Q}
\approx
\frac{s}{r}
$$

之后需要 classical post-processing。

---

## 误区五：Shor 的速度来自 exponential parallelism

不准确。

如果只是生成：

$$
\sum_x
|x\rangle|f(x)\rangle
$$

然后直接测量，并没有获得指数加速。

真正关键的是：

$$
\text{periodic structure}
+
\text{QFT interference}
$$

---

## 误区六：增加 RSA key size 可以解决量子攻击

不能从根本上解决。

因为 Shor 攻击的是整个整数分解 hard assumption，而不是某个具体 key size。

---

## 误区七：Shor 算法存在意味着今天的 RSA 已经失效

不是。

算法层面已经证明 RSA 不具备量子抗性。

但现实破解仍依赖足够规模的 fault-tolerant quantum computer。

---

# 四十四、从前三课到 Shor 的完整连接

至此，前四节课已经形成了一条完整逻辑链。

Lesson 1：

$$
|\psi\rangle
=
\sum_x\alpha_x|x\rangle
$$

建立量子态、Hilbert Space、Unitary Transformation。

Lesson 2：

理解：

$$
\alpha_x
$$

携带：

* magnitude；
* phase。

不同 computational paths 可以发生 interference。

Lesson 3：

QFT 利用：

$$
e^{2\pi ixk/N}
$$

构造 structured global interference，把：

$$
\text{Period}
$$

转换成：

$$
\text{Frequency Peaks}
$$

Lesson 4：

把整数分解转换成：

$$
\text{Period Finding}
$$

最终得到：

$$
\boxed{
\text{Factoring}
\rightarrow
\text{Hidden Period}
\rightarrow
\text{QFT}
\rightarrow
\text{Recover Period}
\rightarrow
\text{Factors}
}
$$

这就是 Shor 破解 RSA 的真正逻辑。

---

# 四十五、本课总结

Shor Algorithm 最关键的思想并不是“使用量子计算机快速搜索因子”。

它首先完成了一次数学问题变换：

$$
\text{Integer Factorization}
\rightarrow
\text{Order Finding}
$$

对于随机选择的：

$$
a
$$

寻找最小：

$$
r
$$

满足：

$$
a^r\equiv1\pmod N
$$

由于：

$$
f(x)=a^x\bmod N
$$

满足：

$$
f(x+r)=f(x)
$$

所以 order finding 等价于 period finding。

量子计算机负责高效提取：

$$
r
$$

过程为：

$$
\text{Superposition}
\rightarrow
\text{Modular Exponentiation}
\rightarrow
\text{Periodic Structure}
\rightarrow
\text{QFT}
\rightarrow
\text{Fourier Sampling}
$$

得到：

$$
\frac{k}{Q}
\approx
\frac{s}{r}
$$

之后经典计算机利用 continued fractions 恢复：

$$
r
$$

如果：

$$
r
$$

为偶数且：

$$
a^{r/2}\not\equiv-1\pmod N
$$

那么：

$$
a^r-1
=
(a^{r/2}-1)(a^{r/2}+1)
$$

最终：

$$
\boxed{
\gcd(a^{r/2}-1,N)
}
$$

和：

$$
\boxed{
\gcd(a^{r/2}+1,N)
}
$$

可以给出：

$$
N
$$

的非平凡因子。

因此 Shor 的真正思想是：

> 不直接攻击目标秘密，而是寻找与秘密等价的隐藏代数结构，再利用量子 Fourier Sampling 高效提取这种结构。

对于 RSA，这个隐藏结构是：

$$
\text{multiplicative order}
$$

而在下一课中，对于：

$$
Q=dG
$$

隐藏结构将直接包含：

$$
d
$$

本身。

这也是为什么理解 Shor 破解 ECDLP 比理解 RSA 版本更加重要：

$$
\boxed{
Q=dG
}
$$

并不是因为量子计算机能够“暴力搜索所有私钥”，而是因为离散对数可以被重新表达成一个 Abelian Hidden Subgroup Problem。

下一课将完整分析：

# Lesson 5：Shor Algorithm 如何破解 ECDSA

核心路线将变成：

$$
Q=dG
$$

$$
\downarrow
$$

$$
f(a,b)=aG+bQ
$$

$$
\downarrow
$$

$$
f(a-d,b+1)=f(a,b)
$$

$$
\downarrow
$$

$$
\text{Hidden Direction }(-d,1)
$$

$$
\downarrow
$$

$$
\text{2D Fourier Sampling}
$$

$$
\downarrow
$$

$$
v\equiv du\pmod n
$$

$$
\downarrow
$$

$$
d\equiv vu^{-1}\pmod n
$$

这一步将把量子计算真正连接到 ECDSA、Schnorr、Ed25519、FROST 与 MPC Wallet 的安全基础。

---

# 课后思考

### 1. 为什么 Shor 不直接寻找 p 和 q？

解释为什么：

$$
\text{Factoring}
\rightarrow
\text{Order Finding}
$$

是一种更适合量子算法处理的问题变换。

---

### 2. 对 N=15，选择 a=4

计算：

$$
4^x\bmod15
$$

并求出：

$$
r
$$

然后判断这一选择是否能够成功分解：

$$
15
$$

重点检查：

$$
4^{r/2}\pmod{15}
$$

---

### 3. 对 N=21，选择 a=2

逐步计算：

$$
2^x\bmod21
$$

找到 order：

$$
r
$$

然后计算：

$$
\gcd(2^{r/2}-1,21)
$$

与：

$$
\gcd(2^{r/2}+1,21)
$$

观察是否能得到：

$$
3
$$

和：

$$
7
$$

---

### 4. 为什么下面条件会导致本轮 Shor 失败？

$$
a^{r/2}\equiv-1\pmod N
$$

不要只回答“因为算法要求如此”，而是分析：

$$
\gcd(a^{r/2}-1,N)
$$

和：

$$
\gcd(a^{r/2}+1,N)
$$

此时会得到什么。

---

### 5. 为什么 r 必须是偶数？

从：

$$
a^r-1
$$

如何因式分解入手解释。

---

### 6. 为什么 QFT 之后测得的 k 不是周期 r 本身？

解释关系：

$$
\frac{k}{Q}
\approx
\frac{s}{r}
$$

以及：

$$
s
$$

在其中的作用。

---

### 7. 假设 Q=256，测量得到 k=64

有：

$$
\frac{k}{Q}
=
\frac{64}{256}
$$

尝试推测可能的：

$$
r
$$

然后思考：

为什么单个 sample 可能还不足以确定真实周期？

---

### 8. 为什么 classical FFT 无法替代 Shor 中的 QFT？

回答时需要说明：

* quantum amplitudes 没有被显式读出；
* 状态空间有指数多个 amplitudes；
* QFT 直接操作 quantum state；
* Shor 只需要 Fourier sample，而不是完整 Fourier spectrum。

---

### 9. 最重要的一道思考题

Shor 最终寻找的只是一个整数：

$$
r
$$

为什么寻找这个整数需要前面如此复杂的：

$$
\text{Superposition}
+
\text{Entanglement}
+
\text{Phase}
+
\text{Interference}
+
\text{QFT}
$$

？

换句话说：

> 量子计算真正提供的能力，到底是“同时计算很多值”，还是“高效提取经典算法难以发现的全局代数结构”？

如果答案已经倾向于后者，那么已经建立了理解下一课 ECDLP 量子攻击所需要的核心思维。

因为下一课中，目标将从：

$$
\text{找周期 }r
$$

升级为：

$$
\text{找隐藏方向 }(-d,1)
$$

而这个隐藏方向中，正是椭圆曲线私钥：

$$
d
$$

。
