---
title: "Eddsa_mpc"
date: 2026-01-12T21:01:06+08:00
draft: false
---

# MPC 场景下实现 EdDSA（Ed25519）的工程复盘：派生路径、关键点与踩坑记录

本文整理自我在实现/适配 **MPC EdDSA（Ed25519）** 过程中的关键讨论与代码片段，重点包括：  
- 我如何从“业务编码式 path”演进到“可控、可扩展”的派生索引生成；  
- Ed25519 clamping / cofactor / 子群风险在 **tss-lib**（阈值 EdDSA）语境下到底落在哪些轮次与入口；  
- 实战里踩过的坑与最终推荐实现（含完整 Go 代码与测试向量结构）。

---

## 1. 我的派生路径方案演进

### 1.1 初版：`PathPrefix + req.Path` 的字符串切分（能跑，但“安全性几乎为零”）
我最早的做法是把 `PathPrefix + req.Path` 拼成一个数字串，然后按固定长度切片并解析成 `uint32` 索引数组供后续使用。  
这个实现的问题在于：它更像“编码业务含义”，并没有提供密码学意义上的不可预测性与域隔离；同时固定切分也限制了未来演进空间。

### 1.2 升级：引入父公钥 +（可选）master secret，用 HMAC 生成稳定索引
升级后我的目标是：
- **确定性**：同一输入得到同一索引序列；
- **域隔离**：不同用途/曲线/环境不会“撞域”；
- **可扩展**：不暴露 depth 也能生成固定长度（或按需扩展）的索引序列；
- **可选不可推导**：如果需要对外不可推导，则引入 master secret；否则至少做到“确定性伪随机映射”。

我最终选择的核心结构是：  
- 用父公钥坐标（固定长度编码）与 `path` 组成 base；
- 用 `chainCode` 作为 HMAC key（或用 master secret 再派生出 HMAC key）；
- 用 `counter` 迭代扩展输出；
- 输出分片为 `uint32`，并做 `& 0x7fffffff` 约束到 31-bit，减少与常见索引体系的冲突风险。

---

## 2. 最终推荐实现（Go）：固定长度编码 + master secret 选项 + 测试向量结构

> 说明  
> - **固定长度编码**：Ed25519/Curve25519 语境下通常按 32 字节处理坐标（若你用的点表示不是 Weierstrass XY，请按你们内部点序列化规范替换）。  
> - **master secret 选项**：如果你希望外部仅凭父公钥与 path 无法推导派生结果，请启用 master secret；否则可只用 chainCode 作为确定性伪随机映射。  
> - **索引长度**：默认输出 `N=16` 个索引（可按业务改为 8/16/32，但上线后不要随意变更，否则等价于“换树”）。

```go
package edderive

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"fmt"
	"math/big"
)

// Options controls derivation behavior.
type Options struct {
	// Tag provides domain separation (e.g. "ed-derive/v1").
	Tag string

	// OutLen is how many indices to return. Recommended: 8 or 16.
	OutLen int

	// If true, mask indices to 31-bit using & 0x7fffffff.
	Mask31bit bool
}

func (o *Options) normalize() Options {
	n := *o
	if n.Tag == "" {
		n.Tag = "ed-derive/v1"
	}
	if n.OutLen <= 0 {
		n.OutLen = 16
	}
	if !n.Mask31bit {
		// default true
		n.Mask31bit = true
	}
	return n
}

// DeriveIndices derives a deterministic list of uint32 indices from:
// - parent public key coordinates (pubX, pubY) in big.Int form
// - chainCode (32 bytes recommended)
// - path string (business path / hierarchical label)
// - optional masterSecret: if provided, derivation becomes non-inferable without it
func DeriveIndices(pubX, pubY *big.Int, chainCode []byte, path string, masterSecret []byte, opt Options) ([]uint32, error) {
	opt = opt.normalize()

	if pubX == nil || pubY == nil {
		return nil, errors.New("nil public key coordinates")
	}
	if len(chainCode) == 0 {
		return nil, errors.New("empty chainCode")
	}

	// Canonical fixed-length encoding for coordinates (32 bytes each).
	// If your point representation differs, replace this with your canonical serialization.
	xb, err := bigIntToFixedBytes(pubX, 32)
	if err != nil {
		return nil, fmt.Errorf("encode pubX: %w", err)
	}
	yb, err := bigIntToFixedBytes(pubY, 32)
	if err != nil {
		return nil, fmt.Errorf("encode pubY: %w", err)
	}

	// base = tag || x || y || path
	tagB := []byte(opt.Tag)
	pathB := []byte(path)
	base := make([]byte, 0, len(tagB)+len(xb)+len(yb)+len(pathB))
	base = append(base, tagB...)
	base = append(base, xb...)
	base = append(base, yb...)
	base = append(base, pathB...)

	// Derive HMAC key:
	// - if masterSecret is present: key = HMAC(masterSecret, "ed-derive-key" || chainCode)
	// - else: key = chainCode
	key := chainCode
	if len(masterSecret) > 0 {
		key = hmacSHA256(masterSecret, append([]byte("ed-derive-key"), chainCode...))
	}

	// Generate enough bytes via HMAC(key, base || counter_be32).
	need := opt.OutLen
	out := make([]uint32, 0, need)

	var counter uint32 = 0
	buf := make([]byte, 0, 32) // rolling buffer of HMAC blocks

	for len(out) < need {
		ctr := make([]byte, 4)
		binary.BigEndian.PutUint32(ctr, counter)
		block := hmacSHA256(key, append(base, ctr...))
		counter++

		buf = append(buf, block...)

		// consume buf 4 bytes at a time
		for len(buf) >= 4 && len(out) < need {
			v := binary.BigEndian.Uint32(buf[:4])
			buf = buf[4:]

			if opt.Mask31bit {
				v = v & 0x7fffffff
			}
			out = append(out, v)
		}
	}

	return out, nil
}

func hmacSHA256(key, msg []byte) []byte {
	mac := hmac.New(sha256.New, key)
	_, _ = mac.Write(msg)
	return mac.Sum(nil)
}

func bigIntToFixedBytes(x *big.Int, size int) ([]byte, error) {
	if x.Sign() < 0 {
		return nil, errors.New("negative big.Int")
	}
	b := x.Bytes()
	if len(b) > size {
		return nil, fmt.Errorf("integer too large: %d > %d", len(b), size)
	}
	out := make([]byte, size)
	copy(out[size-len(b):], b)
	return out, nil
}

// -------------------- Test Vector Structure --------------------

// DeriveTestVector is a stable test fixture format for regression tests.
// Keep vectors once published; changing any field changes derived outputs.
type DeriveTestVector struct {
	Name            string `json:"name"`
	Tag             string `json:"tag"`
	PubXHex         string `json:"pub_x_hex"` // big-endian hex
	PubYHex         string `json:"pub_y_hex"` // big-endian hex
	ChainCodeHex    string `json:"chain_code_hex"`
	Path            string `json:"path"`
	MasterSecretHex string `json:"master_secret_hex,omitempty"` // optional
	OutLen          int    `json:"out_len"`

	// Expected output indices (uint32). Store as hex or decimal in your JSON as you prefer.
	Expected []uint32 `json:"expected"`
}

func (tv DeriveTestVector) Run() error {
	pubX, err := hexToBigInt(tv.PubXHex)
	if err != nil {
		return fmt.Errorf("[%s] pubX: %w", tv.Name, err)
	}
	pubY, err := hexToBigInt(tv.PubYHex)
	if err != nil {
		return fmt.Errorf("[%s] pubY: %w", tv.Name, err)
	}
	chainCode, err := hex.DecodeString(strip0x(tv.ChainCodeHex))
	if err != nil {
		return fmt.Errorf("[%s] chainCode: %w", tv.Name, err)
	}

	var master []byte
	if tv.MasterSecretHex != "" {
		master, err = hex.DecodeString(strip0x(tv.MasterSecretHex))
		if err != nil {
			return fmt.Errorf("[%s] masterSecret: %w", tv.Name, err)
		}
	}

	opt := Options{
		Tag:       tv.Tag,
		OutLen:    tv.OutLen,
		Mask31bit: true,
	}

	got, err := DeriveIndices(pubX, pubY, chainCode, tv.Path, master, opt)
	if err != nil {
		return fmt.Errorf("[%s] derive: %w", tv.Name, err)
	}
	if len(tv.Expected) > 0 {
		if len(got) != len(tv.Expected) {
			return fmt.Errorf("[%s] length mismatch: got=%d expected=%d", tv.Name, len(got), len(tv.Expected))
		}
		for i := range got {
			if got[i] != tv.Expected[i] {
				return fmt.Errorf("[%s] mismatch at %d: got=%d expected=%d", tv.Name, i, got[i], tv.Expected[i])
			}
		}
	}
	return nil
}

func hexToBigInt(h string) (*big.Int, error) {
	b, err := hex.DecodeString(strip0x(h))
	if err != nil {
		return nil, err
	}
	return new(big.Int).SetBytes(b), nil
}

func strip0x(s string) string {
	if len(s) >= 2 && (s[:2] == "0x" || s[:2] == "0X") {
		return s[2:]
	}
	return s
}
