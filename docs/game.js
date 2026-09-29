/* ==========================================================
   SOCIAL CAPITAL
   game.js — Part 1: State, Constants & Utilities
   ========================================================== */
const API_BASE = '/api';

/* ----------------------------------------------------------
   ARCHETYPES
   ---------------------------------------------------------- */
const ARCHETYPES = [
    {
        id: 'jordan',
        name: 'JORDAN',
        job: 'Executive / Investor',
        bio: 'Manages family investments. Has never had to think about money.',
        targetPercentile: 0.95,
        color: '#9b5de5'
    },
    {
        id: 'amir',
        name: 'AMIR',
        job: 'Manager / Engineer',
        bio: 'Did everything right. Mortgage, student loans, stable income.',
        targetPercentile: 0.75,
        color: '#00c8f5'
    },
    {
        id: 'dev',
        name: 'DEV',
        job: 'Small business owner',
        bio: 'Three years into his business. Reinvests everything.',
        targetPercentile: 0.50,
        color: '#00f5a0'
    },
    {
        id: 'ruth',
        name: 'RUTH',
        job: 'Retired / fixed income',
        bio: 'Fixed pension. Worked in manufacturing for 35 years.',
        targetPercentile: 0.25,
        color: '#ffb800'
    },
    {
        id: 'maria',
        name: 'MARIA',
        job: 'Fast food / retail',
        bio: 'Works two jobs. Every unexpected bill is a crisis.',
        targetPercentile: 0.05,
        color: '#ff3b5c'
    }
];

/* ----------------------------------------------------------
   CHARACTER CREATOR MAPPINGS
   ---------------------------------------------------------- */
const JOB_W = {
    fast_food: { w: 0.08, label: 'Fast food / retail' },
    trades: { w: 0.14, label: 'Skilled trades / nurse' },
    small_biz: { w: 0.20, label: 'Small business / teacher' },
    manager: { w: 0.26, label: 'Manager / engineer' },
    executive: { w: 0.34, label: 'Executive / investor' }
};

const FAMILY_MOD = {
    single: { mod: 0.00 },
    single_parent: { mod: -0.03 },
    partnered: { mod: 0.02 },
    family: { mod: -0.01 }
};

const EDU_MOD = {
    no_college: { mod: -0.03 },
    some_college: { mod: 0.00 },
    bachelors: { mod: 0.02 },
    graduate: { mod: 0.04 }
};

/* ----------------------------------------------------------
   COUNTRY GINI REFERENCE
   ---------------------------------------------------------- */
const COUNTRY_GINI = [
    { name: 'Norway', flag: 'NO', gini: 0.25 },
    { name: 'Sweden', flag: 'SE', gini: 0.27 },
    { name: 'Germany', flag: 'DE', gini: 0.31 },
    { name: 'UK', flag: 'GB', gini: 0.35 },
    { name: 'USA', flag: 'US', gini: 0.39 },
    { name: 'Mexico', flag: 'MX', gini: 0.45 },
    { name: 'Brazil', flag: 'BR', gini: 0.53 },
    { name: 'South Africa', flag: 'ZA', gini: 0.63 }
];

/* ----------------------------------------------------------
   CRISIS EVENTS
   ---------------------------------------------------------- */
const CRISES = {
    10: [
        {
            id: 'automation',
            title: 'THE AUTOMATION WAVE',
            text: 'A wave of industrial automation has eliminated 30% of mid-skill jobs. <strong>Maria just lost one of her two jobs.</strong> Dev\'s small business is struggling to compete with automated alternatives.',
            choices: [
                {
                    key: 'A',
                    text: 'Invest in retraining programs. Fund public education and skills development.',
                    pills: [{ label: 'MOBILITY BOOST', type: 'up' }, { label: 'SHORT-TERM COST', type: 'down' }],
                    effect: { survivalCostMod: -0.1, nextCrisis: 'inequality_reckoning' }
                },
                {
                    key: 'B',
                    text: 'Let the market adjust. Disruption creates opportunity in the long run.',
                    pills: [{ label: 'NEUTRAL SHORT-TERM', type: 'neutral' }, { label: 'MOBILITY DROP', type: 'down' }],
                    effect: { survivalCostMod: 0.1, nextCrisis: 'debt_spiral' }
                },
                {
                    key: 'C',
                    text: 'Launch a Universal Basic Income pilot. Every citizen receives a floor.',
                    pills: [{ label: 'FLOOR PROTECTION', type: 'up' }, { label: 'WEALTH TAX', type: 'neutral' }],
                    effect: { patron: true, survivalCostMod: -0.05, nextCrisis: 'gentrification' }
                }
            ]
        },
        {
            id: 'medical',
            title: 'THE MEDICAL EMERGENCY',
            text: 'A health crisis has swept the nation. Families without savings face catastrophic costs. <strong>Ruth is rationing her medication.</strong> Maria cannot afford to miss work despite being sick.',
            choices: [
                {
                    key: 'A',
                    text: 'Expand public healthcare. Reduce the cost burden on all citizens.',
                    pills: [{ label: 'SURVIVAL COST -30%', type: 'up' }, { label: 'TAX INCREASE', type: 'neutral' }],
                    effect: { survivalCostMod: -0.3, nextCrisis: 'inequality_reckoning' }
                },
                {
                    key: 'B',
                    text: 'Subsidize private insurance. Partial relief through the market.',
                    pills: [{ label: 'PARTIAL RELIEF', type: 'neutral' }, { label: 'BENEFITS INSURERS', type: 'down' }],
                    effect: { survivalCostMod: -0.15, nextCrisis: 'debt_spiral' }
                },
                {
                    key: 'C',
                    text: 'No government intervention. The market will find a solution.',
                    pills: [{ label: 'CATASTROPHIC FOR LOWER', type: 'down' }, { label: 'GINI RISES', type: 'down' }],
                    effect: { survivalCostMod: 0.2, nextCrisis: 'gentrification' }
                }
            ]
        },
        {
            id: 'housing',
            title: 'THE HOUSING CRISIS',
            text: 'Property values have surged 60% in five years. Renters are being priced out. <strong>Jordan\'s real estate holdings have tripled in value.</strong> Maria just received an eviction notice.',
            choices: [
                {
                    key: 'A',
                    text: 'Implement rent control. Protect renters from runaway costs.',
                    pills: [{ label: 'PROTECTS LOWER', type: 'up' }, { label: 'SLOWS UPPER GAINS', type: 'neutral' }],
                    effect: { survivalCostMod: -0.2, nextCrisis: 'inequality_reckoning' }
                },
                {
                    key: 'B',
                    text: 'Encourage new construction. Fix supply, let the market stabilize.',
                    pills: [{ label: 'LONG-TERM FIX', type: 'neutral' }, { label: 'SLOW TO ACT', type: 'neutral' }],
                    effect: { survivalCostMod: 0, nextCrisis: 'debt_spiral' }
                },
                {
                    key: 'C',
                    text: 'Tax incentives for landlords. Encourage more rental supply.',
                    pills: [{ label: 'SUPPLY INCREASE', type: 'neutral' }, { label: 'UPPER BRACKET WINS', type: 'down' }],
                    effect: { survivalCostMod: 0.1, nextCrisis: 'gentrification' }
                }
            ]
        }
    ],
    20: {
        inequality_reckoning: {
            id: 'inequality_reckoning',
            title: 'THE INEQUALITY RECKONING',
            text: 'After 20 years, the wealth gap has become politically unstable. <strong>Jordan now holds more wealth than Maria, Ruth, and Dev combined.</strong> The streets are restless. Your government must respond.',
            choices: [
                {
                    key: 'A',
                    text: 'Implement a wealth tax on the top 10%. Redistribute the proceeds.',
                    pills: [{ label: 'GINI DROPS', type: 'up' }, { label: 'CAPITAL FLIGHT RISK', type: 'down' }],
                    effect: { patron: true, nextCrisis: 'tax_revolt' }
                },
                {
                    key: 'B',
                    text: 'Austerity and growth focus. Cut spending, attract investment.',
                    pills: [{ label: 'GDP UP', type: 'neutral' }, { label: 'MIDDLE CLASS SQUEEZED', type: 'down' }],
                    effect: { survivalCostMod: 0.15, nextCrisis: 'generation_gap' }
                },
                {
                    key: 'C',
                    text: 'Structural reform. Change the rules slowly and sustainably.',
                    pills: [{ label: 'LONG GAME', type: 'neutral' }, { label: 'NO IMMEDIATE EFFECT', type: 'neutral' }],
                    effect: { survivalCostMod: -0.05, nextCrisis: 'displacement' }
                }
            ]
        },
        debt_spiral: {
            id: 'debt_spiral',
            title: 'THE DEBT SPIRAL',
            text: 'Consumer debt has reached record levels. <strong>Maria carries crushing medical and housing debt.</strong> Dev\'s business loan is underwater. The middle class is hollowing out.',
            choices: [
                {
                    key: 'A',
                    text: 'Debt jubilee for the bottom 40%. Cancel what cannot be repaid.',
                    pills: [{ label: 'LOWER BRACKET RELIEF', type: 'up' }, { label: 'CREDITORS FURIOUS', type: 'down' }],
                    effect: { survivalCostMod: -0.2, nextCrisis: 'tax_revolt' }
                },
                {
                    key: 'B',
                    text: 'Tighten lending standards. Prevent future debt accumulation.',
                    pills: [{ label: 'LONG-TERM STABILITY', type: 'neutral' }, { label: 'SHORT-TERM PAIN', type: 'down' }],
                    effect: { survivalCostMod: 0.1, nextCrisis: 'generation_gap' }
                },
                {
                    key: 'C',
                    text: 'Bail out the lenders. Protect the financial system first.',
                    pills: [{ label: 'SYSTEM STABLE', type: 'neutral' }, { label: 'UPPER BRACKET WINS', type: 'down' }],
                    effect: { patron: false, nextCrisis: 'displacement' }
                }
            ]
        },
        gentrification: {
            id: 'gentrification',
            title: 'THE GENTRIFICATION WAVE',
            text: 'Entire neighborhoods have been transformed. <strong>Maria and Ruth have been displaced from the city they grew up in.</strong> Jordan just sold a property for 4x what he paid.',
            choices: [
                {
                    key: 'A',
                    text: 'Community land trusts. Take housing out of the speculative market.',
                    pills: [{ label: 'STABILITY FOR LOWER', type: 'up' }, { label: 'SLOWS UPPER GAINS', type: 'neutral' }],
                    effect: { survivalCostMod: -0.15, nextCrisis: 'tax_revolt' }
                },
                {
                    key: 'B',
                    text: 'Inclusionary zoning. Require affordable units in new developments.',
                    pills: [{ label: 'PARTIAL RELIEF', type: 'neutral' }, { label: 'SLOW IMPLEMENTATION', type: 'neutral' }],
                    effect: { survivalCostMod: -0.05, nextCrisis: 'generation_gap' }
                },
                {
                    key: 'C',
                    text: 'Let the market work. Growth benefits everyone eventually.',
                    pills: [{ label: 'UPPER BRACKET GAINS', type: 'neutral' }, { label: 'LOWER BRACKET FALLS', type: 'down' }],
                    effect: { survivalCostMod: 0.15, nextCrisis: 'displacement' }
                }
            ]
        }
    },
    35: {
        tax_revolt: {
            id: 'tax_revolt',
            title: 'THE TAX REVOLT',
            text: 'A political movement is demanding an end to redistribution policies. <strong>Jordan\'s lobbying group has spent millions on the campaign.</strong> Your government must take a position.',
            choices: [
                {
                    key: 'A',
                    text: 'Hold the line. Maintain redistribution in the face of opposition.',
                    pills: [{ label: 'GINI STABILIZES', type: 'up' }, { label: 'POLITICAL COST', type: 'neutral' }],
                    effect: { patron: true }
                },
                {
                    key: 'B',
                    text: 'Compromise. Reduce but do not eliminate redistribution.',
                    pills: [{ label: 'GINI RISES SLOWLY', type: 'neutral' }, { label: 'POLITICAL PEACE', type: 'neutral' }],
                    effect: { survivalCostMod: 0.05 }
                },
                {
                    key: 'C',
                    text: 'Repeal. Remove wealth taxes and let the market decide.',
                    pills: [{ label: 'UPPER BRACKET WINS', type: 'neutral' }, { label: 'GINI SPIKES', type: 'down' }],
                    effect: { patron: false, survivalCostMod: 0.2 }
                }
            ]
        },
        generation_gap: {
            id: 'generation_gap',
            title: 'THE GENERATION GAP',
            text: 'Young people have a lower standard of living than their parents at the same age. <strong>Social mobility has stalled.</strong> Dev\'s children have less opportunity than Dev did.',
            choices: [
                {
                    key: 'A',
                    text: 'Free higher education. Remove the tuition barrier to opportunity.',
                    pills: [{ label: 'LONG-TERM MOBILITY', type: 'up' }, { label: 'MAJOR INVESTMENT', type: 'neutral' }],
                    effect: { survivalCostMod: -0.1 }
                },
                {
                    key: 'B',
                    text: 'Inheritance tax reform. Limit the advantage of family wealth.',
                    pills: [{ label: 'LEVELS STARTING LINE', type: 'up' }, { label: 'JORDAN LOSES MOST', type: 'neutral' }],
                    effect: { patron: true, survivalCostMod: -0.05 }
                },
                {
                    key: 'C',
                    text: 'No intervention. Each generation earns what it earns.',
                    pills: [{ label: 'STATUS QUO', type: 'neutral' }, { label: 'MOBILITY STALLS', type: 'down' }],
                    effect: { survivalCostMod: 0.1 }
                }
            ]
        },
        displacement: {
            id: 'displacement',
            title: 'THE DISPLACEMENT CRISIS',
            text: 'Entire communities have been economically displaced. <strong>Maria and Ruth live in the same neighborhood — both struggling, neither with a path up.</strong> Jordan has never visited that part of the city.',
            choices: [
                {
                    key: 'A',
                    text: 'Universal Basic Services. Housing, healthcare, education as rights.',
                    pills: [{ label: 'FLOOR FOR ALL', type: 'up' }, { label: 'MAJOR INVESTMENT', type: 'neutral' }],
                    effect: { patron: true, survivalCostMod: -0.2 }
                },
                {
                    key: 'B',
                    text: 'Targeted assistance. Help the most vulnerable, means-tested.',
                    pills: [{ label: 'PARTIAL RELIEF', type: 'neutral' }, { label: 'STIGMA ATTACHED', type: 'neutral' }],
                    effect: { survivalCostMod: -0.1 }
                },
                {
                    key: 'C',
                    text: 'Economic zones. Attract business investment to depressed areas.',
                    pills: [{ label: 'SLOW GROWTH', type: 'neutral' }, { label: 'BENEFITS BUSINESS FIRST', type: 'down' }],
                    effect: { survivalCostMod: 0.05 }
                }
            ]
        }
    }
};

/* ----------------------------------------------------------
   GAME STATE — single source of truth
   ---------------------------------------------------------- */
let STATE = {
    screen: 'character',
    player: {
        name: '',
        job: null,
        family: null,
        education: null,
        w: 0,
        tailwind: '',
        bracket: '',
        targetPercentile: 0.5,
        agentIndex: null
    },
    policy: 'econophysics',
    patron: false,
    year: 0,
    running: false,
    intervalId: null,
    stepSpeed: 800,
    characters: [],       // [{...archetype, agentIndex}] after matching
    giniHistory: [],
    wealthHistory: {},    // keyed by character id
    decisions: [],
    nextCrisisId: null,
    crisisPool10Used: null
};

/* ----------------------------------------------------------
   UTILITIES
   ---------------------------------------------------------- */
function el(id) {
    return document.getElementById(id);
}

function getTailwind(w) {
    if (w < 0.13) return 'Headwind';
    if (w < 0.22) return 'Neutral';
    return 'Tailwind';
}

function getTailwindColor(t) {
    if (t === 'Headwind') return 'var(--red)';
    if (t === 'Neutral') return 'var(--amber)';
    return 'var(--neon)';
}

function getBracketColor(b) {
    if (b === 'Lower') return 'var(--lower)';
    if (b === 'Middle') return 'var(--middle)';
    return 'var(--upper)';
}

function formatWealth(w) {
    if (w >= 1000) return '$' + (w / 1000).toFixed(1) + 'K';
    return '$' + w.toFixed(2);
}

function getCountryByGini(gini) {
    return COUNTRY_GINI.reduce((closest, c) =>
        Math.abs(c.gini - gini) < Math.abs(closest.gini - gini) ? c : closest
    );
}

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getPlayerTargetPercentile(w) {
    if (w < 0.13) return 0.15;
    if (w < 0.22) return 0.50;
    return 0.75;
}

/* ----------------------------------------------------------
   SCREEN NAVIGATION
   ---------------------------------------------------------- */
function showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = el('screen-' + name);
    if (target) target.classList.add('active');
    STATE.screen = name;
}

/* ----------------------------------------------------------
   API HELPERS
   ---------------------------------------------------------- */
async function apiPost(endpoint, body = {}) {
    const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}

async function apiGet(endpoint) {
    const res = await fetch(API_BASE + endpoint);
    return res.json();
}

/* ----------------------------------------------------------
   INIT
   ---------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    console.log('SOCIAL CAPITAL — initialized');
    showScreen('character');
});

/* ==========================================================
   PART 2: CHARACTER CREATOR
   ========================================================== */
function initCharacterCreator() {
    renderArchetypePreview();
    setupOptionGroups();
    setupRandomize();
    setupCharacterCTA();
}

/* ----------------------------------------------------------
   ARCHETYPE PREVIEW CARDS
   ---------------------------------------------------------- */
function renderArchetypePreview() {
    const container = el('archetype-preview');
    if (!container) return;

    container.innerHTML = ARCHETYPES.map(a => `
        <div style="
            background: var(--bg3);
            border: 1px solid ${a.color}44;
            border-radius: 3px;
            padding: 8px;
            text-align: center;
        ">
            <div style="
                width: 32px;
                height: 32px;
                background: ${a.color}22;
                border: 2px solid ${a.color};
                border-radius: 2px;
                margin: 0 auto 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: var(--px);
                font-size: 10px;
                color: ${a.color};
            ">${a.name[0]}</div>
            <div style="
                font-family: var(--px);
                font-size: 5px;
                color: ${a.color};
                margin-bottom: 3px;
            ">${a.name}</div>
            <div style="
                font-size: 9px;
                color: var(--muted);
                line-height: 1.4;
            ">${a.job}</div>
        </div>
    `).join('');
}

/* ----------------------------------------------------------
   OPTION GROUP SELECTIONS
   ---------------------------------------------------------- */
function setupOptionGroups() {
    ['job-options', 'family-options', 'edu-options'].forEach(groupId => {
        const group = el(groupId);
        if (!group) return;
        group.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.option-btn')
                    .forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                updatePlayerW();
            });
        });
    });

    el('char-name-input').addEventListener('input', () => {
        updatePositionCard();
        updateCTAState();
    });
}

/* ----------------------------------------------------------
   CALCULATE PLAYER W FROM SELECTIONS
   ---------------------------------------------------------- */
function updatePlayerW() {
    const jobBtn = document.querySelector('#job-options .option-btn.selected');
    const familyBtn = document.querySelector('#family-options .option-btn.selected');
    const eduBtn = document.querySelector('#edu-options .option-btn.selected');

    if (!jobBtn || !familyBtn || !eduBtn) {
        updateCTAState();
        return;
    }

    const jobData = JOB_W[jobBtn.dataset.value];
    const familyData = FAMILY_MOD[familyBtn.dataset.value];
    const eduData = EDU_MOD[eduBtn.dataset.value];

    const w = Math.max(0.04, Math.min(0.40,
        jobData.w + familyData.mod + eduData.mod
    ));

    STATE.player.w = w;
    STATE.player.tailwind = getTailwind(w);
    STATE.player.job = jobBtn.dataset.value;
    STATE.player.family = familyBtn.dataset.value;
    STATE.player.education = eduBtn.dataset.value;
    STATE.player.targetPercentile = getPlayerTargetPercentile(w);

    updatePositionCard();
    updateCTAState();
}

/* ----------------------------------------------------------
   POSITION CARD — shows after all selections made
   ---------------------------------------------------------- */
function updatePositionCard() {
    const jobBtn = document.querySelector('#job-options .option-btn.selected');
    const familyBtn = document.querySelector('#family-options .option-btn.selected');
    const eduBtn = document.querySelector('#edu-options .option-btn.selected');

    if (!jobBtn || !familyBtn || !eduBtn) return;

    const card = el('position-card');
    const name = el('char-name-input').value.trim() || 'YOUR CHARACTER';
    const tailwind = STATE.player.tailwind;

    const bios = {
        Headwind: 'Your money doesn\'t work for you. You depend entirely on income. One bad year can undo years of progress.',
        Neutral: 'You have some cushion — but nothing that compounds significantly. You\'ll need good policy and a little luck.',
        Tailwind: 'Your wealth generates more wealth. The system already works for you. The question is what happens to everyone else.'
    };

    const bracketLabels = {
        Headwind: 'LOWER',
        Neutral: 'MIDDLE',
        Tailwind: 'UPPER'
    };

    el('position-name').textContent = name.toUpperCase();
    el('position-bio').textContent = bios[tailwind];
    el('position-bracket').textContent = bracketLabels[tailwind];
    el('position-bracket').style.color = getTailwindColor(tailwind);
    el('position-tailwind').textContent = tailwind.toUpperCase();
    el('position-tailwind').style.color = getTailwindColor(tailwind);

    card.style.display = 'block';
}

/* ----------------------------------------------------------
   CTA STATE — enable button only when form is complete
   ---------------------------------------------------------- */
function updateCTAState() {
    const btn = el('to-policy-btn');
    const hasName = el('char-name-input').value.trim().length > 0;
    const hasJob = !!document.querySelector('#job-options .option-btn.selected');
    const hasFamily = !!document.querySelector('#family-options .option-btn.selected');
    const hasEdu = !!document.querySelector('#edu-options .option-btn.selected');
    btn.disabled = !(hasName && hasJob && hasFamily && hasEdu);
}

/* ----------------------------------------------------------
   RANDOMIZE
   ---------------------------------------------------------- */
function setupRandomize() {
    el('randomize-btn').addEventListener('click', () => {
        const names = [
            'Alex', 'Jordan', 'Sam', 'Casey', 'Morgan',
            'Riley', 'Drew', 'Jamie', 'Taylor', 'Robin'
        ];
        el('char-name-input').value = randomFrom(names);
        randomSelectGroup('job-options', Object.keys(JOB_W));
        randomSelectGroup('family-options', Object.keys(FAMILY_MOD));
        randomSelectGroup('edu-options', Object.keys(EDU_MOD));
        updatePlayerW();
    });
}

function randomSelectGroup(groupId, keys) {
    const group = el(groupId);
    if (!group) return;
    const key = randomFrom(keys);
    group.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.value === key);
    });
}

/* ----------------------------------------------------------
   CTA — go to policy screen
   ---------------------------------------------------------- */
function setupCharacterCTA() {
    el('to-policy-btn').addEventListener('click', () => {
        STATE.player.name = el('char-name-input').value.trim();
        showScreen('policy');
    });
}

/* ----------------------------------------------------------
   KICK OFF
   ---------------------------------------------------------- */
initCharacterCreator();

/* ==========================================================
   PART 3: POLICY SCREEN
   ========================================================== */
function initPolicyScreen() {
    setupPolicyCards();
    setupPatronToggle();
    setupPolicyCTA();
    setupCustomPolicyGenerator();
}

/* ----------------------------------------------------------
   POLICY CARD SELECTION
   ---------------------------------------------------------- */
function setupPolicyCards() {
    const customInput = el('custom-policy-input');

    document.querySelectorAll('.policy-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.policy-card')
                .forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            STATE.policy = card.dataset.policy;

            // Show/hide custom policy input
            if (customInput) {
                customInput.style.display = STATE.policy === 'custom' ? 'block' : 'none';
            }

            // Reset run button state when switching policies
            const runBtn = el('to-run-btn');
            if (runBtn) {
                if (STATE.policy === 'custom' && !STATE.customPolicyReady) {
                    runBtn.disabled = true;
                    runBtn.style.opacity = '0.4';
                } else {
                    runBtn.disabled = false;
                    runBtn.style.opacity = '1';
                }
            }
        });
    });

    // Default selection — econophysics
    const defaultCard = document.querySelector('.policy-card[data-policy="econophysics"]');
    if (defaultCard) {
        defaultCard.classList.add('selected');
        STATE.policy = 'econophysics';
    }
}

/* ----------------------------------------------------------
   CUSTOM POLICY GENERATOR
   ---------------------------------------------------------- */
function setupCustomPolicyGenerator() {
    const btn = el('generate-policy-btn');
    if (!btn) return;

    // Track whether a custom policy has been successfully generated
    STATE.customPolicyReady = false;

    btn.addEventListener('click', async () => {
        const promptText = (el('policy-prompt')?.value || '').trim();
        if (!promptText) {
            setCustomStatus('⚠ Please describe your policy first.', 'var(--neon)');
            return;
        }

        // Disable button during generation
        btn.disabled = true;
        btn.textContent = '⏳ GENERATING...';
        setCustomStatus('Phase 1: Sending to AI...', 'var(--muted)');
        hideCustomDescription();

        try {
            // 1. Generate + validate via /api/chat
            const chatRes = await apiPost('/chat', { message: promptText });

            if (chatRes.error) {
                throw new Error(chatRes.error);
            }

            const data = typeof chatRes.response === 'string'
                ? JSON.parse(chatRes.response)
                : chatRes.response;

            if (!data || !data.python_code) {
                throw new Error('No policy code was generated.');
            }

            setCustomStatus('Phase 2: Saving policy...', 'var(--muted)');

            // 2. Save the generated class to custom_policies.py
            await apiPost('/add_custom_policy', { code: data.python_code });

            // 3. Wire the step function into user_logic.py
            if (data.step_code) {
                await apiPost('/update_code', { code: data.step_code });
            }

            // 4. Show the plain-English description
            if (data.description) {
                showCustomDescription(data.description);
            }

            // 5. Mark as ready — enable the run button
            STATE.customPolicyReady = true;
            const runBtn = el('to-run-btn');
            if (runBtn) {
                runBtn.disabled = false;
                runBtn.style.opacity = '1';
            }

            setCustomStatus(data.status_message || '✅ Policy generated and ready!', '#00ff88');
            btn.textContent = '✦ REGENERATE';

        } catch (err) {
            setCustomStatus('❌ ' + (err.message || 'Generation failed.'), '#ff4466');
            btn.textContent = '✦ TRY AGAIN';
        } finally {
            btn.disabled = false;
        }
    });
}

function setCustomStatus(msg, color) {
    const s = el('policy-status');
    if (s) { s.textContent = msg; s.style.color = color || 'var(--muted)'; }
}

function showCustomDescription(desc) {
    const d = el('policy-description');
    if (!d) return;
    d.style.display = 'block';
    d.innerHTML = '<div style="font-size:11px; text-transform:uppercase; color:var(--neon); margin-bottom:8px; letter-spacing:1px;">How Your Policy Works</div>'
        + desc.replace(/\n/g, '<br>');
}

function hideCustomDescription() {
    const d = el('policy-description');
    if (d) d.style.display = 'none';
}

/* ----------------------------------------------------------
   PATRON TOGGLE
   ---------------------------------------------------------- */
function setupPatronToggle() {
    const toggle = el('patron-toggle');
    if (!toggle) return;
    toggle.addEventListener('change', () => {
        STATE.patron = toggle.checked;
    });
}

/* ----------------------------------------------------------
   CTA — begin the run
   ---------------------------------------------------------- */
function setupPolicyCTA() {
    el('to-run-btn').addEventListener('click', () => {
        // Block if custom policy selected but not yet generated
        if (STATE.policy === 'custom' && !STATE.customPolicyReady) return;

        // For custom policies, use 'econophysics' as the base model policy
        // (the custom logic runs via user_logic.py override)
        if (STATE.policy === 'custom') {
            STATE._originalPolicy = 'custom';
            STATE.policy = 'econophysics';
        }

        showScreen('loading');
        beginInitSequence();
    });
}

/* ==========================================================
   PART 4: INITIALIZATION SEQUENCE
   ========================================================== */

/* ----------------------------------------------------------
   LOADING SCREEN — narrative beats while we initialize
   ---------------------------------------------------------- */
function showLoadingScreen() {
    // Inject loading screen HTML if not already present
    if (el('screen-loading')) return;

    const div = document.createElement('div');
    div.className = 'screen';
    div.id = 'screen-loading';
    div.innerHTML = `
        <header class="game-header">
            <div class="game-logo">SOCIAL<span>CAPITAL</span></div>
            <div class="px-xxs text-muted">the game was never fair</div>
        </header>
        <div style="
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
            gap: 32px;
        ">
            <div class="px-lg text-neon" id="loading-headline">
                BUILDING YOUR WORLD...
            </div>
            <div style="
                font-size: 14px;
                color: var(--muted);
                max-width: 480px;
                line-height: 1.8;
            " id="loading-body">
                Initializing the simulation.
            </div>
            <div style="
                width: 240px;
                height: 4px;
                background: var(--bg3);
                border-radius: 2px;
                overflow: hidden;
            ">
                <div id="loading-bar" style="
                    height: 100%;
                    background: var(--neon);
                    border-radius: 2px;
                    width: 0%;
                    transition: width 0.4s ease;
                "></div>
            </div>
            <div class="px-xxs text-muted" id="loading-step">
                STEP 0 / 10
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

function setLoadingState(headline, body, progress, stepLabel) {
    const h = el('loading-headline');
    const b = el('loading-body');
    const bar = el('loading-bar');
    const s = el('loading-step');
    if (h) h.textContent = headline;
    if (b) b.innerHTML = body;
    if (bar) bar.style.width = progress + '%';
    if (s) s.textContent = stepLabel;
}

/* ----------------------------------------------------------
   MAIN INIT SEQUENCE
   ---------------------------------------------------------- */
async function beginInitSequence() {
    showLoadingScreen();
    showScreen('loading');

    const SILENT_STEPS = 10;

    try {
        // Step 1 — initialize model
        setLoadingState(
            'BUILDING YOUR WORLD...',
            'Setting up the economic system.',
            5,
            'INITIALIZING...'
        );

        await apiPost('/initialize', {
            policy: STATE.policy,
            population: 100,
            patron: STATE.patron,
            start_up_required: 1
        });

        // Step 2 — run 10 silent steps with narrative beats
        const narrativeBeats = [
            'You graduate. You take your first job. The economy hums along.',
            'A few years pass. Some people get promotions. Others get laid off.',
            'The market shifts. Quietly, wealth begins to sort itself.',
            'Five years in. The gap between the top and bottom is already visible.',
            'You work hard. So does everyone else. The system has other plans.',
            'Seven years. Jordan\'s investments are compounding. Maria is treading water.',
            'Eight years. Dev is struggling to get his business off the ground.',
            'Nine years. Ruth\'s pension buys less than it used to.',
            'The world is taking shape. Ten years have passed.',
            'Here is where everyone stands...'
        ];

        for (let i = 0; i < SILENT_STEPS; i++) {
            const progress = 10 + ((i / SILENT_STEPS) * 80);
            setLoadingState(
                'TEN YEARS PASS...',
                narrativeBeats[i] || 'Time moves on.',
                progress,
                `YEAR $(i + 1) / ${SILENT_STEPS}`
            );
            await apiPost('/step');
            await sleep(600);
        }

        // Step 3 — fetch data and match characters
        setLoadingState(
            'HERE IS WHERE YOU STAND...',
            'Calculating where everyone ended up.',
            92,
            'MATCHING CHARACTERS...'
        );

        await sleep(400);
        await matchCharactersToAgents();

        // Step 4 — fetch initial display data
        await refreshSimData();

        setLoadingState(
            'YEAR 10.',
            'The simulation is ready.',
            100,
            'COMPLETE'
        );

        await sleep(800);
        // Transition to run screen
        STATE.year = 10;
        initRunScreen();
        showScreen('run');

    } catch (err) {
        console.error('Init sequence failed:', err);
        setLoadingState(
            'SOMETHING WENT WRONG.',
            'Could not connect to the simulation. Is the server running?',
            0,
            'ERROR'
        );
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/* ----------------------------------------------------------
   CHARACTER MATCHING
   After 10 steps, match archetypes + player to real agents
   by wealth rank
   ---------------------------------------------------------- */
async function matchCharactersToAgents() {
    const mobilityData = await apiGet('/data/mobility');

    if (!Array.isArray(mobilityData)) {
        console.error('Unexpected mobility data shape', mobilityData);
        return;
    }

    // Build sortable list with original index
    const agents = mobilityData.map((a, i) => ({
        index: i,
        wealth: a.wealth,
        bracket: a.bracket,
        mobility: a.mobility
    }));

    const sorted = [...agents].sort((a, b) => a.wealth - b.wealth);
    const n = sorted.length;

    // Helper — find agent at a given percentile
    function agentAtPercentile(p, excluded) {
        const targetIdx = Math.round(p * (n - 1));
        // Search outward from target until we find an unexcluded agent
        for (let offset = 0; offset < n; offset++) {
            for (const dir of [1, -1]) {
                const idx = targetIdx + (offset * dir);
                if (idx < 0 || idx >= n) continue;
                const agent = sorted[idx];
                if (!excluded.has(agent.index)) return agent;
            }
        }
        return null;
    }

    const usedIndices = new Set();
    const matched = [];

    // Match each archetype in order of most distinctive
    // (extremes first, then work toward middle)
    const matchOrder = [
        { id: 'jordan', percentile: 0.95 },
        { id: 'maria', percentile: 0.05 },
        { id: 'amir', percentile: 0.75 },
        { id: 'ruth', percentile: 0.25 },
        { id: 'dev', percentile: 0.50 }
    ];

    for (const { id, percentile } of matchOrder) {
        const archetype = ARCHETYPES.find(a => a.id === id);
        const agent = agentAtPercentile(percentile, usedIndices);
        if (!agent) continue;

        usedIndices.add(agent.index);
        matched.push({
            ...archetype,
            agentIndex: agent.index,
            wealth: agent.wealth,
            bracket: agent.bracket,
            mobility: agent.mobility,
            wealthHistory: [agent.wealth]
        });
    }

    // Match player
    const playerPercentile = STATE.player.targetPercentile;
    const playerAgent = agentAtPercentile(playerPercentile, usedIndices);

    if (playerAgent) {
        usedIndices.add(playerAgent.index);
        matched.push({
            id: 'player',
            name: STATE.player.name.toUpperCase(),
            job: JOB_W[STATE.player.job]?.label || '',
            bio: 'That\'s you.',
            color: '#ffffff',
            isPlayer: true,
            agentIndex: playerAgent.index,
            wealth: playerAgent.wealth,
            bracket: playerAgent.bracket,
            mobility: playerAgent.mobility,
            wealthHistory: [playerAgent.wealth]
        });
    }

    // Sort display order by wealth descending
    matched.sort((a, b) => b.wealth - a.wealth);
    STATE.characters = matched;

    console.log('Characters matched:', STATE.characters.map(c =>
        `${c.name} → agent[${c.agentIndex}] wealth=${c.wealth.toFixed(2)}`
    ));
}

/* ----------------------------------------------------------
   REFRESH SIM DATA — called after each step
   ---------------------------------------------------------- */
async function refreshSimData() {
    const [mobilityData, giniData] = await Promise.all([
        apiGet('/data/mobility'),
        apiGet('/data/gini')
    ]);

    // Update gini history
    if (giniData.current) {
        STATE.giniHistory = giniData.current;
    }

    // Update each character's live data
    if (Array.isArray(mobilityData)) {
        STATE.characters.forEach(char => {
            const agent = mobilityData[char.agentIndex];
            if (!agent) return;
            const prevWealth = char.wealth;
            char.wealth = agent.wealth;
            char.bracket = agent.bracket;
            char.mobility = agent.mobility;
            char.trend = char.wealth > prevWealth ? 'up'
                : char.wealth < prevWealth ? 'down'
                    : 'flat';
            char.wealthHistory.push(agent.wealth);
        });

        // Re-sort by wealth descending
        STATE.characters.sort((a, b) => b.wealth - a.wealth);
    }
}

/* ----------------------------------------------------------
   KICK OFF POLICY SCREEN
   ---------------------------------------------------------- */
initPolicyScreen();

/* ==========================================================
   PART 5: RUN SCREEN
   ========================================================== */
/* ----------------------------------------------------------
   INIT RUN SCREEN — called once when transitioning from loading
   ---------------------------------------------------------- */
function initRunScreen() {
    renderSidebar();
    initCanvas();
    setupSimControls();
    updateYearDisplay();
    updateGiniDisplay();
}

/* ----------------------------------------------------------
   SIDEBAR — 6 character cards
   ---------------------------------------------------------- */
function renderSidebar() {
    const container = el('char-sidebar');
    if (!container) return;

    container.innerHTML = STATE.characters.map(char => `
        <div class="char-card ${char.isPlayer ? 'you' : ''}"
             id="char-card-${char.id}">
            ${char.isPlayer
            ? '<span class="char-you-tag">▶ YOU</span>'
            : ''}
            <div class="char-name-row">
                <span class="char-name" style="color: ${char.color}">
                    ${char.name}
                </span>
                <span class="char-bracket-tag ${char.bracket}">
                    ${char.bracket.toUpperCase()}
                </span>
            </div>
            <div class="wealth-bar-wrap">
                <div class="wealth-bar-fill"
                     id="wealth-bar-${char.id}"
                     style="width: 0%; background: ${char.color}">
                </div>
            </div>
            <div class="char-wealth" style="color: ${char.color}">
                <span id="wealth-val-${char.id}">
                    ${formatWealth(char.wealth)}
                </span>
                <span class="char-trend flat"
                      id="trend-${char.id}">→</span>
            </div>
            <div class="char-tailwind" id="tailwind-${char.id}">
                ${char.isPlayer
            ? STATE.player.tailwind
            : char.tailwind || ''}
            </div>
        </div>
    `).join('');
}

/* ----------------------------------------------------------
   UPDATE SIDEBAR — called after each step
   ---------------------------------------------------------- */
function updateSidebar() {
    // Find max wealth for bar scaling
    const maxWealth = Math.max(...STATE.characters.map(c => c.wealth));

    STATE.characters.forEach(char => {
        const bar = el(`wealth-bar-${char.id}`);
        const val = el(`wealth-val-${char.id}`);
        const trend = el(`trend-${char.id}`);
        const card = el(`char-card-${char.id}`);
        const bracket = card ? card.querySelector('.char-bracket-tag') : null;

        if (bar) {
            const pct = maxWealth > 0
                ? (char.wealth / maxWealth) * 100
                : 0;
            bar.style.width = pct + '%';
        }

        if (val) val.textContent = formatWealth(char.wealth);

        if (trend) {
            const t = char.trend || 'flat';
            trend.className = 'char-trend ${t}';
            trend.textContent = t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
        }

        if (bracket) {
            bracket.className = `char-bracket-tag ${char.bracket}`;
            bracket.textContent = char.bracket.toUpperCase();
        }
    });
}

/* ----------------------------------------------------------
   YEAR + GINI DISPLAY
   ---------------------------------------------------------- */
function updateYearDisplay() {
    const d = el('year-display');
    if (d) d.textContent = `YEAR ${String(STATE.year).padStart(2, '0')}`;

    const p = el('progress-fill');
    if (p) p.style.width = ((STATE.year / 50) * 100) + '%';
}

function updateGiniDisplay() {
    const current = STATE.giniHistory[STATE.giniHistory.length - 1];
    if (current === undefined) return;

    const giniEl = el('gini-display');
    const fillEl = el('gini-fill');
    const headerEl = el('header-gini');

    const val = current.toFixed(3);

    if (giniEl) giniEl.textContent = val;
    if (headerEl) headerEl.textContent = val;

    // Color shifts from neon → amber → red as inequality rises
    const color = current < 0.35 ? 'var(--neon)'
        : current < 0.50 ? 'var(--amber)'
            : 'var(--red)';

    if (giniEl) giniEl.style.color = color;
    if (fillEl) {
        fillEl.style.width = (current * 100) + '%';
        fillEl.style.background = color;
    }
}

/* ----------------------------------------------------------
   DISPATCH FEED
   ---------------------------------------------------------- */
function addDispatchEntry(html, type = '') {
    const feed = el('dispatch-feed');
    if (!feed) return;

    const entry = document.createElement('div');
    entry.className = 'dispatch-entry';
    if (type) entry.classList.add(type);
    entry.innerHTML = html;

    // Prepend so newest is at top
    feed.insertBefore(entry, feed.firstChild);

    // Keep feed from growing too large
    while (feed.children.length > 40) {
        feed.removeChild(feed.lastChild);
    }
}

async function updateDispatchFeed() {
    const data = await apiGet('/data/exchanges');
    if (!data.edges || !data.edges.length) return;
    // Map unique_id → character
    // unique_id is 1-indexed, agentIndex is 0-indexed
    const idToChar = {};
    STATE.characters.forEach(char => {
        idToChar[char.agentIndex + 1] = char;
    });

    // Separate exchanges into categories
    const characterExchanges = [];  // between 2 of our characters
    const incomingExchanges = [];  // outside agent → our character
    const outgoingExchanges = [];  // our character → outside agent

    data.edges.forEach(([fromId, toId, amount]) => {
        const fromChar = idToChar[fromId];
        const toChar = idToChar[toId];

        if (fromChar && toChar) {
            characterExchanges.push({ fromChar, toChar, amount });
        } else if (!fromChar && toChar) {
            incomingExchanges.push({ fromId, toChar, amount });
        } else if (fromChar && !toChar) {
            outgoingExchanges.push({ fromChar, toId, amount });
        }
    });

    // Show character-to-character first (most interesting)
    characterExchanges.slice(0, 2).forEach(({ fromChar, toChar, amount }) => {
        addDispatchEntry(
            `<span class="actor" style="color:${fromChar.color}">${fromChar.name}</span> ` +
            `paid ` +
            `<span class="actor" style="color:${toChar.color}">${toChar.name}</span> ` +
            `<span class="good">$${amount.toFixed(2)}</span>`
        );
    });

    // Show notable incoming — outside world paying our characters
    incomingExchanges
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 1)
        .forEach(({ fromId, toChar, amount }) => {
            addDispatchEntry(
                `<span class="actor" style="color: var(--muted)">agent #${fromId}</span> ` +
                `paid ` +
                `<span class="actor" style="color:${toChar.color}">${toChar.name}</span> ` +
                `<span class="good">$${amount.toFixed(2)}</span>`
            );
        });
    // Show notable outgoing — our characters paying outside world
    outgoingExchanges
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 1)
        .forEach(({ fromChar, toId, amount }) => {
            addDispatchEntry(
                `<span class="actor" style="color:${fromChar.color}">${fromChar.name}</span> ` +
                `paid ` +
                `<span class="actor" style="color: var(--muted)">agent #${toId}</span> ` +
                `<span class="bad">$${amount.toFixed(2)}</span>`
            );
        });

    // Bracket change events
    STATE.characters.forEach(char => {
        const history = char.wealthHistory;
        if (history.length < 2) return;
        const prev = history[history.length - 2];
        const curr = history[history.length - 1];

        if (curr < prev * 0.8) {
            addDispatchEntry(
                `<span class="actor" style="color:${char.color}">${char.name}</span>` +
                `<span class="bad">'s wealth dropped by more than 20%</span>`
            );
        } else if (curr > prev * 1.5) {
            addDispatchEntry(
                `<span class="actor" style="color:${char.color}">${char.name}</span>` +
                `<span class="good">'s wealth increased by more than 50%!</span>`
            );
        }
    });
}

/* ----------------------------------------------------------
   CANVAS — exchange visualization
   ---------------------------------------------------------- */
let canvas, ctx, canvasParticles = [];

function initCanvas() {
    canvas = el('exchange-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(animateCanvas);
}

function resizeCanvas() {
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const w = wrap.offsetWidth || wrap.getBoundingClientRect().width || 600;
    const h = Math.max(300, wrap.offsetHeight || 300);
    canvas.width = w;
    canvas.height = h;
}

// Store fixed positions after matching
let fixedNodePositions = null;
function getNodePositions() {
    if (!canvas) return [];

    // If we have fixed positions already, return them
    if (fixedNodePositions && fixedNodePositions.length === STATE.characters.length) {
        // Update wealth/bracket data but keep x,y fixed
        fixedNodePositions.forEach(node => {
            const char = STATE.characters.find(c => c.id === node.char.id);
            if (char) node.char = char;
        });
        return fixedNodePositions;
    }

    // Calculate positions once
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.35;
    const n = STATE.characters.length;

    fixedNodePositions = STATE.characters.map((char, i) => {
        const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
        return {
            char,
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        };
    });

    return fixedNodePositions;
}

function animateCanvas() {
    if (!ctx || !canvas) return;
    requestAnimationFrame(animateCanvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodes = getNodePositions();
    if (!nodes.length) return;

    // Draw connecting lines between nodes
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            ctx.strokeStyle = 'rgba(42, 42, 64, 0.6)';
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
        }
    }

    // Draw particles
    canvasParticles = canvasParticles.filter(p => p.life > 0);
    canvasParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;

        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        ctx.globalAlpha = 1;
    });

    // Draw nodes
    const maxWealth = Math.max(...STATE.characters.map(c => c.wealth), 1);

    nodes.forEach(({ char, x, y }) => {
        const size = 10 + (char.wealth / maxWealth) * 20;

        // Glow for player
        if (char.isPlayer) {
            ctx.shadowColor = char.color;
            ctx.shadowBlur = 16;
        }

        // Node square (pixel art feel)
        ctx.fillStyle = char.color + '33';
        ctx.fillRect(x - size, y - size, size * 2, size * 2);

        ctx.strokeStyle = char.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x - size, y - size, size * 2, size * 2);

        ctx.shadowBlur = 0;

        // Name label
        ctx.fillStyle = char.color;
        ctx.font = '5px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(char.name, x, y + size + 14);

        // Wealth label
        ctx.fillStyle = 'rgba(232, 232, 240, 0.7)';
        ctx.font = '5px "Press Start 2P"';
        ctx.fillText(formatWealth(char.wealth), x, y + size + 24);
    });
}

function spawnParticles(fromChar, toChar, amount) {
    const nodes = getNodePositions();
    const from = nodes.find(n => n.char.id === fromChar.id);
    const to = nodes.find(n => n.char.id === toChar.id);
    if (!from || !to) return;

    const count = Math.min(8, Math.ceil(amount * 2));

    for (let i = 0; i < count; i++) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 2 + Math.random() * 2;

        canvasParticles.push({
            x: from.x + (Math.random() - 0.5) * 10,
            y: from.y + (Math.random() - 0.5) * 10,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            color: toChar.color,
            life: Math.round(dist / speed),
            maxLife: Math.round(dist / speed)
        });
    }
}

async function spawnExchangeParticles() {
    const data = await apiGet('/data/exchanges');
    if (!data.edges) return;
    const idToChar = {};
    STATE.characters.forEach(char => {
        idToChar[char.agentIndex + 1] = char;
    });

    data.edges.forEach(([fromId, toId, amount]) => {
        const fromChar = idToChar[fromId];
        const toChar = idToChar[toId];

        if (fromChar && toChar) {
            // Character to character — normal particle
            spawnParticles(fromChar, toChar, amount);
        } else if (!fromChar && toChar) {
            // Outside → character — spawn from canvas edge
            spawnParticlesFromEdge(toChar, amount, 'in');
        } else if (fromChar && !toChar) {
            // Character → outside — spawn toward canvas edge
            spawnParticlesFromEdge(fromChar, amount, 'out');
        }
    });
}

function spawnParticlesFromEdge(char, amount, direction) {
    const nodes = getNodePositions();
    const node = nodes.find(n => n.char.id === char.id);
    if (!node || !canvas) return;

    const count = Math.min(4, Math.ceil(amount));
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < count; i++) {
        // Random edge position
        const angle = Math.random() * Math.PI * 2;
        const edgeX = cx + Math.cos(angle) * (canvas.width * 0.6);
        const edgeY = cy + Math.sin(angle) * (canvas.height * 0.6);

        const fromX = direction === 'in' ? edgeX : node.x;
        const fromY = direction === 'in' ? edgeY : node.y;
        const toX = direction === 'in' ? node.x : edgeX;
        const toY = direction === 'in' ? node.y : edgeY;

        const dx = toX - fromX;
        const dy = toY - fromY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 2 + Math.random() * 2;

        canvasParticles.push({
            x: fromX,
            y: fromY,
            vx: (dx / dist) * speed,
            vy: (dy / dist) * speed,
            color: direction === 'in'
                ? char.color
                : 'rgba(106, 106, 138, 0.6)',
            life: Math.round(dist / speed),
            maxLife: Math.round(dist / speed)
        });
    }
}

/* ----------------------------------------------------------
   SIM CONTROLS
   ---------------------------------------------------------- */
function setupSimControls() {
    el('step-btn').addEventListener('click', () => {
        if (!STATE.running) runOneStep();
    });

    el('run-btn').addEventListener('click', () => {
        startContinuous();
    });

    el('stop-btn').addEventListener('click', () => {
        stopContinuous();
    });
}

async function runOneStep() {
    if (STATE.year >= 50) return;

    await apiPost('/step');
    STATE.year++;

    await refreshSimData();
    await spawnExchangeParticles();
    await updateDispatchFeed();

    updateSidebar();
    updateYearDisplay();
    updateGiniDisplay();

    // Check for crisis
    checkForCrisis();
}

function startContinuous() {
    if (STATE.running) return;
    STATE.running = true;
    el('run-btn').style.display = 'none';
    el('stop-btn').style.display = 'inline-block';

    STATE.intervalId = setInterval(async () => {
        if (STATE.running) await runOneStep();
    }, STATE.stepSpeed);
}

function stopContinuous() {
    STATE.running = false;
    clearInterval(STATE.intervalId);
    el('run-btn').style.display = 'inline-block';
    el('stop-btn').style.display = 'none';
}

/* ----------------------------------------------------------
   CRISIS CHECK
   ---------------------------------------------------------- */
function checkForCrisis() {
    // Year 20 — random from pool
    if (STATE.year === 20 && !STATE.crisisPool10Used) {
        stopContinuous();
        const pool = CRISES[10];
        const crisis = randomFrom(pool);
        STATE.crisisPool10Used = crisis.id;
        STATE.nextCrisisId = crisis.effect?.nextCrisis || null;
        showCrisisScreen(crisis, 20);
        return;
    }

    // Year 35 — gated by year 20 choice
    if (STATE.year === 35 && STATE.nextCrisisId) {
        stopContinuous();
        const crisis = CRISES[20][STATE.nextCrisisId];
        if (crisis) {
            STATE.nextCrisisId = crisis.effect?.nextCrisis || null;
            showCrisisScreen(crisis, 35);
        }
        return;
    }

    // Year 50 — final
    if (STATE.year === 50) {
        stopContinuous();
        if (STATE.nextCrisisId && CRISES[35][STATE.nextCrisisId]) {
            const crisis = CRISES[35][STATE.nextCrisisId];
            showCrisisScreen(crisis, 50);
        } else {
            showVerdictScreen();
        }
    }
}

/* ----------------------------------------------------------
   KICK OFF — called from beginInitSequence after loading
   ---------------------------------------------------------- */
function initRunScreen() {
    renderSidebar();
    setupSimControls();
    updateYearDisplay();
    updateGiniDisplay();
    // Delay canvas init until screen is visible
    setTimeout(() => {
        initCanvas();
    }, 50);
}

/* ==========================================================
   PART 6: CRISIS SCREEN
   ========================================================== */
function showCrisisScreen(crisis, year) {
    // Update header tag
    el('crisis-tag').textContent = `YEAR ${year} · CRISIS EVENT`;
    el('crisis-title').textContent = crisis.title;

    // Update header color
    const header = el('crisis-header');
    if (header) header.style.background = crisis.color || 'var(--red)';

    // Update crisis text
    el('crisis-text').innerHTML = crisis.text;

    // Render standings
    renderCrisisStandings();

    // Render choices
    renderCrisisChoices(crisis, year);

    showScreen('crisis');
}

/* ----------------------------------------------------------
   CRISIS STANDINGS
   ---------------------------------------------------------- */
function renderCrisisStandings() {
    const container = el('crisis-standings-list');
    if (!container) return;

    const maxWealth = Math.max(...STATE.characters.map(c => c.wealth), 1);

    // Sort by wealth descending for display
    const sorted = [...STATE.characters].sort((a, b) => b.wealth - a.wealth);

    container.innerHTML = sorted.map(char => {
        const pct = (char.wealth / maxWealth) * 100;
        const isPlayer = char.isPlayer;
        const trendIcon = char.trend === 'up' ? '↑'
            : char.trend === 'down' ? '↓'
                : '→';
        const trendColor = char.trend === 'up' ? 'var(--neon)'
            : char.trend === 'down' ? 'var(--red)'
                : 'var(--muted)';

        return `
            <div class="standing-row ${isPlayer ? 'you-row' : ''}">
                <span class="standing-name" style="color: ${char.color}">
                    ${char.name}
                </span>
                <div class="standing-bar-wrap">
                    <div class="standing-bar-fill"
                         style="width: ${pct}%; background: ${char.color};">
                    </div>
                </div>
                <span class="standing-wealth">
                    ${formatWealth(char.wealth)}
                </span>
                <span class="standing-bracket"
                      style="color: ${getBracketColor(char.bracket)}">
                    ${char.bracket.toUpperCase()}
                </span>
                <span style="color: ${trendColor}; font-size: 12px;">
                    ${trendIcon}
                </span>
            </div>
        `;
    }).join('');
}

/* ----------------------------------------------------------
   CRISIS CHOICES
   ---------------------------------------------------------- */
function renderCrisisChoices(crisis, year) {
    const container = el('crisis-choices');
    if (!container) return;

    container.innerHTML = crisis.choices.map(choice => `
        <button class="choice-btn"
                data-key="${choice.key}"
                data-year="${year}"
                data-next="${choice.effect?.nextCrisis || ''}">
            <span class="choice-key">OPTION ${choice.key}</span>
            <span class="choice-text">${choice.text}</span>
            <div class="pill-row">
                ${choice.pills.map(pill => `
                    <span class="pill pill-${pill.type}">
                        ${pill.label}
                    </span>
                `).join('')}
            </div>
        </button>
    `).join('');

    // Attach click handlers
    container.querySelectorAll('.choice-btn').forEach((btn, i) => {
        btn.addEventListener('click', () => {
            const choice = crisis.choices[i];
            applyCrisisEffect(choice.effect, year);
            recordDecision(year, crisis.title, choice.text);
        });
    });
}

/* ----------------------------------------------------------
   APPLY CRISIS EFFECT
   ---------------------------------------------------------- */
async function applyCrisisEffect(effect, year) {
    if (!effect) {
        resumeAfterCrisis(year);
        return;
    }

    // Handle patron toggle
    if (effect.patron !== undefined) {
        STATE.patron = effect.patron;
        // Re-initialize with new patron setting
        // We can't change mid-run via API directly
        // so we track it in state for verdict display
    }

    // Track next crisis
    if (effect.nextCrisis) {
        STATE.nextCrisisId = effect.nextCrisis;
    }

    // For survival cost changes we note them in dispatch
    if (effect.survivalCostMod !== undefined) {
        const mod = effect.survivalCostMod;
        const msg = mod < 0
            ? `<span class="good">Policy applied — cost of living decreasing</span>`
            : mod > 0
                ? `<span class="bad">Policy applied — cost of living increasing</span>`
                : `<span>Policy applied — no immediate economic change</span>`;

        addDispatchEntry(msg);
    }

    resumeAfterCrisis(year);
}

function resumeAfterCrisis(year) {
    // If year 50 crisis — go straight to verdict
    if (year === 50) {
        showVerdictScreen();
        return;
    }

    // Otherwise return to run screen
    showScreen('run');

    // Brief dispatch message
    addDispatchEntry(
        `<span class="special">— CRISIS RESOLVED · SIMULATION RESUMING —</span>`
    );
}

/* ----------------------------------------------------------
   RECORD DECISION FOR VERDICT
   ---------------------------------------------------------- */
function recordDecision(year, crisisTitle, choiceText) {
    STATE.decisions.push({
        year,
        crisis: crisisTitle,
        choice: choiceText
    });
}

/* ==========================================================
   PART 7: VERDICT SCREEN
   ========================================================== */
function showVerdictScreen() {
    renderVerdictScore();
    renderVerdictSparklines();
    renderVerdictDecisions();
    setupVerdictButtons();
    showScreen('verdict');
}

/* ----------------------------------------------------------
   SCORE & COUNTRY COMPARISON
   ---------------------------------------------------------- */
function renderVerdictScore() {
    const finalGini = STATE.giniHistory[STATE.giniHistory.length - 1] || 0;
    const country = getCountryByGini(finalGini);
    const equity = Math.round((1 - finalGini) * 100);

    // Gini value
    const giniEl = el('verdict-gini');
    if (giniEl) {
        giniEl.textContent = finalGini.toFixed(3);
        giniEl.style.color = finalGini < 0.35 ? 'var(--neon)'
            : finalGini < 0.50 ? 'var(--amber)'
                : 'var(--red)';
    }

    // Equity score
    const equityEl = el('verdict-equity');
    if (equityEl) {
        equityEl.textContent = `EQUITY SCORE: ${equity} / 100`;
        equityEl.style.color = equity > 65 ? 'var(--neon)'
            : equity > 50 ? 'var(--amber)'
                : 'var(--red)';
    }

    // Country comparison
    const countryEl = el('verdict-country');
    if (countryEl) {
        countryEl.innerHTML = `YOUR ECONOMY FINISHED LIKE &nbsp;
            <span style="color: var(--neon2)">${country.name.toUpperCase()}</span>
            &nbsp; (GINI ${country.gini.toFixed(2)})`;
    }
}

/* ----------------------------------------------------------
   CHARACTER JOURNEY SPARKLINES
   ---------------------------------------------------------- */
function renderVerdictSparklines() {
    const container = el('verdict-sparklines');
    if (!container) return;

    // Sort by final wealth descending
    const sorted = [...STATE.characters].sort((a, b) => b.wealth - a.wealth);

    container.innerHTML = sorted.map(char => {
        const sparkSVG = buildSparkline(char.wealthHistory, char.color);
        const finalW = formatWealth(char.wealth);
        const bracket = char.bracket;

        return `
            <div class="sparkline-row">
                <span class="sparkline-name"
                      style="color: ${char.color}">
                    ${char.name}
                </span>
                <div class="sparkline-track">
                    ${sparkSVG}
                </div>
                <span class="sparkline-end">
                    <span style="color: ${getBracketColor(bracket)}">
                        ${bracket.toUpperCase()}
                    </span>
                    &nbsp;${finalW}
                </span>
            </div>
        `;
    }).join('');
}

function buildSparkline(history, color) {
    if (!history || history.length < 2) {
        return '<svg width="100%" height="32"></svg>';
    }

    const w = 200;
    const h = 32;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const n = history.length;

    const points = history.map((val, i) => {
        const x = (i / (n - 1)) * w;
        const y = h - ((val - min) / range) * (h - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return `
        <svg width="100%" height="${h}"
             viewBox="0 0 ${w} ${h}"
             preserveAspectRatio="none">
            <polyline
                points="${points}"
                fill="none"
                stroke="${color}"
                stroke-width="1.5"
                stroke-linejoin="round"
                stroke-linecap="round"
            />
        </svg>
    `;
}

/* ----------------------------------------------------------
   DECISION LOG
   ---------------------------------------------------------- */
function renderVerdictDecisions() {
    const container = el('verdict-decisions');
    if (!container) return;

    if (!STATE.decisions.length) {
        container.innerHTML = `
            <div class="decision-row">
                <span class="decision-txt" style="color: var(--muted)">
                    No crisis decisions were recorded.
                </span>
            </div>
        `;
        return;
    }

    container.innerHTML = STATE.decisions.map(d => `
        <div class="decision-row">
            <span class="decision-yr">YR ${d.year}</span>
            <span class="decision-txt">
                <strong>${d.crisis}</strong><br>
                ${d.choice}
            </span>
        </div>
    `).join('');
}

/* ----------------------------------------------------------
   VERDICT BUTTONS
   ---------------------------------------------------------- */
function setupVerdictButtons() {
    // Share score
    const shareBtn = el('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const finalGini = STATE.giniHistory[STATE.giniHistory.length - 1] || 0;
            const equity = Math.round((1 - finalGini) * 100);
            const country = getCountryByGini(finalGini);
            const player = STATE.player.name || 'A player';
            const text = `I just played SOCIAL CAPITAL.\n` +
                `Final Gini: ${finalGini.toFixed(3)}\n` +
                `Equity Score: ${equity}/100\n` +
                `My economy finished like ${country.name}.\n` +
                `"the game was never fair"`;

            if (navigator.share) {
                navigator.share({ title: 'SOCIAL CAPITAL', text })
                    .catch(() => fallbackShare(text));
            } else {
                fallbackShare(text);
            }
        });
    }

    // Play again
    const playAgainBtn = el('play-again-btn');
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            resetGame();
        });
    }
}

function fallbackShare(text) {
    navigator.clipboard.writeText(text).then(() => {
        const btn = el('share-btn');
        if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'COPIED!';
            setTimeout(() => { btn.textContent = orig; }, 2000);
        }
    }).catch(() => {
        alert('Copy this to share:\n\n' + text);
    });
}

/* ----------------------------------------------------------
   RESET — start a new game
   ---------------------------------------------------------- */
function resetGame() {
    // Clear state
    STATE.screen = 'character';
    STATE.player = {
        name: '', job: null, family: null,
        education: null, w: 0, tailwind: '',
        bracket: '', targetPercentile: 0.5,
        agentIndex: null
    };
    STATE.policy = 'econophysics';
    STATE.patron = false;
    STATE.year = 0;
    STATE.running = false;
    STATE.characters = [];
    STATE.giniHistory = [];
    STATE.decisions = [];
    STATE.nextCrisisId = null;
    STATE.crisisPool10Used = null;

    clearInterval(STATE.intervalId);
    canvasParticles = [];
    fixedNodePositions = null;

    // Reset policy screen
    document.querySelectorAll('.policy-card')
        .forEach(c => c.classList.remove('selected'));
    const defaultCard = document.querySelector(
        '.policy-card[data-policy="econophysics"]'
    );
    if (defaultCard) defaultCard.classList.add('selected');

    // Reset character form
    const nameInput = el('char-name-input');
    if (nameInput) nameInput.value = '';

    ['job-options', 'family-options', 'edu-options'].forEach(groupId => {
        const group = el(groupId);
        if (group) group.querySelectorAll('.option-btn')
            .forEach(b => b.classList.remove('selected'));
    });

    const posCard = el('position-card');
    if (posCard) posCard.style.display = 'none';

    const ctaBtn = el('to-policy-btn');
    if (ctaBtn) ctaBtn.disabled = true;

    // Reset patron toggle
    const patronToggle = el('patron-toggle');
    if (patronToggle) patronToggle.checked = false;

    showScreen('character');
}