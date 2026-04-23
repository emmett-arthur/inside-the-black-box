---
number: 05
slug: 05-q-k-v-the-lookup-table
title: "Q, K, V: The Lookup Table That Runs the World"
module: "02 — Transformer Architecture"
lede: Attention tells you what to look at. Q, K, and V are how it actually decides.
next_slug: 06-why-transformers-won
next_title: "Why Transformers Beat Everything Before Them"
---

## The gap between what and how

The previous article explained what attention does: every token looks at every other token, computes a score representing how relevant each one is, and blends the results into a richer representation. What it didn't explain is how those scores get computed. That's what Q, K, and V are for.

The letters stand for query, key, and value. They sound abstract, but the idea behind them is something you already understand intuitively. You do a version of it every time you search for something.

## A library with a twist

Imagine walking into a library. You have a question in your head — say, you're trying to understand something about rivers. That question is your query. Every book on the shelf has a title and a set of subject tags — those are the keys. You scan the keys to find which books match your question. The books that match well get pulled off the shelf. What you actually read — the content inside — that's the value.

Query: what am I looking for? Key: what do I advertise that I contain? Value: what do I actually give you once you open me?

Attention works the same way. For every token in a sequence, the model generates all three: a query, a key, and a value. The attention score between two tokens is computed by matching one token's query against another token's key. The output is a weighted blend of values, where the weights are those scores.

<!--
DIAGRAMS
--------
Diagram 1 — The Q/K/V split for a single token.
Show the token "bank" on the left.
Three arrows branch out from it to the right, each labelled:
  - Q: "What am I looking for in other tokens?"
  - K: "What do I advertise that I contain?"
  - V: "What do I actually contribute when attended to?"
Keep it clean and simple — three roles, one token. No computation yet.
The point: every token generates three separate things, each serving a different role in the attention mechanism.
-->

## One word, two meanings

Consider the word "bank." Even before the model has computed anything, it faces an immediate problem: bank as in a financial institution, or bank as in the edge of a river? The meaning is entirely dependent on context — and context, in a transformer, is exactly what Q, K, and V are designed to resolve.

"Bank" generates a key that effectively advertises its ambiguity — something like "I could be financial or geographical, and I'm waiting for context to tell me which." Other tokens in the sentence generate queries that reflect what they're looking for. The word "river" generates a query oriented toward geographical, physical things. The word "account" generates a query oriented toward financial things.

When "river" 's query meets "bank" 's key, the score is high — these two things are pointing at each other. When "account" 's query meets "bank" 's key, a different facet lights up. The score reflects how well the query and key align, which is just a way of asking: given what this token is looking for, how relevant is what that token is offering?

## How the score is actually computed

The score between two tokens is calculated by taking their query and key vectors — which are just lists of numbers representing each token in the model's internal space — and measuring how much they point in the same direction. Two vectors pointing in the same direction produce a high score. Two vectors pointing away from each other produce a low score. Vectors at right angles to each other produce a score near zero.

You do not need to know the exact maths. What matters is the intuition: the score is a measure of alignment. A high score means the query and the key are a good match — this token is relevant to what the other token is looking for. A low score means they are not. In our "bank" example, "river" and "bank" produce a high score when the sentence is about geography. "Account" and "bank" produce a high score when the sentence is about finance. The same word, different scores, depending entirely on what else is in the sequence.

<!--
DIAGRAMS
--------
Diagram 2 — Query meets key, produces a score.
Show two short example sentences side by side:
  Left: "The river bank was steep."
  Right: "She checked her bank account."
In both sentences, highlight the token "bank".
For the left sentence: draw a line from "river" to "bank" labelled "score: 0.81 → geographical meaning activated"
For the right sentence: draw a line from "account" to "bank" labelled "score: 0.79 → financial meaning activated"
Below each sentence, show the value that "bank" contributes: 
  Left: value = "river bank (geographical)"
  Right: value = "bank account (financial)"
The point: same word, same key, but different queries from context produce different scores — and different values get contributed as a result.
-->

## Why query, key, and value are three separate things

Here is the part that makes the whole system genuinely powerful. The key — what a token advertises — and the value — what it actually contributes — are not the same thing.

In the library analogy, the title on the spine of the book and the content inside the book are different things. The title gets you to the right book. What you read once you open it is something richer, more specific, more contextual.

"Bank" advertises ambiguity via its key: I could be either thing, context will decide. But its value — what it actually delivers to the tokens attending to it — is the resolved meaning. Next to "river," its value carries geographical, physical connotations. Next to "account," its value carries financial ones. The key is the same in both sentences. The value is different.

This separation is what lets the model handle the actual messiness of language. Without it, every word would have one fixed meaning regardless of context — and language does not work that way. With the key/value split, a token can advertise one thing and deliver another, which means what a word contributes to the tokens around it can shift depending on where it appears and what is attending to it. Combined with multi-head attention running several of these lookups in parallel, the model ends up with a representation of each token that is shaped by its full context — not a static dictionary definition, but a meaning that has been resolved by everything around it.

That is what makes transformers so much better at language than anything that came before. Not magic. Just a very well-designed lookup system, run billions of times.

## Where this picture breaks down

The library analogy is useful but it implies a level of tidiness that does not exist in practice. Real query, key, and value vectors are not human-readable. They are lists of hundreds or thousands of numbers, and what they encode is not something you can inspect and label as "geographical meaning" or "financial meaning." Those interpretations are useful for building intuition — they are not literally what is stored.

The "same key, different value" framing also simplifies how the model actually works. In practice, keys are not entirely static either — they are generated by passing the token's embedding through a learned weight matrix, which means the key a token produces is already partially shaped by the training process. The clean separation between advertising and delivering is real, but messier than the analogy suggests.

Finally, Q, K, and V describe only the attention mechanism itself. The transformer has other components — feed-forward layers, layer normalisation, positional encodings — that this article has not touched. Attention is the heart of the transformer, but it does not work alone.
