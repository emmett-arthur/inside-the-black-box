---
number: 08
slug: 08-pretraining
title: "Pre-training: Learning from the Whole Internet"
module: "03 — Training & Alignment"
lede: Before a model can answer a question or write a line of code, it has to become something. This is how that happens — and why it leaves a few problems baked in.
next_slug: 09-rlhf
next_title: "RLHF: Teaching a Model to Be Helpful"
---

## Batter, cake, frosting, sprinkles

Think of building a language model as baking an elaborate cake.

Pre-training is making the batter. You combine an enormous quantity of raw ingredients — billions of words scraped from the internet, digitised books, Wikipedia, code repositories — and run them through a training process that takes weeks on thousands of machines. Everything the model will ever know goes in here. The capability is in the batter.

What comes out is the base model. The unfrosted cake. Baked, structured, impressive if you know what you're looking at. But plain. Ask it a question and it might answer — or it might just keep generating questions, because that's what text after a question often looks like. It has no concept of being an assistant. It is a very powerful text-prediction engine and nothing more.

The frosting is what comes next. Supervised fine-tuning, reward modelling, RLHF — the phases that turn a base model into something you'd actually want to use. They don't add new knowledge. They shape what's already there.

The sprinkles are fine-tuning for specific contexts. A coding assistant. A customer service bot. A medical tool. Same cake, different occasion.

This article is about the batter. The rest comes after.

## What pre-training actually is

One objective. Predict the next token.

Given a sequence of tokens, what comes next? The model guesses, the guess gets compared to the actual next token in the text, the loss is computed, the weights get nudged. Then the next sequence. Then the next. Run this across hundreds of billions of tokens and the model gradually gets better at predicting what follows in text drawn from across human knowledge.

No human labels. No annotations. The training signal is the text itself — the correct answer is always whatever token actually came next. This is called self-supervised learning. The supervision is built into the data.

The simplicity is deceptive. Predicting the next token well, across the full range of human writing — Wikipedia articles, legal documents, novels, Python code, forum arguments, scientific papers — requires the model to develop a working understanding of facts, grammar, reasoning, and style. Not because anyone designed it to. Because those are the things that make text predictable.

<!--
DIAGRAMS
--------
Diagram 1 — The pre-training loop.
Show a circular flow diagram with five steps arranged clockwise:

1. "Sample text from corpus"
   Sub-label: e.g. "Louis XVI was executed in January 1793."

2. "Tokenise"
   Sub-label: text becomes a list of integers
   e.g. [6599, 26653, 373, 10222, 287, ...]

3. "Predict next token"
   Sub-label: model sees all tokens up to position N, predicts token N+1
   e.g. given "Louis XVI was executed in January" → predicts "1793"

4. "Measure loss"
   Sub-label: how wrong was the prediction?
   e.g. predicted "1794" → high loss. predicted "1793" → low loss.

5. "Update weights"
   Sub-label: nudge every weight in the direction that reduces loss
   Arrow leads back to step 1: "repeat across hundreds of billions of tokens"

Use the French Revolution sentence throughout as the running example.
Mac OS window chrome. Clean cycle layout.
-->

## What goes into the batter

The training corpus is the most consequential decision in pre-training. More than architecture. More than parameter count. What you train on is what you get.

A typical corpus pulls from a few main sources. Common Crawl — a regularly updated scrape of a large chunk of the public internet, filtered and cleaned. Books, for long-form coherent prose. Wikipedia, for factual and well-organised text across a wide range of topics. GitHub, for code. Scientific papers, legal documents, news. The mix varies by model.

It is not a neutral mix. English dominates. Recent text dominates. Text that exists on the internet dominates, which means anything that lives primarily in people's heads, in oral traditions, in languages that are under-digitised — that is largely missing. The model knows what the training data knew, weighted by how often it appeared.

This is why a model is fluent in Python and shaky in a less common language. Why it knows more about American law than Indonesian law. Why its knowledge cuts off at a specific date and the world, as far as it is concerned, simply stops there. The batter contains what went into it. Nothing else.

## What the model is actually learning

It is not memorising text. That is a common assumption and it is wrong.

To predict that "The capital of France is" continues with "Paris," the model has to have encoded something that functions like a geographic fact. To continue a Python function correctly, it has to have encoded something that functions like programming logic. To extend a legal argument coherently, it has to have encoded something that functions like knowledge of legal reasoning.

None of this is stored as a lookup table of facts. It is distributed across billions of weights as statistical pattern — the accumulated regularities of everything the model read. The knowledge is implicit. But it is real. And it is surprisingly broad.

The base model that emerges can answer questions, write code, summarise documents, translate languages, and reason through problems. Not because it was trained to do any of those things specifically. Because doing them is a side effect of being good at predicting text across everything humans have written.

## Why this produces hallucination

The model was trained to predict plausible text. Not true text. Plausible text.

That distinction is everything. When it generates an answer, it is not retrieving a fact and checking it against a source. It is producing whatever sequence of tokens its weights judge to be the most likely continuation of your prompt. Usually that is also accurate — because accurate completions of factual prompts are statistically common in the training data. But sometimes it is not, and the model has no way of knowing the difference.

There is no internal alarm. No flag that says "I am not sure about this." The confidence in the output is a property of how the text flows, not a signal that the model actually knows what it is talking about.

This is not a bug someone introduced. It is what you get when you train a system to produce convincing text at scale. The frosting helps. It does not fix it. If you want to understand why hallucination is genuinely hard to solve — start here.

## The scale of it

GPT-3 trained on roughly 300 billion tokens. LLaMA 3 trained on 15 trillion. These numbers are large enough to be nearly meaningless without context, so here is some: 15 trillion tokens is approximately 10 million books. Training a model at this scale requires thousands of specialised GPUs running continuously for months. The electricity bill alone for a single frontier pre-training run is estimated in the millions of dollars.

Pre-training from scratch is something only a handful of organisations in the world can do. The barrier is not intellectual — the techniques are published and broadly understood. The barrier is infrastructure and capital. What separates the frontier labs from everyone else is not secret knowledge. It is the ability to run the process at scale.

For most applications this does not matter. Base models are released — sometimes openly, sometimes via API — and everything that follows can be applied on top of them at a fraction of the cost.

## What pre-training produces — and what it doesn't

The base model is genuinely strange to interact with.

Ask it a question and it might give you a thoughtful answer. Or it might continue in the style of a FAQ, generating three more questions after yours. It has no preference for being helpful. No sense that you are a person waiting for a response. It is predicting what text typically follows text like yours — and text like yours, in the training data, was often followed by more text of the same kind rather than a direct answer.

This is the unfrosted cake. The capability is there. The usability is not. Which is why three more phases exist.

<!--
DIAGRAMS
--------
Diagram 2 — The four-phase pipeline.
Show a horizontal flow with four stages, left to right, connected by arrows.
Each stage has three elements: a phase name, a one-line description of what happens, and a label for what the model looks like coming out.

Stage 1 — Pre-training
  What happens: "trains on hundreds of billions of tokens of raw text"
  Output: "Base model — powerful text predictor. Knows a lot. Follows no instructions."

Stage 2 — Supervised Fine-Tuning (SFT)
  What happens: "shown thousands of examples of good question/answer pairs"
  Output: "Instruction follower — responds rather than continues. Still unpolished."

Stage 3 — Reward Modelling
  What happens: "a separate model learns to score responses the way a human would"
  Output: "Reward model — not the assistant itself. A scorer used in the next phase."

Stage 4 — RLHF
  What happens: "SFT model is fine-tuned to maximise the reward model's scores"
  Output: "Aligned assistant — helpful, harmless, honest. What you actually interact with."

Add a subtle "you are here" marker on Stage 1.
Below the diagram: "Each phase builds on the last. The batter is made once. Everything after shapes it."
Mac OS window chrome.
-->

## Where the analogy breaks down

In baking, each phase is irreversible. You cannot unbake a cake. In model development you can go back to the base model and apply completely different fine-tuning — multiple different assistants can be built on the same pre-trained base. The ingredients are reusable in a way flour and eggs are not.

The analogy also implies a clean sequence. In practice the boundaries blur. Some approaches interleave pre-training and fine-tuning. Some models skip explicit reward modelling. The four-phase pipeline is a useful map, not a universal recipe.

And "the capability is all there from the start" is mostly true. Some capabilities do emerge specifically during fine-tuning rather than pre-training. The line between what the base model knows and what the fine-tuned model can do is blurrier than the analogy suggests — and understanding exactly where capability comes from is still an open research question.
