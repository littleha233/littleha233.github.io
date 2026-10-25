---
title: 门限签名协议（九）：tss-lib v2.0.2源码与协议映射
date: '2026-10-25 13:14:49'
description: 阅读门限签名源码，需要把论文中的数学阶段，对应到状态机、消息类型和实际校验。仅根据函数名称猜测协议，容易把实现轮次、通信轮次和论文版本混在一起。
categories:
  - 密码学与安全
tags:
  - 现代密码学与钱包安全系列
content_type: article
disableNunjucks: true
---

# 门限签名协议（九）：tss-lib v2.0.2源码与协议映射

阅读门限签名源码，需要把论文中的数学阶段，对应到状态机、消息类型和实际校验。仅根据函数名称猜测协议，容易把实现轮次、通信轮次和论文版本混在一起。

本文核对 bnb-chain/tss-lib 的 v2.0.2 标签，标签指向 commit 为 28d0622477bfe05ed2c950d2728d8c4ace70a0a0。以下结论限定于这个公开版本，不代表任何部署分支都完全相同，也不是完整安全审计。

## 一、先确认协议路线与门限记号

该版本 README 明确写明，ECDSA 基于 Gennaro–Goldfeder CCS 2018，即 GG18 路线；EdDSA 使用独立实现。不能因为库发布于较晚时间，就把它称为 GG20 或 CGGMP。

库中的 threshold 参数还需要特别注意。README 说明签名需要 threshold 加一名参与者。因此，业务所说的 2-of-3，对应的库参数为 threshold 等于 1。

阅读时最好分别记录“实际需要几方”和“代码参数值”，不要把论文、业务和 API 中的字母直接混用。

## 二、通信轮次与本地完成阶段

| 流程 | 发送协议消息的阶段 | 后续本地阶段 |
| --- | --- | --- |
| ECDSA 建钥 | round_1 至 round_3 | round_4 验证 Paillier 证明并输出保存数据 |
| ECDSA 签名 | round_1 至 round_9 | finalize 聚合、规范化并验签 |
| EdDSA 建钥 | round_1 至 round_2 | round_3 验证并输出保存数据 |
| EdDSA 签名 | round_1 至 round_3 | finalize 聚合并验证结果 |

例如，目录中存在 ECDSA 建钥的 round_4.go，并不表示它会再广播第四批消息。该文件的 CanAccept 明确不期待输入消息，Start 使用第三轮已收到的证明完成本地验证。

因此，“三轮建钥”与“代码有四个 round 文件”可以同时成立。

## 三、ECDSA签名的九轮分别做什么

下表按相应 round 文件的 Start 行为概括。某轮开始时会验证前一轮输入，所以“发送内容”和“验证时机”需要连着阅读。

| 轮次 | 主要发送内容或动作 | 对应目的 |
| --- | --- | --- |
| 1 | 点对点发送 MtA 初始密文与范围证明，广播随机点承诺 | 固定随机输入并启动秘密乘法 |
| 2 | 返回两组 MtA 响应及证明 | 分别处理随机量乘积与密钥相关乘积 |
| 3 | 验证 MtA 响应，构造乘积份额，广播 theta | 聚合形成可公开的掩蔽乘积 |
| 4 | 聚合 theta 并求逆，公开随机点承诺及知识证明 | 为恢复签名点准备可验证输入 |
| 5 | 检查公开点，计算 R 和本地签名贡献，再广播辅助点承诺 | 进入贡献一致性验证 |
| 6 | 打开辅助承诺，发送相关知识证明 | 证明此前承诺的值与秘密计算有关 |
| 7 | 验证前一轮输入，构造 U、T 等辅助点并承诺 | 继续检查整体签名关系 |
| 8 | 公开 U、T 的承诺 | 使各方执行最终一致性检查 |
| 9 | 检查 U、T 聚合关系，广播本地签名贡献 | 允许最终聚合 |

第一轮注释明确标识 GG18。第三轮中的 theta、sigma 分别来自两组 MtA 结果，不能仅凭“都是大整数”把它们互换。

## 四、把数学核心对应到变量

为说明代码语义，设所有参与方代码中的 k 之和为 K，gamma 之和为 GammaScalar，经签名准备处理后的私钥加法份额之和为 x。

在相关聚合值非零、逆元存在且协议检查通过的条件下，该实现的中间关系可以概括为：

$$
\theta=K\cdot\operatorname{GammaScalar}\pmod n,
\qquad
\sum_i\sigma_i=Kx\pmod n.
$$

第四轮准备 theta 的逆。第五轮聚合各方的 gamma 对应点，再乘该逆：

$$
R
=
\theta^{-1}\operatorname{GammaScalar}G
=
K^{-1}G.
$$

因此，代码中的 K 对应普通单机 ECDSA 一次性标量的逆。随后本地贡献满足：

$$
s_i=e\,k_i+r\,\sigma_i\pmod n.
$$

这解释了为什么直接把单机公式中的 k 与源码变量 k 当成同一个量，会产生错误推导。第五轮代码使用 R 的横坐标参与模 n 的乘法，意义上对应签名分量 r。

## 五、建钥证明与消息检查在哪里

ECDSA 建钥第一轮准备多项式承诺、Paillier 公钥及 DLN 证明。第二轮检查参数和 DLN，发送私密份额及因子证明，广播承诺公开值和模数证明。第三轮检查承诺、VSS 份额、modproof 和 facproof，生成公开份额与总公钥，并广播 Paillier 证明；第四轮验证后才输出保存数据。

源码存在 NoProofMod、NoProofFac 等兼容路径。实际安全配置需要核对调用参数、保存数据来源和部署代码，不能仅因目录里存在证明实现，就断言所有部署都会执行全部检查。

签名路径中的 AliceInit、BobMid、AliceEnd 及带 WC 的变体位于 crypto/mta。阅读时应从调用点追到具体证明关系，再反向检查消息反序列化与错误传播。

## 六、完成处理与应用层边界

ECDSA finalize 聚合第九轮贡献，执行 low-S 处理，并相应调整 recovery 位，然后调用普通 ECDSA 验证，成功后才输出结果。

EdDSA 第一轮则调用随机源生成本地签名秘密，再承诺相应点。因此，该实现不能描述为照搬单机 Ed25519 的确定性 nonce 派生。

另一个关键边界是会话。ECDSA 签名的 getSSID 根据曲线、参与者、公开份额、辅助参数和内部计数等计算上下文；第一轮把 ssidNonce 设为零。业务订单标识并不自动成为该函数输入。

README 因而要求应用层提供独立执行标识、认证与保密通信、可靠广播，以及超时和错误处理。库内证明上下文与传输层业务会话，需要分别核对。

## 七、一个可复核的阅读方法

对每个 round，依次查看 Start、CanAccept、Update、NextRound，再沿 NewSignRound 消息构造函数检查字段。最后回到测试，确认模拟网络何时把消息交给下一方。

例如，观察第五轮已经计算了本地签名贡献，不能据此删除第六至第九轮。后续阶段承担的验证职责仍然存在，最终数值出现得早，并不意味着协议已经安全完成。

本篇完成的是版本固定的结构映射。具体修改、侧信道评估和异常输入审计，还需逐项建立额外证据。

## 温习自测

1. 2-of-3 在该版本中应如何设置 threshold？
2. 为什么 ECDSA 建钥有 round_4.go，却常被称为三轮通信？
3. 源码 k 与普通 ECDSA 签名标量是什么关系？
4. 为什么不能在第五轮得到签名贡献后直接结束？
5. 库内 SSID 与应用层订单会话分别需要检查什么？

## 参考资料

1. [v2.0.2 标签指向的 Git 对象](https://api.github.com/repos/bnb-chain/tss-lib/git/ref/tags/v2.0.2)。
2. [固定版本 README](https://github.com/bnb-chain/tss-lib/blob/v2.0.2/README.md)。
3. [ECDSA signing 目录](https://github.com/bnb-chain/tss-lib/tree/v2.0.2/ecdsa/signing)，重点核对 round_1 至 round_9、prepare、rounds、finalize。
4. [ECDSA keygen 目录](https://github.com/bnb-chain/tss-lib/tree/v2.0.2/ecdsa/keygen)。
5. [EdDSA signing 目录](https://github.com/bnb-chain/tss-lib/tree/v2.0.2/eddsa/signing)。
6. [GG18 原论文：Fast Multiparty Threshold ECDSA with Fast Trustless Setup](https://eprint.iacr.org/2019/114)。



---

系列阅读：[系列总目录](/posts/cryptography-wallet-series/) · [上一篇](/posts/crypto-08-08-cggmp/) · [下一篇](/posts/crypto-08-10-offline-mpc/)
