---
title: 欧拉函数
date: '2026-09-20 02:04:25'
description: ''
categories:
  - 数学
tags:
  - 代码片段
content_type: snippet
disableNunjucks: true
---

# 欧拉函数 $\varphi(n)$：从“互质计数”到 RSA 与 Shor 算法

欧拉函数（Euler's Totient Function）是初等数论中一个看似简单、实际上极其重要的函数。它的定义只有一句话：

> $\varphi(n)$ 表示 $1$ 到 $n$ 之间与 $n$ 互质的正整数个数。

但从这个简单的“计数问题”出发，会自然连接到互质、模运算、乘法逆元、有限群、欧拉定理、费马小定理、RSA，甚至 Shor 量子算法中的周期寻找。

因此，真正理解欧拉函数，不应该只记住

$$
\varphi(n)=n\prod_{p\mid n}\left(1-\frac1p\right)
$$

而应该理解：

> **为什么这个公式成立，它在数什么，以及它为什么会出现在密码学中。**

本文从最基本的互质开始，逐渐深入到群论和现代密码学。

---

## 一、从“互质”开始

在理解欧拉函数之前，首先需要理解互质。

对于两个整数 $a,b$，如果它们的最大公约数为 $1$：

$$
\gcd(a,b)=1
$$

就称 $a$ 和 $b$ **互质**。

例如：

$$
\gcd(8,15)=1
$$

所以 $8$ 和 $15$ 互质。

而：

$$
\gcd(6,15)=3
$$

所以 $6$ 和 $15$ 不互质。

这里有一个很容易混淆的地方：

> **互质并不要求两个数本身都是质数。**

例如 $8$ 和 $15$ 都是合数，但：

$$
\gcd(8,15)=1
$$

所以它们仍然互质。

---

# 二、欧拉函数到底在计算什么

欧拉函数记作：

$$
\boxed{\varphi(n)}
$$

它的定义是：

$$
\boxed{
\varphi(n)
=
\#\{\,a\mid1\leq a\leq n,\ \gcd(a,n)=1\,\}
}
$$

这里的 $#$ 表示集合中元素的数量。

对于 $n>1$，由于：

$$
\gcd(n,n)=n\neq1
$$

所以 $n$ 自己一定不会被统计。

因此也通常写成：

$$
\boxed{
\varphi(n)
=
\#\{\,a\mid1\leq a<n,\ \gcd(a,n)=1\,\}
}
$$

---

## 三、第一个例子：$\varphi(15)$

考虑：

$$
n=15
$$

检查：

$$
1,2,3,\ldots,14
$$

分别是否和 $15$ 互质。

容易得到：

$$
1,2,4,7,8,11,13,14
$$

与 $15$ 互质。

总共 $8$ 个，因此：

$$
\boxed{\varphi(15)=8}
$$

这就是欧拉函数最朴素的含义：

> 从 $1$ 到 $n-1$ 中，把和 $n$ 有公共因子的数字删掉，剩下多少个。

---

# 四、质数是最简单的情况

假设 $p$ 是质数。

例如：

$$
p=7
$$

那么：

$$
1,2,3,4,5,6
$$

全部与 $7$ 互质。

这是因为质数 $7$ 的正因子只有：

$$
1,\quad7
$$

任何小于 $7$ 的正整数都不可能和它共享一个大于 $1$ 的因子。

所以：

$$
\boxed{\varphi(p)=p-1}
$$

例如：

$$
\varphi(5)=4
$$

$$
\varphi(7)=6
$$

$$
\varphi(13)=12
$$

$$
\varphi(101)=100
$$

这是欧拉函数最基本的公式。

---

# 五、如果是质数的幂呢

接下来考虑：

$$
n=p^k
$$

其中 $p$ 是质数。

例如：

$$
n=8=2^3
$$

$1$ 到 $8$ 中，哪些数字不和 $8$ 互质？

显然是所有 $2$ 的倍数：

$$
2,4,6,8
$$

所以剩下：

$$
1,3,5,7
$$

因此：

$$
\varphi(8)=4
$$

一般情况下，在：

$$
1,2,\ldots,p^k
$$

中，一共有：

$$
p^k
$$

个整数。

其中 $p$ 的倍数有：

$$
\frac{p^k}{p}=p^{k-1}
$$

个。

所以：

$$
\varphi(p^k)
=
p^k-p^{k-1}
$$

提取 $p^k$：

$$
\boxed{
\varphi(p^k)
=
p^k\left(1-\frac1p\right)
}
$$

例如：

$$
27=3^3
$$

所以：

$$
\varphi(27)
=
27\left(1-\frac13\right)
$$

得到：

$$
\boxed{\varphi(27)=18}
$$

---

# 六、欧拉函数的通用公式

任何正整数都可以唯一分解成质因数：

$$
n
=
p_1^{\alpha_1}
p_2^{\alpha_2}
\cdots
p_k^{\alpha_k}
$$

其中：

$$
p_1,p_2,\ldots,p_k
$$

是不同的质数。

那么：

$$
\boxed{
\varphi(n)
=
n
\prod_{p\mid n}
\left(1-\frac1p\right)
}
$$

展开来看就是：

$$
\boxed{
\varphi(n)
=
n
\left(1-\frac1{p_1}\right)
\left(1-\frac1{p_2}\right)
\cdots
\left(1-\frac1{p_k}\right)
}
$$

这里：

$$
p\mid n
$$

表示 $p$ 是 $n$ 的质因子。

需要特别注意：

> 每个不同的质因子只出现一次，与它在 $n$ 中出现多少次无关。

---

# 七、为什么公式中是 $1-\frac1p$

这是欧拉函数最值得理解的地方。

仍然考虑：

$$
n=15
$$

它的质因数分解是：

$$
15=3\times5
$$

一个整数与 $15$ 不互质，当且仅当它：

* 能被 $3$ 整除；
* 或能被 $5$ 整除。

因此我们真正要做的是：

> 从 $1$ 到 $15$ 中，把 $3$ 的倍数和 $5$ 的倍数删除。

---

## 7.1 删除 3 的倍数

$1$ 到 $15$ 中，大约有：

$$
\frac13
$$

是 $3$ 的倍数。

因此保留下来的比例是：

$$
1-\frac13
=
\frac23
$$

所以还剩：

$$
15\times\frac23
$$

---

## 7.2 再删除 5 的倍数

类似地，能够被 $5$ 整除的比例为：

$$
\frac15
$$

所以保留：

$$
1-\frac15
=
\frac45
$$

最终：

$$
\varphi(15)
=
15
\times
\frac23
\times
\frac45
$$

得到：

$$
\boxed{8}
$$

于是：

$$
\boxed{
\varphi(15)
=
15
\left(1-\frac13\right)
\left(1-\frac15\right)
}
$$

---

# 八、更加严格的解释：容斥原理

刚才的解释很直观，但背后真正起作用的是数学中的**容斥原理**。

考虑：

$$
n=30
$$

有：

$$
30=2\times3\times5
$$

一个数与 $30$ 互质，就不能是：

* $2$ 的倍数；
* $3$ 的倍数；
* $5$ 的倍数。

首先有 $30$ 个数。

删除 $2$ 的倍数：

$$
\frac{30}{2}=15
$$

删除 $3$ 的倍数：

$$
\frac{30}{3}=10
$$

删除 $5$ 的倍数：

$$
\frac{30}{5}=6
$$

似乎应该：

$$
30-15-10-6
$$

但这是错误的。

因为像：

$$
6
$$

既是 $2$ 的倍数，又是 $3$ 的倍数，因此被删除了两次。

所以必须把重复删除的数字加回来。

完整的容斥公式是：

$$
\begin{aligned}
\varphi(30)
={}&30
-\frac{30}{2}
-\frac{30}{3}
-\frac{30}{5}\\
&+\frac{30}{2\cdot3}
+\frac{30}{2\cdot5}
+\frac{30}{3\cdot5}\\
&-\frac{30}{2\cdot3\cdot5}
\end{aligned}
$$

计算：

$$
30-15-10-6+5+3+2-1
$$

得到：

$$
8
$$

这实际上恰好可以因式分解为：

$$
30
\left(1-\frac12\right)
\left(1-\frac13\right)
\left(1-\frac15\right)
$$

因此：

$$
\boxed{\varphi(30)=8}
$$

与 $30$ 互质的整数就是：

$$
1,7,11,13,17,19,23,29
$$

---

# 九、一个具体计算：$\varphi(360)$

先进行质因数分解：

$$
360=2^3\times3^2\times5
$$

注意虽然有：

$$
2^3,\quad3^2
$$

但公式中每种质因子只出现一次：

$$
\varphi(360)
=
360
\left(1-\frac12\right)
\left(1-\frac13\right)
\left(1-\frac15\right)
$$

计算：

$$
=
360
\times
\frac12
\times
\frac23
\times
\frac45
$$

得到：

$$
\boxed{\varphi(360)=96}
$$

---

# 十、为什么质因子的指数不重复出现

这是初学欧拉函数时很容易产生的疑问。

例如：

$$
12=2^2\times3
$$

为什么不是：

$$
12
\left(1-\frac12\right)^2
\left(1-\frac13\right)?
$$

原因在于：

> 我们需要排除的不是“被多少个 $2$ 整除”，而只是“是不是 $2$ 的倍数”。

只要一个数能够被 $2$ 整除，它就已经和 $12$ 不互质。

无论它是：

$$
2,\quad4,\quad8
$$

都已经属于需要排除的集合。

因此只需要排除一次：

$$
\left(1-\frac12\right)
$$

所以：

$$
\varphi(12)
=
12
\left(1-\frac12\right)
\left(1-\frac13\right)
$$

得到：

$$
\boxed{4}
$$

对应：

$$
1,5,7,11
$$

---

# 十一、从计数问题进入模运算

到目前为止，欧拉函数似乎只是一个“统计互质整数数量”的函数。

但真正有趣的事情从模运算开始。

考虑：

$$
\mathbb Z_n
=
\{0,1,2,\ldots,n-1\}
$$

它表示模 $n$ 意义下的所有剩余类。

例如：

$$
\mathbb Z_{15}
=
\{0,1,2,\ldots,14\}
$$

现在提出一个问题：

> 哪些元素可以做除法？

更准确地说：

> 哪些元素拥有乘法逆元？

---

# 十二、模逆元

如果存在 $b$，使得：

$$
ab\equiv1\pmod n
$$

那么就称 $b$ 是 $a$ 在模 $n$ 下的乘法逆元。

记作：

$$
a^{-1}\pmod n
$$

例如在模 $15$ 下：

$$
2\times8=16
$$

而：

$$
16\equiv1\pmod{15}
$$

所以：

$$
\boxed{
2^{-1}\equiv8\pmod{15}
}
$$

但是 $3$ 有没有逆元？

假设存在 $x$：

$$
3x\equiv1\pmod{15}
$$

左边永远是 $3$ 的倍数，而右边模 $15$ 是 $1$。

不可能成立。

所以 $3$ 没有逆元。

---

# 十三、什么时候存在模逆元

这里有一个极其重要的定理：

$$
\boxed{
a\text{ 在模 }n\text{ 下存在乘法逆元}
\iff
\gcd(a,n)=1
}
$$

也就是说：

> **互质和可逆，本质上是同一件事。**

为什么？

如果：

$$
\gcd(a,n)=1
$$

根据裴蜀定理，一定存在整数 $x,y$：

$$
ax+ny=1
$$

两边模 $n$：

$$
ax\equiv1\pmod n
$$

因此 $x$ 就是 $a$ 的逆元。

---

# 十四、$\mathbb Z_n^*$：欧拉函数真正的代数意义

把 $\mathbb Z_n$ 中所有可逆元素取出来：

$$
\mathbb Z_n^*
=
\{a\in\mathbb Z_n\mid\gcd(a,n)=1\}
$$

例如：

$$
\mathbb Z_{15}^*
=
\{1,2,4,7,8,11,13,14\}
$$

一共有 $8$ 个元素。

因此：

$$
\boxed{
|\mathbb Z_{15}^*|=8=\varphi(15)
}
$$

一般而言：

$$
\boxed{
|\mathbb Z_n^*|=\varphi(n)
}
$$

这里的 $|\cdot|$ 表示集合中的元素个数。

这时，欧拉函数拥有了一个比“数有多少个互质整数”更深刻的解释：

> **$\varphi(n)$ 是模 $n$ 乘法群 $\mathbb Z_n^*$ 的大小。**

数学上把群中元素的数量称为：

> **群的阶（order of a group）**

因此：

$$
\boxed{
\varphi(n)
=
\mathbb Z_n^*\text{ 的群阶}
}
$$

---

# 十五、一个“阶”字带来的两个概念

这里必须区分两个非常容易混淆的概念。

## 群的阶

群里面有多少个元素。

例如：

$$
\mathbb Z_{15}^*
=
\{1,2,4,7,8,11,13,14\}
$$

因此：

$$
|\mathbb Z_{15}^*|=8
$$

也就是：

$$
\varphi(15)=8
$$

---

## 元素的阶

对于一个元素 $a$，寻找最小正整数 $r$，使得：

$$
a^r\equiv1\pmod n
$$

这个 $r$ 称为 $a$ 的阶：

$$
\operatorname{ord}_n(a)
$$

例如模 $15$ 下：

$$
2^1\equiv2
$$

$$
2^2\equiv4
$$

$$
2^3\equiv8
$$

$$
2^4\equiv1
$$

因此：

$$
\boxed{
\operatorname{ord}_{15}(2)=4
}
$$

所以：

$$
\boxed{
\text{群的阶}=8
}
$$

但：

$$
\boxed{
2\text{ 的阶}=4
}
$$

二者不是一个概念。

---

# 十六、欧拉定理

现在终于可以理解欧拉函数最重要的应用。

如果：

$$
\gcd(a,n)=1
$$

那么：

$$
\boxed{
a^{\varphi(n)}
\equiv1\pmod n
}
$$

这就是著名的：

> **欧拉定理（Euler's Theorem）**

例如：

$$
n=15
$$

有：

$$
\varphi(15)=8
$$

取：

$$
a=2
$$

因为：

$$
\gcd(2,15)=1
$$

所以：

$$
2^8\equiv1\pmod{15}
$$

验证：

$$
2^8=256
$$

而：

$$
256=17\times15+1
$$

所以：

$$
256\bmod15=1
$$

成立。

---

# 十七、欧拉定理为什么成立

可以先不用群论，用一个非常漂亮的方法证明。

假设：

$$
r_1,r_2,\ldots,r_{\varphi(n)}
$$

是所有与 $n$ 互质的剩余。

也就是说：

$$
\mathbb Z_n^*
=
\{r_1,r_2,\ldots,r_{\varphi(n)}\}
$$

现在选择：

$$
\gcd(a,n)=1
$$

把每个元素乘以 $a$：

$$
ar_1,ar_2,\ldots,ar_{\varphi(n)}
$$

然后全部模 $n$。

一个关键事实是：

> 这些数字虽然顺序发生了变化，但仍然恰好是原来的整个 $\mathbb Z_n^*$。

也就是说，乘以 $a$ 只是对群中的元素做了一次重新排列。

因此：

$$
r_1r_2\cdots r_{\varphi(n)}
\equiv
(ar_1)(ar_2)\cdots(ar_{\varphi(n)})
\pmod n
$$

右边：

$$
=
a^{\varphi(n)}
r_1r_2\cdots r_{\varphi(n)}
$$

所以：

$$
r_1\cdots r_{\varphi(n)}
\equiv
a^{\varphi(n)}
r_1\cdots r_{\varphi(n)}
\pmod n
$$

由于所有 $r_i$ 都与 $n$ 互质，所以乘积存在逆元，可以约掉：

$$
\boxed{
a^{\varphi(n)}\equiv1\pmod n
}
$$

欧拉定理得证。

---

# 十八、用群论重新理解欧拉定理

进入抽象代数之后，证明会变得更加简洁。

我们已经知道：

$$
|\mathbb Z_n^*|=\varphi(n)
$$

设：

$$
r=\operatorname{ord}_n(a)
$$

根据有限群中的**拉格朗日定理**：

> 元素的阶一定整除群的阶。

因此：

$$
\boxed{
r\mid\varphi(n)
}
$$

所以存在整数 $k$：

$$
\varphi(n)=kr
$$

又因为：

$$
a^r\equiv1\pmod n
$$

所以：

$$
a^{\varphi(n)}
=
a^{kr}
=
(a^r)^k
$$

因此：

$$
a^{\varphi(n)}
\equiv1^k
\equiv1
\pmod n
$$

这就是欧拉定理。

从这个角度看，欧拉定理其实不是一个孤立的技巧，而是有限群结构的自然结果。

---

# 十九、费马小定理其实是欧拉定理的特殊情况

费马小定理说：

如果 $p$ 是质数，并且：

$$
p\nmid a
$$

那么：

$$
\boxed{
a^{p-1}\equiv1\pmod p
}
$$

为什么指数恰好是：

$$
p-1
$$

？

因为质数满足：

$$
\varphi(p)=p-1
$$

把它代入欧拉定理：

$$
a^{\varphi(p)}
\equiv1\pmod p
$$

立刻得到：

$$
a^{p-1}\equiv1\pmod p
$$

所以从结构上看：

$$
\boxed{
\text{费马小定理}
=
\text{欧拉定理在模质数情形下的特殊版本}
}
$$

---

# 二十、欧拉函数的乘法性

欧拉函数还有一个极其重要的性质。

如果：

$$
\gcd(m,n)=1
$$

那么：

$$
\boxed{
\varphi(mn)
=
\varphi(m)\varphi(n)
}
$$

例如：

$$
15=3\times5
$$

因为：

$$
\gcd(3,5)=1
$$

所以：

$$
\varphi(15)
=
\varphi(3)\varphi(5)
$$

得到：

$$
2\times4=8
$$

---

## 20.1 这里的前提非常重要

欧拉函数是**乘法函数**，但不是**完全乘法函数**。

例如：

$$
\varphi(4)=2
$$

而：

$$
\varphi(2)\varphi(2)=1
$$

显然：

$$
2\neq1
$$

原因在于：

$$
\gcd(2,2)\neq1
$$

所以：

$$
\varphi(mn)=\varphi(m)\varphi(n)
$$

只有在：

$$
\boxed{\gcd(m,n)=1}
$$

时才能直接使用。

---

# 二十一、为什么欧拉函数具有乘法性

更深层的原因来自中国剩余定理。

如果：

$$
\gcd(m,n)=1
$$

中国剩余定理告诉我们：

$$
\mathbb Z_{mn}
\cong
\mathbb Z_m\times\mathbb Z_n
$$

对于可逆元素，同样有：

$$
\boxed{
\mathbb Z_{mn}^*
\cong
\mathbb Z_m^*
\times
\mathbb Z_n^*
}
$$

所以：

$$
|\mathbb Z_{mn}^*|
=
|\mathbb Z_m^*|
\cdot
|\mathbb Z_n^*|
$$

代入：

$$
|\mathbb Z_k^*|=\varphi(k)
$$

便得到：

$$
\boxed{
\varphi(mn)
=
\varphi(m)\varphi(n)
}
$$

因此，欧拉函数的乘法性并不是偶然出现的计算规律。

它反映的是：

> **互质模数下的模乘法群可以通过中国剩余定理分解。**

---

# 二十二、RSA 为什么一定会出现欧拉函数

欧拉函数最著名的密码学应用就是 RSA。

RSA 首先选择两个大质数：

$$
p,q
$$

然后构造：

$$
N=pq
$$

因为 $p,q$ 都是质数：

$$
\varphi(p)=p-1
$$

$$
\varphi(q)=q-1
$$

而且：

$$
\gcd(p,q)=1
$$

所以：

$$
\boxed{
\varphi(N)
=
(p-1)(q-1)
}
$$

展开：

$$
\varphi(N)
=
pq-p-q+1
$$

由于：

$$
pq=N
$$

所以：

$$
\boxed{
\varphi(N)
=
N-p-q+1
}
$$

---

# 二十三、RSA 中公钥和私钥的关系

RSA 选择一个公钥指数：

$$
e
$$

要求：

$$
\gcd(e,\varphi(N))=1
$$

因此 $e$ 在模 $\varphi(N)$ 下存在逆元。

计算：

$$
d
=
e^{-1}
\pmod{\varphi(N)}
$$

于是：

$$
\boxed{
ed\equiv1\pmod{\varphi(N)}
}
$$

这意味着存在整数 $k$：

$$
ed
=
1+k\varphi(N)
$$

RSA 的公钥通常包含：

$$
(N,e)
$$

私钥则掌握：

$$
d
$$

以及通常还会保存 $p,q$ 等 CRT 参数。

---

# 二十四、欧拉定理为什么能解释 RSA 解密

RSA 加密：

$$
c
=
m^e
\bmod N
$$

解密：

$$
m'
=
c^d
\bmod N
$$

代入：

$$
m'
=
(m^e)^d
=
m^{ed}
$$

因为：

$$
ed=1+k\varphi(N)
$$

所以：

$$
m^{ed}
=
m^{1+k\varphi(N)}
$$

进一步：

$$
=
m
\left(
m^{\varphi(N)}
\right)^k
$$

如果：

$$
\gcd(m,N)=1
$$

根据欧拉定理：

$$
m^{\varphi(N)}
\equiv1\pmod N
$$

于是：

$$
m^{ed}
\equiv
m\cdot1^k
\pmod N
$$

最终：

$$
\boxed{
m^{ed}\equiv m\pmod N
}
$$

这解释了 RSA 为什么可以恢复原始消息。

严格来说，RSA 对所有合法消息的正确性证明通常进一步使用 CRT，从而覆盖 $\gcd(m,N)\neq1$ 的情形。

---

# 二十五、为什么知道 $\varphi(N)$ 会破坏 RSA

这一点非常有意思。

对于：

$$
N=pq
$$

有：

$$
\varphi(N)
=
(p-1)(q-1)
$$

展开：

$$
\varphi(N)
=
pq-p-q+1
$$

又因为：

$$
pq=N
$$

所以：

$$
p+q
=
N-\varphi(N)+1
$$

如果攻击者同时知道：

$$
N
$$

和：

$$
\varphi(N)
$$

那么就知道：

$$
p+q
$$

以及：

$$
pq
$$

于是 $p,q$ 是方程：

$$
x^2-(p+q)x+pq=0
$$

的两个根。

代入：

$$
x^2-
\bigl(N-\varphi(N)+1\bigr)x
+
N
=
0
$$

解这个二次方程即可得到：

$$
p,q
$$

所以对于标准 RSA 半素数：

$$
\boxed{
\text{知道 }\varphi(N)
\text{ 基本就意味着能够分解 }N
}
$$

这也是为什么 RSA 中 $\varphi(N)$ 不能公开。

---

# 二十六、欧拉函数和 Shor 算法

现在把它连接到量子计算。

Shor 整数分解算法中，会选一个：

$$
a
$$

满足：

$$
\gcd(a,N)=1
$$

然后寻找最小正整数 $r$：

$$
\boxed{
a^r\equiv1\pmod N
}
$$

这个 $r$ 就是：

$$
\operatorname{ord}_N(a)
$$

也就是 $a$ 在：

$$
\mathbb Z_N^*
$$

中的阶。

而：

$$
|\mathbb Z_N^*|
=
\varphi(N)
$$

根据拉格朗日定理：

$$
\boxed{
\operatorname{ord}_N(a)
\mid
\varphi(N)
}
$$

也就是：

$$
\boxed{
r\mid\varphi(N)
}
$$

例如：

$$
N=15
$$

有：

$$
\varphi(15)=8
$$

选择：

$$
a=2
$$

计算：

$$
2^1\equiv2
$$

$$
2^2\equiv4
$$

$$
2^3\equiv8
$$

$$
2^4\equiv1
\pmod{15}
$$

所以：

$$
r=4
$$

而：

$$
4\mid8
$$

正好符合：

$$
r\mid\varphi(15)
$$

---

# 二十七、Shor 为什么不直接计算 $\varphi(N)$

这里有一个非常值得思考的问题：

> 既然 $r\mid\varphi(N)$，为什么 Shor 不直接计算 $\varphi(N)$？

原因恰恰在于：

对于 RSA：

$$
N=pq
$$

计算：

$$
\varphi(N)=(p-1)(q-1)
$$

本身就需要知道：

$$
p,q
$$

而 $p,q$ 正是我们想求的东西。

实际上，前面已经看到：

> 如果能够高效得到 $\varphi(N)$，基本上也就能够高效分解 $N$。

Shor 的巧妙之处是绕过了直接计算：

$$
\varphi(N)
$$

而是量子地寻找某个具体元素 $a$ 的阶：

$$
r=\operatorname{ord}_N(a)
$$

也就是寻找函数：

$$
f(x)=a^x\bmod N
$$

的周期。

因此：

$$
\boxed{
\text{Integer Factoring}
\longrightarrow
\text{Order Finding}
}
$$

而真正由量子计算负责解决的是：

$$
\boxed{
\text{Order Finding / Period Finding}
}
$$

---

# 二十八、从周期到因子

假设 Shor 找到了：

$$
a^r\equiv1\pmod N
$$

并且 $r$ 是偶数。

那么：

$$
a^r-1
\equiv0
\pmod N
$$

因为：

$$
a^r
=
\left(a^{r/2}\right)^2
$$

所以：

$$
\left(a^{r/2}\right)^2-1
\equiv0
\pmod N
$$

利用平方差：

$$
x^2-1=(x-1)(x+1)
$$

得到：

$$
\boxed{
\left(a^{r/2}-1\right)
\left(a^{r/2}+1\right)
\equiv0
\pmod N
}
$$

于是可以计算：

$$
\gcd\left(a^{r/2}-1,N\right)
$$

和：

$$
\gcd\left(a^{r/2}+1,N\right)
$$

从而得到 $N$ 的非平凡因子。

例如：

$$
N=15,\qquad a=2,\qquad r=4
$$

那么：

$$
a^{r/2}=2^2=4
$$

于是：

$$
\gcd(4-1,15)=3
$$

以及：

$$
\gcd(4+1,15)=5
$$

所以：

$$
\boxed{15=3\times5}
$$

这条知识链现在就非常清晰了：

$$
\boxed{
\varphi(N)
\rightarrow
\mathbb Z_N^*
\rightarrow
\text{群阶}
\rightarrow
\text{元素阶}
\rightarrow
\text{周期}
\rightarrow
\text{Shor}
}
$$

---

# 二十九、$\frac{\varphi(n)}n$ 的概率意义

因为：

$$
\varphi(n)
$$

表示 $1$ 到 $n$ 中与 $n$ 互质的数的数量，所以：

$$
\boxed{
\frac{\varphi(n)}n
}
$$

可以理解为：

> 随机选取一个整数模 $n$ 后，它与 $n$ 互质的概率。

根据欧拉函数公式：

$$
\varphi(n)
=
n
\prod_{p\mid n}
\left(1-\frac1p\right)
$$

两边除以 $n$：

$$
\boxed{
\frac{\varphi(n)}n
=
\prod_{p\mid n}
\left(1-\frac1p\right)
}
$$

例如：

$$
n=15
$$

那么：

$$
\frac{\varphi(15)}{15}
=
\frac8{15}
$$

约为：

$$
53.3\%
$$

也就是说，随机选一个模 $15$ 的整数，大约有一半拥有乘法逆元。

---

# 三十、一个重要恒等式

欧拉函数还有一个很漂亮的性质：

$$
\boxed{
\sum_{d\mid n}\varphi(d)=n
}
$$

其中：

$$
d\mid n
$$

表示 $d$ 是 $n$ 的正约数。

例如：

$$
n=12
$$

约数为：

$$
1,2,3,4,6,12
$$

于是：

$$
\varphi(1)
+
\varphi(2)
+
\varphi(3)
+
\varphi(4)
+
\varphi(6)
+
\varphi(12)
$$

分别为：

$$
1+1+2+2+2+4
$$

得到：

$$
12
$$

即：

$$
\boxed{
\sum_{d\mid12}\varphi(d)=12
}
$$

这个恒等式在更深入的数论中会自然连接到 Möbius 反演。

---

# 三十一、从欧拉函数进一步得到 Möbius 反演公式

由：

$$
\sum_{d\mid n}\varphi(d)=n
$$

使用 Möbius inversion，可以反推出：

$$
\boxed{
\varphi(n)
=
n
\sum_{d\mid n}
\frac{\mu(d)}d
}
$$

其中：

$$
\mu(d)
$$

是 Möbius 函数。

这又可以进一步推出：

$$
\varphi(n)
=
n
\prod_{p\mid n}
\left(1-\frac1p\right)
$$

因此从解析数论的角度来看，欧拉函数的乘积公式也可以视为 Möbius 反演和质因数结构的结果。

这一层并不是理解 RSA 或 Shor 所必须的，但它说明：

> 欧拉函数并不是一个孤立的小公式，而是整个乘法数论体系中的核心对象。

---

# 三十二、欧拉函数与 Carmichael 函数

继续深入，还会遇到一个和欧拉函数非常相似的函数：

$$
\lambda(n)
$$

称为 **Carmichael 函数**。

欧拉定理告诉我们：

$$
a^{\varphi(n)}
\equiv1
\pmod n
$$

但：

$$
\varphi(n)
$$

通常并不是让所有可逆元素同时回到 $1$ 的最小指数。

Carmichael 函数定义为：

> 对所有 $\gcd(a,n)=1$ 的 $a$，使

$$
a^{\lambda(n)}
\equiv1\pmod n
$$

成立的最小正整数。

---

## 32.1 一个例子：$n=15$

我们知道：

$$
\varphi(15)=8
$$

所以欧拉定理保证：

$$
a^8\equiv1\pmod{15}
$$

但实际上对于所有：

$$
a\in\mathbb Z_{15}^*
$$

已经有：

$$
a^4\equiv1\pmod{15}
$$

因此：

$$
\boxed{
\lambda(15)=4
}
$$

显然：

$$
\lambda(15)<\varphi(15)
$$

---

## 32.2 RSA 中的 Carmichael 函数

对于不同质数：

$$
N=pq
$$

有：

$$
\boxed{
\lambda(N)
=
\operatorname{lcm}(p-1,q-1)
}
$$

其中：

$$
\operatorname{lcm}
$$

表示最小公倍数。

因此在现代 RSA 的数学描述中，经常使用：

$$
ed\equiv1\pmod{\lambda(N)}
$$

而不一定使用：

$$
ed\equiv1\pmod{\varphi(N)}
$$

$\lambda(N)$ 描述的是整个群的指数，因此比 $\varphi(N)$ 更精确。

---

# 三十三、欧拉函数和 Carmichael 函数的区别

可以这样理解：

欧拉函数：

$$
\boxed{
\varphi(n)
=
\mathbb Z_n^*\text{ 中有多少个元素}
}
$$

Carmichael 函数：

$$
\boxed{
\lambda(n)
=
\mathbb Z_n^*\text{ 中所有元素阶的最小公倍数}
}
$$

而具体元素 $a$ 的阶：

$$
\boxed{
\operatorname{ord}_n(a)
}
$$

于是存在非常漂亮的关系：

$$
\boxed{
\operatorname{ord}_n(a)
\mid
\lambda(n)
\mid
\varphi(n)
}
$$

例如：

$$
n=15,\quad a=2
$$

有：

$$
\operatorname{ord}_{15}(2)=4
$$

$$
\lambda(15)=4
$$

$$
\varphi(15)=8
$$

因此：

$$
4\mid4\mid8
$$

---

# 三十四、欧拉函数的边界情况：$\varphi(1)$

按照数学上的约定：

$$
\boxed{\varphi(1)=1}
$$

这个定义初看可能有些奇怪。

但它可以让很多数论公式保持统一。

例如：

$$
\sum_{d\mid n}\varphi(d)=n
$$

当：

$$
n=1
$$

时：

$$
\varphi(1)=1
$$

正好成立。

---

# 三十五、几个常见误区

## 误区一：互质意味着两个数都是质数

错误。

例如：

$$
8,\quad15
$$

都是合数，但：

$$
\gcd(8,15)=1
$$

因此互质。

---

## 误区二：$\varphi(n)$ 等于质数的数量

错误。

$\varphi(n)$ 统计的是：

> 与 $n$ 互质的整数数量。

并不是统计小于 $n$ 的质数。

例如：

$$
\varphi(15)=8
$$

其中：

$$
1,4,8,14
$$

显然都不是质数。

---

## 误区三：欧拉函数是完全乘法函数

错误。

只有：

$$
\gcd(m,n)=1
$$

时才有：

$$
\varphi(mn)=\varphi(m)\varphi(n)
$$

---

## 误区四：$\varphi(n)$ 就是元素的周期

错误。

$\varphi(n)$ 是群：

$$
\mathbb Z_n^*
$$

的大小。

而具体元素 $a$ 的周期是：

$$
\operatorname{ord}_n(a)
$$

它们满足：

$$
\operatorname{ord}_n(a)\mid\varphi(n)
$$

但一般并不相等。

例如：

$$
\varphi(15)=8
$$

而：

$$
\operatorname{ord}_{15}(2)=4
$$

---

# 三十六、如何快速计算 $\varphi(n)$

实际做题时，可以遵循一个固定流程。

例如计算：

$$
\varphi(840)
$$

第一步，质因数分解：

$$
840
=
2^3\times3\times5\times7
$$

第二步，只取不同质因子：

$$
2,3,5,7
$$

第三步代入：

$$
\varphi(840)
=
840
\left(1-\frac12\right)
\left(1-\frac13\right)
\left(1-\frac15\right)
\left(1-\frac17\right)
$$

第四步计算：

$$
=
840
\times
\frac12
\times
\frac23
\times
\frac45
\times
\frac67
$$

依次约分：

$$
840\times\frac12=420
$$

$$
420\times\frac23=280
$$

$$
280\times\frac45=224
$$

$$
224\times\frac67=192
$$

因此：

$$
\boxed{\varphi(840)=192}
$$

---

# 三十七、如何真正建立对欧拉函数的直觉

学完公式之后，可以把欧拉函数分成三个层次理解。

### 第一层：计数

$$
\varphi(n)
$$

表示：

> 有多少整数和 $n$ 互质。

这是最初级的理解。

---

### 第二层：可逆性

因为：

$$
\gcd(a,n)=1
$$

等价于：

$$
a^{-1}\pmod n
$$

存在，所以：

$$
\varphi(n)
$$

其实是在统计：

> 模 $n$ 世界里，有多少数字能够做乘法除法。

---

### 第三层：群论

这些可逆元素组成：

$$
\mathbb Z_n^*
$$

于是：

$$
\boxed{
\varphi(n)=|\mathbb Z_n^*|
}
$$

欧拉函数就变成：

> **有限模乘法群的群阶。**

到了这一层之后：

* 欧拉定理；
* 费马小定理；
* RSA；
* 元素阶；
* 周期寻找；
* Shor 算法；

都开始自然地连接起来。

---

# 三十八、把整个知识体系串起来

可以把欧拉函数周围的数学结构整理成下面这条链路：

$$
\gcd(a,n)=1
$$

意味着：

$$
a\text{ 和 }n\text{ 互质}
$$

也等价于：

$$
a^{-1}\pmod n
\text{ 存在}
$$

因此所有这样的 $a$ 构成：

$$
\mathbb Z_n^*
$$

而：

$$
|\mathbb Z_n^*|
=
\varphi(n)
$$

所以：

$$
\boxed{
\varphi(n)
=
n
\prod_{p\mid n}
\left(1-\frac1p\right)
}
$$

进一步，根据有限群理论：

$$
\operatorname{ord}_n(a)
\mid
\varphi(n)
$$

从而：

$$
a^{\varphi(n)}
\equiv1\pmod n
$$

得到欧拉定理。

当 $n=p$ 为质数时：

$$
\varphi(p)=p-1
$$

于是退化为费马小定理：

$$
a^{p-1}
\equiv1\pmod p
$$

对于 RSA：

$$
N=pq
$$

有：

$$
\varphi(N)
=
(p-1)(q-1)
$$

通过：

$$
ed\equiv1\pmod{\varphi(N)}
$$

构造公私钥关系。

对于 Shor：

$$
r=\operatorname{ord}_N(a)
$$

满足：

$$
r\mid\varphi(N)
$$

量子算法负责高效寻找这个隐藏周期 $r$。

最终整个逻辑可以压缩成：

$$
\boxed{
\begin{aligned}
\text{互质}
&\longrightarrow
\text{模逆元}\\
&\longrightarrow
\mathbb Z_n^*\\
&\longrightarrow
\varphi(n)\\
&\longrightarrow
\text{有限群的阶}\\
&\longrightarrow
\text{欧拉定理}\\
&\longrightarrow
\text{RSA / Shor}
\end{aligned}
}
$$

欧拉函数最值得掌握的，并不是某一个公式，而是它揭示的一个基本事实：

> **整数模运算并不是一堆零散的取余技巧。在互质元素上，它会形成一个完整的代数结构；欧拉函数 $\varphi(n)$，正是在计算这个结构究竟有多大。**

一旦建立这个视角，$\varphi(n)$ 就不再只是“数一下有多少个互质数”，而成为理解现代公钥密码学、有限群和量子密码分析的一座桥梁。
