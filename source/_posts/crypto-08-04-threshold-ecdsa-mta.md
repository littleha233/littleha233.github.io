---
title: 门限签名协议（四）：门限 ECDSA、Paillier 与 MtA
date: '2026-10-25 13:14:54'
description: Schnorr 的响应对私钥和 nonce 呈线性关系，而 ECDSA 还包含秘密值的求逆与乘法。把私钥拆成份额后，单纯把各方计算结果相加，并不能自动得到正确的 ECDSA 签名。
categories:
  - 密码学与安全
tags:
  - 现代密码学与钱包安全系列
content_type: article
disableNunjucks: true
---

# 门限签名协议（四）：门限 ECDSA、Paillier 与 MtA

Schnorr 的响应对私钥和 nonce 呈线性关系，而 ECDSA 还包含秘密值的求逆与乘法。把私钥拆成份额后，单纯把各方计算结果相加，并不能自动得到正确的 ECDSA 签名。

Paillier 加法同态加密与乘法转加法协议 MtA，是一类门限 ECDSA 路线的重要工具。本篇解释它们如何把分散的秘密乘积变成分散的结果，同时说明“算术正确”与“恶意参与方下安全”之间的距离。

## 一、门限 ECDSA 需要处理哪些秘密运算

设曲线子群阶为素数 q，长期私钥为 x，消息代表值为 m，标准 ECDSA nonce 为 u。签名包含：

$$
\begin{aligned}
R&=uG,\\
r&=x(R)\bmod q,\\
s&=u^{-1}(m+rx)\pmod q.
\end{aligned}
$$

其中，横坐标提取发生在曲线点上。长期私钥、nonce 及其逆元都不能因合作签名而集中暴露。

如果两项秘密都采用加法份额表示，乘积会产生跨方项：

$$
(a_1+a_2)(b_1+b_2)
=a_1b_1+a_1b_2+a_2b_1+a_2b_2.
$$

各方能够计算自己的局部乘积，却不能直接得到跨方乘积。让双方交换秘密输入虽然能完成计算，却破坏了门限设计的目的。

## 二、Paillier 允许在密文上进行加法

Paillier 使用另一个整数模数 N，典型情况下它是两个大素数的乘积。明文空间模 N，密文运算模其平方。选择合适参数后，一种常见加密表示为：

$$
\operatorname{Enc}(a;\rho)
=g^{a}\rho^{N}\bmod N^{2},
\qquad g=1+N.
$$

这里的随机因子必须属于模 N 的可逆元素集合。N 不是曲线群阶 q，不能因为两个空间都出现取模就将它们混用。

其同态关系可以概括为：

$$
\begin{aligned}
\operatorname{Enc}(a;\rho_1)
\operatorname{Enc}(b;\rho_2)
&=\operatorname{Enc}(a+b;\rho_1\rho_2),\\
\operatorname{Enc}(a;\rho)^b
&=\operatorname{Enc}(ab;\rho^b).
\end{aligned}
$$

上述明文结果按模 N 理解，密文乘法按模 N 的平方理解。第二个等式里的 b 是进行运算的一方知道的标量；这不等于 Paillier 能任意相乘两份未知明文的密文。

## 三、MtA 只输出乘积的加法份额

设 Alice 持有秘密 a，同时持有某把 Paillier 私钥；Bob 持有秘密 b。基本的诚实计算结构如下：

1. Alice 用自己的公钥加密 a，把密文发给 Bob。
2. Bob 选择秘密掩码，将密文求 b 次幂，再乘以掩码的加密。
3. Alice 解密得到被掩码覆盖的乘积，Bob 保留相反数形式的份额。

用 beta 表示 Bob 的掩码：

$$
\begin{aligned}
C&=\operatorname{Enc}_{A}(a),\\
D&=C^b\operatorname{Enc}_{A}(\beta)
=\operatorname{Enc}_{A}(ab+\beta),\\
\alpha&=\operatorname{Dec}_{A}(D)\bmod q,\\
\beta'&=-\beta\bmod q.
\end{aligned}
$$

在整数嵌入与范围要求成立时，两份输出满足：

$$
\alpha+\beta'\equiv ab\pmod q.
$$

Alice 不直接获得 b，Bob 也不获得 a；双方各自得到的是乘积的一份加法分享。保密性还要求正确选择掩码分布与参数，不能仅凭最后这条等式断言成立。

## 四、一个完整的同态算术例子

使用仅供教学的 Paillier 模数 77，生成元 78，曲线标量模数取 19。Alice 的输入为 4，Bob 的输入为 6，掩码为 9。这个极小模数不提供任何安全性。

加密输入时随机因子取 2，加密掩码时取 3。直接按公式计算可得：

| 项目 | 数值 |
| --- | --- |
| Paillier 密文模数 | 5929 |
| Alice 的输入密文 C | 3406 |
| Bob 返回的密文 D | 3512 |
| Alice 解密得到的整数 | 33 |
| Alice 的标量份额 | 14 |
| Bob 的标量份额 | 10 |

因为被加密的整数乘积与掩码之和没有越过 77，最终可以检查：

$$
\begin{aligned}
4\times6+9&=33,\\
33\bmod19&=14,\\
(-9)\bmod19&=10,\\
14+10&\equiv4\times6\equiv5\pmod{19}.
\end{aligned}
$$

这验证了密文计算和掩码符号。真实参数必须保证掩码足以隐藏输入，并满足协议规定的统计与范围要求；本例中的小掩码只服务于手算。

## 五、为什么范围证明不能随意省略

如果明文计算在模 N 下发生回绕，再对 q 取模，通常不会得到整数计算后直接模 q 的结果。仍用上面的模数，取输入 10、7 和掩码 10：

$$
\begin{aligned}
10\times7+10&=80,\\
80\bmod77&=3,\\
(3-10)\bmod19&=12,\\
(10\times7)\bmod19&=13.
\end{aligned}
$$

相差的原因是两个模数并不相同。恶意参与方可以刻意选择非规定范围的输入，并观察协议成功或失败是否依赖对方秘密。

真实恶意安全 MtA 因而需要约束公钥、密文、输入范围以及相关公有值之间的一致性。零知识证明的作用，是让参与方证明遵守运算约束，又不公开秘密。证明对象、范围和安全参数必须跟随完整协议，不能把“有一个范围证明”当成充分条件。

## 六、从两方乘积到秘密求逆

对多方加法份额，每个跨方乘积可以通过 MtA 产生对应两份输出，然后与本地乘积累加，形成整体乘积的分享。注意同一对参与方的两个方向可能对应不同秘密输入，不能只计算其中一个方向。

秘密求逆也可以借助随机盲化来理解。若非零秘密 u 与非零随机秘密 gamma 都已分享，可以安全计算并公开它们的乘积 delta。再用公开 delta 的逆元缩放 gamma 的份额：

$$
\begin{aligned}
\delta&=u\gamma\pmod q,\\
u^{-1}&=\delta^{-1}\gamma\pmod q.
\end{aligned}
$$

这是解释盲化求逆的数学技巧。公开值、零值处理、随机量关联和证明要求仍需由具体协议保证，不能把这两行等式直接视为完整安全求逆服务。GG18 中常见的记号还会把标准 nonce 的逆元直接记作 k，阅读时必须先对齐语义。

## 七、实现中要维护两套不同的类型

一种有用的实现约束，是让曲线标量、Paillier 明文、Paillier 密文与曲线点具有明确类型。进入另一运算空间时，显式执行规范规定的编码、范围检查或约简，而不是让通用大整数在几个模数之间隐式流动。

同时，能解密某份 Paillier 密文，不等于允许把解密结果返回给请求者。解密属于协议内部计算，只应把规定的证明、份额或公开结果送出。否则，辅助解密接口本身可能成为攻击者可查询的预言机。

## 八、温习自测

1. 为什么加法份额相乘会出现各方无法本地计算的交叉项？
2. Paillier 的加法同态为什么不能直接理解成任意密文乘法？
3. MtA 的两份输出怎样加回秘密乘积？掩码符号为什么重要？
4. Paillier 模数和曲线群阶不同，会造成什么回绕问题？
5. 为什么一次失败的签名尝试也可能成为信息泄露渠道？

## 参考资料

1. [Paillier：Public-Key Cryptosystems Based on Composite Degree Residuosity Classes](https://link.springer.com/chapter/10.1007/3-540-48910-X_16)：加法同态加密原始论文。
2. [Gennaro、Goldfeder：2019 年 NIST 作者报告](https://csrc.nist.gov/CSRC/media/Presentations/fast-multiparty-threshold-ecdsa-with-fast-trustles/images-media/ntcw2019-gennaro-fast-multiparty-threshold-ecdsa-with-fast-trustless-setuppanel-DSS.pdf)：MtA、范围问题与门限 ECDSA 的构造直觉。
3. [Makriyannis、Peled：A Note on the Security of GG18](https://info.fireblocks.com/hubfs/A_Note_on_the_Security_of_GG.pdf)：Paillier MtA 中模数与范围约束的安全分析。


---

系列阅读：[系列总目录](/posts/cryptography-wallet-series/) · [上一篇](/posts/crypto-08-03-threshold-eddsa/) · [下一篇](/posts/crypto-08-05-gg18/)
