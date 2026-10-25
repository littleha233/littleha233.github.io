---
title: 门限签名协议（五）：GG18 的核心思想与通信过程
date: '2026-10-25 13:14:53'
description: GG18 通常指 Gennaro 与 Goldfeder 在 CCS 2018 发表的门限 ECDSA 路线。其目标是让达到门限数量的参与方合作产生普通 ECDSA 签名，同时支持无可信分发者的建钥。
categories:
  - 密码学与安全
tags:
  - 现代密码学与钱包安全系列
content_type: article
disableNunjucks: true
---

# 门限签名协议（五）：GG18 的核心思想与通信过程

GG18 通常指 Gennaro 与 Goldfeder 在 CCS 2018 发表的门限 ECDSA 路线。其目标是让达到门限数量的参与方合作产生普通 ECDSA 签名，同时支持无可信分发者的建钥。

作者的 ePrint 入口为 2019/114，并列有后续修订。本篇结合作者报告解释核心代数与通信目的，按数学阶段组织，不把阶段数量当成某个库的 round 编号。论文修订、加固证明和具体实现，需要在源码篇中分别对应。

## 一、先统一 nonce 的记号

标准 ECDSA 的秘密 nonce 在这里记为 u，私钥为 x，群阶为 q，消息代表值为 m：

$$
\begin{aligned}
R&=uG,\\
r&=x(R)\bmod q,\\
s&=u^{-1}(m+rx)\pmod q.
\end{aligned}
$$

GG18 相关资料常把标准 nonce 的逆元称为 k。本篇也采用这一约定：

$$
k=u^{-1}\pmod q.
$$

因此，后面的签名响应直接乘以 k；生成 R 时则要得到 k 的逆元乘以 G。若把这里的 k 误当成单机 ECDSA 的 nonce，会把两个步骤都读反。

## 二、建钥产生长期份额，也准备辅助密码材料

每方贡献随机秘密多项式，通过可验证的份额分发形成共同私钥的 Shamir 分享。每方保留自己的秘密份额，大家共同得到组公钥，并认可参与者和验证数据。

签名时选定参与集合后，可利用拉格朗日系数，将长期 Shamir 份额转成这次签名使用的加法份额：

$$
x=\sum_{i\in S}w_i\pmod q.
$$

这里的加权只改变本次参与集合下的计算表示，不意味着长期密钥已经被刷新。

协议还需要为 MtA 准备 Paillier 等辅助材料及相应验证机制。Paillier 私钥与签名份额都是敏感状态，但职责不同；丢失某个辅助秘密是否能够安全恢复，也必须结合实际协议判断。

## 三、签名准备：随机量、承诺与密文

每方选择本次的逆 nonce 份额与盲化份额，并对盲化份额对应的群点作承诺。概念上定义：

$$
\begin{aligned}
k&=\sum_i k_i\pmod q,\\
\gamma&=\sum_i\gamma_i\pmod q,\\
\Gamma_i&=\gamma_iG.
\end{aligned}
$$

承诺让参与方先固定相关输入，避免看到其他输入后再任意选择。Paillier 密文和零知识证明则为后续秘密乘法提供受约束的输入。

这些消息应当属于同一个密钥、参与集合和签名会话。传输层加密可以保护消息，却不能代替承诺、证明和会话验证。

## 四、MtA 构造两个关键乘积的份额

协议要获得以下两个秘密乘积的加法分享：

$$
\begin{aligned}
\delta&=k\gamma=\sum_i\delta_i\pmod q,\\
\sigma&=kx=\sum_i\sigma_i\pmod q.
\end{aligned}
$$

每方先计算自己的局部项，再通过与其他参与方的 MtA 补齐交叉项。实际发送的主要是加密输入、同态变换后的密文，以及约束这些计算的证明，而不是直接发送秘密标量。

第一组乘积用于生成 nonce 点，第二组乘积用于生成最终响应。两组运算使用的输入之间存在协议要求的关联，不能把它们视为可随意替换、独立调用的黑盒接口。

## 五、公开盲化乘积，得到 nonce 点

各方公开并组合 delta 的份额，同时按承诺规则打开并检查盲化点。由此计算：

$$
\begin{aligned}
\delta&=\sum_i\delta_i\pmod q,\\
\Gamma&=\sum_i\Gamma_i=\gamma G,\\
R&=\delta^{-1}\Gamma=k^{-1}G=uG.
\end{aligned}
$$

公开的是随机盲化后的乘积，不是 k 或 gamma 本身。若 delta 为零，逆元不存在，需要按完整协议中止并更换一次性状态；不能继续计算。

随后从 R 提取 r。点编码、点合法性和 r 的零值条件，都属于要检查的输入或输出约束。

## 六、响应份额不能在任何情况下立即公开

各方可以本地形成响应份额：

$$
s_i=mk_i+r\sigma_i\pmod q.
$$

若所有计算正确，聚合结果自然满足：

$$
\begin{aligned}
s
&=\sum_i s_i\\
&=mk+rkx\\
&=u^{-1}(m+rx)\pmod q.
\end{aligned}
$$

困难在于：恶意 MtA 输入可能使中间份额错误，而公开错误份额可能泄露信息。不能先交出全部响应，再以最终验签失败作为唯一防护。

作者方案使用随机化的一致性检验来处理这个问题。其数学目标是检查：

$$
sR=mG+rY,\qquad Y=xG.
$$

参与者先发布带随机掩码的相关群点，并通过受承诺和证明约束的后续消息检查一致性。检查通过后，才按协议公开响应份额。这里的验证目标不是完整检验算法，原文规定的掩码、证明与消息顺序必须一起保留。

| 数学阶段 | 主要通信 | 目的 |
| --- | --- | --- |
| 固定随机输入 | 承诺、加密输入及证明 | 固定本次输入，建立计算约束 |
| 秘密乘法 | MtA 密文与证明 | 构造两个乘积的加法份额 |
| 构造 nonce 点 | 公开盲化乘积、打开承诺 | 得到可公开的 R，保留秘密 nonce |
| 一致性检验 | 掩码群点、承诺与证明 | 在释放敏感响应前发现不一致 |
| 输出签名 | 响应份额与最终验证 | 组合普通 ECDSA 签名 |

## 七、用一组小参数检查代数

取曲线及基点：

$$
\begin{aligned}
y^2&=x^3+2x+2\pmod{17},\\
G&=(5,1),\qquad q=19.
\end{aligned}
$$

设私钥为 7，消息代表值为 11，标准 nonce 为 4，因此逆 nonce k 为 5。再取盲化值为 9：

$$
\begin{aligned}
\delta&=5\times9\equiv7\pmod{19},\\
\delta^{-1}&\equiv11\pmod{19},\\
R&=11(9G)=4G=(3,1).
\end{aligned}
$$

于是 r 为 3，另一个乘积为 16，最终响应为：

$$
\begin{aligned}
\sigma&=5\times7\equiv16\pmod{19},\\
s&=11\times5+3\times16\equiv8\pmod{19}.
\end{aligned}
$$

签名为数值对 3、8，可以按普通 ECDSA 等式验签。这个例子只检验聚合代数；真正安全的份额计算还要执行 MtA、承诺、证明和一致性检验。

## 八、版本、失败与安全假设

GG18 是研究路线名称，不能单凭名称断言某实现已包含哪次修订或证明加固。作者 ePrint 页面列有修订记录；后续研究也指出某些 MtA 变体中的信息泄露问题。部署评估必须同时核对论文版本、库版本与对应修复。

失败和重试是安全模型的一部分。一次中止不代表本次 nonce 或 MtA 材料没有被观察；把旧状态恢复后重新用于变化的任务，可能超出协议分析的前提。普通 ECDSA 输出兼容性，也不能证明内部执行已经安全。

## 九、温习自测

1. 本篇的 k 与标准 ECDSA nonce 之间是什么关系？
2. 为什么需要分别构造逆 nonce 与盲化值、逆 nonce 与私钥的乘积？
3. 从公开 delta 和 Gamma 推导 R 时，为什么不需要公开 gamma？
4. 为什么最终验签失败不能代替释放响应前的一致性检验？
5. 为什么论文中的数学阶段数与某个库的通信轮数可能不同？

## 参考资料

1. [Gennaro、Goldfeder：Fast Multiparty Threshold ECDSA with Fast Trustless Setup，ePrint 2019/114](https://eprint.iacr.org/2019/114)：CCS 2018 工作的作者修订入口，页面列有 2021-12-17 修订记录。
2. [作者在 NIST 2019 门限密码学研讨会的报告](https://csrc.nist.gov/CSRC/media/Presentations/fast-multiparty-threshold-ecdsa-with-fast-trustles/images-media/ntcw2019-gennaro-fast-multiparty-threshold-ecdsa-with-fast-trustless-setuppanel-DSS.pdf)：MtA、盲化求逆及分布式一致性检验的构造思路。
3. [Makriyannis、Peled：A Note on the Security of GG18](https://info.fireblocks.com/hubfs/A_Note_on_the_Security_of_GG.pdf)：MtA 变体与范围相关的信息泄露分析。


---

系列阅读：[系列总目录](/posts/cryptography-wallet-series/) · [上一篇](/posts/crypto-08-04-threshold-ecdsa-mta/) · [下一篇](/posts/crypto-08-06-gg20/)
