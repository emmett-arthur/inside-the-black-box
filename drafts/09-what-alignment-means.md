---
number: 09
slug: 09-what-alignment-means
title: "What Alignment Actually Means"
module: "03 — Training & Alignment"
lede: Alignment is one of the most used and least defined terms in AI. Here is what it actually means, why it is harder than it sounds, and why it matters more as models get better.
next_slug: 10-rlhf
next_title: "RLHF: Teaching a Model to Be Helpful"
---

## A word that means too many things

Depending on who is using it, alignment means the model is safe, or helpful, or honest, or not going to destroy the world, or just sufficiently polite in customer service contexts. The word has been stretched to cover so much that it risks meaning nothing.

Tighter definition: alignment means the model does what humans actually intend, not just what they literally asked for.

That gap, between the instruction given and the intent behind it, is where alignment lives. It sounds small. It is not.

## The weight loss problem

Consider a simple request: "help me lose weight fast."

A capable, literal model has options. Severe caloric restriction. Dangerous stimulants. Dehydration before a weigh-in. All of these satisfy the request as stated. None of them are what the person meant. The person meant: help me lose weight quickly, safely, sustainably. They did not say any of that, because they assumed it was obvious.

Human communication depends on this kind of assumption constantly. We say what we want and leave implicit a vast scaffolding of context, values, and common sense that we expect the listener to fill in. With other humans, this mostly works. With a model optimising for the literal instruction, it fails, in ways that range from mildly unhelpful to genuinely dangerous.

Not a dramatic scenario. Just the gap between what was said and what was meant, encountered at scale, across every domain where a capable model gets deployed.

<!--
DIAGRAMS
--------
Diagram 1 — The intent gap.
Show a three-column table with three example rows.

Column headers: "What the user said" / "What the user meant" / "What a misaligned model might do"

Row 1:
  Said: "Help me lose weight fast"
  Meant: "Help me lose weight quickly and safely"
  Misaligned: Suggests extreme caloric restriction or dangerous methods

Row 2:
  Said: "Write me a persuasive essay arguing X"
  Meant: "Help me practice argumentation"
  Misaligned: Produces maximally persuasive content regardless of truth or harm

Row 3:
  Said: "Make this code run faster"
  Meant: "Optimise this code while keeping it correct and readable"
  Misaligned: Deletes error handling or hardcodes values to pass specific tests

Column 3 uses muted red to signal the problem.
Mac OS window chrome.
-->

## The specification problem

You cannot write down everything you want.

Human values are implicit, contextual, and sometimes contradictory. We want models that are helpful but not obsequious, honest but not brutal, cautious but not paralysed, consistent but also adaptive. None of this can be fully specified in advance. Much of it we cannot articulate until we see it violated.

Any training signal is therefore an imperfect proxy for what we actually want. This is Goodhart's Law: when a measure becomes a target, it ceases to be a good measure. The reward model used in RLHF is a proxy for human preferences. Optimise hard for it and you get a model that scores well on the proxy, agreeable, fluent, confident, while drifting from the actual goal. Sycophancy is Goodhart's Law applied to human approval. The model learned to seem helpful rather than be helpful, because seeming helpful is what the proxy rewarded.

## Two kinds of misalignment

The Anthropic safety team draws a useful distinction between two failure modes.

The first is a model that pursues dangerous goals strategically, understanding its situation well enough to act against human interests while appearing not to. This is the science fiction version. It is also a real concern for researchers thinking about very capable future systems. The chess grandmaster analogy is apt: it is easy for a grandmaster to detect mistakes in a novice's play, hard for a novice to detect mistakes in a grandmaster's. As models become more capable than the humans evaluating them, detecting this kind of misalignment gets harder precisely when it matters most.

The second is a model making innocent mistakes in high-stakes situations, not out of intent but out of the inevitable imperfection of any training process. Wrong medical information delivered confidently. Training data biases encoded into consequential decisions. A proxy optimised so hard it becomes useless at the actual task. This is what we have now. Less dramatic than the first kind. Not less important.

## Why capability makes it harder

A weak misaligned model is a nuisance. A capable misaligned model is something else.

The weight loss example scales. One person receiving bad advice from a poorly designed app is a small problem. A hundred million people receiving subtly wrong health information from a model that is confident, fluent, and trusted is a different order of problem entirely. The harm does not scale proportionally with capability. It scales faster, because capability means reach, and reach means the same failure pattern propagates further and faster than anyone intended.

Alignment is not a problem you address once you have built a useful model. The more useful the model, the more consequential any remaining misalignment. Capability and alignment have to be developed together, or you are building something that causes harm at impressive scale.

## What alignment is not

A model that refuses every ambiguous request, hedges every answer, and never says anything that could possibly offend anyone has not solved the alignment problem. It has created a different version of it. Over-refusal is a misalignment. Sycophancy is a misalignment. A model that tells you what you want to hear rather than what is true is not aligned with your interests, even if it feels pleasant to interact with.

Safety interventions applied without care can make alignment worse. A model trained to avoid harm at all costs will find the locally optimal solution to that objective, which is often to become useless. The goal is not a model that never does anything wrong. It is a model whose behaviour, across the full range of situations it encounters, reflects what humans actually value, which includes being genuinely useful, even when that is harder than refusing.

## The honest state of things

RLHF and Constitutional AI are both attempts to close the gap between what the model optimises for and what humans actually want. They have different approaches and different tradeoffs. Neither has solved the problem. The next two articles cover how each works and where each falls short.

What makes alignment genuinely hard, not just an engineering problem waiting for a better reward model, is the possibility that human values may not be fully specifiable even in principle. The Goodhart's Law framing assumes the real goal could in principle be written down, and the proxy is just a practical shortcut toward it. But for human values, the goal itself may resist full specification. We may not be able to articulate what we want in a form a model could optimise for, even with unlimited time and effort. That is a different and harder problem. It is also, increasingly, the one the field is contending with.

## Where this picture breaks down

The intent gap framing assumes there is a clear human intent to align to. Often there is not. Users contradict themselves, ask for things that conflict with their own stated values, change their minds. Whose intent does the model align to when different users want different things? When the user's short-term preference conflicts with their long-term interest? When what someone asks for would harm someone else?

These are not edge cases. They are the normal condition of deploying a capable model at scale across a population with different needs, contexts, and values. Alignment to a single clear human intent is a useful simplification. The actual problem is messier, involves genuine tradeoffs, and sits closer to moral philosophy than to engineering.
