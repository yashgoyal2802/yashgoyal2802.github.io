// ---------------------------------------------------------------
// Skills as proof.
// Every skill chip opens a case-file card that morphs out of the chip and
// lists where the skill was actually used. From the card, "See in context"
// lights the evidence up across Experience and Projects (the lens), and the
// Network view shows the same data as a graph of skills and the work that
// backs them. One data set feeds all three.
// ---------------------------------------------------------------
(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wideGraph = window.matchMedia('(min-width: 820px)');
    const $ = (sel, root = document) => root.querySelector(sel);
    const make = (tag, cls, html) => {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (html != null) node.innerHTML = html;
        return node;
    };

    // The work that backs the skills. `target` is the section element the
    // lens scrolls to; `x` is where the hub sits in the network (% of width).
    const HUBS = {
        incedo:   { name: 'Senior DevOps Engineer, Incedo × A10 Networks', short: 'Incedo · A10', kind: 'Role',      icon: 'bx-briefcase-alt-2', target: '#exp-incedo',   x: 10 },
        hack:     { name: 'Hackathon winner, Valar Deceptis',               short: 'Hackathon',    kind: 'Role',      icon: 'bx-trophy',          target: '#exp-incedo',   x: 27 },
        sohired:  { name: 'SoHired',                                        short: 'SoHired',      kind: 'Project',   icon: 'bx-bot',             target: '#proj-sohired', x: 44 },
        safepe:   { name: 'Safe Pe',                                        short: 'Safe Pe',      kind: 'Project',   icon: 'bx-lock-alt',        target: '#proj-safepe',  x: 61 },
        ailearn:  { name: 'AI Learn',                                       short: 'AI Learn',     kind: 'Project',   icon: 'bx-brain',           target: '#proj-ailearn', x: 77 },
        cases:    { name: 'SPJIMR case competitions and research',          short: 'Case work',    kind: 'Education', icon: 'bx-medal',           target: '#edu-spjimr',   x: 92 }
    };

    const CATEGORIES = {
        product: { label: 'Product & Management', icon: 'bx-briefcase-alt-2' },
        tech:    { label: 'Domain & Technical',   icon: 'bx-shield-quarter' }
    };

    // `line` is what the card says; `mark` is the exact phrase the lens
    // highlights in the page copy (no mark = the whole card is lit instead).
    // A skill with no proofs stays a plain chip.
    const SKILLS = [
        { name: 'Requirements Definition', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Sole client point of contact for <strong>42 months</strong>, turning client goals into a sequenced, release-ready backlog and roadmap.', mark: 'translating business objectives into prioritized backlogs' },
            { hub: 'sohired', line: 'Framed the product around one job, <em>walk in sounding like I did my homework</em>, and used it to decide what to cut.', mark: 'Defined the product around one job' },
            { hub: 'safepe',  line: 'Spotted the unmet need first: payments that are fast <em>or</em> secure, but rarely both.', mark: 'Identified a product gap between transaction speed and security' }
        ] },
        { name: 'Backlog Prioritisation', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Ranked the backlog by business impact on a two-month release cycle and aligned QA with engineering on what ships.', mark: 'prioritized backlogs' },
            { hub: 'sohired', line: 'Built solo, so every feature had to earn its place: the one-job framing decided what was cut.', mark: 'used it to cut scope' }
        ] },
        { name: 'Roadmap Planning', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Owned release planning on a two-month cycle, ranking the backlog by business impact and aligning QA with engineering.', mark: 'Managed end-to-end delivery roadmaps' },
            { hub: 'sohired', line: 'First live version in <strong>under 24 hours</strong>, then <strong>7 spec-driven releases</strong>.', mark: 'spec-driven releases' }
        ] },
        { name: 'Stakeholder Management', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Coordinated scope and dates across <strong>5 teams and 35 engineers</strong> without direct authority, from kickoff to production sign-off.', mark: 'primary client liaison' },
            { hub: 'incedo',  line: 'Aligned stakeholders on requirements and success metrics to drive adoption of an internal platform across <strong>30+ developers</strong>.', mark: 'aligning stakeholders on requirements and success metrics' }
        ] },
        { name: 'Client Engagement', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'The single point of contact for A10 Networks for <strong>42 months</strong>, from kickoff to production sign-off and handover.', mark: 'primary client liaison' },
            { hub: 'hack',    line: 'Took a hackathon prototype to the client and saw it adopted as a live product, which went on to onboard its first customer.', mark: 'adopted by the client as a live product' }
        ] },
        { name: 'Agile / Scrum', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Ran delivery on a fixed two-month release cadence with go/no-go calls and release-readiness gates.', mark: 'owned end-to-end release planning' },
            { hub: 'sohired', line: 'Shipped in small, spec-driven increments: a first live version in <strong>under 24 hours</strong>, then <strong>7 releases</strong>.', mark: 'spec-driven releases' }
        ] },
        { name: 'Release Management', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Shipped <strong>20+ production releases at 100% on-time</strong> by tightening release-readiness gates and go/no-go calls with QA.', mark: 'executing 20+ production releases with 100% on-time delivery' },
            { hub: 'incedo',  line: 'Cut production defects <strong>32%</strong> across 5 development teams by restructuring the QA-to-engineering handoff.' }
        ] },
        { name: 'Cross-functional Delivery', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Aligned <strong>35 engineers across 5 teams</strong> and coached 4 new joiners through release and security governance.', mark: 'aligning cross-functional teams' },
            { hub: 'hack',    line: 'Led the Valar Deceptis team to a hackathon win; the tool was adopted by the client as a live product.', mark: 'Valar Deceptis' }
        ] },
        { name: 'Team Leadership', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Coached <strong>4 new joiners</strong> through release and security governance while aligning 35 engineers across 5 teams.', mark: 'Cross-functional Leadership & Release Ownership' },
            { hub: 'hack',    line: 'Led team Valar Deceptis from idea to a winning, client-adopted tool.', mark: 'Led team "Valar Deceptis"' }
        ] },
        { name: 'Root-Cause Analysis', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Traced <strong>80 weekly infra-health alerts</strong> to an oversized cloud footprint, not an on-call gap, and cut the volume <strong>90%</strong> by right-sizing.' },
            { hub: 'safepe',  line: 'Diagnosed the speed-versus-security trade-off in digital payments before designing the fix.', mark: 'Identified a product gap between transaction speed and security' }
        ] },
        { name: 'Business Case Development', cat: 'product', proofs: [
            { hub: 'incedo',  line: 'Built the case for consolidating environments and retiring idle capacity: <strong>$1.5M</strong> a year in run-rate savings.' },
            { hub: 'ailearn', line: 'Measured the outcome, not the build: course selection time <strong>down 50%</strong>, satisfaction <strong>up 30%</strong> across 80 students.', mark: 'reduced course selection time by 50%' },
            { hub: 'cases',   line: 'Team finalist at <strong>Consultathon 5.0</strong> from an 800-team field.', mark: 'Consultathon 5.0' }
        ] },
        { name: 'Cyber Security', cat: 'tech', proofs: [
            { hub: 'incedo',  line: 'Embedded for <strong>3.5 years</strong> with a security vendor, building first-hand insight into enterprise DDoS mitigation gaps.', mark: 'enterprise DDoS mitigation gaps' },
            { hub: 'hack',    line: 'Built a RAG and LLM tool for real-time threat intelligence.', mark: 'real-time threat intelligence' },
            { hub: 'safepe',  line: 'Hybrid AES+ECC encryption, <strong>86% more efficient</strong> than RSA-based alternatives.', mark: 'hybrid encryption system with AES+ECC' },
            { hub: 'cases',   line: 'Co-authored a case on the "Vibe Coding" security crisis, accepted at NACRA.' }
        ] },
        { name: 'DevSecOps', cat: 'tech', proofs: [
            { hub: 'incedo',  line: 'Defined cloud security protocols and role-based access for <strong>200+ users</strong> across 3 cloud providers and 4 environments.' }
        ] },
        { name: 'AI & LLM Applications', cat: 'tech', proofs: [
            { hub: 'hack',    line: 'Region Predictor: a RAG and LLM threat-detection tool that beat 32 teams and was adopted by the client.', mark: 'RAG and LLMs' },
            { hub: 'sohired', line: 'Provider-agnostic AI pipeline that turns a company name into a sourced interview brief.', mark: 'Gemini-to-OpenRouter failover' },
            { hub: 'ailearn', line: 'ML-powered personalisation that turns learner performance data into an optimised learning plan.', mark: 'ML-powered personalized learning platform' }
        ] },
        { name: 'AI Governance', cat: 'tech', proofs: [
            { hub: 'sohired', line: 'Every claim in a brief is labelled <em>sourced</em> or <em>analysis</em>, so a reader always knows what to trust.', mark: 'every claim is labelled' },
            { hub: 'incedo',  line: 'Defined security protocols and role-based access controls for <strong>200+ users</strong> across 3 cloud providers.' }
        ] },
        { name: 'Kubernetes', cat: 'tech', proofs: [
            { hub: 'incedo',  line: 'Scaled an internal multi-cloud developer platform to <strong>30+ developers</strong> across 8 production clusters and 50+ instances.', mark: 'driving adoption across 30+ developers' }
        ] },
        { name: 'Docker', cat: 'tech', proofs: [] },
        { name: 'AWS & OCI', cat: 'tech', proofs: [
            { hub: 'incedo',  line: 'Consolidated environments and retired idle capacity across 3 cloud providers, driving <strong>$1.5M</strong> in annual run-rate savings.', mark: 'Standardized deployment environments' },
            { hub: 'incedo',  line: 'Traced 80 weekly infra-health alerts to an oversized footprint and cut the volume <strong>90%</strong> by right-sizing.' }
        ] },
        { name: 'Python', cat: 'tech', proofs: [
            { hub: 'ailearn', line: 'Trained an SVM classifier on learner performance data: course selection time <strong>down 50%</strong>, satisfaction <strong>up 30%</strong>.', mark: 'SVM classifier' }
        ] },
        { name: 'CI/CD Pipelines', cat: 'tech', proofs: [
            { hub: 'incedo',  line: 'Led an internal multi-cloud developer platform: environment setup <strong>down 80%</strong>, deployment time <strong>down 65%</strong>.', mark: 'Led scoping and delivery of an internal developer platform' }
        ] },
        { name: 'System Design', cat: 'tech', proofs: [
            { hub: 'sohired', line: 'Provider-agnostic AI pipeline with automatic Gemini-to-OpenRouter failover and a shared 30-day cache, all on free-tier APIs.', mark: 'a shared 30-day cache with Gemini-to-OpenRouter failover' },
            { hub: 'safepe',  line: 'Designed a hybrid scheme that balances transaction speed against security.', mark: 'hybrid encryption system with AES+ECC' },
            { hub: 'incedo',  line: 'Scoped and led a multi-cloud developer platform: environment setup <strong>down 80%</strong>, deployment time <strong>down 65%</strong>.', mark: 'internal developer platform' },
            { hub: 'hack',    line: 'Designed the Region Predictor, a RAG and LLM tool for real-time threat intelligence.', mark: 'Region Predictor tool' }
        ] }
    ];
    SKILLS.forEach((s, i) => { s.id = 's' + i; });
    const byId = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
    const byName = Object.fromEntries(SKILLS.map((s) => [s.name, s]));
    const proven = SKILLS.filter((s) => s.proofs.length);

    const proofsHTML = (skill) => skill.proofs.map((p, i) => {
        const hub = HUBS[p.hub];
        return `<li class="proof">
            <span class="tag"><i class='bx ${hub.icon}' aria-hidden="true"></i> ${hub.kind}</span>
            <h4>${hub.name}</h4>
            <p>${p.line}</p>
            <button type="button" class="proof-go" data-skill="${skill.id}" data-proof="${i}">See in context <i class='bx bx-right-arrow-alt' aria-hidden="true"></i></button>
        </li>`;
    }).join('');

    // Places the lens will visit: each highlighted phrase, plus any card that
    // has proof but no phrase of its own to light.
    const placeCount = (skill) => {
        const lit = new Set(skill.proofs.filter((p) => p.mark).map((p) => HUBS[p.hub].target));
        const places = new Set();
        skill.proofs.forEach((p) => {
            if (p.mark) places.add(p.hub + p.mark);
            else if (!lit.has(HUBS[p.hub].target)) places.add(HUBS[p.hub].target);
        });
        return places.size;
    };

    const lensButtonHTML = (skill) =>
        `<button type="button" class="lens-btn" data-skill="${skill.id}"><i class='bx bx-bulb' aria-hidden="true"></i> Light up on the page <span>${placeCount(skill)}</span></button>`;

    // ---------------------------------------------------------------
    // Lens: highlight where a skill shows up, and step through the places.
    // ---------------------------------------------------------------
    let lens = null;
    let pill = null;

    const SCOPES = '#experience .timeline-content, #education .card, #projects .card';

    const wrapPhrase = (root, phrase) => {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: (n) => n.parentElement.closest('.lens-mark') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const at = node.nodeValue.indexOf(phrase);
            if (at < 0) continue;
            const range = document.createRange();
            range.setStart(node, at);
            range.setEnd(node, at + phrase.length);
            const mark = make('mark', 'lens-mark');
            range.surroundContents(mark);
            return mark;
        }
        return null;
    };

    const ensurePill = () => {
        if (pill) return pill;
        pill = make('div', 'lens-pill', `
            <span class="lens-pill-name"><i class='bx bx-bulb' aria-hidden="true"></i><span></span></span>
            <span class="lens-pill-count" role="status" aria-live="polite"></span>
            <button type="button" class="lens-pill-btn" data-lens="prev" aria-label="Previous place"><i class='bx bx-chevron-left' aria-hidden="true"></i></button>
            <button type="button" class="lens-pill-btn" data-lens="next" aria-label="Next place"><i class='bx bx-chevron-right' aria-hidden="true"></i></button>
            <button type="button" class="lens-pill-text" data-lens="back"><i class='bx bx-up-arrow-alt' aria-hidden="true"></i> Skills</button>
            <button type="button" class="lens-pill-btn" data-lens="close" aria-label="Clear highlights"><i class='bx bx-x' aria-hidden="true"></i></button>`);
        pill.hidden = true;
        pill.addEventListener('click', (e) => {
            const act = e.target.closest('[data-lens]');
            if (!act || !lens) return;
            const what = act.dataset.lens;
            if (what === 'next') goToStop(lens.i + 1);
            else if (what === 'prev') goToStop(lens.i - 1);
            else if (what === 'back') $('#skills').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth' });
            else stopLens();
        });
        document.body.appendChild(pill);
        return pill;
    };

    const goToStop = (index) => {
        if (!lens) return;
        lens.i = (index + lens.stops.length) % lens.stops.length;
        const stop = lens.stops[lens.i];
        stop.el.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        stop.el.classList.remove('is-pulse');
        void stop.el.offsetWidth; // restart the pulse
        stop.el.classList.add('is-pulse');
        $('.lens-pill-count', pill).textContent = `${lens.i + 1} of ${lens.stops.length}`;
    };

    const stopLens = () => {
        if (!lens) return;
        document.querySelectorAll('.lens-mark').forEach((mark) => {
            const parent = mark.parentNode;
            mark.replaceWith(...mark.childNodes);
            parent.normalize();
        });
        document.querySelectorAll('.lens-dim, .lens-hit').forEach((n) => n.classList.remove('lens-dim', 'lens-hit'));
        document.body.classList.remove('lens-on');
        pill.hidden = true;
        lens = null;
    };

    const startLens = (skillId, proofIndex = 0) => {
        stopLens();
        const skill = byId[skillId];
        const stops = [];
        const litBoxes = new Set();
        const stopOfProof = [];

        skill.proofs.forEach((p) => {
            const host = $(HUBS[p.hub].target);
            if (!host) { stopOfProof.push(-1); return; }
            const box = host.matches('.timeline-item') ? $('.timeline-content', host) : host;
            const mark = p.mark ? wrapPhrase(box, p.mark) : null;
            // A card that already has a highlighted phrase doesn't get a second stop.
            const stop = mark ? { el: mark, box } : (stops.find((s) => s.box === box) || { el: box, box });
            if (!stops.includes(stop)) stops.push(stop);
            litBoxes.add(box);
            stopOfProof.push(stop);
        });

        stops.sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
        document.querySelectorAll(SCOPES).forEach((n) => n.classList.add(litBoxes.has(n) ? 'lens-hit' : 'lens-dim'));
        document.body.classList.add('lens-on');

        lens = { skill, stops, i: 0 };
        ensurePill();
        $('.lens-pill-name span', pill).textContent = skill.name;
        pill.hidden = false;
        const first = stops.indexOf(stopOfProof[proofIndex]);
        goToStop(first < 0 ? 0 : first);
    };

    // ---------------------------------------------------------------
    // Case-file card: morphs out of the chip that opened it.
    // ---------------------------------------------------------------
    let card = null;
    let scrim = null;
    let openChip = null;
    let openScroll = 0;
    let running = null;

    const ensureCard = () => {
        if (card) return;
        scrim = make('div', 'skill-scrim');
        scrim.hidden = true;
        card = make('div', 'skill-card');
        card.hidden = true;
        card.setAttribute('role', 'dialog');
        card.setAttribute('aria-modal', 'true');
        card.tabIndex = -1;
        card.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            const items = [...card.querySelectorAll('button')].filter((b) => !b.disabled);
            const firstItem = items[0], lastItem = items[items.length - 1];
            if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus(); }
            else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus(); }
        });
        scrim.addEventListener('click', () => closeCard());
        document.body.append(scrim, card);
    };

    const cssColor = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const closeCard = (instant = false) => {
        if (!card || card.hidden) return;
        const chip = openChip;
        openChip = null;
        if (running) running.cancel();

        const finish = () => {
            card.getAnimations().forEach((a) => a.cancel());
            card.hidden = true;
            scrim.hidden = true;
            scrim.classList.remove('is-open');
            if (chip) {
                chip.classList.remove('is-open');
                // The chip can be mid-transition when the card hides, so a
                // focus call that lands too early is retried on the next frame.
                chip.focus({ preventScroll: true });
                if (document.activeElement !== chip) requestAnimationFrame(() => chip.focus({ preventScroll: true }));
            }
            running = null;
        };
        scrim.classList.remove('is-open');
        if (instant || reduceMotion.matches || !chip) { finish(); return; }

        const cr = card.getBoundingClientRect();
        const r = chip.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < innerHeight;
        let frames;
        if (!card.classList.contains('is-sheet') && inView) {
            frames = [
                { clipPath: 'inset(0 round 16px)', backgroundColor: cssColor('--bg-card') },
                { clipPath: `inset(${r.top - cr.top}px ${cr.right - r.right}px ${cr.bottom - r.bottom}px ${r.left - cr.left}px round 8px)`, backgroundColor: cssColor('--bg-main') }
            ];
        } else {
            frames = [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(16px)' }];
        }
        running = card.animate(frames, { duration: 260, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
        running.onfinish = finish;
    };

    const openCard = (skill, chip) => {
        ensureCard();
        closeCard(true);
        const cat = CATEGORIES[skill.cat];
        card.innerHTML = `
            <span class="skill-card-ghost" aria-hidden="true">${skill.name}</span>
            <button type="button" class="skill-card-close" aria-label="Close"><i class='bx bx-x' aria-hidden="true"></i></button>
            <div class="skill-card-body">
                <p class="skill-card-cat"><i class='bx ${cat.icon}' aria-hidden="true"></i> ${cat.label}</p>
                <h3 class="skill-card-title" id="skill-card-title">${skill.name}</h3>
                <ul class="skill-proofs">${proofsHTML(skill)}</ul>
                <div class="skill-card-actions">${lensButtonHTML(skill)}</div>
            </div>`;
        card.setAttribute('aria-labelledby', 'skill-card-title');

        const sheet = innerWidth < 640;
        card.classList.toggle('is-sheet', sheet);
        card.style.left = card.style.top = card.style.width = '';
        const chipRect = chip.getBoundingClientRect();
        openChip = chip;
        openScroll = scrollY;

        card.hidden = false;
        scrim.hidden = false;
        void scrim.offsetWidth;
        scrim.classList.add('is-open');

        if (!sheet) {
            const width = Math.min(460, innerWidth - 32);
            card.style.width = width + 'px';
            card.style.left = Math.max(16, Math.min(chipRect.left, innerWidth - width - 16)) + 'px';
            const height = card.offsetHeight;
            card.style.top = Math.max(16, Math.min(chipRect.top, innerHeight - height - 16)) + 'px';
        }

        const cr = card.getBoundingClientRect();
        const ghost = $('.skill-card-ghost', card);
        const body = $('.skill-card-body', card);
        const inside = !sheet
            && chipRect.left >= cr.left - 1 && chipRect.right <= cr.right + 1
            && chipRect.top >= cr.top - 1 && chipRect.bottom <= cr.bottom + 1;

        chip.classList.add('is-open');
        card.getAnimations().forEach((a) => a.cancel());

        if (!reduceMotion.matches) {
            const ease = 'cubic-bezier(.16, 1, .3, 1)';
            if (inside) {
                // Place the label where the chip's text was, so the words
                // seem to stay put while the chip grows around them.
                ghost.style.cssText = `left:${chipRect.left - cr.left}px;top:${chipRect.top - cr.top}px;width:${chipRect.width}px;height:${chipRect.height}px`;
                running = card.animate([
                    { clipPath: `inset(${chipRect.top - cr.top}px ${cr.right - chipRect.right}px ${cr.bottom - chipRect.bottom}px ${chipRect.left - cr.left}px round 8px)`, backgroundColor: cssColor('--bg-main') },
                    { clipPath: 'inset(0 round 16px)', backgroundColor: cssColor('--bg-card') }
                ], { duration: 480, easing: ease });
                ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: 'forwards' });
                body.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
                    { duration: 380, delay: 140, easing: ease, fill: 'backwards' });
            } else {
                ghost.hidden = true;
                running = card.animate(sheet
                    ? [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }]
                    : [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }],
                    { duration: 340, easing: ease });
            }
        } else {
            ghost.hidden = true;
        }
        card.focus({ preventScroll: true });
    };

    // ---------------------------------------------------------------
    // Chips: upgrade the plain spans that have proof into buttons.
    // ---------------------------------------------------------------
    document.querySelectorAll('.skill-chips span').forEach((span) => {
        const skill = byName[span.textContent.trim()];
        if (!skill || !skill.proofs.length) return;
        const chip = make('button', 'skill-chip', `<span>${skill.name}</span><i class='bx bx-plus' aria-hidden="true"></i>`);
        chip.type = 'button';
        chip.dataset.skill = skill.id;
        chip.setAttribute('aria-haspopup', 'dialog');
        span.replaceWith(chip);
    });

    // ---------------------------------------------------------------
    // Network: skills on the outside, the work that backs them in the middle.
    // Selecting a node lights its links; everything else steps back.
    // ---------------------------------------------------------------
    const grid = $('.skills-grid');
    const section = $('#skills .section-container');
    let graph = null;

    const buildGraph = () => {
        const hubIds = Object.keys(HUBS);
        const hubX = (id) => HUBS[id].x;
        const rows = { product: [], tech: [] };
        proven.forEach((s) => rows[s.cat].push(s));
        const bary = (s) => s.proofs.reduce((sum, p) => sum + hubX(p.hub), 0) / s.proofs.length;

        const pos = {};
        Object.entries(rows).forEach(([cat, list]) => {
            list.sort((a, b) => bary(a) - bary(b));
            const levels = cat === 'product' ? [6, 17, 28] : [94, 83, 72];
            const used = list.length > 8 ? 3 : 2;
            list.forEach((s, i) => {
                pos[s.id] = {
                    x: list.length > 1 ? 12 + (76 * i) / (list.length - 1) : 50,
                    y: levels[i % used]
                };
            });
        });
        hubIds.forEach((id) => { pos[id] = { x: HUBS[id].x, y: 50 }; });

        const edges = new Map();
        proven.forEach((s) => s.proofs.forEach((p) => edges.set(s.id + '|' + p.hub, [s.id, p.hub])));

        const stage = make('div', 'skill-graph-stage');
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('class', 'skill-graph-lines');
        svg.setAttribute('viewBox', '0 0 1000 560');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');

        const edgeEls = {};
        edges.forEach(([sid, hid], key) => {
            const a = pos[sid], b = pos[hid];
            const x1 = a.x * 10, y1 = a.y * 5.6, x2 = b.x * 10, y2 = b.y * 5.6;
            const mid = (y1 + y2) / 2;
            const path = document.createElementNS(svgNS, 'path');
            path.setAttribute('d', `M${x1} ${y1} C${x1} ${mid} ${x2} ${mid} ${x2} ${y2}`);
            path.setAttribute('class', 'edge');
            svg.appendChild(path);
            edgeEls[key] = path;
        });
        stage.appendChild(svg);

        const nodeEls = {};
        const addNode = (id, label, cls, icon) => {
            const node = make('button', 'graph-node ' + cls, (icon ? `<i class='bx ${icon}' aria-hidden="true"></i>` : '') + `<span>${label}</span>`);
            node.type = 'button';
            node.dataset.node = id;
            node.style.left = pos[id].x + '%';
            node.style.top = pos[id].y + '%';
            node.style.transitionDelay = (Object.keys(nodeEls).length * 25) + 'ms';
            stage.appendChild(node);
            nodeEls[id] = node;
        };
        proven.forEach((s) => addNode(s.id, s.name, 'is-skill'));
        hubIds.forEach((id) => addNode(id, HUBS[id].short, 'is-hub', HUBS[id].icon));

        const panel = make('div', 'skill-graph-panel');
        panel.setAttribute('aria-live', 'polite');
        const wrap = make('div', 'skill-graph');
        wrap.hidden = true;
        wrap.append(stage, panel);

        const idle = '<p class="skill-graph-idle"><i class=\'bx bx-network-chart\' aria-hidden="true"></i> Select a skill to see the work behind it, or a role or project to see what it proves.</p>';
        panel.innerHTML = idle;

        let pinned = null;
        const light = (id) => {
            stage.classList.toggle('has-focus', !!id);
            Object.values(nodeEls).forEach((n) => n.classList.remove('on'));
            Object.values(edgeEls).forEach((e) => e.classList.remove('on'));
            if (!id) return;
            nodeEls[id].classList.add('on');
            edges.forEach(([sid, hid], key) => {
                if (sid === id || hid === id) {
                    edgeEls[key].classList.add('on');
                    nodeEls[sid].classList.add('on');
                    nodeEls[hid].classList.add('on');
                }
            });
        };

        const show = (id) => {
            pinned = id;
            Object.values(nodeEls).forEach((n) => n.classList.remove('is-pinned'));
            light(id);
            if (!id) { panel.innerHTML = idle; return; }
            nodeEls[id].classList.add('is-pinned');
            if (byId[id]) {
                const skill = byId[id];
                const cat = CATEGORIES[skill.cat];
                panel.innerHTML = `
                    <p class="skill-card-cat"><i class='bx ${cat.icon}' aria-hidden="true"></i> ${cat.label}</p>
                    <h3 class="skill-card-title">${skill.name}</h3>
                    <ul class="skill-proofs">${proofsHTML(skill)}</ul>
                    <div class="skill-card-actions">${lensButtonHTML(skill)}</div>`;
            } else {
                const hub = HUBS[id];
                const backed = proven.filter((s) => s.proofs.some((p) => p.hub === id));
                panel.innerHTML = `
                    <p class="skill-card-cat"><i class='bx ${hub.icon}' aria-hidden="true"></i> ${hub.kind}</p>
                    <h3 class="skill-card-title">${hub.name}</h3>
                    <p class="skill-graph-lead">Skills this ${hub.kind.toLowerCase()} backs up:</p>
                    <ul class="skill-graph-backs">${backed.map((s) => `<li><button type="button" class="skill-chip" data-node="${s.id}"><span>${s.name}</span></button></li>`).join('')}</ul>
                    <div class="skill-card-actions"><button type="button" class="lens-btn" data-jump="${hub.target}"><i class='bx bx-down-arrow-alt' aria-hidden="true"></i> Go to ${hub.kind.toLowerCase()}</button></div>`;
            }
        };

        stage.addEventListener('pointerover', (e) => {
            const node = e.target.closest('[data-node]');
            if (node && !pinned) light(node.dataset.node);
        });
        stage.addEventListener('pointerout', (e) => { if (!pinned && e.target.closest('[data-node]')) light(null); });
        stage.addEventListener('focusin', (e) => {
            const node = e.target.closest('[data-node]');
            if (node && !pinned) light(node.dataset.node);
        });
        stage.addEventListener('focusout', () => { if (!pinned) light(null); });
        stage.addEventListener('click', (e) => {
            const node = e.target.closest('[data-node]');
            show(node && node.dataset.node !== pinned ? node.dataset.node : null);
        });
        panel.addEventListener('click', (e) => {
            const node = e.target.closest('[data-node]');
            if (node) show(node.dataset.node);
            const jump = e.target.closest('[data-jump]');
            if (jump) $(jump.dataset.jump).scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
        });

        // Links draw in the first time the network scrolls into view.
        new IntersectionObserver((entries, io) => {
            if (entries.some((en) => en.isIntersecting)) { stage.classList.add('is-drawn'); io.disconnect(); }
        }, { threshold: 0.25 }).observe(stage);

        return { wrap, show };
    };

    const toolbar = make('div', 'skills-toolbar', `
        <p class="skills-hint"><i class='bx bx-pointer' aria-hidden="true"></i> Select a skill to see where I've used it.</p>
        <div class="view-toggle" role="group" aria-label="Skills view">
            <button type="button" data-view="list" aria-pressed="true"><i class='bx bx-list-ul' aria-hidden="true"></i> List</button>
            <button type="button" data-view="graph" aria-pressed="false"><i class='bx bx-network-chart' aria-hidden="true"></i> Network</button>
        </div>`);
    grid.before(toolbar);

    const setView = (view) => {
        if (view === 'graph') {
            if (!graph) { graph = buildGraph(); grid.after(graph.wrap); }
            closeCard(true);
        }
        const showGraph = view === 'graph';
        grid.hidden = showGraph;
        if (graph) graph.wrap.hidden = !showGraph;
        toolbar.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    };
    toolbar.addEventListener('click', (e) => {
        const b = e.target.closest('[data-view]');
        if (b) setView(b.dataset.view);
    });
    wideGraph.addEventListener('change', () => { if (!wideGraph.matches) setView('list'); });

    // ---------------------------------------------------------------
    // One set of handlers for chips, proof links and lens buttons.
    // ---------------------------------------------------------------
    document.addEventListener('click', (e) => {
        const chip = e.target.closest('.skill-chips .skill-chip');
        if (chip) { openCard(byId[chip.dataset.skill], chip); return; }

        if (e.target.closest('.skill-card-close')) { closeCard(); return; }

        const go = e.target.closest('.proof-go');
        if (go) { closeCard(true); startLens(go.dataset.skill, Number(go.dataset.proof)); return; }

        const light = e.target.closest('.lens-btn[data-skill]');
        if (light) { closeCard(true); startLens(light.dataset.skill); }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if (card && !card.hidden) closeCard();
        else stopLens();
    });

    window.addEventListener('scroll', () => {
        if (card && !card.hidden && Math.abs(scrollY - openScroll) > 80) closeCard(true);
    }, { passive: true });
    window.addEventListener('resize', () => closeCard(true));
})();
