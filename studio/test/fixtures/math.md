# 数学公式测试

行内公式：$\varphi(n)$。中文紧邻$\gcd(a,n)$也可以。

## 欧拉函数 $\varphi(n)$

$$
\varphi(n)=n\prod_{p\mid n}\left(1-\frac{1}{p}\right)
$$

## 最大公约数

$$
\gcd(8,15)=1
$$

## 模运算

$$
a^{\varphi(n)}\equiv1\pmod n
$$

## 集合

$$
\mathbb{Z}_n^*=\{a\in\mathbb{Z}_n\mid\gcd(a,n)=1\}
$$

## 分数

$$
\frac{\varphi(n)}{n}
=
\prod_{p\mid n}\left(1-\frac{1}{p}\right)
$$

## 上下标

$$
n=p_1^{\alpha_1}p_2^{\alpha_2}\cdots p_k^{\alpha_k}
$$

## 多行定义与根号求和

$$
\varphi(n)
=
\left|
\left\{
a\mid 1\leq a\leq n,\ \gcd(a,n)=1
\right\}
\right|
$$

$$
\sqrt{x}+a^2+a_i+\sum_{i=1}^{n}i+\prod_{p\mid n}p\pmod{n}
$$

## 窄屏长公式

$$
\underbrace{a_1+a_2+a_3+a_4+a_5+a_6+a_7+a_8+a_9+a_{10}+a_{11}+a_{12}+a_{13}+a_{14}+a_{15}}_{\text{横向滚动，不撑开页面}}=\sum_{i=1}^{15}a_i
$$

## 原样保留的代码

行内代码：`$\varphi(n)$`、`$$ x^2 $$`，转义美元：\$5 和 \$10。

```latex
$\varphi(n)$
$$
\frac{1}{p}
$$
```

```bash
echo "$HOME"
```

    $\gcd(a,n)$

## 普通 Markdown

**粗体**、*斜体*、[链接](https://example.com/)。

- 第一项
- 第二项

> 普通引用与公式 $a_i$。

| 名称 | 值 |
| --- | --- |
| 公式 | $\sqrt{x}$ |
