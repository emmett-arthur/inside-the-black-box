---
number: 06
slug: 06-why-transformers-won
title: "Why Transformers Beat Everything Before Them"
module: "02 — Transformer Architecture"
lede: The transformer wasn't the cleverest architecture ever proposed. It was the one that scaled. Here is why that turned out to matter more than anything else.
next_slug: 07-pretraining
next_title: "Pre-training: Learning from the Whole Internet"
---

## What came before and why it wasn't enough

Recurrent neural networks were not bad. For most of the 2010s they were the best tool available for language tasks — translation, summarisation, question answering. They worked. Researchers built real products with them.

The problem was the ceiling. The fading memory problem from Article 04 meant that long sequences were always a struggle. The sequential processing requirement meant training was slow — you could not parallelise across a sequence because each step depended on the one before it. And slow training meant you could not use more data, because more data requires more training time. The architecture and the available compute were mismatched in a way that had no clean solution within the RNN framework.

LSTMs — long short-term memory networks, a more sophisticated variant of the RNN — helped. They introduced gating mechanisms, which are just controlled switches that decide what information to keep and what to discard as the model reads along a sequence. They extended the effective memory window considerably. But they did not solve the parallelisation problem, and they added enough complexity that they were harder to scale and tune. The ceiling rose slightly. It did not disappear.

## The three things transformers got right simultaneously

The 2017 paper *Attention Is All You Need* proposed a different architecture built entirely around the attention mechanism from Article 04. It got three things right at once, and the combination was what mattered.

First, attention solved the long-range dependency problem cleanly. Every token can attend directly to every other token regardless of distance. The trophy and the pronoun referring to it five words later are no further apart than adjacent words.

Second, because attention computations are independent of each other, the entire sequence can be processed in parallel. This meant transformers could use GPU hardware — which is designed for doing many simple computations simultaneously — far more efficiently than RNNs ever could. Training that would have taken weeks could now take days.

Third, and least obviously, the architecture turned out to be general. Attention is a mechanism for finding relationships in sequences. Almost any data can be framed as a sequence — words, image patches, audio frames, protein residues, lines of code. The same architecture that translated text in 2017 now runs across most of modern AI.

No single one of these was a decisive advantage. Together they were.

## Building intuition for the architecture

Before looking at the full picture, it helps to name the components you already understand from earlier articles and what each one is doing.

Tokens are the input. A sentence gets broken into pieces — sometimes words, sometimes parts of words — and each piece becomes a token. "The cat sat on the mat" might become six tokens, one per word.

Positional encoding is a small addition to each token that tells the model where in the sequence it sits. Attention on its own has no sense of order — "cat sat" and "sat cat" would look identical without it. Positional encoding solves this by injecting position information directly into the token's representation before any attention is computed.

The attention mechanism, covered in Articles 04 and 05, is the core operation. Each token generates a query, a key, and a value. Queries match against keys to produce scores. Scores weight the blending of values. The result is a representation of each token that has been shaped by its full context.

Feed-forward layers sit after the attention step in each block. Where attention does relational work — figuring out how tokens relate to each other — the feed-forward layer does additional computation on each token individually. Think of attention as the step that gathers context, and the feed-forward layer as the step that processes it.

The whole block — attention plus feed-forward — gets repeated many times. Each repetition is a layer. More layers means more passes of refinement before the output is produced. A small model might have 12 layers. A large one might have 96.

## The translation example: encoder and decoder

The original transformer was built for translation — specifically, translating English into French. It had two components: an encoder and a decoder, each built from the blocks described above.

Take the sentence "The cat sat on the mat." The encoder reads the full English sentence and builds a rich representation of what it means — using attention to connect every word to every other word, resolving relationships, producing a dense understanding of the input. The encoder does not generate anything. Its job is comprehension.

The decoder then generates the French translation one token at a time: "Le," then "chat," then "s'est," and so on. At each step it does two things. First, it attends to the French tokens it has already generated — this is called self-attention, and it is masked so the model cannot cheat by looking at future tokens it has not generated yet. Second, it attends to the encoder's output — this is called cross-attention, and it is how the decoder keeps consulting the original English meaning as it generates each new French word.

The encoder/decoder split exists because translation is a two-act process: fully read the source language, then generate the target. Comprehension first, generation second. Two separate jobs, two separate components.

<!--
DIAGRAMS
--------
Diagram 1 — The transformer architecture, simplified.
Show a vertical flow diagram with two clearly separated halves: Encoder (left) and Decoder (right).

ENCODER side (top to bottom):
  - "Input tokens" (e.g. "The cat sat on the mat")
  - Arrow down to "Embedding + Positional Encoding" — label: "tokens become numbers; position added"
  - Arrow down to a box labelled "Encoder Block × N" containing two sub-boxes:
      - "Multi-Head Attention" — label: "every token attends to every other token"
      - "Feed-Forward Layer" — label: "each token processed individually"
  - Arrow down to "Encoded representation" — label: "a rich understanding of the input"

DECODER side (top to bottom):
  - "Output tokens so far" (e.g. "Le chat s'est")
  - Arrow down to "Embedding + Positional Encoding"
  - Arrow down to a box labelled "Decoder Block × N" containing three sub-boxes:
      - "Masked Self-Attention" — label: "can only see past tokens, not future ones"
      - "Cross-Attention" — label: "attends to the encoder's output"
      - "Feed-Forward Layer"
  - Arrow down to "Next token (probability)" — label: "assis"

Draw a horizontal arrow from "Encoded representation" on the encoder side to the "Cross-Attention" box on the decoder side, labelled "encoder output flows here".

Add small reference labels on the right margin:
  - Next to Multi-Head Attention: "→ Articles 05 & 06"
  - Next to Feed-Forward Layer: "→ Article 01 (weights)"
  - Next to Encoded representation: "→ Article 03 (parameters)"

Use Mac OS window chrome. Keep it clean — this is a map, not a technical spec.
The point: show where every concept from the module lives in the actual architecture, in one diagram a reader can return to.
-->

## Why modern LLMs dropped the encoder

If the encoder/decoder architecture worked for translation, why do GPT, Claude, and LLaMA not use it?

Because language modelling is not a two-act process. There is no source sentence in a foreign language that needs to be fully read and compressed before generation can begin. There is only one stream of text, and one job: predict what comes next.

The decoder can attend back to everything it has already seen in the sequence. By the time it is predicting token 50, it has attended to tokens 1 through 49 — which is all the context it needs. Nothing needs to be encoded into a separate representation first. The comprehension and the generation are the same operation, happening in the same component.

Decoder-only is not a simplification or a shortcut. It is the right architecture for the task. Encoder/decoder is correct when input and output live in different spaces — English into French. Decoder-only is correct when input and output live in the same space — text continuing from text.

You might be wondering: but ChatGPT and Claude can translate too — so what gives? They can, but they do it differently. Not by explicitly encoding a source language and decoding a target, but because exposure to vast amounts of multilingual text during pre-training made translation an emergent capability. The model has seen so much English and French side by side that it can continue a prompt that says "translate this" without needing a dedicated encoder to do it. Same result, different mechanism.

## Scale as an unexpected force

Here is the part nobody predicted. As transformers got bigger — more layers, more parameters, more training data — they did not just get incrementally better at existing tasks. They developed qualitatively new capabilities that smaller models simply did not have.

A model with 1 billion parameters can complete sentences. A model with 10 billion parameters can answer questions. A model with 100 billion parameters can write code, reason through multi-step problems, and translate languages it was never explicitly trained on. These are not improvements in degree. They are differences in kind. The same architecture, scaled up, starts doing things that feel categorically different.

This phenomenon — sometimes called emergent capability — is still not fully understood. Researchers can observe it happening but cannot reliably predict which new capabilities will appear at which scale. What is clear is that the transformer architecture did not just benefit from scale. It seemed to unlock something new as scale increased, in a way that earlier architectures did not.

## What transformers are still bad at

The transformer won. It has not solved intelligence.

Attention scales quadratically with sequence length — meaning double the tokens, roughly four times the computation. Context windows are not unlimited. Hallucination — the model confidently producing false information — is a direct consequence of the architecture: the model generates the most statistically plausible next token, not the most factually accurate one. It has no mechanism for checking whether what it is saying is true.

Transformers have no persistent memory. Every conversation starts fresh. Every context window is a clean slate. A human expert who has spent forty years studying a subject brings all of that to every sentence they read. A transformer brings only what fits in the current context window.

And transformers are extraordinarily data-hungry compared to humans. A child learns the concept of a chair from a handful of examples. A transformer requires exposure to millions of sentences containing the word before its representation stabilises. The architecture is powerful but not efficient in the way biological intelligence is efficient.

These are not arguments against transformers. They are the shape of the problem that the next decade of research is organised around.

## Where this picture breaks down

The "three things at once" framing makes the transformer's success sound inevitable in retrospect. It was not. Attention mechanisms existed before 2017 and were used as additions to RNNs rather than replacements for them. The insight that you could discard recurrence entirely and build purely on attention was a genuine leap, not an obvious next step.

The encoder/decoder diagram is the original 2017 architecture. Modern transformers have diverged considerably — different positional encoding schemes, different normalisation approaches, different attention variants. The diagram is a map of the concept, not a blueprint for any specific model in production today.

Finally, the emergent capability story is real but contested. Some researchers argue that apparent emergence is partly an artefact of how capability is measured — that smoother, more gradual improvement becomes visible as a sharp jump when you change the metric. The debate is unresolved. What is not contested is that large transformers do things small transformers cannot.
