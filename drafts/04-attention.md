---
number: 04
slug: 04-attention-the-mechanism-behind-everything
title: "Attention: The Mechanism Behind Everything"
module: "02 — Transformer Architecture"
lede: One idea separates modern AI from everything that came before it. Here is what attention actually does and why it mattered so much.
next_slug: 05-q-k-v-the-lookup-table
next_title: "Q, K, V: The Lookup Table That Runs the World"
---

## The problem no one had solved

Before transformers, the dominant approach to processing language was the recurrent neural network. An RNN reads a sequence one token at a time, left to right, maintaining a hidden state — a fixed-size bundle of numbers that carries information forward as it moves through the sequence. Each new token updates that bundle based on what came before.

The problem is that bundle has a fixed size. It has to compress everything the model has read so far into the same number of dimensions, regardless of how long the sequence is. Read ten tokens, the bundle carries ten tokens worth of context. Read a thousand tokens, it still has the same size — which means earlier information gets increasingly compressed, overwritten, and eventually lost.

This is the fading memory problem. By the time an RNN reaches the end of a long sentence, the beginning has been diluted across hundreds of updates. The model can still see the recent past clearly, but the distant past has become a blur.

<!--
DIAGRAMS
--------
Diagram 1 — The fading memory problem.
Show a row of tokens from the sentence: "The trophy didn't fit in the suitcase because it was too big."
Render each token as a labelled box. Show a sliding window of ~4 tokens moving rightward across the sequence.
Tokens inside the window are fully opaque and clearly readable.
Tokens to the left of the window fade progressively — the further left, the more faded (lower opacity, greyer colour).
By the time the window reaches "it", "The" and "trophy" are nearly invisible.
Add a label near "trophy": "fading..." and near "it": "what does this refer to?"
The point: the model has lost the context it needs precisely when it needs it most.
-->

## A single sentence that broke the old approach

Consider this sentence: *"The trophy didn't fit in the suitcase because it was too big."*

What does "it" refer to? The trophy or the suitcase? You resolved this immediately and without effort. The trophy is too big to fit — so "it" refers to the trophy. The reasoning requires holding "trophy," "fit," "suitcase," and "too big" in mind simultaneously and reasoning about their relationships.

An RNN processing this sentence left to right will encounter "it" near the end, by which point "trophy" — the key word it needs — has been compressed through several state updates and is competing with everything else the model has read. Language is full of these long-range dependencies: pronouns referring to nouns several clauses back, verbs whose meaning depends on subjects introduced earlier, negations that flip the meaning of something stated further up the paragraph. For a model to truly understand text rather than approximate it, it needs to be able to connect any two positions in a sequence directly — regardless of the distance between them.

## The core idea: every token looks at every other token

Attention solves the fading memory problem by abandoning sequential processing entirely. Instead of reading left to right and maintaining a running state, an attention mechanism allows every token in a sequence to look at every other token simultaneously and decide how much to weight each one.

When the model processes "it" in our sentence, attention doesn't force it to rely on whatever compressed memory has carried forward from the beginning. Instead, "it" can directly consult "trophy" — still fully present, not faded — and decide that it is the relevant word. The relationship is computed directly, not retrieved from a degraded memory.

## What an attention score actually is

The result of this process is a number for every pair of tokens in the sequence: an attention score representing how much token A should attend to token B. Think of it as a rating from 0 to 1. A score close to 1 means "this relationship matters a lot." A score close to 0 means "mostly ignore this."

In our sentence, the model might compute scores from "it" to every other token and arrive at something like this: trophy scores 0.71, suitcase scores 0.18, big scores 0.07, everything else scores below 0.02. These scores don't have to be invented by hand — the model learns during training which patterns of attention are useful for predicting the next token correctly, and those patterns get baked into the weights.

Once the scores are computed, they are used to produce a weighted blend — that is, a mixture where each token contributes in proportion to its score. The output representation of "it" ends up being mostly shaped by "trophy," somewhat shaped by "suitcase," barely influenced by anything else. The scores are first adjusted so they all add up to 1 (a standard mathematical step that makes the blending stable), and then the blending happens. The result is a richer representation of "it" than the raw token alone could carry — one that already encodes the likely answer to the coreference question.

<!--
DIAGRAMS
--------
Diagram 2 — Attention scores for "it".
Show the same sentence: "The trophy didn't fit in the suitcase because it was too big."
All tokens are fully visible simultaneously — no fading, no window.
Draw weighted connection lines from the token "it" to every other token.
Line weight and colour intensity represent attention score:
  - "trophy" → thick, saturated red line, labelled "0.71"
  - "suitcase" → medium line, labelled "0.18"
  - "big" → thin line, labelled "0.07"
  - All other tokens → very faint grey lines, labelled "< 0.02"
The point: "it" doesn't rely on faded memory. It consults the full sequence and attends most strongly to the token that resolves its meaning.
-->

## Multi-head attention: several perspectives at once

A single round of attention produces one perspective on the relationships in a sequence. But language carries many kinds of relationships simultaneously. In our sentence, "it" and "trophy" are linked by coreference — "it" refers back to "trophy." But there are also grammatical relationships (which word is the subject, which is the object), semantic relationships (trophy and suitcase are both physical objects that can contain or be contained), and proximity relationships (words close together often relate to each other). A single pass of attention cannot capture all of these at once.

Multi-head attention runs the attention mechanism several times in parallel — each run is called a head — with different learned parameters each time. Each head develops its own pattern of what to attend to. One head might specialise in tracking grammatical structure. Another might focus on which words refer to the same thing. A third might weight nearby words more heavily. Their outputs are then combined — merged together — into a single richer representation.

The model is not told what each head should learn. The specialisation emerges from training: each head finds the pattern that most reliably helps reduce prediction error on the training data.

<!--
DIAGRAMS
--------
Diagram 3 — Multi-head attention.
Show three side-by-side panels, each containing the same sentence.
Each panel represents one attention head, with connection lines from "it" to other tokens.
Panel 1, labelled "Head 1 — coreference": heavy line to "trophy", light lines elsewhere.
Panel 2, labelled "Head 2 — grammar": heavy lines to "fit" and "didn't", lighter lines elsewhere.
Panel 3, labelled "Head 3 — proximity": heavier lines to nearby tokens ("was", "too", "big"), lighter lines to distant tokens.
Below all three panels, show a single merged output token for "it" with a label: "combined representation".
The point: attention runs multiple times in parallel, each head learning a different kind of relationship. The final representation blends all of them.
-->

## Why this changed everything

Attention did more than solve the fading memory problem. It changed what was computationally possible during training.

An RNN processes tokens sequentially — token 1, then token 2, then token 3. You cannot process token 3 until you have finished token 2. This means training on a long sequence requires many steps taken one after another, and you cannot speed this up by throwing more processors at it. The steps have to happen in order.

The attention mechanism has no such constraint. Because every token attends to every other token independently, all of these computations can happen at the same time across many processors simultaneously. A sequence of a thousand tokens that would require a thousand sequential steps in an RNN can be processed in a single parallel sweep in a transformer. This is why transformers became feasible to train on the scale of the entire internet — the architecture was a natural fit for what modern GPU hardware is designed to do.

The 2017 paper that introduced the transformer was titled *Attention Is All You Need*. The title was a provocation: you do not need recurrence, you do not need sequential processing. Attention, applied carefully, is sufficient. The years since have proved the claim correct in a way even the authors likely did not anticipate.

## Where this picture breaks down

The "every token looks at every other token" framing is accurate but it obscures a real cost. Attention scales quadratically with sequence length — which is just a way of saying that doubling the number of tokens roughly quadruples the computation required. This is why context windows have limits: at some point the computation becomes prohibitively expensive, and significant research effort has gone into making attention more efficient for very long sequences.

The heads-as-specialists framing — "this head tracks grammar, that one tracks coreference" — is a useful intuition but an oversimplification. Attention heads do not have clean, human-interpretable roles. Researchers have found heads that appear to specialise, but most heads perform computations that resist tidy description. The specialisation is real but messier than the diagram suggests.

The scores-as-understanding framing is the deepest simplification. A high attention score between "it" and "trophy" means the model has learned that this connection is statistically useful for predicting what comes next — not that it has resolved the coreference the way a human reader does. The behaviour looks like understanding. Whether it constitutes understanding is a harder question, and one this article cannot settle.
