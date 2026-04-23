---
number: 04
slug: 04-tokens-and-the-tokeniser
title: "Tokens and the Tokeniser"
module: "01 — Foundations"
lede: The model doesn't read words. It reads numbers. Here is what actually happens between the sentence you type and the computation that begins.
next_slug: 05-attention-the-mechanism-behind-everything
next_title: "Attention: The Mechanism Behind Everything"
---

## Not words, chunks

When you send a message to a language model, the first thing that happens has nothing to do with neural networks or attention or weights. The text gets chopped up.

The pieces it gets chopped into are called tokens. Tokens are not words. They are sub-word chunks — fragments that might be a full word, part of a word, a punctuation mark, or even a leading space. "unhappiness" might become three tokens: "un," "happy," "ness." "The" is almost certainly one token. "Tokenisation" might be two. Whether a word stays whole or gets split depends entirely on how common it is in the training data.

This matters more than it sounds. The model never sees the word "unhappiness." It sees three separate pieces, each processed independently before any meaning gets assembled. Everything the model does — every attention computation, every weight update during training — operates on these chunks, not on the words you think you typed.

Whitespace is part of this too, in a way that surprises most people. The token for " the" with a leading space is a different token to "the" without one. "Hello" and " Hello" are not the same token. The model does not see clean words separated by neutral spaces. It sees a stream of chunks where spaces are baked into the chunks themselves, and two versions of the same word can have completely different representations depending on where in a sentence they appear.

## A sentence becomes a list of integers

Before any computation begins, every token gets assigned an integer — a single number that identifies it in the model's vocabulary. This is the tokeniser's output: not text, not words, but a list of numbers.

"The cat sat on the mat" might become something like:

```
"The"   →  464
" cat"  →  3797
" sat"  →  3332
" on"   →  319
" the"  →  262
" mat"  →  2603
```

That list of integers — [464, 3797, 3332, 319, 262, 2603] — is what the model actually receives. There is no text after this point. No letters, no words, no punctuation as you would recognise it. Just a sequence of numbers, each one pointing to an entry in a lookup table.

<!--
DIAGRAMS
--------
Diagram 1 — A sentence becomes integers.
Show a two-column layout.
Left column: the sentence "The cat sat on the mat" with each token in its own labelled box.
Note the leading space on " cat", " sat", " on", " the", " mat" — make these visible (e.g. show the space character explicitly as "·cat" or with a faint underline).
Right column: the corresponding integer for each token, shown in monospace:
  "The"  → 464
  " cat" → 3797
  " sat" → 3332
  " on"  → 319
  " the" → 262
  " mat" → 2603
Draw connecting arrows from each token box to its integer.
Below the diagram add a label: "This list of integers — not the words themselves — is what enters the model."
Note that " the" (with space, token 262) and "The" (no space, capitalised, token 464) are different tokens — call this out explicitly with a small annotation.
Mac OS window chrome. Clean and readable.
-->

## The embedding table: from integers to something the model can use

The model can only do maths. It cannot do anything useful with the integer 464 directly — a single number is not enough information to represent meaning. So every token gets swapped for a list of numbers it can actually compute with.

Think of it like RGB colour values: red is [255, 0, 0], blue is [0, 0, 255]. Three numbers, and similar colours have similar numbers. Embeddings work the same way but with 768 numbers instead of 3, and instead of encoding colour they encode meaning. "King" and "queen" end up with similar vectors because they appeared in similar contexts across the training data. "King" and "motorway" end up with very different vectors because they almost never appear together.

The embedding table is the full collection of those vectors — one row per token in the vocabulary, each row a list of numbers. Look up integer 464, get the vector for "The." Look up 3797, get the vector for " cat." The table has one row for every token the model knows — 100,277 rows in GPT-4's case — and each row gets refined during training until the numbers reflect the actual relationships between words.

This lookup is the last step before the real computation begins. Integers in, vectors out. Everything after this — attention, feed-forward layers, all of it — operates on these vectors.

<!--
DIAGRAMS
--------
Diagram 2 — The embedding table lookup.
Show a three-stage flow, left to right.

Stage 1 — Token integers (left):
  A short vertical list of integers: 464, 3797, 3332
  Label: "token IDs"

Stage 2 — Embedding table (centre):
  Show a grid representing the table — rows are token IDs, columns are dimensions.
  Highlight three rows: 464, 3797, 3332.
  Each highlighted row shows a truncated vector of numbers, e.g.:
    Row 464:  [0.21, −0.54, 0.88, 0.03, ... (768 total)]
    Row 3797: [−0.11, 0.73, −0.42, 0.61, ... (768 total)]
    Row 3332: [0.56, 0.12, 0.94, −0.28, ... (768 total)]
  Label: "embedding table (100,277 rows × 768 dimensions)"

Stage 3 — Output vectors (right):
  Three labelled vector boxes corresponding to "The", " cat", " sat"
  Each shows a short truncated list of numbers.
  Label: "token embeddings — ready for computation"

Arrows connecting stage 1 → stage 2 (lookup) → stage 3 (output).
Add a note: "Each vector is learned during training. Similar words end up with similar vectors."
Mac OS window chrome.
-->

## Why sub-word and not just words?

The sub-word approach is a pragmatic solution to two problems that sit at opposite ends of the same spectrum.

A word-level tokeniser — one token per word — sounds intuitive. The problem is vocabulary size. English alone has hundreds of thousands of words, plus technical terms, proper nouns, misspellings, and words from other languages that appear in English text. A vocabulary large enough to cover all of this would require a lookup table too large to train efficiently, and any word not in the vocabulary simply cannot be represented.

A character-level tokeniser — one token per letter — solves the vocabulary problem entirely. You only need 26 letters plus punctuation. But it creates a different problem: sequences become very long. "The cat sat" is eleven characters. Processing eleven tokens instead of three is slower, and the model has to learn that "c," "a," and "t" together mean something — a harder task than learning it from a single token.

Sub-word tokenisation is the middle ground. Common words — "the," "cat," "sat" — stay as single tokens because they appear often enough to earn a place in the vocabulary. Rare words get broken into recognisable pieces. "Tokenisation" might become "token" and "isation." A technical term might become several fragments. The model handles both common and rare language without an unmanageable vocabulary or impractically long sequences.

## How BPE builds the vocabulary

The most widely used sub-word method is called Byte Pair Encoding, or BPE. The name is slightly misleading — the process is simpler than it sounds.

Start with the entire training corpus — billions of words of text — broken down into individual characters. Every character is a token. Now find the most frequently occurring pair of adjacent tokens and merge them into a single new token. "t" and "h" appearing together constantly becomes "th." Do this again — "th" and "e" becomes "the." Repeat the process, each time merging the most common pair, until you have reached your target vocabulary size.

The result is a vocabulary that reflects the actual distribution of the training data. Common words and common word fragments become single tokens. Rare combinations stay as multiple fragments. The vocabulary is not hand-crafted — it is a direct product of what the model was trained on, which means it encodes the biases and priorities of that data before a single weight has been learned.

## Vocabulary size and what it means for performance

GPT-4 uses a vocabulary of 100,277 tokens. That number is a design decision with real tradeoffs.

A larger vocabulary means more common words and phrases stay as single tokens — fewer pieces, shorter sequences, faster computation. But every token in the vocabulary needs its own row in the embedding table, and every row needs to be learned during training. A vocabulary of 100,000 tokens requires 100,000 embedding vectors, each with hundreds of dimensions. That is a significant portion of the model's total parameters.

A smaller vocabulary means shorter, more efficient training, but longer sequences at inference time — which is expensive for attention, which scales quadratically with sequence length.

The number is a balance. Different models have made different choices, and those choices have downstream effects on which languages and domains the model handles well.

## How tokenisation decisions show up in what models can and cannot do

This is where tokenisation stops being an implementation detail and starts explaining behaviour you have probably noticed.

Counting letters in a word is surprisingly hard for language models. Ask GPT how many r's are in "strawberry" and it will often get it wrong. The reason is that the model never sees individual letters — it sees token chunks. It cannot count characters it has never been shown. This is not a reasoning failure. It is a direct consequence of how the input was represented before any reasoning began.

Arithmetic can behave inconsistently for similar reasons. Numbers get tokenised in ways that do not reflect their mathematical relationships. The number 1234 might be one token or four, depending on context. The model has no guarantee that adjacent number tokens represent adjacent values. Simple arithmetic that seems trivial can become genuinely hard when the numbers involved get tokenised in unexpected ways.

Some languages are at a structural disadvantage. A word in English might be one token. The equivalent concept expressed in another language — particularly languages with rich morphology, or languages underrepresented in the training data — might be four or five tokens. This means those languages consume more of the context window for the same amount of meaning, and the model has seen far fewer training examples per token for those languages. The tokeniser encodes the priorities of its training data, and English-heavy training data produces an English-efficient tokeniser.

Code behaves differently to prose for the same reason. Common programming keywords — "def," "return," "import" — tend to get their own tokens. Unusual variable names get fragmented. The model's fluency with different programming languages reflects, in part, how well those languages are represented in the tokeniser's vocabulary.

Karpathy has described tokenisation as the source of a surprising number of language model limitations — not a footnote to the architecture, but a root cause. The decisions made when building the tokeniser, before any training begins, shape what the model finds easy and what it finds hard in ways that cannot be fixed later without retraining from scratch.

## Where this picture breaks down

The "chunks of text map to integers" framing is accurate but it skips over some complexity at the byte level. Modern tokenisers like GPT-4's tiktoken operate on bytes rather than characters, which means they can handle any Unicode input — including emoji, non-Latin scripts, and arbitrary binary data — without a special case for every possible character. The principle is the same; the implementation is slightly lower-level.

The embedding table analogy also simplifies in one important direction. Embeddings are not static after training — in the transformer, the initial embedding is just the starting point. By the time a token's representation has passed through multiple attention layers, it has been reshaped by its context to the point where the original embedding is just a seed. The RGB analogy captures what embeddings are at lookup time. It does not capture what they become by the time the model produces an output.

Finally, tokenisation is not the only way to represent text as numbers for a neural network. Character-level and byte-level models exist and have real advantages for certain tasks. Sub-word tokenisation with BPE is the dominant approach today because it works well at scale — not because it is theoretically optimal.
