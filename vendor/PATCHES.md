# Local renderer patch — 2026-11-05

The bundled Three.js renderer now accepts an optional `transmissionResolutionScale` property. Its default is `1`, preserving the original behavior. Values are clamped to `[0.25, 1]`.

Only the width and height of the internal transmission render target are multiplied by this scale and rounded down, with a minimum of one pixel. The WebGL 1 power-of-two fallback still runs after scaling. The renderer's main drawing-buffer size, viewport, materials, MSAA settings, and shadow map are unchanged.

The gallery sets this property to `0.5`. The main cover image and DOM text do not use this reduced buffer. The glass refracts the smaller background image. The transmission sampler receives the target's actual dimensions through the existing renderer code.

This is a narrow local backport, not a Three.js upgrade. The original library is preserved in the deployment backup. To disable the optimization, set the gallery's `config.transmissionResolutionScale` to `1`. Recheck this local patch if replacing the bundled library.
