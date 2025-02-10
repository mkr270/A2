<!DOCTYPE html>
<html>
<head>
    <title>System Architecture Animation</title>
    <style>
        body {
            background: #000;
            margin: 0;
            overflow: hidden;
        }
        #terminal {
            color: #87d4f8;
            font-family: 'DejaVu Sans Mono', Consolas, monospace;
            font-size: 14px;
            line-height: 17px;
            white-space: pre;
            position: relative;
            padding: 20px;
        }
        .layer {
            position: absolute;
            white-space: pre;
        }
    </style>
</head>
<body>
    <div id="terminal"></div>
    <script>
// Configuration
const CHAR_WIDTH = 8.4;
const LINE_HEIGHT = 17;
const BASE_FRAME_RATE = 50;

class AnimationElement {
    constructor(x, y, frames, speed) {
        this.x = x;
        this.y = y;
        this.frames = frames;
        this.speed = speed;
        this.frameIndex = 0;
        this.lastUpdate = 0;
        this.element = this.createElement();
    }

    createElement() {
        const el = document.createElement('div');
        el.className = 'layer';
        el.style.left = `${this.x * CHAR_WIDTH}px`;
        el.style.top = `${this.y * LINE_HEIGHT}px`;
        el.textContent = this.frames[0].join('\n');
        return el;
    }

    update(timestamp) {
        if (timestamp - this.lastUpdate > BASE_FRAME_RATE) {
            if (++this.frameIndex >= this.frames.length) this.frameIndex = 0;
            this.element.textContent = this.frames[this.frameIndex].join('\n');
            this.lastUpdate = timestamp;
        }
    }
}

// Animation generators
const createLoadingFrames = (filling, length) => {
    const filled = '█';
    const empty = '⎕';
    return Array.from({length: length + 1}, (_, i) => 
        [filling ? 
            filled.repeat(i) + empty.repeat(length - i) :
            filled.repeat(length - i) + empty.repeat(i)]
    );
};

const createArrowFrames = (direction, length) => {
    const horizontal = (dir, len) => 
        Array.from({length: len + 1}, (_, i) => 
            ['─'.repeat(i) + dir + '─'.repeat(len - i)]
        );

    const vertical = (dir, len) => 
        Array.from({length: len}, (_, i) => 
            Array.from({length: len}, (_, j) => 
                j === (dir === '▼' ? i : len - 1 - i) ? dir : '│'
            )
        );

    return {
        right: () => horizontal('▶', length),
        left: () => horizontal('◀', length),
        up: () => vertical('▲', length),
        down: () => vertical('▼', length)
    }[direction]();
};

// Initialize elements
const elements = [
    // Static architecture diagram
    new AnimationElement(3, 2, [[`
*                                                ┌──────────┐
                                                 │ Gossip   │
                                                 │ Service  │
                                                 │          │ 
                                                 └──────────┘
                                                       │ContactInfo
                                                       │
                          ┌───────────────────────────────────────────────────────────────────────┐
                          │ Retransmit Stage           │                                          │
                          │                            │                                          │
                          │  ┌────────────────────────────────────┐                               │
                          │  │Window Service           │          │                               │                      ┌─────────┐
                          │  │                         │          │           ┌───────────────┐   │  ┌────────────┐      │         │
               Packets    │  │  ┌─────────────┐        │          │           │               │   │  │ Deshredder │      │ Replay  │
              ─────────────────▶│ ShredFilter ├──────────────────────────────▶│  Blockstore   ├──────┤ (entries)  ├─────▶│ Stage   │
                          │  │  └─────────────┘        │          │           │               │   │  └────────────┘      │         │
        ┌──────────┐      │  │         ▲    │          │          │           │               │   │                      └─────────┘
        │  Bank    │ Leader Schedule   │    │          │          │           └───────┬───────┘   │
        │          ├───────────────────┘    │    ┌─────┴────┐     │                   │           │
        │          │        │  │            │    │ Repair   │     │                   │           │
        └──────────┘  ┌─────────────────────┼────▶│ Service  │     │  Incomplete       │           │
                      │         │  │        │    │          │◀────────────────────────┘           │
                      │         │  │        │    └──────────┘     │  Slots                        │
                      │         │  │        │                     │                               │
                      │         │  └──────────────────────────────┘                               │
                      │         │             │                                                     │
                      ▼         │             ▼                                                     │
               ┌────────────┐   │      ┌───────────────┐                                            │
               │ Peer       │   │      │               │                                            │
               │ Validators │   │      │ Retransmitter │                                            │
               │            │◀─────────┤               │                                            │
               └────────────┘   │      └───────────────┘                                            │
                                │            ▲                                                      │
                                │            │                                                      │
                                └───────────────────────────────────────────────────────────────────┘
                                            │
                                 ContactInfo│
                                            │
                                     ┌──────┴─┐
                                     │ Gossip │
                                     │ Service│
                                     └────────┘
    `.trim().split('\n')]], Infinity),

    // Animated elements
    new AnimationElement(17, 16, createArrowFrames('right', 15), 2),
    new AnimationElement(15, 20, createArrowFrames('right', 26), 6),
    new AnimationElement(47, 18, createArrowFrames('down', 10), 8),
    new AnimationElement(50, 16, createArrowFrames('right', 29), 6),
    new AnimationElement(27, 32, createArrowFrames('left', 12), 6),
    new AnimationElement(65, 23, createArrowFrames('left', 23), 6),
    new AnimationElement(118, 16, createArrowFrames('right', 4), 6),
    new AnimationElement(4, 21, createLoadingFrames(false, 10), 20),
    new AnimationElement(82, 18, createLoadingFrames(true, 15), 20)
];

// Mount elements
const terminal = document.getElementById('terminal');
elements.forEach(el => terminal.appendChild(el.element));

// Animation loop
let lastFrame = performance.now();
function animate(timestamp) {
    elements.forEach(el => el.update(timestamp));
    requestAnimationFrame(animate);
}

// Start animation
requestAnimationFrame(animate);

// Handle window resize
window.addEventListener('resize', () => {
    elements.forEach(el => {
        el.element.style.left = `${el.x * CHAR_WIDTH}px`;
        el.element.style.top = `${el.y * LINE_HEIGHT}px`;
    });
});
    </script>
</body>
</html>
