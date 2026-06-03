---
title: "3D Renderer"
description: "A renderer that uses a frame graph approach."
year: "2023"
technologies: ["cpp", "opengl", "vulkan"]
weight: 2
---

A real-time 3D renderer built from scratch in C++, using a **frame graph** architecture to manage GPU resource dependencies declaratively.

## Motivation

I wanted to understand modern GPU rendering pipelines at a low level — not just use an engine, but build the underlying abstractions myself.

## Architecture

The renderer uses a **frame graph** (also called a render graph): a directed acyclic graph where nodes are render passes and edges are resource dependencies. The graph is compiled at startup to determine:

- Execution order
- Resource lifetimes (when to allocate / free GPU memory)
- Automatic barrier insertion (Vulkan pipeline barriers)

```cpp
FrameGraph fg;

auto& gbuffer = fg.addPass("GBuffer", [&](PassBuilder& builder) {
    builder.write(albedo);
    builder.write(normal);
    builder.write(depth);
});

auto& lighting = fg.addPass("Lighting", [&](PassBuilder& builder) {
    builder.read(gbuffer.albedo);
    builder.read(gbuffer.normal);
    builder.write(hdrOutput);
});

fg.compile();
fg.execute(cmdBuffer);
```

## Tech

- **C++20** — coroutines for async asset loading
- **Vulkan** — explicit GPU control
- **OpenGL** — used for early prototyping before switching to Vulkan
