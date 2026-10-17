document.addEventListener('DOMContentLoaded', () => {
    
    // Set Current Year in Footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Theme Toggle Logic (Dark/Light Mode)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Check local storage for theme preference, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Older browsers (and anyone who asked for less motion) just get the
        // swap, softened by the colour transitions already on body.
        if (!document.startViewTransition || prefersReduced) {
            setTheme(newTheme);
            return;
        }

        // The reveal grows from the button itself, so the new palette reads as
        // spreading out of the control that was actually pressed. Radius is the
        // distance to the furthest corner, so the circle always clears the page.
        const rect = themeToggleBtn.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        const endRadius = Math.hypot(
            Math.max(originX, window.innerWidth - originX),
            Math.max(originY, window.innerHeight - originY)
        );

        // Per-element colour transitions would still be mid-flight when the
        // browser snapshots the incoming state, so that snapshot would capture
        // the *old* palette and the wipe would reveal nothing. Suppressed for
        // the duration — the clip-path is the only motion we want here.
        htmlElement.classList.add('theme-switching');

        const transition = document.startViewTransition(() => setTheme(newTheme));

        transition.ready.then(() => {
            htmlElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${originX}px ${originY}px)`,
                        `circle(${endRadius}px at ${originX}px ${originY}px)`
                    ]
                },
                {
                    duration: 620,
                    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        }, () => { /* transition skipped — nothing to animate */ });

        // Settled either way: a skipped or interrupted transition must not
        // leave transitions globally disabled.
        const release = () => htmlElement.classList.remove('theme-switching');
        transition.finished.then(release, release);
    });

    function setTheme(theme) {
        htmlElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Icon
        if (theme === 'dark') {
            themeIcon.classList.remove('bx-moon');
            themeIcon.classList.add('bx-sun');
        } else {
            themeIcon.classList.remove('bx-sun');
            themeIcon.classList.add('bx-moon');
        }
    }

    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // 3D Tilt (hero portrait + cards share one pointer-driven material;
    // skipped on touch/coarse pointers and when reduced motion is requested)
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (finePointer && !reducedMotion) {
        document.querySelectorAll('[data-tilt]').forEach(el => {
            const maxDeg = parseFloat(el.dataset.tiltMax) || 8;
            let rafId = null;
            let lastEvent = null;

            const applyTilt = () => {
                const rect = el.getBoundingClientRect();
                const x = (lastEvent.clientX - rect.left) / rect.width;
                const y = (lastEvent.clientY - rect.top) / rect.height;
                const rotateY = (x - 0.5) * 2 * maxDeg;
                const rotateX = (0.5 - y) * 2 * maxDeg;
                el.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
                el.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
                rafId = null;
            };

            el.addEventListener('pointermove', (e) => {
                lastEvent = e;
                if (rafId === null) {
                    rafId = requestAnimationFrame(applyTilt);
                }
            });

            el.addEventListener('pointerenter', () => {
                el.style.setProperty('--tilt-lift', '-6px');
                el.style.setProperty('--tilt-scale', '1.03');
            });

            el.addEventListener('pointerleave', () => {
                if (rafId !== null) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
                el.style.setProperty('--tilt-x', '0deg');
                el.style.setProperty('--tilt-y', '0deg');
                el.style.setProperty('--tilt-lift', '0px');
                el.style.setProperty('--tilt-scale', '1');
            });
        });
    }

    // ---------------------------------------------------------------
    // Threat Mesh — the hero's focal moment.
    // A drifting node graph with packets traversing its links. Every few
    // seconds one node is flagged as a threat, flares, and is mitigated:
    // neighbours pulse inward and the graph settles back to calm.
    // ---------------------------------------------------------------
    const meshCanvas = document.getElementById('threat-mesh');
    const heroSection = document.getElementById('about');

    if (meshCanvas && heroSection && meshCanvas.getContext) {
        const ctx = meshCanvas.getContext('2d');

        // Node count follows hero *area*, not a fixed budget: a fixed count
        // thins out on wide screens until average spacing exceeds the link
        // radius and the graph stops reading as a mesh — it was scattered dots
        // at 1900px wide. Clamped at both ends: the link pass is O(n²), so a 4K
        // hero must not run away, and a phone still needs enough to connect.
        const AREA_PER_NODE = 23000;
        const MIN_NODES = 28;
        const MAX_NODES = 140;
        // Average links per node. The link radius is *derived* from this and
        // the real node spacing rather than being a fixed pixel value: with a
        // fixed radius the clamps above skew the graph badly at the extremes
        // (a phone hit ~12 links per node — a thicket, on the device that can
        // least afford one). Solving for the radius keeps every viewport at
        // this same density, so the mesh reads identically everywhere.
        const TARGET_DEGREE = 4.2;
        const CURSOR_RADIUS = 190;
        // Peak cursor displacement, in px. Applied at draw time only.
        const CURSOR_PULL = 16;
        const FLARE_INTERVAL = 8000;

        const nodeCountFor = (w, h) => Math.max(
            MIN_NODES,
            Math.min(MAX_NODES, Math.round((w * h) / AREA_PER_NODE))
        );

        // degree = (n / area) * π * r²  →  solve for r at the target degree.
        const linkRadiusFor = (w, h, n) =>
            Math.sqrt((TARGET_DEGREE * w * h) / (n * Math.PI));

        // Set from the hero's real size on every seed/resize.
        let linkDistance = 175;

        let width = 0;
        let height = 0;
        let nodes = [];
        let packets = [];
        let flare = null;
        let pointer = { x: -9999, y: -9999, active: false };
        let rafId = null;
        let running = false;
        let lastFlareAt = 0;
        let lastFrameAt = 0;

        // Palette is read from CSS so the mesh follows the theme toggle.
        let palette = { node: '255, 122, 0', flare: '#FF3B30' };

        const readPalette = () => {
            const styles = getComputedStyle(document.documentElement);
            palette.node = (styles.getPropertyValue('--mesh-node') || '255, 122, 0').trim();
            palette.flare = (styles.getPropertyValue('--flare') || '#FF3B30').trim();
        };

        const resize = () => {
            const rect = heroSection.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            meshCanvas.width = Math.round(width * dpr);
            meshCanvas.height = Math.round(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const seed = () => {
            const count = nodeCountFor(width, height);
            linkDistance = linkRadiusFor(width, height, count);

            nodes = Array.from({ length: count }, () => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                return {
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 0.18,
                    vy: (Math.random() - 0.5) * 0.18,
                    radius: 1.2 + Math.random() * 1.8,
                    pulse: 0,
                    // Draw-time position: drift plus the cursor's transient
                    // lean. Seeded to the base position because the first paint
                    // after seed() happens before any step() has run.
                    rx: x,
                    ry: y
                };
            });
            packets = [];
            flare = null;
        };

        const neighboursOf = (index) => {
            const source = nodes[index];
            const found = [];
            for (let i = 0; i < nodes.length; i++) {
                if (i === index) continue;
                const dx = nodes[i].x - source.x;
                const dy = nodes[i].y - source.y;
                if (dx * dx + dy * dy < linkDistance * linkDistance) found.push(i);
            }
            return found;
        };

        const spawnPacket = () => {
            const from = Math.floor(Math.random() * nodes.length);
            const options = neighboursOf(from);
            if (!options.length) return;
            const to = options[Math.floor(Math.random() * options.length)];
            packets.push({ from, to, t: 0, speed: 0.006 + Math.random() * 0.008 });
        };

        const startFlare = () => {
            const index = Math.floor(Math.random() * nodes.length);
            flare = { index, t: 0, neighbours: neighboursOf(index) };
        };

        const step = (delta) => {
            // Drift and bounce. Reflecting at the edges rather than wrapping
            // keeps a node from teleporting across the hero, which snapped all
            // of its links at once and read as a glitch.
            for (const node of nodes) {
                node.x += node.vx * delta;
                node.y += node.vy * delta;

                if (node.x < 0) { node.x = 0; node.vx = Math.abs(node.vx); }
                if (node.x > width) { node.x = width; node.vx = -Math.abs(node.vx); }
                if (node.y < 0) { node.y = 0; node.vy = Math.abs(node.vy); }
                if (node.y > height) { node.y = height; node.vy = -Math.abs(node.vy); }

                // The cursor lean is a pure function of where the node is right
                // now — never written back into x/y. Accumulating it there let
                // the pointer permanently vacuum nodes into a clump that stayed
                // long after the mouse had gone.
                let ox = 0;
                let oy = 0;
                if (pointer.active) {
                    const dx = pointer.x - node.x;
                    const dy = pointer.y - node.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < CURSOR_RADIUS && dist > 0.01) {
                        const falloff = 1 - dist / CURSOR_RADIUS;
                        // Squared falloff eases in at the rim; capping against
                        // dist stops a node from sliding past the cursor.
                        const mag = Math.min(CURSOR_PULL * falloff * falloff, dist * 0.6);
                        ox = (dx / dist) * mag;
                        oy = (dy / dist) * mag;
                    }
                }
                node.rx = node.x + ox;
                node.ry = node.y + oy;

                if (node.pulse > 0) node.pulse = Math.max(0, node.pulse - 0.012 * delta);
            }

            // Packets ride their link, then retire.
            for (let i = packets.length - 1; i >= 0; i--) {
                packets[i].t += packets[i].speed * delta;
                if (packets[i].t >= 1) {
                    nodes[packets[i].to].pulse = 1;
                    packets.splice(i, 1);
                }
            }
            if (packets.length < 5 && Math.random() < 0.03 * delta) spawnPacket();

            // Flare rises, then neighbours pulse as it is mitigated.
            if (flare) {
                flare.t += 0.004 * delta;
                if (flare.t >= 0.55 && !flare.mitigated) {
                    flare.mitigated = true;
                    for (const n of flare.neighbours) nodes[n].pulse = 1;
                }
                if (flare.t >= 1) flare = null;
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Links first, so nodes sit above them. Drawn from rx/ry so a link
            // always meets the dot where it actually appears under the cursor.
            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].rx - nodes[i].rx;
                    const dy = nodes[j].ry - nodes[i].ry;
                    const distSq = dx * dx + dy * dy;
                    if (distSq >= linkDistance * linkDistance) continue;
                    const dist = Math.sqrt(distSq);
                    // Denser graph than before, so each strand carries less ink;
                    // the mesh reads as a field rather than a thicket.
                    const strength = (1 - dist / linkDistance) * 0.22;
                    ctx.strokeStyle = `rgba(${palette.node}, ${strength.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].rx, nodes[i].ry);
                    ctx.lineTo(nodes[j].rx, nodes[j].ry);
                    ctx.stroke();
                }
            }

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                const isFlare = flare && flare.index === i;
                const flareEase = isFlare ? Math.sin(Math.min(flare.t, 1) * Math.PI) : 0;
                const radius = node.radius + node.pulse * 1.6 + flareEase * 4;
                const alpha = 0.45 + node.pulse * 0.35 + flareEase * 0.3;

                if (isFlare && flareEase > 0.02) {
                    ctx.beginPath();
                    ctx.fillStyle = palette.flare;
                    ctx.globalAlpha = flareEase * 0.85;
                    ctx.arc(node.rx, node.ry, radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.strokeStyle = palette.flare;
                    ctx.globalAlpha = flareEase * 0.35;
                    ctx.lineWidth = 1.5;
                    ctx.arc(node.rx, node.ry, radius + flare.t * 40, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.lineWidth = 1;
                    continue;
                }

                ctx.beginPath();
                ctx.fillStyle = `rgba(${palette.node}, ${Math.min(alpha, 1).toFixed(3)})`;
                ctx.arc(node.rx, node.ry, radius, 0, Math.PI * 2);
                ctx.fill();
            }

            for (const packet of packets) {
                const a = nodes[packet.from];
                const b = nodes[packet.to];
                const x = a.rx + (b.rx - a.rx) * packet.t;
                const y = a.ry + (b.ry - a.ry) * packet.t;
                ctx.beginPath();
                ctx.fillStyle = `rgba(${palette.node}, 0.95)`;
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const frame = (now) => {
            // Normalised to a 60fps step and clamped so a backgrounded tab
            // cannot resume with one enormous jump.
            const delta = Math.min((now - lastFrameAt) / 16.67, 3);
            lastFrameAt = now;

            step(delta);
            draw();

            if (now - lastFlareAt > FLARE_INTERVAL && !flare) {
                lastFlareAt = now;
                startFlare();
            }

            rafId = requestAnimationFrame(frame);
        };

        const start = () => {
            if (running || reducedMotion) return;
            running = true;
            lastFrameAt = performance.now();
            lastFlareAt = performance.now();
            rafId = requestAnimationFrame(frame);
        };

        const stop = () => {
            running = false;
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        readPalette();
        resize();
        seed();
        draw();
        meshCanvas.classList.add('mesh-ready');

        // With reduced motion the seeded graph stays as drawn above: the
        // composition without the movement.
        if (!reducedMotion) {
            // Only animate while the hero is actually on screen and the tab is
            // focused — both conditions must hold before the loop resumes.
            let heroVisible = false;

            const sync = () => {
                if (heroVisible && !document.hidden) {
                    start();
                } else {
                    stop();
                }
            };

            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => { heroVisible = entry.isIntersecting; });
                sync();
            }, { threshold: 0 });
            heroObserver.observe(heroSection);

            document.addEventListener('visibilitychange', sync);

            if (finePointer) {
                heroSection.addEventListener('pointermove', (e) => {
                    const rect = heroSection.getBoundingClientRect();
                    pointer.x = e.clientX - rect.left;
                    pointer.y = e.clientY - rect.top;
                    pointer.active = true;
                });
                heroSection.addEventListener('pointerleave', () => {
                    pointer.active = false;
                });
            }
        }

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                seed();
                draw();
            }, 180);
        });

        // Keep the mesh in step with the theme toggle.
        new MutationObserver(readPalette).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    // ---------------------------------------------------------------
    // Packet-trace timeline — the spine fills and a packet rides down it,
    // lighting each bullet as it clears them.
    // ---------------------------------------------------------------
    const timeline = document.querySelector('.timeline');
    const trace = document.querySelector('.timeline-trace');

    if (timeline && trace && !reducedMotion) {
        const bullets = Array.from(timeline.querySelectorAll('.timeline-details li'));
        let traceTicking = false;

        const updateTrace = () => {
            const rect = timeline.getBoundingClientRect();
            const viewport = window.innerHeight;

            // 0 when the spine's top reaches ~70% down the viewport,
            // 1 once its bottom has passed ~35% down.
            const startAt = viewport * 0.7;
            const endAt = viewport * 0.35;
            const travel = (rect.height + (startAt - endAt)) || 1;
            const progress = Math.min(Math.max((startAt - rect.top) / travel, 0), 1);

            trace.style.setProperty('--trace-progress', progress.toFixed(4));
            trace.style.setProperty('--trace-height', `${rect.height}px`);

            const packetY = rect.top + progress * rect.height;
            bullets.forEach(li => {
                const liRect = li.getBoundingClientRect();
                li.classList.toggle('lit', packetY >= liRect.top + liRect.height * 0.35);
            });

            traceTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (!traceTicking) {
                requestAnimationFrame(updateTrace);
                traceTicking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', updateTrace);
        updateTrace();
    }

    // ---------------------------------------------------------------
    // Encrypted headline — the name resolves out of cipher glyphs once,
    // on load. Width is reserved first so nothing reflows mid-scramble.
    // ---------------------------------------------------------------
    const scrambleTarget = document.querySelector('[data-scramble]');

    if (scrambleTarget && !reducedMotion) {
        const finalText = scrambleTarget.textContent;
        const glyphs = '!<>-_\\/[]{}—=+*^?#01';
        const duration = 1200;
        const perChar = duration / finalText.length;

        // Each character locks in turn, strictly left to right.
        const settleAt = Array.from(finalText, (_, i) => i * perChar);

        // Rests 3–4s between runs, measured from the moment a run resolves.
        const REPLAY_MIN = 3000;
        const REPLAY_JITTER = 1000;

        const scheduleReplay = () => {
            setTimeout(() => {
                // Nothing to see off screen or in a background tab; check again later.
                const rect = scrambleTarget.getBoundingClientRect();
                const onScreen = rect.bottom > 0 && rect.top < window.innerHeight;
                if (document.hidden || !onScreen) {
                    scheduleReplay();
                    return;
                }
                runScramble();
            }, REPLAY_MIN + Math.random() * REPLAY_JITTER);
        };

        let startedAt = 0;

        const runScramble = () => {
            // Lock the resolved width before any glyph swapping starts.
            scrambleTarget.style.minWidth = `${scrambleTarget.getBoundingClientRect().width}px`;
            startedAt = performance.now();
            requestAnimationFrame(scrambleFrame);
        };

        const scrambleFrame = (now) => {
            const elapsed = now - startedAt;
            let output = '';
            let done = true;

            for (let i = 0; i < finalText.length; i++) {
                const char = finalText[i];
                if (char === ' ') {
                    output += ' ';
                    continue;
                }
                if (elapsed >= settleAt[i]) {
                    output += char;
                } else {
                    output += glyphs[Math.floor(Math.random() * glyphs.length)];
                    done = false;
                }
            }

            scrambleTarget.textContent = output;

            if (done) {
                scrambleTarget.style.minWidth = '';
                scheduleReplay();
                return;
            }
            requestAnimationFrame(scrambleFrame);
        };

        runScramble();
    }

    // ---------------------------------------------------------------
    // Head tracker — the portrait follows the cursor.
    // assets/head/NN.webp are frames cut from a clip of the head sweeping
    // through its range. POSES holds each frame's measured [yaw, pitch] in
    // degrees (+yaw = facing the viewer's right, +pitch = looking down). The
    // cursor is turned into a target pose, eased toward, and the frame whose
    // measured pose is nearest is drawn — so no video plays; the cursor is the
    // timeline.
    // ---------------------------------------------------------------
    const headCanvas = document.getElementById('head-tracker');
    const headFallback = document.getElementById('portrait-fallback');

    if (headCanvas && headCanvas.getContext) {
        const POSES = [[-0.4,5.2],[-0.3,0.4],[-0.5,-1.5],[-0.6,-3.5],[-0.2,-5.4],[2.1,-6.5],[3.2,-7.9],[5.1,-8.2],[7.5,-9.1],[8.9,-9.9],[11.0,-9.3],[12.8,-10.9],[14.7,-11.6],[18.2,-12.1],[20.2,-12.7],[23.2,-12.1],[25.1,-11.5],[25.6,-13.7],[27.6,-10.9],[27.7,-8.4],[26.3,-9.9],[26.7,-6.3],[27.6,-4.7],[27.2,-2.2],[26.7,-0.5],[26.0,1.1],[25.2,2.7],[25.5,4.5],[25.1,6.1],[24.5,7.8],[23.3,9.0],[20.5,8.4],[19.1,10.8],[16.6,10.5],[15.3,11.9],[12.5,12.3],[9.9,12.2],[8.0,13.1],[6.6,14.1],[5.0,13.5],[2.1,13.4],[0.3,13.3],[-1.7,13.8],[-3.9,14.2],[-5.5,13.4],[-7.9,12.7],[-9.3,14.1],[-11.5,12.9],[-13.4,12.7],[-15.5,11.9],[-17.3,11.6],[-18.8,10.0],[-20.5,10.5],[-23.2,10.4],[-24.3,8.1],[-24.0,5.1],[-25.7,4.7],[-24.0,2.6],[-26.3,2.3],[-25.8,0.7],[-24.6,-1.0],[-23.4,-2.7],[-22.2,-4.9],[-20.1,-7.0],[-18.3,-7.5],[-16.5,-7.1],[-14.6,-8.1],[-11.7,-7.2],[-11.8,-5.6],[-9.9,-4.4],[-8.3,-2.3],[-5.7,-1.4],[-4.6,0.0],[-3.1,0.9],[-1.5,2.0],[0.1,2.3],[0.8,4.1]];
        const NEUTRAL = 75; // straight-on frame
        const MAX_YAW = 27;
        const MAX_PITCH = 13;
        // Cursor distance (as a fraction of the viewport) that reaches full turn.
        const REACH = 0.45;
        const EASE = 0.14;

        const hctx = headCanvas.getContext('2d');
        const frames = new Array(POSES.length);
        let loaded = 0;
        let ready = false;
        let shown = -1;

        const current = { yaw: POSES[NEUTRAL][0], pitch: POSES[NEUTRAL][1] };
        const target = { yaw: current.yaw, pitch: current.pitch };
        let headRaf = null;
        let headVisible = true;
        const nearestFrame = (yaw, pitch) => {
            let best = NEUTRAL;
            let bestDist = Infinity;
            for (let i = 0; i < POSES.length; i++) {
                const d = (POSES[i][0] - yaw) ** 2 + (POSES[i][1] - pitch) ** 2;
                if (d < bestDist) { bestDist = d; best = i; }
            }
            return best;
        };

        const paint = (index) => {
            if (index === shown || !frames[index]) return;
            shown = index;
            hctx.drawImage(frames[index], 0, 0, headCanvas.width, headCanvas.height);
        };

        const headTick = () => {
            current.yaw += (target.yaw - current.yaw) * EASE;
            current.pitch += (target.pitch - current.pitch) * EASE;
            paint(nearestFrame(current.yaw, current.pitch));

            const settled = Math.abs(target.yaw - current.yaw) < 0.05 &&
                            Math.abs(target.pitch - current.pitch) < 0.05;
            headRaf = settled ? null : requestAnimationFrame(headTick);
        };

        const wake = () => {
            if (headRaf === null && ready && headVisible) headRaf = requestAnimationFrame(headTick);
        };

        const lookAt = (clientX, clientY) => {
            const rect = headCanvas.getBoundingClientRect();
            const dx = (clientX - (rect.left + rect.width / 2)) / (window.innerWidth * REACH);
            const dy = (clientY - (rect.top + rect.height / 2)) / (window.innerHeight * REACH);
            target.yaw = Math.max(-1, Math.min(1, dx)) * MAX_YAW;
            target.pitch = Math.max(-1, Math.min(1, dy)) * MAX_PITCH;
            wake();
        };

        const lookAhead = () => {
            target.yaw = POSES[NEUTRAL][0];
            target.pitch = POSES[NEUTRAL][1];
            wake();
        };

        const onReady = () => {
            ready = true;
            paint(NEUTRAL);
            headCanvas.classList.add('is-ready');
            // Hide the static photo only once the canvas has faded in over it.
            setTimeout(() => headFallback && headFallback.classList.add('is-hidden'), 550);

            if (reducedMotion) return;

            window.addEventListener('pointermove', (e) => lookAt(e.clientX, e.clientY), { passive: true });
            window.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') lookAhead(); });
            window.addEventListener('pointercancel', lookAhead);
            document.documentElement.addEventListener('pointerleave', lookAhead);

            // No point easing frames while the hero is off screen.
            new IntersectionObserver((entries) => {
                headVisible = entries[entries.length - 1].isIntersecting;
                if (headVisible) wake();
            }).observe(headCanvas);
        };

        POSES.forEach((_, i) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = img.onerror = () => {
                if (++loaded === POSES.length) onReady();
            };
            img.src = `assets/head/${String(i).padStart(2, '0')}.webp`;
            frames[i] = img;
        });
    }

    // Mobile menu
    const navToggle = document.getElementById('nav-toggle');
    const navToggleIcon = document.getElementById('nav-toggle-icon');
    const navMenu = document.getElementById('nav-links');

    const setMenu = (open) => {
        navMenu.classList.toggle('open', open);
        navToggle.setAttribute('aria-expanded', String(open));
        navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        navToggleIcon.classList.toggle('bx-menu', !open);
        navToggleIcon.classList.toggle('bx-x', open);
    };

    navToggle.addEventListener('click', () => {
        setMenu(!navMenu.classList.contains('open'));
    });

    navMenu.addEventListener('click', (e) => {
        if (e.target.closest('.nav-link')) setMenu(false);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });

    // Scroll Spy (Highlight active nav link)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.header');
    let spyTicking = false;

    const updateSpy = () => {
        let current = '';

        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 150) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });

        // Add subtle shadow to header on scroll
        header.style.boxShadow = window.scrollY > 50 ? 'var(--shadow)' : 'none';

        spyTicking = false;
    };

    window.addEventListener('scroll', () => {
        if (!spyTicking) {
            requestAnimationFrame(updateSpy);
            spyTicking = true;
        }
    }, { passive: true });
});
