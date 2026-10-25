---
title: AandDS 密码学精选：从安全计算到可验证系统（首批十篇）
date: '2026-10-26 00:30:10'
description: 经原作者许可整理的十篇密码学专题：OT、混淆电路、GMW、BLS、KZG、累加器、VRF、环签名、时间锁与 Passkey，补充推导、算例与工程边界。
categories:
  - 密码学与安全
tags:
  - AandDS 密码学精选
content_type: article
disableNunjucks: true
---

本专题经原作者 cig01 许可，选自 [AandDS 博客的密码学相关笔记](https://aandds.com/categories.html)。十篇整理稿保留核心原理，重新编排叙述，增加可核对的例子，并结合原始论文、规范说明适用条件。每篇保留原文链接，涉及补充规范或论文时列出参考资料；原作者的贡献与本站新增的推导、示例分别注明。

本站已有[现代密码学与钱包安全系列](/posts/cryptography-wallet-series/)，覆盖数学基础、常用签名、门限协议、密钥管理和钱包工程。这次优先选择能填补空白、又能与现有文章衔接的十个主题。不是给所有密码算法做一次排名，而是为现有阅读路径增加一组更深入的工具。

## 一、阅读目录

| 顺序 | 整理稿 | 需要解决的问题 | AandDS 原文 |
| --- | --- | --- | --- |
| 01 | [不经意传输：在隐藏选择的同时只取一条消息](/posts/aandds-01-oblivious-transfer/) | 接收方怎样拿到一条消息，却不暴露选择，也拿不到另一条？ | [Oblivious Transfer](https://aandds.com/blog/oblivious-transfer.html) |
| 02 | [混淆电路：用不可读的标签执行布尔逻辑](/posts/aandds-02-garbled-circuit/) | 两个人怎样一起计算，而不直接交换输入？ | [Garbled Circuit](https://aandds.com/blog/garbled-circuit.html) |
| 03 | [GMW：把布尔电路变成多方共享上的计算](/posts/aandds-03-gmw/) | 多方持有输入份额时，为什么 XOR 容易、AND 需要交互？ | [GMW](https://aandds.com/blog/gmw87.html) |
| 04 | [BLS 签名：双线性配对、聚合与公钥注册](/posts/aandds-04-bls-signatures/) | 为什么签名能相加？合并验签还依赖什么前提？ | [BLS Curves and BLS Signatures](https://aandds.com/blog/bls.html) |
| 05 | [KZG 多项式承诺：把求值关系压缩成一个证明](/posts/aandds-05-kzg-commitment/) | 不公开全部多项式，怎样验证它在某一点的值？ | [KZG Polynomial Commitment](https://aandds.com/blog/kzg-commitment.html) |
| 06 | [密码学累加器：集合成员与非成员的短证明](/posts/aandds-06-accumulator/) | 一个短摘要怎样支持成员证明？未知阶为何重要？ | [Cryptographic Accumulator](https://aandds.com/blog/accumulator.html) |
| 07 | [可验证随机函数：让私钥生成的输出可以公开检查](/posts/aandds-07-vrf/) | 如何证明随机外观的输出确实来自固定密钥与输入？ | [Verifiable Random Function](https://aandds.com/blog/vrf.html) |
| 08 | [环签名：证明某个成员签过，而不暴露是哪一个](/posts/aandds-08-ring-signatures/) | 不先组建受管理的群，如何建立签名匿名集合？ | [Ring Signature](https://aandds.com/blog/ring-signature.html) |
| 09 | [时间锁谜题：让解密依赖一段顺序计算](/posts/aandds-09-time-lock-puzzles/) | 如何延迟解密？为何不能保证精确的现实时间？ | [Time-Lock Puzzles](https://aandds.com/blog/time-lock-puzzles.html) |
| 10 | [Passkey 与 WebAuthn：把登录绑定到网站、设备与挑战](/posts/aandds-10-passkeys/) | 怎样从签名建立安全登录，而不漏掉来源和请求状态？ | [Technical Details of Passkey Authentication](https://aandds.com/blog/passkey.html) |

目录中的短标题描述各篇的阅读目标；进入文章后以正文标题与目录为准。各篇末尾提供相邻篇章及返回本目录的链接，首篇仅有下一篇，末篇仅有上一篇。

## 二、为什么这样安排

前三篇沿着“隐藏选择—隐藏输入—共同计算”的顺序展开。OT 提供安全计算的基础能力；混淆电路说明两方如何用标签执行逻辑；GMW 再把计算转移到多个参与者持有的份额上。先掌握这些局部关系，再回看门限签名里的 OT、秘密共享和预处理，就更容易理解它们分别承担什么工作。

第四至第六篇讨论紧凑的验证材料。BLS 的线性结构使聚合成为可能，双线性配对则为 KZG 的求值证明提供工具。累加器从另一个角度说明：一个小摘要可以承诺很大的集合，但证明大小、可信设置、更新代价与隐私并不是同一项指标。

最后四篇把重点放在具体系统需要的属性：VRF 的可验证输出、环签名的签名者匿名性、时间锁的延迟条件，以及 Passkey 的网站和请求绑定。它们不能互相替代，也不会仅凭一个正确的公式就自动获得公平性、不可追踪性、精确计时或完整账户安全。

## 三、预备知识与站内衔接

如果模运算与群还不熟悉，可以先读[模运算、模幂与模逆元](/posts/crypto-02-01-modular-arithmetic/)、[有限域、群与循环群](/posts/crypto-02-02-fields-groups/)以及[离散对数与计算困难假设](/posts/crypto-02-03-discrete-log/)。KZG 还需要[多项式与拉格朗日插值](/posts/crypto-02-04-polynomials-interpolation/)中的基本知识。

阅读安全计算部分时，可以搭配[多方计算的安全目标与攻击模型](/posts/crypto-07-01-mpc-security-models/)和[Shamir 秘密共享](/posts/crypto-07-02-shamir/)。阅读签名与 VRF 时，可以回顾[Schnorr 签名](/posts/crypto-05-03-schnorr/)，理解承诺、挑战与响应的关系。

## 四、怎样使用这些整理稿

每篇中的小素数、小模数、抽象群元素和布尔例子都用于核对等式或协议结构，不提供生产参数。出现“半诚实”“恶意安全”“可信设置”“随机预言机”等条件时，应把它们看作结论的一部分。

文中对示例完成的算术验证，只证明所展示的关系成立。真正部署协议还需要选择经过审查的规范和实现，核对版本、参数、编码、随机数、密钥与状态管理。文章在相应位置解释这些要求如何影响具体结果。

---

开始阅读：[01 · 不经意传输](/posts/aandds-01-oblivious-transfer/)
