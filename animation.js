class FlowElement {
    constructor(x, y, frames, speed) {
        this.x = x;
        this.y = y;
        this.frames = frames;
        this.speed = speed;
        this.currentFrame = 0;
        this.element = document.createElement('div');
        this.element.className = 'element';
        this.element.style.left = `${x * 8.4}px`;  // Approximate monospace character width
        this.element.style.top = `${y * 17}px`;    // Approximate line height
        document.getElementById('terminal').appendChild(this.element);
    }

    update(frameCount) {
        if (frameCount % this.speed === 0) {
            this.currentFrame = (this.currentFrame + 1) % this.frames.length;
            this.element.textContent = this.frames[this.currentFrame];
        }
    }
}

// Animation frames generation functions
function createLoadingFrames(filling, length) {
    const filled = '█';
    const empty = '⎕';
    return Array.from({length: length + 1}, (_, i) => 
        filling ? 
        filled.repeat(i) + empty.repeat(length - i) :
        filled.repeat(length - i) + empty.repeat(i)
    );
}

function createArrowFrames(direction, length) {
    if (direction === 'right') {
        return Array.from({length: length + 1}, (_, i) => 
            '─'.repeat(i) + '▶' + '─'.repeat(length - i)
        );
    }
    // Add other directions as needed
}

// Initialize elements
const elements = [
    // Static elements
    new FlowElement(3, 2, [
        `*                                                ┌──────────┐
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
        ┌──────────┐          │  │         ▲    │          │          │           │               │   │                      └─────────┘
        │  Bank    │   Leader Schedule     │    │          │          │           └───────┬───────┘   │
        │          ├───────────────────────┘    │    ┌─────┴────┐     │                   │           │
        │          │          │  │              │    │ Repair   │     │                   │           │
        └──────────┘    ┌───────────────────────▶│ Service  │     │  Incomplete       │           │
                        │         │  │              │    │          │◀────────────────────────┘           │
                        │         │  │              │    └──────────┘     │  Slots                        │
                        │         │  │              │                     │                               │
                        │         │  └────────────────────────────────────┘                               │
                        │         │                 │                                                     │
                        ▼         │                 ▼                                                     │
                 ┌────────────┐   │          ┌───────────────┐                                            │
                 │ Peer       │   │          │               │                                            │
                 │ Validators │   │          │ Retransmitter │                                            │
                 │            │◀─────────────┤               │                                            │
                 └────────────┘   │          └───────────────┘                                            │
                                  │                  ▲                                                    │
                                  │                  │                                                    │
                                  └───────────────────────────────────────────────────────────────────────┘
                                              │
                                   ContactInfo│
                                              │
                                       ┌──────┴─┐
                                       │ Gossip │
                                       │ Service│
                                       └────────┘`
    ], Infinity),  // Static element
    
    // Animated elements
    new FlowElement(17, 16, createArrowFrames('right', 15), 2),
    new FlowElement(4, 21, createLoadingFrames(false, 10), 20)
];

// Animation loop
let frameCount = 0;
function animate() {
    elements.forEach(element => element.update(frameCount));
    frameCount++;
    requestAnimationFrame(animate);
}

animate();
