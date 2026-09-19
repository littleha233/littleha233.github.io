---
title: 量子计算5：Shor Algorithm 如何破解 ECDSA
date: '2026-09-20 04:39:37'
description: ''
categories:
  - 量子计算
tags: []
content_type: article
disableNunjucks: true
---

# Shor Algorithm 如何破解 ECDSA——从离散对数到 Hidden Subgroup

RSA 版本的 Shor Algorithm 已经展示了一种非常重要的量子算法思想：

$$
\text{Hard Problem}
\rightarrow
\text{Hidden Period}
\rightarrow
\text{QFT}
\rightarrow
\text{Recover Structure}
\rightarrow
\text{Recover Secret}
$$

对于 RSA，隐藏结构是：

$$
a^x\bmod N
$$

中的周期 $r$。

而对于椭圆曲线密码学，攻击对象变成了：

$$
Q=dG
$$

其中：

* $G$ 是公开的椭圆曲线基点；
* $d$ 是私钥；
* $Q$ 是公钥。

经典计算机面对：

$$
G,Q
$$

需要解决 Elliptic Curve Discrete Logarithm Problem，ECDLP：

$$
d=\log_G Q
$$

对于现代密码学使用的大参数，这在经典计算模型下被认为非常困难。

Shor Algorithm 改变了这一点。

关键依然不是：

> 在 $1,2,3,\ldots$ 中更快地暴力搜索私钥 $d$。

而是：

> 把 $d$ 编码成一个隐藏的代数对称结构，再利用量子 Fourier Sampling 把这个结构直接提取出来。

对于椭圆曲线离散对数，这个隐藏结构可以通过函数：

$$
f(a,b)=aG+bQ
$$

构造出来。

由于：

$$
Q=dG
$$

所以：

$$
f(a,b)
=
(a+bd)G
$$

进而出现一个极其关键的不变关系：

$$
\boxed{
f(a-d,b+1)=f(a,b)
}
$$

换句话说，在二维空间中沿着：

$$
(-d,1)
$$

这个方向移动，函数值不会发生变化。

私钥 $d$ 因而被编码成了一个**隐藏方向**。

这就是 Shor 破解 ECDLP 的核心。

---

# 一、先回到椭圆曲线离散对数问题

设椭圆曲线上的一个循环子群阶为：

$$
n
$$

通常密码系统会选择一个大素数阶子群。

基点：

$$
G
$$

满足：

$$
nG=\mathcal O
$$

其中 $\mathcal O$ 为无穷远点，即椭圆曲线群的单位元。

私钥：

$$
d\in\mathbb Z_n
$$

公钥：

$$
Q=dG
$$

正向计算非常容易：

$$
d
\longrightarrow
dG
$$

可以通过 double-and-add 等算法高效完成。

问题在于反向：

$$
G,Q
\longrightarrow
d
$$

即：

$$
Q=dG
$$

已知 $G,Q$，求 $d$。

这就是 ECDLP。

---

# 二、为什么经典计算机很难求 d

最直接的方法是尝试：

$$
G,2G,3G,\ldots
$$

直到发现：

$$
dG=Q
$$

如果群阶约为：

$$
n
$$

那么暴力搜索大约需要：

$$
O(n)
$$

次群运算。

但经典计算机还有更好的算法，例如：

* Baby-Step Giant-Step；
* Pollard's rho for logarithms。

对于一般椭圆曲线群，Pollard's rho 可以把复杂度降低到大约：

$$
O(\sqrt n)
$$

并且只需要较少存储。

因此如果使用约 $256$ bit 的素数阶：

$$
n\approx2^{256}
$$

那么经典攻击复杂度大约为：

$$
\sqrt n
\approx
2^{128}
$$

这就是常见的：

> 256-bit ECC 大致提供 128-bit classical security。

这里的困难并不是因为椭圆曲线点乘本身特别复杂。

而是因为：

$$
d\rightarrow dG
$$

易算，

但：

$$
dG\rightarrow d
$$

没有已知高效经典逆算法。

---

# 三、为什么增加 ECC Key Size 不能根本解决 Shor

如果面对 Pollard's rho，可以通过增大：

$$
n
$$

提高攻击成本。

例如从：

$$
2^{256}
$$

增大到：

$$
2^{384}
$$

经典 Pollard's rho 成本会从：

$$
2^{128}
$$

增加到：

$$
2^{192}
$$

因此增加 key size 对经典攻击非常有效。

但 Shor 不属于这种攻击。

Shor 不是把：

$$
O(\sqrt n)
$$

稍微优化成：

$$
O(\sqrt n/1000)
$$

而是把离散对数问题转换成量子计算机可以在关于：

$$
\log n
$$

的多项式资源下求解的问题。

因此：

$$
256\text{-bit ECC}
\rightarrow
384\text{-bit ECC}
\rightarrow
521\text{-bit ECC}
$$

只能增加量子攻击的多项式资源需求。

它不会恢复：

$$
\text{exponential hardness}
$$

所以量子时代真正需要改变的是：

> 底层数学困难问题。

而不是简单继续增大椭圆曲线参数。

---

# 四、Shor 为什么可以攻击离散对数

RSA 中，Shor 构造的是周期函数：

$$
f(x)=a^x\bmod N
$$

然后寻找：

$$
r
$$

满足：

$$
f(x+r)=f(x)
$$

ECDLP 看起来似乎没有类似周期。

只有：

$$
Q=dG
$$

如何从这里制造一个可以交给 QFT 的周期结构？

答案是：

> 不再使用一个变量，而是引入两个变量。

定义：

$$
\boxed{
f(a,b)=aG+bQ
}
$$

其中：

$$
a,b\in\mathbb Z_n
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

函数值实际上只取决于：

$$
a+bd\pmod n
$$

而不是分别取决于：

$$
a
$$

和：

$$
b
$$

这立刻产生了一个隐藏结构。

---

# 五、隐藏方向从哪里出现

考虑：

$$
f(a-d,b+1)
$$

代入定义：

$$
\begin{aligned}
f(a-d,b+1)
&=(a-d)G+(b+1)Q\\
&=(a-d)G+(b+1)dG\\
&=(a-d+bd+d)G\\
&=(a+bd)G\\
&=f(a,b)
\end{aligned}
$$

所以：

$$
\boxed{
f(a-d,b+1)=f(a,b)
}
$$

也就是说：

```text
(a,b)
   │
   │  移动 (-d,+1)
   ▼
(a-d,b+1)
```

函数值完全不变。

再次移动：

$$
(a-2d,b+2)
$$

仍然：

$$
f(a-2d,b+2)=f(a,b)
$$

继续：

$$
(a-3d,b+3)
$$

仍然相同。

所以：

$$
(a,b)
$$

$$
(a-d,b+1)
$$

$$
(a-2d,b+2)
$$

$$
(a-3d,b+3)
$$

$$
\cdots
$$

形成一条隐藏的“周期方向”。

方向向量正是：

$$
\boxed{
(-d,1)
}
$$

私钥 $d$ 已经进入了这个方向。

---

# 六、这就是二维意义上的“周期”

RSA 的周期是一维的：

$$
x
\rightarrow
x+r
$$

有：

$$
f(x+r)=f(x)
$$

ECDLP 中则变成二维：

$$
(a,b)
\rightarrow
(a-d,b+1)
$$

有：

$$
f(a-d,b+1)=f(a,b)
$$

因此可以把 RSA 的周期理解为：

```text
──────────────→ x

*---r---*---r---*---r---*
```

而 ECDLP 的隐藏结构更像：

```text
b
↑
|
|        •
|      •
|    •
|  •
|•
+----------------------→ a

     direction = (-d,1)
```

函数沿这条方向保持不变。

所以，所谓 Hidden Subgroup 可以先建立一个非常直观的理解：

> 一组能够让函数值保持不变的“平移操作”。

RSA 中，这个平移是一维：

$$
+r
$$

ECDLP 中，这个平移是二维：

$$
(-d,+1)
$$

---

# 七、正式进入 Hidden Subgroup

输入空间是：

$$
\mathbb Z_n\times\mathbb Z_n
$$

也就是所有：

$$
(a,b)
$$

组成的二维有限 Abelian Group。

定义：

$$
f(a,b)=aG+bQ
$$

寻找所有满足：

$$
f(a,b)=\mathcal O
$$

的输入。

因为：

$$
f(a,b)
=
(a+bd)G
$$

而：

$$
G
$$

的阶为 $n$，所以：

$$
(a+bd)G=\mathcal O
$$

等价于：

$$
a+bd\equiv0\pmod n
$$

因此：

$$
a\equiv-bd\pmod n
$$

所有这样的点可以写为：

$$
(-td,t)
$$

其中：

$$
t\in\mathbb Z_n
$$

所以得到一个 subgroup：

$$
\boxed{
H
=
\{
(-td,t)
:
t\in\mathbb Z_n
\}
}
$$

或者写成：

$$
H
=
\langle(-d,1)\rangle
$$

这就是隐藏子群。

它由：

$$
(-d,1)
$$

生成。

---

# 八、为什么叫 Hidden Subgroup

函数：

$$
f(a,b)
$$

有一个重要性质：

如果两个输入的差属于：

$$
H
$$

那么它们的函数值相同。

即若：

$$
(a',b')
=
(a,b)+(-td,t)
$$

那么：

$$
f(a',b')=f(a,b)
$$

因此输入空间被划分成很多个 coset：

$$
(a,b)+H
$$

每个 coset 内的所有输入都映射到同一个椭圆曲线点。

可以想象成：

```text
Input Space Z_n × Z_n

══════════════════════   coset 1
══════════════════════   coset 2
══════════════════════   coset 3
══════════════════════   coset 4
```

每条平行线的方向都是：

$$
(-d,1)
$$

函数告诉量子计算机：

> 哪些点属于同一条线。

但不会直接告诉：

$$
d
$$

是多少。

任务就是：

> 根据函数的这种“常值 coset 结构”，找到隐藏子群 $H$。

找到：

$$
H
$$

也就找到：

$$
(-d,1)
$$

从而得到：

$$
d
$$

这就是 Abelian Hidden Subgroup Problem。

---

# 九、RSA 的 Period Finding 其实也是 Hidden Subgroup Problem

这时可以重新理解上一课。

RSA 中：

$$
f(x+r)=f(x)
$$

输入空间可以看作某个有限循环群。

隐藏子群由周期：

$$
r
$$

生成。

所以：

$$
H=\langle r\rangle
$$

Shor 的 RSA 算法本质上也是 Hidden Subgroup Problem。

因此：

$$
\text{Period Finding}
$$

并不是一个孤立技巧。

它实际上属于更一般的：

$$
\boxed{
\text{Abelian Hidden Subgroup Problem}
}
$$

ECDLP 只是把：

$$
\mathbb Z
$$

上的一维隐藏周期，扩展到了：

$$
\mathbb Z_n^2
$$

上的二维隐藏子群。

---

# 十、第一步：准备二维均匀叠加

Shor 首先准备两个输入寄存器。

状态为：

$$
\frac1n
\sum_{a=0}^{n-1}
\sum_{b=0}^{n-1}
|a,b\rangle
$$

因为总共有：

$$
n^2
$$

个状态，每个 amplitude 为：

$$
\frac1n
$$

然后再准备一个输出寄存器：

$$
|0\rangle
$$

所以：

$$
|\psi_0\rangle
=
\frac1n
\sum_{a,b}
|a,b\rangle|0\rangle
$$

这一步相当于：

> 在整个二维输入空间上建立 coherent superposition。

---

# 十一、第二步：量子计算椭圆曲线函数

构造 reversible quantum circuit：

$$
|a,b\rangle|0\rangle
\rightarrow
|a,b\rangle|aG+bQ\rangle
$$

于是：

$$
|\psi_1\rangle
=
\frac1n
\sum_{a,b}
|a,b\rangle
|aG+bQ\rangle
$$

代入：

$$
Q=dG
$$

得到：

$$
|\psi_1\rangle
=
\frac1n
\sum_{a,b}
|a,b\rangle
|(a+bd)G\rangle
$$

此时：

$$
(a,b)
$$

和椭圆曲线函数值之间发生了纠缠。

---

# 十二、纠缠在这里究竟做了什么

考虑一组：

$$
(a,b)
$$

它们满足：

$$
a+bd=c
$$

那么它们全部映射到：

$$
cG
$$

例如：

$$
(a_0,b_0)
$$

映射到某个点：

$$
R
$$

那么：

$$
(a_0-d,b_0+1)
$$

也映射到：

$$
R
$$

以及：

$$
(a_0-2d,b_0+2)
$$

仍然映射到：

$$
R
$$

所以输出寄存器把一整条 coset 上的输入关联了起来。

这一结构本质上就是：

$$
\text{Entanglement}
+
\text{Hidden Subgroup}
$$

---

# 十三、测量输出寄存器后的直觉

为了方便理解，可以想象测量第三个寄存器。

假设测得某个椭圆曲线点：

$$
R
$$

那么前两个寄存器会坍缩到所有满足：

$$
aG+bQ=R
$$

的输入。

如果其中一个解是：

$$
(a_0,b_0)
$$

那么所有解就是：

$$
(a_0,b_0)+t(-d,1)
$$

其中：

$$
t\in\mathbb Z_n
$$

所以状态变成：

$$
\boxed{
|\psi_H\rangle
=
\frac1{\sqrt n}
\sum_{t=0}^{n-1}
|a_0-td,\ b_0+t\rangle
}
$$

这就是一个 coset superposition。

它沿：

$$
(-d,1)
$$

方向均匀分布。

---

# 十四、真正的问题已经变成几何问题

此时不再需要关心：

$$
Q=dG
$$

的椭圆曲线点乘细节。

需要解决的问题已经转换为：

> 有一个二维周期态，它沿未知方向 $(-d,1)$ 重复。如何找出这个方向？

这和 Lesson 3 非常相似。

Lesson 3 是：

```text
周期序列
↓
QFT
↓
垂直的 frequency structure
```

现在则是：

```text
二维隐藏方向
↓
2D QFT
↓
与隐藏方向正交的 frequency samples
```

这就是下一步。

---

# 十五、二维 QFT 是什么

对：

$$
\mathbb Z_n\times\mathbb Z_n
$$

执行二维 QFT，本质上就是：

$$
\operatorname{QFT}_n
\otimes
\operatorname{QFT}_n
$$

分别对两个输入寄存器做 QFT。

定义：

$$
\operatorname{QFT}_n|a\rangle
=
\frac1{\sqrt n}
\sum_{u=0}^{n-1}
\omega^{au}|u\rangle
$$

其中：

$$
\omega=e^{2\pi i/n}
$$

所以：

$$
|a,b\rangle
$$

变成：

$$
\boxed{
|a,b\rangle
\rightarrow
\frac1n
\sum_{u,v}
\omega^{au+bv}|u,v\rangle
}
$$

这里：

$$
u,v
$$

可以理解为二维 Fourier frequency coordinates。

---

# 十六、对 Coset State 执行二维 QFT

输入：

$$
|\psi_H\rangle
=
\frac1{\sqrt n}
\sum_t
|a_0-td,\ b_0+t\rangle
$$

执行二维 QFT。

每个：

$$
|a_0-td,b_0+t\rangle
$$

对输出：

$$
|u,v\rangle
$$

贡献的 phase 是：

$$
\omega^{(a_0-td)u+(b_0+t)v}
$$

整理：

$$
\begin{aligned}
&(a_0-td)u+(b_0+t)v\\
&=
a_0u+b_0v+t(-du+v)
\end{aligned}
$$

所以：

$$
|u,v\rangle
$$

对应的 amplitude 与下面这个和式成正比：

$$
\sum_{t=0}^{n-1}
\omega^{t(-du+v)}
$$

这就是整个 Shor-ECDLP 推导中最关键的公式。

---

# 十七、Interference 再次出现

观察：

$$
S(u,v)
=
\sum_{t=0}^{n-1}
\omega^{t(-du+v)}
$$

如果：

$$
-du+v\equiv0\pmod n
$$

那么：

$$
\omega^{t(-du+v)}
=
1
$$

对所有 $t$ 都成立。

于是：

$$
S(u,v)
=
1+1+\cdots+1
=
n
$$

所有振幅：

**完全同相。**

发生：

$$
\text{constructive interference}
$$

---

如果：

$$
-du+v\not\equiv0\pmod n
$$

那么：

$$
1,
\omega^c,
\omega^{2c},
\ldots
$$

会绕单位圆均匀分布。

于是：

$$
S(u,v)=0
$$

发生：

$$
\text{destructive interference}
$$

所以测量只能得到满足：

$$
\boxed{
v\equiv du\pmod n
}
$$

的 Fourier coordinates。

这就是 Shor 破解 ECDLP 的核心结果。

---

# 十八、为什么最后可以恢复私钥 d

量子测量得到：

$$
(u,v)
$$

并满足：

$$
v\equiv du\pmod n
$$

如果：

$$
u\neq0
$$

并且：

$$
n
$$

为素数，那么 $u$ 在：

$$
\mathbb Z_n
$$

中一定存在乘法逆元：

$$
u^{-1}
$$

因此：

$$
v\equiv du\pmod n
$$

两边乘：

$$
u^{-1}
$$

得到：

$$
\boxed{
d\equiv vu^{-1}\pmod n
}
$$

私钥直接恢复。

这和 RSA 版本相比甚至显得非常直接。

RSA 中：

$$
\text{QFT sample}
\rightarrow
\text{continued fractions}
\rightarrow
r
\rightarrow
\gcd
\rightarrow
p,q
$$

而 ECDLP 中：

$$
\text{Fourier sample}
\rightarrow
(u,v)
\rightarrow
v=du
\rightarrow
d
$$

---

# 十九、二维 Fourier Space 中发生了什么

Hidden Subgroup：

$$
H
=
\langle(-d,1)\rangle
$$

QFT 之后得到的不是：

$$
H
$$

本身。

而是得到：

$$
H^\perp
$$

称为：

**orthogonal subgroup，正交子群。**

其定义是：

$$
H^\perp
=
\{
(u,v):
\chi_{u,v}(h)=1
\text{ for all }h\in H
\}
$$

对于：

$$
h=(-d,1)
$$

Fourier character 为：

$$
\chi_{u,v}(h)
=
\omega^{-du+v}
$$

要求：

$$
\chi_{u,v}(h)=1
$$

因此：

$$
-du+v\equiv0\pmod n
$$

即：

$$
\boxed{
v\equiv du\pmod n
}
$$

所以：

$$
H^\perp
$$

实际上是一条：

$$
v=du
$$

的直线。

---

# 二十、隐藏方向与 Fourier 方向为什么正交

这和经典 Fourier Transform 有一个非常漂亮的几何关系。

原始 hidden direction：

$$
(-d,1)
$$

Fourier sample：

$$
(u,v)
$$

满足：

$$
(-d,1)\cdot(u,v)
\equiv0\pmod n
$$

即：

$$
-du+v\equiv0\pmod n
$$

所以 QFT 测出来的是：

> 与原始 hidden direction 正交的 frequency vector。

可以用连续几何做一个近似直觉：

```text
       Fourier direction
             /
            /
           /
----------/----------
        /
       /
 Hidden cosets
```

现实中这里不是普通实数平面，而是有限群：

$$
\mathbb Z_n^2
$$

中的模运算正交关系。

但基本直觉非常相似：

> 某个方向上重复的结构，在 Fourier domain 中会集中到与其正交的频率方向。

---

# 二十一、为什么这个过程能提取 d，而不是暴力猜 d

这是整个课程中最值得理解的一点。

经典暴力攻击的思路是：

```text
猜 d = 1
检查 1G == Q ?

猜 d = 2
检查 2G == Q ?

猜 d = 3
……
```

Pollard's rho 做得更聪明，但仍然属于经典离散对数搜索算法的范畴。

Shor 完全改变问题：

```text
Q = dG
↓
构造 f(a,b)=aG+bQ
↓
发现函数存在隐藏平移
↓
隐藏方向 = (-d,1)
↓
准备整个 coset 的 coherent superposition
↓
二维 QFT
↓
global interference
↓
得到正交关系 v=du
↓
代数求解 d
```

因此：

$$
\boxed{
\text{Shor is not searching }d
}
$$

而是在：

$$
\boxed{
\text{extracting a structure that mathematically determines }d
}
$$

这就是量子算法真正强大的地方。

---

# 二十二、用一个很小的玩具例子理解

为了建立直觉，假设群阶：

$$
n=7
$$

真实私钥：

$$
d=3
$$

于是：

$$
Q=3G
$$

定义：

$$
f(a,b)=aG+bQ
$$

也就是：

$$
f(a,b)=(a+3b)G
$$

隐藏方向：

$$
(-3,1)
$$

模 $7$ 下也可以写成：

$$
(4,1)
$$

因为：

$$
-3\equiv4\pmod7
$$

从：

$$
(a,b)
$$

移动到：

$$
(a-3,b+1)
$$

函数值不变。

例如从：

$$
(2,0)
$$

开始：

$$
f(2,0)=2G
$$

移动：

$$
(2-3,1)
=
(-1,1)
\equiv
(6,1)
$$

有：

$$
f(6,1)
=
6G+3G
=
9G
=
2G
$$

因为：

$$
9\equiv2\pmod7
$$

继续：

$$
(3,2)
$$

因为：

$$
6-3=3
$$

则：

$$
f(3,2)
=
3G+6G
=
9G
=
2G
$$

所以：

```text
(2,0)
   ↓ (-3,+1)
(6,1)
   ↓
(3,2)
   ↓
(0,3)
   ↓
...
```

全部映射到同一个椭圆曲线点。

---

# 二十三、这个例子的 Fourier Sampling

二维 QFT 测量得到：

$$
(u,v)
$$

满足：

$$
v\equiv3u\pmod7
$$

例如如果测到：

$$
u=2
$$

那么：

$$
v=6
$$

于是：

$$
d
\equiv
vu^{-1}
\pmod7
$$

$2$ 在模 $7$ 下的逆元为：

$$
2^{-1}=4
$$

因为：

$$
2\times4=8\equiv1\pmod7
$$

所以：

$$
\begin{aligned}
d
&\equiv6\times4\pmod7\\
&\equiv24\pmod7\\
&\equiv3
\end{aligned}
$$

成功恢复：

$$
d=3
$$

这里完全没有：

```text
1G
2G
3G
```

这样的逐个搜索过程。

---

# 二十四、如果测量得到 u=0 怎么办

关系：

$$
v\equiv du\pmod n
$$

如果：

$$
u=0
$$

那么：

$$
v=0
$$

得到：

$$
(0,0)
$$

显然无法计算：

$$
u^{-1}
$$

也无法恢复 $d$。

但如果：

$$
n
$$

是大素数，Fourier samples 均匀分布在：

$$
H^\perp
$$

的 $n$ 个点上。

只有一个点：

$$
(0,0)
$$

有：

$$
u=0
$$

因此概率为：

$$
\frac1n
$$

对于密码学规模的：

$$
n
$$

这个概率极低。

即使遇到，也只需要重新运行算法。

---

# 二十五、符号为什么有时会看到 v=-du

不同教材可能出现：

$$
v\equiv du\pmod n
$$

也可能出现：

$$
v\equiv-du\pmod n
$$

原因通常不是算法不同，而是：

* QFT 使用 $e^{+2\pi ijk/n}$ 还是 $e^{-2\pi ijk/n}$；
* 函数定义成 $aG+bQ$ 还是 $aG-bQ$；
* hidden generator 选择 $(-d,1)$ 还是 $(d,-1)$。

这些都是 convention 差异。

例如如果定义：

$$
f(a,b)=aG-bQ
$$

则：

$$
f(a,b)=(a-bd)G
$$

隐藏方向会相应改变。

真正不变的是：

> Fourier sample 给出一个关于 $d$ 的线性模方程。

最终都可以高效解出：

$$
d
$$

因此学习时不要把：

$$
+
$$

还是：

$$
-
$$

当作核心。

核心是：

$$
\boxed{
\text{Hidden Subgroup}
\rightarrow
\text{linear relation containing }d
}
$$

---

# 二十六、Shor 破解 ECDLP 的完整流程

现在可以把整个过程放到一起。

已知：

$$
G,Q
$$

满足：

$$
Q=dG
$$

目标：

$$
d
$$

首先构造：

$$
f(a,b)=aG+bQ
$$

有：

$$
f(a,b)
=
(a+bd)G
$$

于是：

$$
f(a-d,b+1)=f(a,b)
$$

隐藏子群：

$$
H
=
\langle(-d,1)\rangle
$$

量子计算：

$$
\frac1n
\sum_{a,b}
|a,b\rangle
|f(a,b)\rangle
$$

得到 coset structure。

对输入寄存器执行：

$$
\operatorname{QFT}_n
\otimes
\operatorname{QFT}_n
$$

interference 保留下满足：

$$
v-du\equiv0\pmod n
$$

的 Fourier samples。

测量：

$$
(u,v)
$$

然后：

$$
\boxed{
d\equiv vu^{-1}\pmod n
}
$$

恢复私钥。

完整路线：

```text
Public Key

Q = dG
   │
   ▼
构造 f(a,b)=aG+bQ
   │
   ▼
f(a,b)=(a+bd)G
   │
   ▼
发现隐藏平移
(-d,1)
   │
   ▼
Hidden Subgroup
H=<(-d,1)>
   │
   ▼
Superposition
   │
   ▼
Entangled function evaluation
   │
   ▼
Coset State
   │
   ▼
2D QFT
   │
   ▼
Interference
   │
   ▼
v ≡ du mod n
   │
   ▼
d ≡ vu⁻¹ mod n
```

---

# 二十七、为什么 ECDSA 会因此失效

ECDSA 私钥：

$$
d
$$

公钥：

$$
Q=dG
$$

签名消息摘要：

$$
z
$$

生成随机 nonce：

$$
k
$$

计算：

$$
R=kG
$$

取：

$$
r=x_R\bmod n
$$

签名第二部分：

$$
s
=
k^{-1}(z+rd)\pmod n
$$

所以 ECDSA 签名核心依赖：

$$
d
$$

保持秘密。

一旦 Shor 根据：

$$
Q=dG
$$

恢复出：

$$
d
$$

攻击者就可以自己选择新的 nonce：

$$
k'
$$

对任意消息：

$$
z'
$$

生成合法签名：

$$
s'
=
{k'}^{-1}(z'+r'd)\pmod n
$$

因此攻击者无需：

* 窃取钱包文件；
* 窃取助记词；
* 入侵 HSM；
* 获取 MPC share；
* 攻击签名服务。

只需要：

$$
\text{Public Key}
$$

就可以从底层数学关系恢复签名私钥。

这就是 Shor 对 ECC 密码系统的根本威胁。

---

# 二十八、为什么 Schnorr 同样失效

Schnorr 签名同样建立在离散对数困难性上。

简化形式：

私钥：

$$
d
$$

公钥：

$$
Q=dG
$$

随机 nonce：

$$
k
$$

承诺：

$$
R=kG
$$

challenge：

$$
e=H(R,Q,m)
$$

response：

$$
s=k+ed\pmod n
$$

验证：

$$
sG=R+eQ
$$

只要 Shor 能从：

$$
Q=dG
$$

恢复：

$$
d
$$

整个 Schnorr 安全性就失效。

因此：

$$
\text{Schnorr}
$$

并不会因为签名公式比 ECDSA 更优雅，就天然获得量子抗性。

其底层仍然依赖：

$$
\boxed{
\text{Discrete Logarithm Hardness}
}
$$

---

# 二十九、BIP340 为什么也不抗量子

Bitcoin BIP340 使用：

**Schnorr signatures over secp256k1。**

虽然它具有：

* x-only public keys；
* deterministic construction；
* linearity；
* 更简洁的安全证明；
* 更适合聚合与 threshold protocol；

但其公钥本质仍对应某个：

$$
Q=dG
$$

关系。

Shor 攻击的是：

$$
Q=dG
$$

而不是 ECDSA 某个具体签名公式。

所以：

$$
\boxed{
\text{BIP340 Schnorr is not post-quantum secure}
}
$$

---

# 三十、Ed25519 为什么也不抗量子

Ed25519 使用 Edwards25519 曲线上的 EdDSA。

虽然：

* 曲线表示不同；
* 签名公式不同；
* nonce 生成方式不同；
* public key 编码不同；

底层仍存在：

$$
A=aB
$$

这样的 scalar multiplication relationship。

也就是说：

$$
\text{secret scalar}
\rightarrow
\text{curve public point}
$$

安全性仍然依赖椭圆曲线离散对数困难性。

因此 Shor 同样可以攻击这种离散对数关系。

所以：

$$
\boxed{
\text{Ed25519 is not post-quantum secure}
}
$$

---

# 三十一、ECDH 为什么也会失效

ECDH 中：

Alice：

$$
A=aG
$$

Bob：

$$
B=bG
$$

共享秘密：

$$
S=abG
$$

Alice 计算：

$$
aB
$$

Bob 计算：

$$
bA
$$

经典攻击者知道：

$$
G,A,B
$$

但无法恢复：

$$
a
$$

或：

$$
b
$$

因此无法计算：

$$
abG
$$

但如果拥有 Shor：

$$
A=aG
$$

可以直接恢复：

$$
a
$$

于是：

$$
S=aB
$$

立刻可得。

所以所有基于经典椭圆曲线 Diffie-Hellman 的体系：

* ECDH；
* X25519；
* ephemeral ECDH；
* ECIES 类方案；

在足够强的量子计算机面前都需要重新考虑。

---

# 三十二、FROST 为什么也无法抵御 Shor

FROST 是 threshold Schnorr signature protocol。

假设私钥：

$$
d
$$

通过 secret sharing 分给：

$$
n
$$

个参与者。

没有任何单个参与者持有完整：

$$
d
$$

签名时，通过 threshold protocol 联合生成合法 Schnorr signature。

这能够解决：

* 单点私钥泄露；
* 单个签名节点被攻破；
* 私钥集中托管；
* 内部作恶；
* availability 与 governance。

但是对外公开的 aggregate public key 仍然是：

$$
Q=dG
$$

Shor 不需要攻击任何 share。

直接：

$$
Q
\xrightarrow{\text{Shor}}
d
$$

因此：

$$
\boxed{
\text{FROST protects key custody, not DLP hardness}
}
$$

---

# 三十三、GG18 / GG20 为什么也无法抵御 Shor

GG18 / GG20 解决的是 Threshold ECDSA。

通过：

* Secret Sharing；
* Paillier；
* MtA；
* Zero-Knowledge Proof；
* Distributed Key Generation；
* distributed signing；

使多个参与者可以联合产生 ECDSA 签名，而无需在单个节点恢复完整私钥。

从系统安全角度，这非常重要。

例如 2-of-3 MPC：

```text
Party A：share A
Party B：share B
Party C：share C

任意两方联合签名
```

攻击者不能简单攻破一个节点拿到：

$$
d
$$

但是整个系统最终仍然有一个 aggregate public key：

$$
Q=dG
$$

其中：

$$
d
$$

是这些 shares 所对应的逻辑私钥。

Shor 完全绕过：

* share；
* Paillier；
* MtA；
* MPC protocol；
* DKG；
* 签名交互。

直接从：

$$
Q=dG
$$

求出：

$$
d
$$

所以：

$$
\boxed{
\text{Threshold ECDSA}
\neq
\text{Post-Quantum Signature}
}
$$

---

# 三十四、MPC 钱包究竟解决什么问题

这一区分对于密码钱包尤其重要。

MPC Wallet 解决的是：

$$
\text{Key Management Problem}
$$

例如：

* 私钥不落单机；
* 防止单点 compromise；
* 多方授权；
* distributed custody；
* threshold signing；
* malicious participant protection；
* auditability。

但 Shor 攻击的是：

$$
\text{Mathematical Hardness Assumption}
$$

即：

$$
Q=dG
$$

中的 ECDLP。

所以：

```text
MPC

解决：
私钥存在哪里？
谁可以签名？
多少参与者才能签名？
如何避免单点泄露？

Shor

攻击：
为什么 Q=dG 难以反推出 d？
```

这两个问题位于完全不同的安全层次。

因此一个系统即使拥有极其完善的：

* HSM；
* Cold Wallet；
* MPC；
* Threshold；
* Multi-Approval；
* Network Isolation；

如果最终签名算法还是：

$$
\text{ECDSA}
$$

那么底层仍然继承 ECDLP 的量子脆弱性。

---

# 三十五、MPC 并不是“多把私钥”

另一个容易产生的误解是：

> 私钥已经分成很多 share，量子计算机是不是必须分别破解每个 share？

不是。

假设：

$$
d=d_1+d_2\pmod n
$$

两方分别拥有：

$$
d_1,d_2
$$

外界并不知道这些 share。

但 aggregate public key 仍然是：

$$
Q=dG
$$

Shor 求的是：

$$
d=\log_G Q
$$

它不关心：

$$
d
$$

内部是：

* 一台机器生成的；
* Shamir 分片；
* additive sharing；
* DKG；
* threshold protocol；

从数学攻击视角：

$$
Q=dG
$$

已经足够。

所以即使：

$$
d
$$

在系统生命周期中从未真正出现在任何一台机器内存中，量子攻击者仍可能从公钥恢复出一个与其等价的完整 scalar：

$$
d
$$

---

# 三十六、这对冷钱包意味着什么

传统冷钱包安全设计通常重点防御：

* online compromise；
* signing machine intrusion；
* private key extraction；
* supply-chain attacks；
* malicious transaction；
* unauthorized signature；
* insider threat。

这些依然非常重要。

但量子攻击增加了另一条完全不同的攻击路径：

```text
无需进入冷钱包系统
无需访问签名机
无需拿到 MPC share
无需突破网络隔离

只需要：
公开的椭圆曲线公钥

↓ Shor

恢复私钥

↓
离线伪造合法签名
```

因此未来所谓：

**Quantum-Safe Wallet Architecture**

不能只在现有 MPC 层继续加固。

必须最终迁移：

$$
\text{Signature Primitive}
$$

本身。

例如从依赖 ECDLP 的签名算法，迁移到基于后量子困难问题的签名方案。

---

# 三十七、但地址公开不一定等于公钥已经公开

在区块链语境下，还需要区分：

$$
\text{Address}
$$

和：

$$
\text{Public Key}
$$

某些系统中地址直接或间接包含公钥。

另一些系统中地址可能只是：

$$
H(Q)
$$

即公钥的 Hash。

在这种情况下，只知道地址：

$$
H(Q)
$$

并不能直接运行：

$$
Q=dG
$$

形式的 Shor 离散对数攻击。

Shor 需要实际的椭圆曲线公钥：

$$
Q
$$

不过很多区块链协议会在：

* 花费交易；
* 签名；
* witness；
* account metadata；
* script；
* protocol state；

中暴露或可恢复公钥。

因此：

> “公钥何时暴露”会成为量子时代区块链迁移中的重要安全边界。

这一问题将在后续 Quantum-Safe Architecture 中进一步讨论。

---

# 三十八、Hash 地址为什么不能简单说“量子安全”

即使地址只暴露：

$$
H(Q)
$$

也不能简单理解为：

> 使用 Hash 地址以后就没有量子风险。

原因包括：

1. 公钥可能在之后的交易中公开；
2. Grover Algorithm 会降低 Hash preimage search 的安全强度；
3. 资金可能长期停留在已经公开 public key 的地址；
4. 协议本身的签名验证逻辑仍然可能依赖 ECDSA / Schnorr；
5. migration window 本身可能产生攻击面。

因此：

$$
\text{Hash(Public Key)}
$$

可以在某些设计中延迟直接 ECDLP 攻击面暴露，但它并不是完整的 Post-Quantum Migration 方案。

---

# 三十九、Shor 对离散对数的复杂度意味着什么

经典 generic attack：

$$
O(\sqrt n)
$$

如果：

$$
n\approx2^{256}
$$

则：

$$
O(2^{128})
$$

量子 Shor：

$$
\operatorname{poly}(\log n)
$$

这意味着算法复杂度类别发生根本变化。

需要特别区分：

$$
\text{Asymptotic Vulnerability}
$$

和：

$$
\text{Practical Attack Today}
$$

Shor 已经从理论上证明：

> 大规模 fault-tolerant quantum computer 一旦达到足够能力，ECDLP 不再能够承担长期密码学安全假设。

但这不意味着现实中的现代量子计算机已经能够破解：

* secp256k1；
* P-256；
* Curve25519；
* Ed25519。

真正执行大规模 Shor 仍需要巨大的：

* logical qubit 数量；
* quantum error correction；
* physical qubits；
* gate fidelity；
* circuit depth；
* fault-tolerant operation。

所以：

$$
\boxed{
\text{ECDSA is quantum-vulnerable}
}
$$

与：

$$
\boxed{
\text{ECDSA can be practically broken today}
}
$$

是两个完全不同的结论。

---

# 四十、为什么 Hidden Subgroup 是理解 Shor 的最高层视角

到这里，可以把前面的知识重新统一起来。

RSA：

$$
f(x)=a^x\bmod N
$$

存在：

$$
f(x+r)=f(x)
$$

隐藏结构：

$$
\langle r\rangle
$$

ECDLP：

$$
f(a,b)=aG+bQ
$$

存在：

$$
f(a-d,b+1)=f(a,b)
$$

隐藏结构：

$$
\langle(-d,1)\rangle
$$

所以两者真正统一在：

$$
\boxed{
\text{Abelian Hidden Subgroup Problem}
}
$$

Shor 的核心并不是某一个具体公式。

而是一种算法范式：

```text
寻找一个困难密码学问题
        ↓
把秘密编码成函数的对称性
        ↓
函数在某个 subgroup 的 coset 上保持不变
        ↓
构造 coset superposition
        ↓
Quantum Fourier Transform
        ↓
测量 orthogonal subgroup
        ↓
恢复 hidden subgroup
        ↓
恢复 secret
```

这就是 Shor Algorithm 最深刻的结构。

---

# 四十一、为什么 Fourier Transform 能找到 Hidden Subgroup

Hidden subgroup：

$$
H
$$

意味着：

$$
f(x)=f(x+h)
$$

对：

$$
h\in H
$$

成立。

于是量子态中会出现：

$$
\sum_{h\in H}|x+h\rangle
$$

这样的 coset superposition。

对它做 QFT 时，每个 Fourier character：

$$
\chi_y(x+h)
$$

都可以写成：

$$
\chi_y(x)\chi_y(h)
$$

沿 subgroup 求和：

$$
\sum_{h\in H}\chi_y(h)
$$

如果 character 在整个 $H$ 上都是：

$$
1
$$

则：

$$
\sum_{h\in H}1
=
|H|
$$

发生相长干涉。

否则这些 phase 会在单位圆上抵消：

$$
\sum_{h\in H}\chi_y(h)=0
$$

因此只保留：

$$
H^\perp
$$

中的 frequency components。

所以 Fourier Transform 本质上是在问：

> 哪些 frequency 对 hidden subgroup 的所有平移都“看不见”？

这些 frequency 恰好组成：

$$
H^\perp
$$

然后从：

$$
H^\perp
$$

就可以反推出：

$$
H
$$

这就是 Hidden Subgroup Algorithm 的数学本质。

---

# 四十二、从“找周期”进一步理解 Shor

经过 RSA 版本时，容易形成一种理解：

> Shor 是一个找周期算法。

这并没有错，但还不够完整。

更准确的理解是：

$$
\boxed{
\text{Shor is a hidden symmetry extraction algorithm}
}
$$

周期只是一种最简单的 symmetry。

RSA 中：

$$
x\rightarrow x+r
$$

是隐藏对称性。

ECDLP 中：

$$
(a,b)\rightarrow(a-d,b+1)
$$

是隐藏对称性。

Quantum Fourier Transform 则负责：

> 把这种 translation symmetry 转换成 frequency-domain linear constraints。

---

# 四十三、ECDSA、Schnorr、Ed25519 的共同弱点

从签名协议表面看：

ECDSA：

$$
s=k^{-1}(z+rd)
$$

Schnorr：

$$
s=k+ed
$$

EdDSA：

具有另外一套 Hash、nonce 和编码设计。

协议公式明显不同。

但从 Shor 的角度，它们有一个共同结构：

$$
\boxed{
\text{Public Key}
=
\text{Secret Scalar}
\times
\text{Public Group Generator}
}
$$

也就是：

$$
Q=dG
$$

只要这一关系位于一个 Shor 可以处理的 finite Abelian group 中，并且安全性依赖离散对数困难性，量子攻击就可以绕过签名协议的表层设计。

因此真正的量子安全边界不在：

* nonce 如何生成；
* DER 如何编码；
* ECDSA 还是 Schnorr；
* deterministic nonce；
* threshold signing；

而在：

$$
\boxed{
\text{Underlying Hard Problem}
}
$$

---

# 四十四、为什么 Safe、MPC、HSM 都不能单独解决这个问题

可以把安全体系分成几个层次：

```text
应用权限层
    ↓
交易策略层
    ↓
审批与风控层
    ↓
签名服务层
    ↓
MPC / HSM / Cold Storage
    ↓
Signature Algorithm
    ↓
Mathematical Hard Problem
```

MPC、HSM、Cold Wallet 主要保护：

$$
\text{Key Custody}
$$

而 Shor 攻击最底层：

$$
\text{Mathematical Hard Problem}
$$

因此上层系统无论多复杂，都无法让：

$$
Q=dG
$$

重新变成量子困难问题。

未来 Quantum-Safe Architecture 必须同时考虑：

1. key custody；
2. threshold security；
3. transaction policy；
4. post-quantum signature primitive。

不能只迁移其中一层。

---

# 四十五、与下一阶段 PQC 的连接

这里自然产生一个问题：

既然：

$$
\text{RSA}
$$

依赖整数分解，

$$
\text{ECDSA}
$$

依赖 ECDLP，

它们都能被 Shor 高效解决，

那么新的密码系统应该依赖什么？

Post-Quantum Cryptography 的基本思路就是：

> 寻找目前没有已知高效量子算法能够解决的数学困难问题。

例如：

* lattice problems；
* coding problems；
* hash-based constructions。

其中最重要的路线之一是：

$$
\text{Lattice-Based Cryptography}
$$

后续会看到：

$$
\text{LWE}
$$

和：

$$
\text{Module-LWE}
$$

的结构与：

$$
Q=dG
$$

完全不同。

目前并不存在一种类似：

$$
\text{Hidden Subgroup}
\rightarrow
\text{QFT}
$$

的已知高效算法可以直接把它们攻破。

这也是现代 PQC 标准大量采用格密码的重要原因。

---

# 四十六、但在进入 PQC 之前，还需要理解 Grover

Shor 解决的是：

* Integer Factorization；
* Discrete Logarithm。

因此直接影响：

* RSA；
* DH；
* ECDH；
* ECDSA；
* Schnorr；
* EdDSA。

但 AES 和 Hash 并不依赖这些数学结构。

例如 AES-256 的安全问题更接近：

> 在 $2^{256}$ 个候选 key 中找到正确 key。

这属于：

$$
\text{Unstructured Search}
$$

Shor 并不能直接把它变成 polynomial-time problem。

量子计算对这类问题主要使用另一种算法：

$$
\boxed{
\text{Grover Algorithm}
}
$$

Grover 会把：

$$
O(N)
$$

搜索降低为：

$$
O(\sqrt N)
$$

因此：

$$
AES\text{-}128
$$

理论上的量子 brute-force security 大约降到：

$$
2^{64}
$$

而：

$$
AES\text{-}256
$$

则大约对应：

$$
2^{128}
$$

这与 Shor 的：

$$
\text{exponential}
\rightarrow
\text{polynomial}
$$

属于完全不同级别的影响。

---

# 四十七、本课最重要的一条逻辑链

从：

$$
Q=dG
$$

开始。

经典计算机面对：

$$
G,Q
$$

需要求：

$$
d=\log_GQ
$$

经典 generic attack 需要约：

$$
O(\sqrt n)
$$

群运算。

Shor 不直接搜索：

$$
d
$$

而构造：

$$
f(a,b)=aG+bQ
$$

因为：

$$
Q=dG
$$

所以：

$$
f(a,b)
=
(a+bd)G
$$

于是：

$$
f(a-d,b+1)=f(a,b)
$$

产生隐藏子群：

$$
\boxed{
H=\langle(-d,1)\rangle
}
$$

量子计算准备 coset superposition：

$$
\frac1{\sqrt n}
\sum_t
|a_0-td,b_0+t\rangle
$$

二维 QFT 后，第：

$$
(u,v)
$$

个 Fourier component 中出现：

$$
\sum_t
e^{2\pi it(-du+v)/n}
$$

只有：

$$
-du+v\equiv0\pmod n
$$

时发生 constructive interference。

所以测量得到：

$$
\boxed{
v\equiv du\pmod n
}
$$

最终：

$$
\boxed{
d\equiv vu^{-1}\pmod n
}
$$

整个攻击完成。

---

# 四十八、本课总结

Shor 对 ECDLP 的攻击，真正体现了量子算法与经典暴力搜索之间的本质区别。

传统攻击面对：

$$
Q=dG
$$

试图寻找：

$$
d
$$

而 Shor 首先改变问题表达：

$$
Q=dG
$$

$$
\downarrow
$$

$$
f(a,b)=aG+bQ
$$

由于：

$$
Q=dG
$$

得到：

$$
f(a,b)=(a+bd)G
$$

进一步产生隐藏平移：

$$
f(a-d,b+1)=f(a,b)
$$

所以私钥：

$$
d
$$

被编码成二维空间中的 Hidden Subgroup：

$$
H=\langle(-d,1)\rangle
$$

之后利用：

* Superposition；
* Entanglement；
* Quantum Fourier Transform；
* Constructive Interference；
* Destructive Interference；
* Measurement；

提取：

$$
H^\perp
$$

中的 Fourier sample：

$$
(u,v)
$$

满足：

$$
v\equiv du\pmod n
$$

从而：

$$
d\equiv vu^{-1}\pmod n
$$

所以整个过程可以概括为：

$$
\boxed{
\text{ECDLP}
\rightarrow
\text{Hidden Subgroup}
\rightarrow
\text{Fourier Sampling}
\rightarrow
\text{Linear Relation}
\rightarrow
\text{Private Key}
}
$$

这也解释了为什么：

* ECDSA；
* ECDH；
* Schnorr；
* BIP340；
* Ed25519；
* Threshold ECDSA；
* GG18；
* GG20；
* FROST；
* MPC Wallet；

都会继承同一个量子弱点。

它们的上层协议虽然不同，但最终都建立在某种：

$$
Q=dG
$$

形式的离散对数困难性之上。

MPC 可以解决：

$$
\text{“私钥是否存在单点泄露？”}
$$

但无法解决：

$$
\text{“离散对数本身是否仍然困难？”}
$$

Shor 攻击的正是后者。

因此，量子时代密码系统真正需要迁移的并不仅仅是：

* 钱包架构；
* 密钥存储；
* MPC protocol；

而是最底层的：

$$
\boxed{
\text{Cryptographic Hardness Assumption}
}
$$

至此，Shor 对现代公钥密码的威胁已经形成了一条完整主线：

$$
\text{RSA}
\rightarrow
\text{Integer Factorization}
\rightarrow
\text{Shor}
$$

以及：

$$
\text{ECC}
\rightarrow
\text{Discrete Logarithm}
\rightarrow
\text{Shor}
$$

但量子计算对对称密码的影响完全不同。

AES 不存在：

$$
Q=dG
$$

这种隐藏代数结构，也不存在可以直接交给 Shor 的离散对数问题。

因此下一课将进入另一类量子算法：

# Lesson 6：Grover Algorithm 与对称密码

核心问题将变成：

> 如果一个问题没有可以被 Shor 利用的代数周期结构，只能在大量候选答案中寻找目标，量子计算究竟还能快多少？

其核心路线是：

$$
\text{Unstructured Search}
\rightarrow
\text{Oracle}
\rightarrow
\text{Phase Flip}
\rightarrow
\text{Amplitude Amplification}
\rightarrow
O(\sqrt N)
$$

这也将解释为什么：

$$
\text{RSA / ECDSA}
$$

在量子时代属于结构性失效，

而：

$$
AES\text{-}256
$$

仍然能够保持较高的量子安全强度。

---

# 课后思考

### 1. 为什么函数

$$
f(a,b)=aG+bQ
$$

会隐藏私钥 $d$？

从：

$$
Q=dG
$$

开始推导：

$$
f(a-d,b+1)=f(a,b)
$$

并解释：

$$
(-d,1)
$$

的含义。

---

### 2. 为什么下面集合是一个 subgroup？

$$
H=
\{
(-td,t):
t\in\mathbb Z_n
\}
$$

检查：

* 单位元；
* 封闭性；
* 逆元。

---

### 3. 假设 n=11，d=4

写出隐藏方向：

$$
(-4,1)
$$

并从任意：

$$
(a,b)
$$

开始生成几个属于同一 coset 的点。

验证这些点的：

$$
a+4b\pmod{11}
$$

是否相同。

---

### 4. 为什么二维 QFT 最终保留的不是隐藏方向本身，而是其正交方向？

从：

$$
\sum_t
\omega^{t(-du+v)}
$$

分析为什么只有：

$$
-du+v\equiv0\pmod n
$$

时不会发生 phase cancellation。

---

### 5. 假设 n=13，真实私钥 d=5

量子 Fourier Sampling 得到：

$$
u=3
$$

计算对应：

$$
v
$$

应该是多少。

然后从：

$$
(u,v)
$$

恢复：

$$
d
$$

需要先求：

$$
3^{-1}\pmod{13}
$$

。

---

### 6. 为什么 Threshold ECDSA 并不能抵抗 Shor？

需要分别说明：

MPC 保护：

$$
\text{key shares}
$$

而 Shor 使用：

$$
\text{aggregate public key}
$$

两者攻击面为什么完全不同。

---

### 7. 一个 2-of-3 MPC 钱包从未在任何设备中重构完整 d

为什么仍然存在：

$$
Q=dG
$$

并且 Shor 仍然能够恢复一个完整的：

$$
d
$$

？

这说明：

$$
\text{distributed secret storage}
$$

和：

$$
\text{mathematical one-wayness}
$$

之间是什么关系？

---

### 8. 为什么 BIP340 Schnorr 与 ECDSA 在 Shor 面前本质相同？

不要比较两个签名公式的细节。

从二者共同依赖的：

$$
Q=dG
$$

分析。

---

### 9. 为什么 Shor 被称为“结构提取”而不是“量子暴力搜索”？

尝试完整描述：

$$
Q=dG
$$

到：

$$
d
$$

之间的：

$$
\text{Hidden Subgroup}
\rightarrow
\text{Fourier Sampling}
$$

路线。

---

### 10. 最重要的一道思考题

RSA 中，Shor 寻找：

$$
r
$$

满足：

$$
f(x+r)=f(x)
$$

ECDLP 中，Shor 寻找：

$$
(-d,1)
$$

满足：

$$
f(a-d,b+1)=f(a,b)
$$

两者表面上一个是“周期”，一个是“方向”。

为什么从更高层数学结构看，它们实际上是同一类问题？

如果可以用一句话概括，那么答案应当接近：

> 它们都在寻找一个使函数保持不变的隐藏 Abelian subgroup。

理解这一点，也就真正理解了 Shor Algorithm 的核心思想。
