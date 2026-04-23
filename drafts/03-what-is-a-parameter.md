---
number: 03
slug: 03-what-is-a-parameter
title: What is a Parameter?
module: "01 — Foundations"
lede: Everyone quotes the number. Almost nobody knows what's actually being counted.
next_slug: 04-attention-the-mechanism-behind-everything
next_title: "Attention: The Mechanism Behind Everything"
---

## Why you keep hearing this word

At some point you noticed that AI models get described by a number. GPT-3 had 175 billion of them. LLaMA 3 comes in 8 billion and 70 billion flavours. Someone on Twitter will tell you a 7B model running on your laptop is "almost as good" as something with ten times as many. The number in question is always parameters, and it's attached to model names the way megapixels used to be attached to cameras.

For a while in the 2000s, megapixels were the number. Camera manufacturers led with it. Consumers used it to compare. A 12-megapixel camera was assumed to be better than an 8-megapixel one. The logic wasn't entirely wrong — more megapixels does mean something real about resolution — but it obscured everything else that actually determines image quality: sensor size, lens optics, software processing. Megapixels were the easiest number to put on the box.

Parameter count is AI's megapixel moment. It means something real. It became the default shorthand because it's the most convenient single number to describe a model's capacity. And like megapixels, it tells you less than the people quoting it tend to imply.

## A parameter is a weight

Strip away the marketing and a parameter is just a number inside the network — one of the learnable values that gets adjusted during training. In most contexts, parameters and weights mean the same thing, though technically parameters also include biases, which are small offset values added at each neuron.

In our house price model from the previous articles, every connection between neurons has a weight. The connection between "distance to centre" and the first hidden layer has a weight. The connection between that hidden layer and the output has a weight. Each of those is a parameter. Count every connection in the network and you have the parameter count.

A small network predicting house prices from four inputs might have a few hundred parameters. A large language model has billions — not because the basic unit is different, but because the network is vastly deeper and wider, with far more connections between far more neurons.

<!--
DIAGRAMS
--------
Diagram 1: The house price network annotated with parameter count.
Show the same small network from Article 01 (inputs → hidden layer → output),
but this time label each connection line with "param" and a small number (e.g. w₁, w₂... w₁₄).
Show a total count at the bottom: "Total parameters: 14"
Then alongside it, a simple scale illustration showing:
  - House model: ~14 parameters
  - Small LLM (e.g. GPT-2): 117 million parameters  
  - Large LLM (e.g. GPT-4 scale): ~1 trillion parameters
Not a table — just three labelled points on a logarithmic scale bar, showing the orders of magnitude difference.
The point: make "number of parameters" feel countable and concrete before scaling to billions.
-->

## What parameters encode

Before training, parameters are initialised randomly. They encode nothing — just noise. After training on millions of examples, they're different numbers, and those numbers encode something real.

What exactly? The patterns the model found in its training data. In the house model, the weight connecting "distance to centre" to the hidden layer ends up encoding something like: proximity to the centre correlates with higher price, and by roughly this much. That relationship wasn't programmed. It was extracted from data, compressed into a single number, and stored as a weight.

In a large language model the same logic applies at a scale that becomes genuinely hard to think about. The parameters of GPT-4 encode statistical patterns across an enormous fraction of human written text — the relationship between words, ideas, facts, styles, arguments. Not as a database of facts that can be looked up, but as a vast web of weighted connections that collectively produce plausible continuations of text. Everything the model "knows" lives in those numbers. There is nothing else.

This is why deleting a model means deleting its weights. The architecture — the blueprint for how neurons connect — is just a structure. The parameters are the knowledge.

## Parameters vs hyperparameters

There is a second kind of number in machine learning that gets conflated with parameters: hyperparameters. They sound similar and they are both numbers that shape model behaviour, but they are fundamentally different things.

Parameters are learned. The model finds their values during training by adjusting them to reduce loss. Humans never set them directly.

Hyperparameters are chosen. A human decides them before training begins and they stay fixed throughout. The learning rate from the previous article is a hyperparameter — it controls how large each weight update is, but it is not itself updated by the training process. Other hyperparameters include the number of layers in the network, the number of neurons per layer, and the batch size.

The distinction matters because when people say "a 70 billion parameter model," they are talking about learned parameters — the knowledge baked in through training — not the structural choices made before training started.

<!--
DIAGRAMS
--------
Diagram 2: A two-column comparison table distinguishing parameters from hyperparameters.
Columns: "Parameters" / "Hyperparameters"
Rows:
  - Set by: Training process / Human before training
  - Example: Connection weight between neurons / Learning rate
  - Example: Bias values / Number of layers
  - Example: Attention weights / Batch size
  - Change during training: Yes / No
  - What they encode: Learned patterns from data / Structural decisions about the model
Clean monospace table in Mac OS window chrome. The point is to make the distinction feel crisp and memorable.
-->

## Why scale matters — and what it cannot tell you

More parameters means more capacity. A network with ten million parameters can encode more complex patterns than one with ten thousand. At the scale of large language models, the relationship between parameter count and capability is real — models with more parameters tend to perform better on a wide range of tasks, all else being equal.

But all else is rarely equal. Training data matters as much as parameter count, perhaps more. A 7 billion parameter model trained carefully on high-quality, well-curated data can outperform a 70 billion parameter model trained carelessly on noisy data. Architecture matters too — the specific way neurons are connected and how attention is implemented affects what a model can learn, not just how much. And training method matters: two models with identical parameter counts and identical data will behave differently depending on whether and how they were fine-tuned or aligned after pre-training.

Parameter count became the headline number because it is easy to measure and easy to compare. It tells you something real about capacity. It does not tell you about the quality of training, the composition of data, the architecture choices, or how the model behaves on any specific task. A camera with 108 megapixels and a cheap plastic lens will still produce worse photographs than one with 12 megapixels and excellent optics.

## Where this picture breaks down

The weight-as-knowledge framing is useful but it simplifies in ways worth naming. No individual parameter encodes a discrete fact or concept — knowledge is distributed across millions of weights simultaneously, and the same weight participates in encoding many different patterns at once. You cannot point to a single parameter and say "this one knows that Paris is the capital of France." It does not work that way.

Parameter count also says nothing about a model's context window — how much text it can hold in mind at once — which has a significant effect on what it can do in practice. Two models with the same parameter count can have very different context window sizes, and for many tasks the context window matters more than the total parameter count.

Finally, the megapixels analogy breaks down in one important direction: unlike cameras, where the megapixel race has largely plateaued, the parameter race in AI is still live. The relationship between scale and capability has not yet hit a clear ceiling, and researchers continue to find that larger models develop qualitatively new capabilities that smaller models simply do not have — a phenomenon that has no clean equivalent in consumer electronics.
