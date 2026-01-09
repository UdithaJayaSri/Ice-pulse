import {
  animate,
  createTimeline,
  createTimer,
  stagger,
  utils
} from 'https://esm.sh/animejs';

const creatureEl = document.querySelector('#creature');

const viewport = {
  w: window.innerWidth * 0.5,
  h: window.innerHeight * 0.5
};

const cursor = { x: 0, y: 0 };
const rows = 13;
const grid = [rows, rows];
const from = 'center';

const scaleStagger = stagger([2, 5], { ease: 'inQuad', grid, from });
const opacityStagger = stagger([1, 0.1], { grid, from });

// Create particles
for (let i = 0; i < rows * rows; i++) {
  creatureEl.appendChild(document.createElement('div'));
}

const particleEls = creatureEl.querySelectorAll('div');

// Container size
utils.set(creatureEl, {
  width: rows * 10 + 'em',
  height: rows * 10 + 'em'
});

// Initial particle styles
utils.set(particleEls, {
  x: 0,
  y: 0,
  scale: scaleStagger,
  opacity: opacityStagger,
 background: stagger([85, 30], {
  grid,
  from,
  modifier: v => `hsl(195, 85%, ${v}%)`
}),

  boxShadow: stagger([8, 1], {
    grid,
    from,
    modifier: v => `0 0 ${utils.round(v, 0)}em var(--red)`
  }),
  zIndex: stagger([rows * rows, 1], {
    grid,
    from,
    modifier: utils.round(0)
  })
});

// Pulse animation
const pulse = () => {
  animate(particleEls, {
    keyframes: [
      {
        scale: 5,
        opacity: 1,
        delay: stagger(90, { start: 1650, grid, from }),
        duration: 150
      },
      {
        scale: scaleStagger,
        opacity: opacityStagger,
        duration: 600,
        ease: 'inOutQuad'
      }
    ]
  });
};

// Follow loop
const mainLoop = createTimer({
  frameRate: 15,
  onUpdate: () => {
    animate(particleEls, {
      x: cursor.x,
      y: cursor.y,
      delay: stagger(40, { grid, from }),
      duration: stagger(120, {
        start: 750,
        ease: 'inQuad',
        grid,
        from
      }),
      ease: 'inOut',
      composition: 'blend'
    });
  }
});

// Auto movement
const autoMove = createTimeline()
  .add(cursor, {
    x: [-viewport.w * 0.45, viewport.w * 0.45],
    modifier: x =>
      x + Math.sin(mainLoop.currentTime * 0.0007) * viewport.w * 0.5,
    duration: 3000,
    ease: 'inOutExpo',
    alternate: true,
    loop: true,
    onBegin: pulse,
    onLoop: pulse
  }, 0)
  .add(cursor, {
    y: [-viewport.h * 0.45, viewport.h * 0.45],
    modifier: y =>
      y + Math.cos(mainLoop.currentTime * 0.00012) * viewport.h * 0.5,
    duration: 1000,
    ease: 'inOutQuad',
    alternate: true,
    loop: true
  }, 0);

// Manual override timeout
const manualMovementTimeout = createTimer({
  duration: 1500,
  onComplete: () => autoMove.play()
});

// Mouse / touch follow
const followPointer = e => {
  const event = e.type === 'touchmove' ? e.touches[0] : e;
  cursor.x = event.pageX - viewport.w;
  cursor.y = event.pageY - viewport.h;

  autoMove.pause();
  manualMovementTimeout.restart();
};

document.addEventListener('mousemove', followPointer);
document.addEventListener('touchmove', followPointer);
