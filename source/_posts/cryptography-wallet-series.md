---
title: 现代密码学与钱包安全系列：总目录
date: '2026-10-25 13:16:34'
description: 本系列按十一章组织，共 49 篇独立 Markdown 文章。按下面顺序阅读，可以从数学与基础构件逐步进入签名、门限协议、硬件保护和钱包工程。
categories:
  - 密码学与安全
tags:
  - 现代密码学与钱包安全系列
content_type: article
disableNunjucks: true
---

# 现代密码学与钱包安全系列：总目录

本系列按十一章组织，共 49 篇独立 Markdown 文章。按下面顺序阅读，可以从数学与基础构件逐步进入签名、门限协议、硬件保护和钱包工程。

正文中的简短变量使用直接可读的字母，数学关系采用独立 LaTeX 公式块。各篇都包含原理解释、可核对的算例或案例、安全边界、温习自测与原始参考资料。

协议篇明确区分数学示意、具体论文版本与源码实现。tss-lib 源码映射限定于 v2.0.2；玩具参数用于理解计算，不代表生产参数。

## 章节概览

| 章节 | 篇数 |
| --- | ---: |
| 一、现代密码学总览 | 1 |
| 二、密码学数学基础 | 5 |
| 三、密码学基础构件 | 5 |
| 四、椭圆曲线密码学 | 3 |
| 五、数字签名算法 | 6 |
| 六、密钥管理与派生 | 3 |
| 七、多方计算与门限密码学基础 | 5 |
| 八、门限签名协议 | 10 |
| 九、HSM 与硬件密钥保护 | 3 |
| 十、钱包签名系统工程 | 4 |
| 十一、密码学攻击与安全实践 | 4 |

## 一、现代密码学总览

- [现代密码学总览与知识体系](/posts/crypto-01-modern-cryptography-overview/)

## 二、密码学数学基础

- [密码学数学基础（一）：模运算、模幂与模逆元](/posts/crypto-02-01-modular-arithmetic/)
- [密码学数学基础（二）：有限域、群与循环群](/posts/crypto-02-02-fields-groups/)
- [密码学数学基础（三）：离散对数与计算困难假设](/posts/crypto-02-03-discrete-log/)
- [密码学数学基础（四）：多项式与拉格朗日插值](/posts/crypto-02-04-polynomials-interpolation/)
- [密码学数学基础（五）：概率、熵与安全强度](/posts/crypto-02-05-probability-entropy/)

## 三、密码学基础构件

- [密码学基础构件（一）：哈希与 HMAC](/posts/crypto-03-01-hash-hmac/)
- [密码学基础构件（二）：密码学随机数与 nonce](/posts/crypto-03-02-randomness-nonce/)
- [密码学基础构件（三）：密钥派生与口令保护](/posts/crypto-03-03-kdf-passwords/)
- [密码学基础构件（四）：认证加密与混合加密](/posts/crypto-03-04-aead-hybrid/)
- [密码学基础构件（五）：承诺与零知识证明入门](/posts/crypto-03-05-commitments-zk/)

## 四、椭圆曲线密码学

- [椭圆曲线密码学（一）：点运算与标量乘法](/posts/crypto-04-01-curve-arithmetic/)
- [椭圆曲线密码学（二）：子群、余因子与公钥校验](/posts/crypto-04-02-subgroups-validation/)
- [椭圆曲线密码学（三）：常见曲线与点编码](/posts/crypto-04-03-curves-encoding/)

## 五、数字签名算法

- [数字签名（一）：ECDSA 原理与正确性推导](/posts/crypto-05-01-ecdsa-math/)
- [数字签名（二）：ECDSA 编码、公钥恢复与 low-S](/posts/crypto-05-02-ecdsa-encoding-recovery/)
- [数字签名（三）：Schnorr 签名与线性结构](/posts/crypto-05-03-schnorr/)
- [数字签名（四）：EdDSA 原理与验签](/posts/crypto-05-04-eddsa-math/)
- [数字签名（五）：Ed25519 的种子、标量与编码规则](/posts/crypto-05-05-ed25519-implementation/)
- [数字签名（六）：ECDSA、Schnorr 与 EdDSA 对比](/posts/crypto-05-06-signature-comparison/)

## 六、密钥管理与派生

- [密钥管理（一）：生成、存储、备份与轮换](/posts/crypto-06-01-key-lifecycle/)
- [密钥管理（二）：BIP32与硬化、非硬化派生](/posts/crypto-06-02-bip32/)
- [密钥管理（三）：Ed25519派生路线与安全边界](/posts/crypto-06-03-ed25519-derivation/)

## 七、多方计算与门限密码学基础

- [多方计算基础（一）：安全目标与攻击模型](/posts/crypto-07-01-mpc-security-models/)
- [多方计算基础（二）：Shamir秘密共享](/posts/crypto-07-02-shamir/)
- [多方计算基础（三）：可验证秘密共享](/posts/crypto-07-03-vss/)
- [多方计算基础（四）：分布式密钥生成](/posts/crypto-07-04-dkg/)
- [多方计算基础（五）：份额刷新、重共享与恢复](/posts/crypto-07-05-refresh-resharing/)

## 八、门限签名协议

- [门限签名协议（一）：从 Schnorr 到门限签名](/posts/crypto-08-01-threshold-schnorr/)
- [门限签名协议（二）：FROST 的两轮交互与 nonce 管理](/posts/crypto-08-02-frost/)
- [门限签名协议（三）：门限 EdDSA 与 Ed25519 输出兼容性](/posts/crypto-08-03-threshold-eddsa/)
- [门限签名协议（四）：门限 ECDSA、Paillier 与 MtA](/posts/crypto-08-04-threshold-ecdsa-mta/)
- [门限签名协议（五）：GG18 的核心思想与通信过程](/posts/crypto-08-05-gg18/)
- [门限签名协议（六）：GG20与可识别中止](/posts/crypto-08-06-gg20/)
- [门限签名协议（七）：CMP的预处理与在线签名](/posts/crypto-08-07-cmp/)
- [门限签名协议（八）：CGGMP系列的安全目标与实现边界](/posts/crypto-08-08-cggmp/)
- [门限签名协议（九）：tss-lib v2.0.2源码与协议映射](/posts/crypto-08-09-tss-lib-mapping/)
- [门限签名协议（十）：离线MPC签名的协议设计](/posts/crypto-08-10-offline-mpc/)

## 九、HSM 与硬件密钥保护

- [硬件密钥保护（一）：HSM、安全芯片与TEE](/posts/crypto-09-01-hsm-tee/)
- [硬件密钥保护（二）：密钥权限、备份与高可用](/posts/crypto-09-02-hsm-operations/)
- [硬件密钥保护（三）：HSM与MPC的组合架构](/posts/crypto-09-03-hsm-mpc/)

## 十、钱包签名系统工程

- [钱包签名系统工程（一）：从订单到链上执行](/posts/crypto-10-01-signing-pipeline/)
- [钱包签名系统工程（二）：交易解析与签名授权](/posts/crypto-10-02-parsing-authorization/)
- [钱包签名系统工程（三）：通信认证、会话绑定与防重放](/posts/crypto-10-03-sessions-transport/)
- [钱包签名系统工程（四）：离线交互、失败恢复与审计](/posts/crypto-10-04-offline-recovery-audit/)

## 十一、密码学攻击与安全实践

- [攻击与安全实践（一）：nonce重用、偏差与泄漏](/posts/crypto-11-01-nonce-attacks/)
- [攻击与安全实践（二）：无效点与子群攻击](/posts/crypto-11-02-invalid-points/)
- [攻击与安全实践（三）：侧信道与故障注入](/posts/crypto-11-03-side-channels-faults/)
- [攻击与安全实践（四）：协议状态与实现错误](/posts/crypto-11-04-state-implementation/)

## 阅读与温习方式

每篇先确认中心问题，再跟随算例核对关键关系。遇到陌生数学工具时回到前置文章；阅读具体协议时，分别记录参与者知道什么、发送什么、检查什么，以及失败后哪些状态还能使用。

数学正确性、协议安全与系统授权分别检查。需要修改实现时，以文章列出的标准、论文版本、源码及其最新勘误为依据，不把教学示意直接当作完整实现规范。
