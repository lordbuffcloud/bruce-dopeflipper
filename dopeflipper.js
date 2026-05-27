// DopeFlipper for Bruce (T-Embed CC1101)
// CK42X DopeWars port - sync stats.ck42x to ck42x.com/dopeflipper (manual paste / WebUI)
// Controls: encoder rotate = PREV/NEXT, encoder press = SEL, side button = ESC

var display = require('display');
var keyboard = require('keyboard');
var storage = require('storage');
var audio = require('audio');
var led = require('led');

var W = display.width();
var H = display.height();
var CX = Math.floor(W / 2);
var CY = Math.floor(H / 2);

var BG = display.color(0, 0, 0);
var FG = display.color(220, 220, 220);
var DIM = display.color(100, 100, 100);
var ACCENT = display.color(255, 200, 60);
var GOOD = display.color(80, 220, 120);
var BAD = display.color(240, 70, 70);
var CYAN = display.color(80, 200, 255);
var POLICE = display.color(40, 90, 220);
var SIREN = display.color(220, 40, 40);
var ROAD = display.color(28, 28, 32);
var LANE = display.color(55, 55, 65);

var DRUG_COLORS = [
    display.color(70, 170, 70),
    display.color(170, 110, 210),
    display.color(120, 220, 255),
    display.color(255, 90, 200),
    display.color(255, 210, 60),
    display.color(240, 240, 240),
    display.color(200, 160, 120),
    display.color(90, 180, 255)
];

var LOC_THEMES = [
    { sky: display.color(18, 22, 38), ground: display.color(55, 42, 32), band: display.color(210, 110, 45), tag: 'BX' },
    { sky: display.color(10, 16, 34), ground: display.color(38, 38, 48), band: display.color(220, 190, 80), tag: 'MN' },
    { sky: display.color(22, 28, 42), ground: display.color(48, 52, 44), band: display.color(120, 190, 255), tag: 'BK' },
    { sky: display.color(16, 24, 40), ground: display.color(44, 50, 38), band: display.color(180, 220, 120), tag: 'QN' },
    { sky: display.color(20, 30, 46), ground: display.color(36, 44, 36), band: display.color(140, 200, 180), tag: 'SI' },
    { sky: display.color(14, 12, 28), ground: display.color(50, 38, 28), band: display.color(255, 180, 60), tag: 'HM' },
    { sky: display.color(24, 34, 58), ground: display.color(42, 48, 56), band: display.color(255, 120, 160), tag: 'CY' },
    { sky: display.color(12, 18, 30), ground: display.color(40, 46, 34), band: display.color(180, 200, 90), tag: 'NJ' },
    { sky: display.color(20, 14, 24), ground: display.color(52, 36, 30), band: display.color(255, 80, 60), tag: 'NK' },
    { sky: display.color(18, 26, 36), ground: display.color(46, 50, 40), band: display.color(160, 210, 255), tag: 'YK' }
];

var FIGHT_MOVES = ['^ JAB', '> HOOK', 'v KICK', '< BLOCK'];
var FIGHT_ARROWS = ['^', '>', 'v', '<'];

var STATS_VERSION = 3;
var DATA_DIR = { fs: 'littlefs', path: '/ck42x_dopewars' };
var SAVE_PATH = { fs: 'littlefs', path: '/ck42x_dopewars/save.json' };
var STATS_PATH = { fs: 'littlefs', path: '/ck42x_dopewars/stats.json' };
var PROFILE_PATH = { fs: 'littlefs', path: '/ck42x_dopewars/stats.ck42x' };

var DRUGS = [
    { name: 'Weed', key: 'weed', min: 15, max: 90, eMin: 10, eMax: 140 },
    { name: 'Shrooms', key: 'shrooms', min: 20, max: 120, eMin: 8, eMax: 200 },
    { name: 'Acid', key: 'acid', min: 100, max: 500, eMin: 50, eMax: 1400 },
    { name: 'Ecstasy', key: 'ecstasy', min: 150, max: 600, eMin: 60, eMax: 1800 },
    { name: 'Speed', key: 'speed', min: 70, max: 350, eMin: 30, eMax: 900 },
    { name: 'Cocaine', key: 'cocaine', min: 1200, max: 6000, eMin: 800, eMax: 18000 },
    { name: 'Heroin', key: 'heroin', min: 1500, max: 8000, eMin: 1000, eMax: 22000 },
    { name: 'Oxy', key: 'oxy', min: 3000, max: 15000, eMin: 2000, eMax: 40000 }
];

var LOCS = [
    { name: 'Bronx', flavor: 'Burnt-out buildings and opportunity.', bias: [70, 80, 90, 85, 75, 100, 100, 110] },
    { name: 'Manhattan', flavor: 'Money talks. Everything costs more.', bias: [140, 130, 120, 130, 120, 140, 150, 130] },
    { name: 'Brooklyn', flavor: 'Gentrified blocks and raw corners.', bias: [100, 110, 110, 120, 100, 90, 95, 100] },
    { name: 'Queens', flavor: 'Diverse. Unpredictable.', bias: [100, 100, 100, 100, 110, 100, 100, 100] },
    { name: 'Staten', flavor: 'Quiet borough. Good connects.', bias: [110, 110, 120, 110, 110, 80, 85, 80] },
    { name: 'Harlem', flavor: 'Legendary streets. OGs move different.', bias: [60, 70, 80, 90, 80, 130, 120, 140] },
    { name: 'Coney', flavor: 'Boardwalk noise and fast flips.', bias: [90, 120, 130, 150, 110, 105, 95, 90] },
    { name: 'Jersey', flavor: 'Tunnel tax. Weird supply.', bias: [130, 95, 85, 100, 120, 115, 120, 110] },
    { name: 'Newark', flavor: 'Hot corners. Heavy pressure.', bias: [75, 85, 100, 90, 95, 125, 135, 130] },
    { name: 'Yonkers', flavor: 'Quiet routes. Thin inventory.', bias: [115, 105, 95, 85, 100, 90, 95, 125] }
];

var MARKET_EVENTS = [
    { type: 1, drug: 0, msg: 'Weed demand jumped. Prices spiked.', p: 8 },
    { type: 1, drug: 2, msg: 'Acid got scarce. Prices are wild.', p: 6 },
    { type: 1, drug: 3, msg: 'Rave tonight. Ecstasy demand is insane.', p: 7 },
    { type: 1, drug: 5, msg: 'Cocaine supply dried up. Prices mooning.', p: 5 },
    { type: 1, drug: 6, msg: 'Heroin pipeline got hit. Prices exploding.', p: 6 },
    { type: 1, drug: 7, msg: 'Pill mills raided. Oxy is scarce.', p: 5 },
    { type: -1, drug: 0, msg: 'Huge weed shipment landed. Prices tanked.', p: 8 },
    { type: -1, drug: 1, msg: 'Shrooms flooded the block. Bottom fell out.', p: 7 },
    { type: -1, drug: 4, msg: 'Speed lab evidence leaked to the street.', p: 6 },
    { type: -1, drug: 5, msg: 'Cocaine everywhere. Prices crashed.', p: 5 },
    { type: -1, drug: 6, msg: 'Heroin seized, then leaked. Streets flooded.', p: 4 },
    { type: -1, drug: 7, msg: 'Generic oxy hit. Prices cratered.', p: 4 },
    { type: 1, drug: 1, msg: 'Shroom festival weekend. Prices climbing.', p: 5 },
    { type: -1, drug: 3, msg: 'Bad batch scare. Ecstasy prices dropped.', p: 5 },
    { type: 1, drug: 4, msg: 'Speed got scarce. Dealers holding stock.', p: 6 }
];

var STREET_TIPS = [
    'Word is Manhattan pays premium.',
    'Harlem heat runs hot. Move quick.',
    'Shark adds 12% every travel day.',
    'Bank cash before a bad cop stop.',
    'Empty coat? Buy low, travel, sell high.',
    'Heat fades a little when you travel.',
    'Big deals raise heat. Stay sharp.',
    'Coney boardwalk moves fast product.',
    'Newark corners are dangerous but rich.',
    'Loan shark squeezes when debt is high.'
];

var stats = {
    games_played: 0,
    wins: 0,
    losses: 0,
    best_net: 0,
    worst_net: 0,
    biggest_deal: 0,
    best_streak: 0,
    current_streak: 0,
    device_name: 'TEmbed'
};

var run = {};

function clamp(n, lo, hi) {
    if (n < lo) return lo;
    if (n > hi) return hi;
    return n;
}

function min(a, b) { return a < b ? a : b; }
function max(a, b) { return a > b ? a : b; }

function toInt(v, fallback) {
    fallback = fallback === undefined ? 0 : fallback;
    if (typeof v === 'string') v = parseInt(v, 10);
    if (typeof v === 'number' && v === v) return Math.trunc(v);
    return fallback;
}

function invQty(i) {
    syncInvData();
    return toInt(run.inventory[i], 0);
}

function setInvQty(i, n) {
    syncInvData();
    run.inventory[i] = toInt(n, 0);
    run.invData = joinArray8(run.inventory);
}

function addInvQty(i, delta) {
    setInvQty(i, invQty(i) + toInt(delta, 0));
}

function syncInvData() {
    var parts;
    if (run.invData && run.invData.indexOf(',') >= 0) {
        parts = normalizeArray8(run.invData);
    } else {
        parts = normalizeArray8(run.inventory);
    }
    run.inventory = parts;
    run.invData = joinArray8(parts);
}

function addArray8(field, idx, delta) {
    run[field] = normalizeArray8(run[field]);
    run[field][idx] = toInt(run[field][idx], 0) + toInt(delta, 0);
}

function money(n) {
    n = Math.trunc(n || 0);
    if (n < 0) return '-$' + Math.abs(n);
    return '$' + n;
}

function padHex(v) {
    var s = (v >>> 0).toString(16).toUpperCase();
    while (s.length < 8) s = '0' + s;
    return s;
}

function rand(max) {
    if (max <= 0) return 0;
    return random(max);
}

function randRange(minV, maxV) {
    if (maxV <= minV) return minV;
    return minV + rand(maxV - minV + 1);
}

function fnvBytes(seed, value) {
    var code = seed >>> 0;
    var v = value >>> 0;
    var b;
    for (b = 0; b < 4; b++) {
        code ^= (v >>> (b * 8)) & 0xff;
        code = Math.imul(code, 16777619) >>> 0;
    }
    return code || 1;
}

function hashU32(seed, value) {
    return fnvBytes(seed >>> 0, value >>> 0);
}

function hashTextSeed(seed, text) {
    var code = (seed ? seed : 2166136261) >>> 0;
    var i;
    text = text || '';
    for (i = 0; i < text.length; i++) {
        code ^= text.charCodeAt(i) & 0xff;
        code = Math.imul(code, 16777619) >>> 0;
    }
    return code || 1;
}

function sanitizeDeviceName(name) {
    var out = '';
    var i, c, ok;
    name = name || 'TEmbed';
    for (i = 0; i < name.length && out.length < 31; i++) {
        c = name.charAt(i);
        ok = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '_' || c === '-' || c === '.';
        out += ok ? c : '_';
    }
    return out || 'TEmbed';
}

function coatUsed() {
    var i, u = 0;
    for (i = 0; i < 8; i++) u += invQty(i);
    return u;
}

function invValue(localPrices) {
    var i, v = 0, p;
    for (i = 0; i < 8; i++) {
        if (localPrices) p = run.prices[i];
        else p = Math.floor((DRUGS[i].min + DRUGS[i].max) / 2);
        v += invQty(i) * p;
    }
    return v;
}

function runNet(localPrices) {
    return run.cash + run.bank + invValue(localPrices) - run.debt;
}

function runProfit() {
    return run.total_sold - run.total_bought;
}

function daysElapsed() {
    return run.day > 30 ? 0 : (30 - run.day);
}

function runPressure() {
    var p = run.heat + daysElapsed() * 2 + run.cop_streak * 3;
    return p > 100 ? 100 : p;
}

function scoreCode(net, profit) {
    var code = 2166136261 >>> 0;
    var values = [net, profit, run.cash, run.bank, run.debt, run.biggest_deal, run.total_bought, run.total_sold];
    var i;
    for (i = 0; i < values.length; i++) code = fnvBytes(code, values[i]);
    code ^= run.heat & 0xff;
    code = Math.imul(code, 16777619) >>> 0;
    code ^= run.cops_fought & 0xff;
    code = Math.imul(code, 16777619) >>> 0;
    code ^= run.cops_ran & 0xff;
    code = Math.imul(code, 16777619) >>> 0;
    code ^= run.day & 0xff;
    code = Math.imul(code, 16777619) >>> 0;
    return code || 1;
}

function profileHash(net, profit, invVal) {
    var code = 2166136261 >>> 0;
    var values = [net, profit, invVal, run.cash, run.bank, run.debt, run.total_bought, run.total_sold, run.biggest_deal, stats.games_played, stats.best_net, stats.biggest_deal];
    var bytes = [run.day, run.heat, run.cops_fought, run.cops_ran, run.max_coat & 0xff, (run.max_coat >>> 8) & 0xff];
    var i;
    for (i = 0; i < values.length; i++) code = fnvBytes(code, values[i]);
    for (i = 0; i < bytes.length; i++) {
        code ^= bytes[i] & 0xff;
        code = Math.imul(code, 16777619) >>> 0;
    }
    code = hashU32(code, run.action_count);
    code = hashU32(code, run.run_chain);
    code ^= 0xC42D0E42;
    code = Math.imul(code, 16777619) >>> 0;
    return code || 1;
}

function recordAction(tag, value, detail) {
    var code = run.run_chain ? run.run_chain : 2166136261;
    code = hashU32(code, tag);
    code = hashU32(code, value >>> 0);
    code = hashU32(code, detail >>> 0);
    code = hashU32(code, run.day);
    code = hashU32(code, run.cash);
    code = hashU32(code, run.bank);
    code = hashU32(code, run.debt);
    code = hashU32(code, coatUsed());
    code = hashU32(code, run.heat);
    code ^= 0xA17C4E42;
    code = Math.imul(code, 16777619) >>> 0;
    run.run_chain = code || 1;
    if (run.action_count < 240) run.action_count++;
}

function statsSeedForDevice(deviceName) {
    var seed = hashTextSeed(2166136261, sanitizeDeviceName(deviceName));
    seed ^= 0xA7D042C3;
    seed = Math.imul(seed, 16777619) >>> 0;
    return seed || 0x6D2B79F5;
}

function statsStreamNext(state) {
    var x = state >>> 0 || 0x6D2B79F5;
    x ^= (x << 13) >>> 0;
    x ^= x >>> 17;
    x ^= (x << 5) >>> 0;
    return x >>> 0 || 0x6D2B79F5;
}

function encodeStatsHex(payload, deviceName) {
    var hex = '0123456789ABCDEF';
    var state = statsSeedForDevice(deviceName);
    var out = '';
    var i, b, enc;
    for (i = 0; i < payload.length; i++) {
        state = statsStreamNext(state);
        b = (payload.charCodeAt(i) & 0xff) ^ (state & 0xff);
        out += hex.charAt((b >> 4) & 0xf);
        out += hex.charAt(b & 0xf);
    }
    return out;
}

function deviceLock(deviceName, sc, ph, gamesPlayed) {
    var code = hashTextSeed(2166136261, sanitizeDeviceName(deviceName));
    code = hashU32(code, sc);
    code = hashU32(code, ph);
    code = hashU32(code, gamesPlayed);
    code ^= 0xD0E57A75;
    code = Math.imul(code, 16777619) >>> 0;
    return code || 1;
}

function encodedProfileSeal(encoded, deviceName, sc, ph) {
    var code = hashTextSeed(2166136261, encoded);
    code = hashU32(code, hashTextSeed(2166136261, sanitizeDeviceName(deviceName)));
    code = hashU32(code, sc);
    code = hashU32(code, ph);
    code ^= 0x51A7C0DE;
    code = Math.imul(code, 16777619) >>> 0;
    return code || 1;
}

function playSeconds() {
    if (!run.run_started_ms || run.day === 0) return 0;
    return Math.floor((now() - run.run_started_ms) / 1000);
}

function exportStatsProfile(finished) {
    var deviceName = sanitizeDeviceName(stats.device_name);
    var invVal = invValue(true);
    var net = runNet(true);
    var profit = runProfit();
    var sc = scoreCode(net, profit);
    var ph = profileHash(net, profit, invVal);
    var dl = deviceLock(deviceName, sc, ph, stats.games_played);
    var productLines = '';
    var i;
    for (i = 0; i < 8; i++) {
        productLines += 'buy_qty_' + DRUGS[i].key + '=' + (run.buy_qty[i] || 0) + '\n';
        productLines += 'sell_qty_' + DRUGS[i].key + '=' + (run.sell_qty[i] || 0) + '\n';
        productLines += 'buy_value_' + DRUGS[i].key + '=' + (run.buy_value[i] || 0) + '\n';
        productLines += 'sell_value_' + DRUGS[i].key + '=' + (run.sell_value[i] || 0) + '\n';
    }
    var payload = '';
    payload += 'ck42x_dopewars_device_stats_v1\n';
    payload += 'app=ck42x_dopewars\n';
    payload += 'format=device_stats_v1\n';
    payload += 'version=' + STATS_VERSION + '\n';
    payload += 'finished=' + (finished ? 1 : 0) + '\n';
    payload += 'flipper_name=' + deviceName + '\n';
    payload += 'device_lock=' + padHex(dl) + '\n';
    payload += 'score=' + net + '\n';
    payload += 'net=' + net + '\n';
    payload += 'profit=' + profit + '\n';
    payload += 'cash=' + run.cash + '\n';
    payload += 'bank=' + run.bank + '\n';
    payload += 'debt=' + run.debt + '\n';
    payload += 'inventory_value=' + invVal + '\n';
    payload += 'total_bought=' + run.total_bought + '\n';
    payload += 'total_sold=' + run.total_sold + '\n';
    payload += 'biggest_deal=' + run.biggest_deal + '\n';
    payload += 'cops_fought=' + run.cops_fought + '\n';
    payload += 'cops_ran=' + run.cops_ran + '\n';
    payload += 'fight_wins=' + run.fight_wins + '\n';
    payload += 'fight_messy=' + run.fight_messy + '\n';
    payload += 'fight_losses=' + run.fight_losses + '\n';
    payload += 'run_clean=' + run.run_clean + '\n';
    payload += 'run_messy=' + run.run_messy + '\n';
    payload += 'run_caught=' + run.run_caught + '\n';
    payload += 'heat=' + run.heat + '\n';
    payload += 'day=' + run.day + '\n';
    payload += 'max_coat=' + run.max_coat + '\n';
    payload += 'games_played=' + stats.games_played + '\n';
    payload += 'best_net=' + stats.best_net + '\n';
    payload += 'best_streak=' + stats.best_streak + '\n';
    payload += 'stats_biggest_deal=' + stats.biggest_deal + '\n';
    payload += 'play_seconds=' + playSeconds() + '\n';
    payload += productLines;
    payload += 'action_count=' + run.action_count + '\n';
    payload += 'run_chain=' + padHex(run.run_chain) + '\n';
    payload += 'score_code=' + padHex(sc) + '\n';
    payload += 'profile_hash=' + padHex(ph) + '\n';
    payload += 'share=ck42x.com/dopeflipper\n';

    var encoded = encodeStatsHex(payload, deviceName);
    var seal = encodedProfileSeal(encoded, deviceName, sc, ph);
    var pkg = '';
    pkg += 'CK42X_DWSTAT_V1\n';
    pkg += 'encoding=xor_hex_fnv1a_device\n';
    pkg += 'device_hint=' + padHex(hashTextSeed(2166136261, deviceName)) + '\n';
    pkg += 'payload=' + encoded + '\n';
    pkg += 'seal=' + padHex(seal) + '\n';

    try {
        storage.write(PROFILE_PATH, pkg, 'write');
    } catch (e) {
        // profile export is best-effort on device
    }
}

function autosyncStats(finished) {
    if (run.day === 0 && !finished) return;
    exportStatsProfile(!!finished);
}

function saveStats() {
    try {
        storage.write(STATS_PATH, JSON.stringify(stats), 'write');
    } catch (e1) {}
}

function loadStats() {
    try {
        var raw = storage.read(STATS_PATH);
        if (raw) {
            var parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                stats.games_played = parsed.games_played || 0;
                stats.wins = parsed.wins || 0;
                stats.losses = parsed.losses || 0;
                stats.best_net = parsed.best_net || 0;
                stats.worst_net = parsed.worst_net || 0;
                stats.biggest_deal = parsed.biggest_deal || 0;
                stats.best_streak = parsed.best_streak || 0;
                stats.current_streak = parsed.current_streak || 0;
                if (parsed.device_name) stats.device_name = parsed.device_name;
            }
        }
    } catch (e2) {}
}

function saveRun() {
    try {
        ensureRunArrays();
        storage.write(SAVE_PATH, serializeRun(), 'write');
    } catch (e3) {}
    autosyncStats(false);
}

function loadRun() {
    try {
        var raw = storage.read(SAVE_PATH);
        if (!raw) return false;
        if (raw.indexOf('ck42x_dopewars_save_v1') >= 0) {
            parseSaveText(raw);
            normalizeRun();
            return run.day !== undefined && run.day > 0;
        }
        var parsed = JSON.parse(raw);
        if (!parsed || parsed.day === undefined) return false;
        run = parsed;
        normalizeRun();
        saveRun();
        return run.day > 0;
    } catch (e4) {
        return false;
    }
}

function escapeSaveText(text) {
    return String(text || '').replace(/\r/g, '').replace(/\n/g, '\\n');
}

function unescapeSaveText(text) {
    return String(text || '').replace(/\\n/g, '\n');
}

function joinArray8(arr) {
    var i, parts = [];
    for (i = 0; i < 8; i++) parts.push(toInt(arr ? arr[i] : 0, 0));
    return parts.join(',');
}

function serializeRun() {
    var lines = [];
    lines.push('ck42x_dopewars_save_v1');
    lines.push('day=' + toInt(run.day, 0));
    lines.push('cash=' + toInt(run.cash, 0));
    lines.push('debt=' + toInt(run.debt, 0));
    lines.push('bank=' + toInt(run.bank, 0));
    lines.push('max_coat=' + toInt(run.max_coat, 100));
    lines.push('heat=' + toInt(run.heat, 0));
    lines.push('location=' + toInt(run.location, 0));
    lines.push('inventory=' + joinArray8(run.inventory));
    lines.push('inv_data=' + joinArray8(run.inventory));
    lines.push('prices=' + joinArray8(run.prices));
    lines.push('total_bought=' + toInt(run.total_bought, 0));
    lines.push('total_sold=' + toInt(run.total_sold, 0));
    lines.push('biggest_deal=' + toInt(run.biggest_deal, 0));
    lines.push('buy_qty=' + joinArray8(run.buy_qty));
    lines.push('sell_qty=' + joinArray8(run.sell_qty));
    lines.push('buy_value=' + joinArray8(run.buy_value));
    lines.push('sell_value=' + joinArray8(run.sell_value));
    lines.push('cops_fought=' + toInt(run.cops_fought, 0));
    lines.push('cops_ran=' + toInt(run.cops_ran, 0));
    lines.push('cop_streak=' + toInt(run.cop_streak, 0));
    lines.push('fight_wins=' + toInt(run.fight_wins, 0));
    lines.push('fight_messy=' + toInt(run.fight_messy, 0));
    lines.push('fight_losses=' + toInt(run.fight_losses, 0));
    lines.push('run_clean=' + toInt(run.run_clean, 0));
    lines.push('run_messy=' + toInt(run.run_messy, 0));
    lines.push('run_caught=' + toInt(run.run_caught, 0));
    lines.push('action_count=' + toInt(run.action_count, 0));
    lines.push('run_chain=' + padHex(toInt(run.run_chain, 0)));
    lines.push('run_started_ms=' + toInt(run.run_started_ms, 0));
    lines.push('pending_officers=' + toInt(run.pending_officers, 0));
    lines.push('coat_offer=' + (run.coat_offer ? 1 : 0));
    lines.push('coat_increase=' + toInt(run.coat_increase, 0));
    lines.push('prev_prices=' + joinArray8(run.prev_prices));
    lines.push('last_msg=' + escapeSaveText(run.last_msg));
    return lines.join('\n') + '\n';
}

function parseSaveText(raw) {
    var lines = raw.split('\n');
    var i, line, idx, key, val;
    run = {
        inventory: [0, 0, 0, 0, 0, 0, 0, 0],
        prices: [0, 0, 0, 0, 0, 0, 0, 0],
        buy_qty: [0, 0, 0, 0, 0, 0, 0, 0],
        sell_qty: [0, 0, 0, 0, 0, 0, 0, 0],
        buy_value: [0, 0, 0, 0, 0, 0, 0, 0],
        sell_value: [0, 0, 0, 0, 0, 0, 0, 0]
    };
    for (i = 0; i < lines.length; i++) {
        line = lines[i];
        idx = line.indexOf('=');
        if (idx <= 0) continue;
        key = line.substring(0, idx).trim();
        val = line.substring(idx + 1);
        if (key === 'inventory' || key === 'inv_data' || key === 'prices' || key === 'prev_prices' || key === 'buy_qty' || key === 'sell_qty' || key === 'buy_value' || key === 'sell_value') {
            if (key === 'inv_data') {
                run.invData = val;
                run.inventory = normalizeArray8(val);
            } else if (key === 'inventory') {
                run.inventory = normalizeArray8(val);
                run.invData = val;
            } else {
                run[key] = normalizeArray8(val);
            }
        } else if (key === 'last_msg') {
            run.last_msg = unescapeSaveText(val);
        } else if (key === 'coat_offer') {
            run.coat_offer = toInt(val, 0) !== 0;
        } else if (key === 'run_chain') {
            run.run_chain = parseInt(val, 16) || 0;
        } else {
            run[key] = toInt(val, 0);
        }
    }
    syncInvData();
}

function ensureRunArrays() {
    syncInvData();
    run.prices = normalizeArray8(run.prices);
    run.prev_prices = normalizeArray8(run.prev_prices, run.prices);
    run.buy_qty = normalizeArray8(run.buy_qty);
    run.sell_qty = normalizeArray8(run.sell_qty);
    run.buy_value = normalizeArray8(run.buy_value);
    run.sell_value = normalizeArray8(run.sell_value);
}

function normalizeArray8(src, fallback) {
    var out = fallback ? fallback.slice() : [0, 0, 0, 0, 0, 0, 0, 0];
    var i, v, parts;
    if (typeof src === 'string') {
        parts = src.split(',');
        for (i = 0; i < 8; i++) out[i] = toInt(parts[i], 0);
        return out;
    }
    if (!src) return out;
    for (i = 0; i < 8; i++) {
        v = src[i];
        if (v === undefined) v = src['' + i];
        out[i] = toInt(v, 0);
    }
    return out;
}

function normalizeRun() {
    run.cash = Math.trunc(run.cash || 0);
    run.debt = Math.trunc(run.debt || 0);
    run.bank = Math.trunc(run.bank || 0);
    run.day = Math.trunc(run.day || 0);
    run.max_coat = Math.trunc(run.max_coat || 100);
    run.heat = Math.trunc(run.heat || 0);
    run.location = Math.trunc(run.location || 0);
    if (run.location < 0 || run.location >= LOCS.length) run.location = 0;
    run.inventory = normalizeArray8(run.inventory);
    run.prices = normalizeArray8(run.prices);
    run.prev_prices = normalizeArray8(run.prev_prices, run.prices);
    run.buy_qty = normalizeArray8(run.buy_qty);
    run.sell_qty = normalizeArray8(run.sell_qty);
    run.buy_value = normalizeArray8(run.buy_value);
    run.sell_value = normalizeArray8(run.sell_value);
    syncInvData();
    run.coat_offer = !!run.coat_offer;
    run.coat_increase = toInt(run.coat_increase, 0);
}

function deleteSave() {
    try { storage.remove(SAVE_PATH); } catch (e5) {}
}

function resetRunState() {
    run = {
        cash: 1500,
        debt: 6500,
        bank: 0,
        day: 30,
        max_coat: 100,
        heat: 0,
        location: 0,
        inventory: [0, 0, 0, 0, 0, 0, 0, 0],
        invData: '0,0,0,0,0,0,0,0',
        prices: [0, 0, 0, 0, 0, 0, 0, 0],
        prev_prices: [0, 0, 0, 0, 0, 0, 0, 0],
        coat_offer: false,
        coat_increase: 0,
        total_bought: 0,
        total_sold: 0,
        biggest_deal: 0,
        buy_qty: [0, 0, 0, 0, 0, 0, 0, 0],
        sell_qty: [0, 0, 0, 0, 0, 0, 0, 0],
        buy_value: [0, 0, 0, 0, 0, 0, 0, 0],
        sell_value: [0, 0, 0, 0, 0, 0, 0, 0],
        cops_fought: 0,
        cops_ran: 0,
        cop_streak: 0,
        fight_wins: 0,
        fight_messy: 0,
        fight_losses: 0,
        run_clean: 0,
        run_messy: 0,
        run_caught: 0,
        action_count: 0,
        run_chain: 0,
        run_started_ms: now(),
        pending_officers: 0,
        last_msg: '30 days. Pay the shark. No handouts.'
    };
    run.run_chain = hashU32((random(2147483647) ^ 0xD042A17C) >>> 0, stats.games_played + 1);
    normalizeRun();
}

function generatePrices(overrides) {
    var loc = LOCS[run.location];
    var i, drug, minP, maxP, p;
    overrides = overrides || [0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < 8; i++) {
        drug = DRUGS[i];
        minP = drug.min;
        maxP = drug.max;
        if (overrides[i] === 1) { minP = drug.max; maxP = drug.eMax; }
        else if (overrides[i] === -1) { minP = drug.eMin; maxP = drug.min; }
        minP = Math.floor((minP * loc.bias[i]) / 100);
        maxP = Math.floor((maxP * loc.bias[i]) / 100);
        if (maxP < minP) maxP = minP;
        p = randRange(minP, maxP);
        run.prices[i] = p < 1 ? 1 : p;
    }
}

function startRound() {
    var overrides = [0, 0, 0, 0, 0, 0, 0, 0];
    var hits = 0;
    var i, evt;
    run.prev_prices = normalizeArray8(run.prices);
    run.last_msg = LOCS[run.location].name + '\n' + LOCS[run.location].flavor + '\n';
    for (i = 0; i < MARKET_EVENTS.length; i++) {
        evt = MARKET_EVENTS[i];
        if (rand(100) < evt.p) {
            overrides[evt.drug] = evt.type;
            run.last_msg += evt.msg + '\n';
            hits++;
            if (hits >= 2) break;
        }
    }
    if (hits === 0 && rand(100) < 25) {
        run.last_msg += 'Quiet market. Read the board.\n';
        if (rand(100) < 40) run.last_msg += STREET_TIPS[rand(STREET_TIPS.length)] + '\n';
    }
    generatePrices(overrides);

    if (!run.coat_offer && rand(100) < 4 && run.cash >= 750) {
        run.coat_offer = true;
        run.coat_increase = randRange(15, 40);
        run.last_msg += 'Coat dealer spotted. Check Bank for deeper pockets.\n';
    }

    if (run.debt > 20000 && rand(100) < 15) {
        var squeeze = min(run.cash, Math.floor(run.debt / 20));
        if (squeeze > 0) {
            run.cash -= squeeze;
            run.heat = min(100, run.heat + 5);
            run.last_msg += 'Shark pressure. Paid ' + money(squeeze) + ' to stay breathing.\n';
        }
    }
    if (rand(100) < 9 && run.cash > 0) {
        var loss = Math.floor((run.cash * randRange(8, 24)) / 100);
        run.cash -= loss;
        run.last_msg += 'You got jumped. Lost ' + money(loss) + '.\n';
    }
    if (rand(100) < 3) {
        var drug = rand(5);
        var qty = randRange(2, 15);
        var fit = run.max_coat - coatUsed();
        if (fit > 0) {
            qty = min(qty, fit);
            addInvQty(drug, qty);
            run.last_msg += 'Found ' + qty + ' ' + DRUGS[drug].name + ' in an alley.\n';
        }
    }
}

function copCheck() {
    var chance = 16 + Math.floor((runPressure() * 5) / 10);
    if (daysElapsed() >= 20) chance += 5;
    if (coatUsed() > run.max_coat / 2) chance += 6;
    if (run.cash > 20000) chance += 6;
    if (run.debt > 20000) chance += 4;
    if (chance > 72) chance = 72;
    if (rand(100) < chance) {
        run.pending_officers = 1 + rand(Math.floor(run.heat / 20) + 1);
        return true;
    }
    return false;
}

function rankFor(net) {
    if (net >= 1000000) return 'The Plug';
    if (net >= 500000) return 'Kingpin';
    if (net >= 250000) return 'Borough Boss';
    if (net >= 100000) return 'Neighborhood Connect';
    if (net >= 50000) return 'Block Captain';
    if (net >= 10000) return 'Corner Boy';
    if (net >= 0) return 'Small Time Hustler';
    if (net >= -10000) return 'Street Corner Bum';
    return 'Dead Broke';
}

function updateStatsEnd(net, profit) {
    var first = stats.games_played === 0;
    stats.games_played++;
    if (net >= 0) {
        stats.wins++;
        stats.current_streak++;
        if (stats.current_streak > stats.best_streak) stats.best_streak = stats.current_streak;
    } else {
        stats.losses++;
        stats.current_streak = 0;
    }
    if (first || net > stats.best_net) stats.best_net = net;
    if (first || net < stats.worst_net) stats.worst_net = net;
    if (run.biggest_deal > stats.biggest_deal) stats.biggest_deal = run.biggest_deal;
    saveStats();
}

var soundOn = true;
var MIN_TONE_MS = 90;

function tone(freq, ms) {
    if (!soundOn) return;
    ms = ms || MIN_TONE_MS;
    if (ms < MIN_TONE_MS) ms = MIN_TONE_MS;
    try {
        // T-Embed I2S speaker needs blocking tones (3rd arg false).
        audio.tone(freq, ms, false);
    } catch (e6) {
        try { audio.tone(freq, ms); } catch (e7) {}
    }
}

function sfx(freq, ms, gap) {
    if (!soundOn) return;
    tone(freq, ms);
    if (gap) delay(gap);
}

function sfxMenu() { sfx(520, 90); }
function sfxSelect() { sfx(760, 100); }
function sfxBack() { sfx(300, 100); }
function sfxEmpty() { sfx(220, 120); }
function sfxBuy() { sfx(620, 100); sfx(880, 120, 30); }
function sfxSell() { sfx(880, 100); sfx(1175, 120, 30); }
function sfxBad() { sfx(180, 120); sfx(140, 140, 20); }
function sfxGood() { sfx(880, 100); sfx(1175, 120, 30); }
function sfxTravel() { sfx(440, 100); sfx(554, 120, 30); }
function sfxCop() { sfx(740, 100); sfx(440, 120, 30); }
function sfxHit() { sfx(160, 140); }
function sfxMove() { sfx(610, 80); }
function sfxFightHit() { sfx(920, 80); }
function sfxRunWhoosh() { sfx(320, 80); }
function sfxWin() { sfx(988, 120); sfx(1175, 140, 40); sfx(1319, 160, 40); }
function sfxLose() { sfx(220, 160); sfx(165, 180, 40); }
function sfxCash() { sfx(740, 90); sfx(988, 110, 20); }
function sfxBank() { sfx(554, 100); }
function sfxDay() { sfx(330, 90); sfx(440, 110, 20); }
function sfxDebt() { sfx(180, 120); sfx(140, 140, 15); }
function sfxCoat() { sfx(500, 100); sfx(660, 120, 25); }
function sfxPage() { sfx(480, 80); }

function sfxTest() {
    tone(660, 140);
}

function ledFlash(r, g, b, ms) {
    ledPulse(r, g, b, false);
    delay(ms || 80);
    ledOff();
}

var HEADER_H = 18;
var FOOTER_H = 14;
var FOOT_Y = H - FOOTER_H;
var ROW_H = 14;
var MENU_TOP = HEADER_H + 4;
var HUB_BANNER_H = 38;
var HUB_MENU_TOP = MENU_TOP + HUB_BANNER_H;
var HI_BG = display.color(30, 30, 50);
var SPLASH_BODY_TOP = MENU_TOP + 26;
var SPLASH_LINE_H = 11;

function textWrapWidth() {
    return Math.max(16, Math.min(30, Math.floor((W - 12) / 7)));
}

function splashLinesPerPage() {
    var room = FOOT_Y - FOOTER_H - SPLASH_BODY_TOP;
    return Math.max(5, Math.floor(room / SPLASH_LINE_H));
}

function truncate(text, maxLen) {
    var s = String(text || '');
    if (s.length <= maxLen) return s;
    if (maxLen <= 1) return s.substring(0, maxLen);
    return s.substring(0, maxLen - 1) + '~';
}

function wrapTextLine(text, maxLen) {
    var words = String(text || '').split(' ');
    var lines = [];
    var row = '';
    var i, w, chunk;
    maxLen = maxLen || 26;
    for (i = 0; i < words.length; i++) {
        w = words[i];
        if (!w) continue;
        while (w.length > maxLen) {
            if (row.length > 0) {
                lines.push(row);
                row = '';
            }
            lines.push(w.substring(0, maxLen));
            w = w.substring(maxLen);
        }
        if (row.length === 0) row = w;
        else if ((row + ' ' + w).length <= maxLen) row += ' ' + w;
        else {
            lines.push(row);
            row = w;
        }
    }
    if (row.length > 0) lines.push(row);
    return lines;
}

function expandBodyLines(body) {
    var raw = String(body || '').split('\n');
    var out = [];
    var i, wrapped;
    for (i = 0; i < raw.length; i++) {
        if (!raw[i]) continue;
        wrapped = wrapTextLine(raw[i], textWrapWidth());
        out = out.concat(wrapped);
    }
    return out;
}

function paginateLines(lines, linesPerPage) {
    var pages = [];
    var i;
    linesPerPage = linesPerPage || 18;
    if (!lines || lines.length === 0) return [''];
    for (i = 0; i < lines.length; i += linesPerPage) {
        pages.push(lines.slice(i, i + linesPerPage));
    }
    return pages;
}

function clearContentArea() {
    display.drawFillRect(0, HEADER_H, W, FOOT_Y - HEADER_H, BG);
}

function priceTrend(drugIdx) {
    var prev = run.prev_prices ? run.prev_prices[drugIdx] : 0;
    var cur = run.prices[drugIdx];
    if (!prev || prev === cur) return '  ';
    if (cur > prev + Math.max(2, Math.floor(prev / 12))) return '^ ';
    if (cur < prev - Math.max(2, Math.floor(prev / 12))) return 'v ';
    return '  ';
}

function drugDealHint(drugIdx) {
    var drug = DRUGS[drugIdx];
    var cur = run.prices[drugIdx];
    if (cur <= Math.floor(drug.min * 1.15)) return 'CHEAP';
    if (cur >= Math.floor(drug.max * 0.85)) return 'HOT';
    return '';
}

function bestBuyDrug() {
    var i, best = -1, score = -1, s;
    for (i = 0; i < 8; i++) {
        if (tradeMaxQty(i, false) <= 0) continue;
        s = DRUGS[i].max - run.prices[i];
        if (s > score) {
            score = s;
            best = i;
        }
    }
    return best;
}

function bestSellDrug() {
    var owned = ownedDrugIndices();
    var i, d, best = -1, score = -1, s;
    for (i = 0; i < owned.length; i++) {
        d = owned[i];
        s = run.prices[d] - DRUGS[d].min;
        if (s > score) {
            score = s;
            best = d;
        }
    }
    return best;
}

function hubBannerLine() {
    if (run.day > 0 && run.day <= 5) return '!! ' + run.day + ' days left !!';
    if (run.debt > run.cash + run.bank && run.debt > 10000) return 'Shark closing in';
    var bs = bestSellDrug();
    var bb = bestBuyDrug();
    if (bs >= 0 && drugDealHint(bs) === 'HOT') return 'Sell ' + DRUGS[bs].name + ' HOT';
    if (bb >= 0 && drugDealHint(bb) === 'CHEAP') return 'Buy ' + DRUGS[bb].name + ' cheap';
    return 'Net ' + money(runNet(true));
}

function drawHubBanner() {
    var theme = LOC_THEMES[run.location] || LOC_THEMES[0];
    var tip = hubBannerLine();
    var tipCol = (run.day > 0 && run.day <= 5) ? BAD : ((tip.indexOf('HOT') >= 0 || tip.indexOf('cheap') >= 0) ? GOOD : DIM);
    display.drawFillRect(0, MENU_TOP, W, HUB_BANNER_H, BG);
    drawSkyline(MENU_TOP + HUB_BANNER_H, theme, run.day * 3);
    drawBoroughBadge(run.location, 8, MENU_TOP + 2, false);
    display.setTextSize(1);
    display.setTextColor(theme.band, BG);
    display.drawString(truncate(LOCS[run.location].flavor, 18), 30, MENU_TOP + 2);
    display.setTextAlign('right', 'top');
    display.setTextColor(run.day <= 5 ? BAD : FG, BG);
    display.drawString('D' + run.day + '/30', W - 4, MENU_TOP + 2);
    display.setTextAlign('left', 'top');
    drawBar(30, MENU_TOP + 14, W - 38, 4, run.day, 30, run.day <= 5 ? BAD : ACCENT, DIM);
    drawBar(30, MENU_TOP + 22, W - 38, 4, coatUsed(), run.max_coat, CYAN, DIM);
    display.setTextColor(tipCol, BG);
    display.drawString(truncate(tip, 22), 30, MENU_TOP + 28);
    if (run.coat_offer) {
        display.setTextAlign('right', 'top');
        display.setTextColor(GOOD, BG);
        display.drawString('COAT', W - 4, MENU_TOP + 28);
    }
    display.setTextAlign('left', 'top');
}

function marketBoardScreen() {
    var page = 0;
    var pages = 2;
    var start, i, d, y, hint, bb, bs;
    while (true) {
        display.fill(BG);
        drawHeader('Prices', true);
        display.setTextSize(1);
        display.setTextColor(DIM, BG);
        display.drawString('Drug  $$$  Inv Tip', 6, MENU_TOP + 2);
        start = page * 4;
        y = MENU_TOP + 14;
        bb = bestBuyDrug();
        bs = bestSellDrug();
        for (i = 0; i < 4; i++) {
            d = start + i;
            if (d >= 8) break;
            hint = drugDealHint(d);
            if (d === bb || d === bs) display.drawFillRect(4, y - 1, W - 8, 11, HI_BG);
            display.setTextColor(FG, d === bb || d === bs ? HI_BG : BG);
            display.drawString(truncate(DRUGS[d].name, 6), 6, y);
            display.drawString(money(run.prices[d]) + priceTrend(d), 46, y);
            display.drawString('' + invQty(d), 108, y);
            if (hint) {
                display.setTextColor(hint === 'CHEAP' ? GOOD : BAD, d === bb || d === bs ? HI_BG : BG);
                display.drawString(hint, 128, y);
            }
            y += 12;
        }
        display.setTextColor(DIM, BG);
        if (bb >= 0) display.drawString('Best buy: ' + DRUGS[bb].name, 6, FOOT_Y - 38);
        if (bs >= 0) display.drawString('Best sell: ' + DRUGS[bs].name, 6, FOOT_Y - 26);
        drawFooter('PREV/NEXT ' + (page + 1) + '/2  SEL done');
        if (keyboard.getEscPress()) {
            sfxBack();
            return;
        }
        if (keyboard.getSelPress()) {
            sfxSelect();
            return;
        }
        if (keyboard.getNextPress() && page < pages - 1) {
            page++;
            sfxPage();
            delay(100);
        }
        if (keyboard.getPrevPress() && page > 0) {
            page--;
            sfxPage();
            delay(100);
        }
        delay(50);
    }
}

function clearHubMenuArea() {
    display.drawFillRect(0, HUB_MENU_TOP, W, FOOT_Y - HUB_MENU_TOP, BG);
}

function drawHeader(title, showBadge) {
    display.drawFillRect(0, 0, W, HEADER_H, ACCENT);
    if (showBadge !== false && run.location !== undefined) {
        drawBoroughBadge(run.location, 2, 1, false);
    }
    display.setTextSize(1);
    display.setTextColor(BG, ACCENT);
    display.setTextAlign('left', 'top');
    display.drawString(truncate(title, 9), showBadge === false ? 4 : 22, 4);
    drawHeatPip(CX - 17, 6);
    drawBar(CX + 20, 7, 22, 5, coatUsed(), run.max_coat, CYAN, display.color(40, 30, 10));
    display.setTextAlign('right', 'top');
    display.drawString(truncate('D' + run.day + ' ' + money(run.cash), 11), W - 4, 4);
    display.setTextAlign('left', 'top');
}

function drawFooter(text) {
    display.drawFillRect(0, FOOT_Y, W, FOOTER_H, BG);
    display.setTextSize(1);
    display.setTextColor(DIM, BG);
    display.setTextAlign('center', 'top');
    display.drawString(truncate(text || 'PREV/NEXT  SEL  ESC', 24), CX, FOOT_Y + 1);
    display.setTextAlign('left', 'top');
}

function drawBodyLines(lines, startY, lineH) {
    var i, y = startY || MENU_TOP;
    lineH = lineH || 11;
    display.setTextSize(1);
    display.setTextColor(FG, BG);
    display.setTextAlign('left', 'top');
    for (i = 0; i < lines.length && y < FOOT_Y - FOOTER_H; i++) {
        if (lines[i] && lines[i].length > 0) display.drawString(lines[i], 6, y);
        y += lineH;
    }
    return y;
}

function drawWrappedBody(body, startY) {
    return drawBodyLines(expandBodyLines(body), startY);
}

function splashScreen(title, body, locIdx) {
    var theme = LOC_THEMES[locIdx !== undefined ? locIdx : run.location] || LOC_THEMES[0];
    var pages = paginateLines(expandBodyLines(body), splashLinesPerPage());
    var page = 0;
    var footer;

    while (true) {
        display.fill(BG);
        display.drawFillRect(0, MENU_TOP, W, 22, theme.band);
        display.setTextSize(1);
        display.setTextColor(BG, theme.band);
        display.setTextAlign('center', 'top');
        display.drawString(truncate(title, 24), CX, MENU_TOP + 6);
        display.setTextAlign('left', 'top');
        drawBodyLines(pages[page], SPLASH_BODY_TOP, SPLASH_LINE_H);
        if (pages.length > 1) {
            footer = 'PREV/NEXT  ' + (page + 1) + '/' + pages.length + '  SEL ';
            footer += (page < pages.length - 1) ? 'more' : 'done';
        } else {
            footer = 'SEL continue';
        }
        drawFooter(footer);
        if (keyboard.getSelPress()) {
            sfxSelect();
            if (page < pages.length - 1) {
                page++;
                continue;
            }
            return;
        }
        if (keyboard.getEscPress()) {
            sfxBack();
            return;
        }
        if (keyboard.getNextPress() && page < pages.length - 1) {
            page++;
            sfxPage();
            delay(120);
        }
        if (keyboard.getPrevPress() && page > 0) {
            page--;
            sfxPage();
            delay(120);
        }
        delay(50);
    }
}

function drawBar(x, y, w, h, value, maxV, fillCol, frameCol) {
    var fill;
    maxV = maxV > 0 ? maxV : 1;
    if (value > maxV) value = maxV;
    display.drawRect(x, y, w, h, frameCol || DIM);
    fill = Math.floor(((w - 2) * value) / maxV);
    if (fill > 0) display.drawFillRect(x + 1, y + 1, fill, h - 2, fillCol || ACCENT);
}

function drawHeatPip(x, y) {
    var heatCol = run.heat > 75 ? BAD : (run.heat > 40 ? ACCENT : GOOD);
    drawBar(x, y, 34, 5, run.heat, 100, heatCol, DIM);
}

function ledPulse(r, g, b, dim) {
    try {
        var v = dim ? 40 : 160;
        led.setColor(Math.floor(r * v / 255), Math.floor(g * v / 255), Math.floor(b * v / 255));
    } catch (eLed) {}
}

function ledOff() {
    try { led.off(); } catch (eLed2) {}
}

function drawSkyline(yBase, theme, scroll) {
    var i, x, h, w;
    scroll = scroll || 0;
    display.drawFillRect(0, MENU_TOP, W, yBase - MENU_TOP, theme.sky);
    display.drawFillRect(0, yBase, W, FOOT_Y - yBase, theme.ground);
    for (i = 0; i < 7; i++) {
        x = ((i * 26) - (scroll % 26) + W) % W;
        if (x > W - 8) continue;
        h = 12 + ((i * 17 + scroll) % 28);
        w = 10 + ((i * 11) % 14);
        display.drawFillRect(x, yBase - h, w, h, theme.ground);
        display.drawRect(x, yBase - h, w, h, theme.band);
        if ((i + scroll) % 3 === 0) display.drawFillRect(x + 2, yBase - h + 4, 3, 3, ACCENT);
    }
}

function drawBoroughBadge(locIdx, x, y, large) {
    var theme = LOC_THEMES[locIdx] || LOC_THEMES[0];
    var sz = large ? 28 : 18;
    display.drawFillRect(x, y, sz, sz, theme.band);
    display.drawRect(x, y, sz, sz, FG);
    display.setTextSize(large ? 2 : 1);
    display.setTextColor(BG, theme.band);
    display.setTextAlign('center', 'middle');
    display.drawString(theme.tag, x + Math.floor(sz / 2), y + Math.floor(sz / 2));
    display.setTextAlign('left', 'top');
}

function drawDrugIcon(idx, x, y, active) {
    var col = DRUG_COLORS[idx] || FG;
    var sz = active ? 12 : 8;
    display.drawFillRect(x, y, sz, sz, active ? col : DIM);
    if (active) display.drawRect(x, y, sz, sz, FG);
}

function drawPriceStrip(selected) {
    var i, x, barX, barW, barH, maxP, h;
    barX = W - 18;
    barW = 8;
    barH = FOOT_Y - MENU_TOP - 16;
    maxP = 1;
    for (i = 0; i < 8; i++) if (run.prices[i] > maxP) maxP = run.prices[i];
    display.drawRect(barX - 2, MENU_TOP + 2, barW + 4, barH + 4, DIM);
    for (i = 0; i < 8; i++) {
        x = barX;
        h = Math.max(2, Math.floor((barH * run.prices[i]) / maxP));
        display.drawFillRect(x, MENU_TOP + 4 + (barH - h), barW, h, i === selected ? DRUG_COLORS[i] : DIM);
    }
}

function boroughCardScreen(locIdx) {
    var loc = LOCS[locIdx];
    var theme = LOC_THEMES[locIdx] || LOC_THEMES[0];
    var lines, i, interest;
    display.fill(BG);
    drawSkyline(MENU_TOP + 72, theme, locIdx * 7);
    drawBoroughBadge(locIdx, CX - 14, MENU_TOP + 8, true);
    display.setTextSize(2);
    display.setTextColor(FG, BG);
    display.setTextAlign('center', 'top');
    display.drawString(loc.name, CX, MENU_TOP + 40);
    display.setTextSize(1);
    display.setTextColor(CYAN, BG);
    lines = loc.flavor.split(' ');
    var row = '';
    var y = MENU_TOP + 66;
    for (i = 0; i < lines.length; i++) {
        if ((row + lines[i]).length > 22) {
            display.drawString(row, CX, y);
            y += 12;
            row = lines[i] + ' ';
        } else {
            row += lines[i] + ' ';
        }
    }
    if (row.length > 0) {
        display.drawString(row, CX, y);
        y += 12;
    }
    display.setTextColor(DIM, BG);
    display.drawString('Day ' + run.day + ' -> ' + (run.day > 0 ? run.day - 1 : 0), CX, y);
    y += 12;
    if (run.debt > 0) {
        interest = Math.floor((run.debt * 112) / 100) - run.debt;
        display.setTextColor(BAD, BG);
        display.drawString('Debt +12% (' + money(interest) + ')', CX, y);
        y += 12;
    }
    display.setTextColor(DIM, BG);
    display.drawString('SEL travel  ESC back', CX, FOOT_Y - 12);
    display.setTextAlign('left', 'top');
    while (true) {
        if (keyboard.getEscPress()) {
            sfxBack();
            return false;
        }
        if (keyboard.getSelPress()) {
            sfxSelect();
            return true;
        }
        delay(50);
    }
}

function travelTransitionAnim(toLoc) {
    var theme = LOC_THEMES[toLoc] || LOC_THEMES[0];
    display.fill(BG);
    display.drawFillRect(0, MENU_TOP, W, 22, theme.band);
    display.setTextSize(1);
    display.setTextColor(BG, theme.band);
    display.setTextAlign('center', 'top');
    display.drawString('Traveling...', CX, MENU_TOP + 6);
    display.setTextAlign('left', 'top');
    drawSkyline(MENU_TOP + 72, theme, toLoc * 5);
    drawBoroughBadge(toLoc, CX - 14, MENU_TOP + 30, true);
    display.setTextSize(2);
    display.setTextColor(FG, BG);
    display.setTextAlign('center', 'top');
    display.drawString(LOCS[toLoc].name, CX, MENU_TOP + 56);
    display.setTextAlign('left', 'top');
    drawFooter('On the road...');
    sfxTravel();
    delay(450);
}

function marketSplashScreen(title, body, locIdx) {
    splashScreen(title, body, locIdx);
}

function copAlertScreen(officers) {
    var i, flash;
    for (i = 0; i < 2; i++) {
        flash = (i % 2) === 0;
        display.fill(flash ? SIREN : POLICE);
        display.setTextSize(2);
        display.setTextColor(BG, flash ? SIREN : POLICE);
        display.setTextAlign('center', 'middle');
        display.drawString('COPS!', CX, CY);
        display.setTextSize(1);
        display.drawString('x' + officers + ' officers', CX, CY + 18);
        display.setTextAlign('left', 'top');
        ledPulse(flash ? 255 : 40, flash ? 40 : 90, flash ? 40 : 220, false);
        if (i === 0) sfxCop();
        delay(180);
    }
    ledOff();
}

function fightMoveLabel(m) {
    return FIGHT_MOVES[m & 3];
}

function fightMoveArrow(m) {
    return FIGHT_ARROWS[m & 3];
}

function buildFightSequence() {
    var officers = run.pending_officers || 1;
    var pressure = runPressure();
    var len = 3 + Math.floor(pressure / 28) + Math.floor((officers + 1) / 2) + min(1, Math.floor(run.cop_streak / 4));
    if (pressure >= 75) len++;
    if (len < 4) len = 4;
    if (len > 8) len = 8;
    var seq = [];
    var i, m;
    for (i = 0; i < len; i++) {
        m = rand(4);
        if (i > 0 && m === seq[i - 1] && rand(100) < 45) m = (m + 1 + rand(3)) & 3;
        seq.push(m);
    }
    return seq;
}

function drawFightArrow(cx, cy, move, active) {
    var col = active ? ACCENT : DIM;
    var bg = active ? HI_BG : BG;
    display.drawFillRect(cx - 10, cy - 10, 20, 20, bg);
    display.drawRect(cx - 10, cy - 10, 20, 20, col);
    display.setTextSize(1);
    display.setTextColor(col, bg);
    display.setTextAlign('center', 'middle');
    display.drawString(fightMoveArrow(move), cx, cy);
    display.setTextAlign('left', 'top');
}

function drawFighter(x, ground, cop, move, active) {
    var dir = cop ? -1 : 1;
    var col = active ? (cop ? BAD : GOOD) : FG;
    var headY = ground - 22;
    display.drawFillCircle(x, headY, 4, col);
    display.drawLine(x, headY + 4, x, ground - 8, col);
    display.drawLine(x, ground - 8, x - 6 * dir, ground, col);
    display.drawLine(x, ground - 8, x + 6 * dir, ground, col);
    if ((move & 3) === 0) display.drawLine(x, headY - 2, x + 12 * dir, headY - 8, col);
    else if ((move & 3) === 1) display.drawLine(x + 2 * dir, headY + 2, x + 14 * dir, headY + 4, col);
    else if ((move & 3) === 2) display.drawLine(x + 2 * dir, ground - 10, x + 12 * dir, ground - 2, col);
    else display.drawLine(x + 2 * dir, headY + 2, x + 8 * dir, headY - 6, col);
    if (cop) {
        display.drawFillRect(x - 5, headY - 8, 10, 3, POLICE);
        display.setTextSize(1);
        display.setTextColor(BG, POLICE);
        display.setTextAlign('center', 'top');
        display.drawString('PD', x, headY - 7);
        display.setTextAlign('left', 'top');
    }
}

function drawFightScene(phase, seq, revealIdx, pos, movePick) {
    var officers = run.pending_officers || 1;
    var ground = FOOT_Y - 18;
    var i, x;
    display.fill(BG);
    display.drawFillRect(0, HEADER_H, W, 16, display.color(40, 20, 20));
    display.setTextSize(1);
    display.setTextColor(FG, display.color(40, 20, 20));
    display.setTextAlign('left', 'top');
    display.drawString('FIGHT x' + officers + ' H' + run.heat, 4, HEADER_H + 4);
    display.setTextAlign('right', 'top');
    display.drawString('S' + run.cop_streak, W - 4, HEADER_H + 4);
    display.setTextAlign('left', 'top');
    display.drawLine(8, ground + 1, W - 8, ground + 1, DIM);

    if (phase === 0) {
        display.setTextColor(CYAN, BG);
        display.drawString('WATCH COMBO', 6, MENU_TOP);
        display.setTextAlign('right', 'top');
        display.drawString((revealIdx + 1) + '/' + seq.length, W - 6, MENU_TOP);
        display.setTextAlign('left', 'top');
        drawBar(6, MENU_TOP + 12, W - 12, 6, revealIdx + 1, seq.length, ACCENT, DIM);
        drawFighter(CX - 36, ground, false, seq[revealIdx], true);
        drawFighter(CX + 36, ground, true, seq[revealIdx], false);
        drawFightArrow(CX, MENU_TOP + 34, seq[revealIdx], true);
        display.setTextColor(ACCENT, BG);
        display.setTextAlign('center', 'top');
        display.drawString(fightMoveLabel(seq[revealIdx]), CX, MENU_TOP + 52);
        for (i = 0; i <= revealIdx && i < seq.length; i++) {
            x = 8 + i * 10;
            display.drawString(fightMoveArrow(seq[i]), x, ground + 4);
        }
    } else {
        display.setTextColor(GOOD, BG);
        display.drawString('REPEAT COMBO', 6, MENU_TOP);
        display.setTextAlign('right', 'top');
        display.drawString(pos + '/' + seq.length, W - 6, MENU_TOP);
        display.setTextAlign('left', 'top');
        drawBar(6, MENU_TOP + 12, W - 12, 6, pos, seq.length, GOOD, DIM);
        drawFighter(CX - 36, ground, false, movePick, true);
        drawFighter(CX + 36, ground, true, 3, true);
        drawFightArrow(CX, MENU_TOP + 30, 0, movePick === 0);
        drawFightArrow(CX + 18, MENU_TOP + 44, 1, movePick === 1);
        drawFightArrow(CX, MENU_TOP + 58, 2, movePick === 2);
        drawFightArrow(CX - 18, MENU_TOP + 44, 3, movePick === 3);
        display.setTextColor(ACCENT, BG);
        display.setTextAlign('center', 'top');
        display.drawString(fightMoveLabel(movePick), CX, MENU_TOP + 72);
        for (i = 0; i < seq.length; i++) {
            x = 8 + i * 10;
            if (i < pos) display.drawFillRect(x, ground + 2, 7, 7, GOOD);
            else display.drawRect(x, ground + 2, 7, 7, DIM);
        }
        drawFooter('PREV/NEXT move  SEL');
    }
}

function fightCountdown() {
    var labels = ['3', '2', '1', 'GO!'];
    var i;
    for (i = 0; i < labels.length; i++) {
        display.fill(BG);
        display.drawFillRect(0, HEADER_H, W, 16, display.color(40, 20, 20));
        display.setTextSize(2);
        display.setTextColor(ACCENT, BG);
        display.setTextAlign('center', 'middle');
        display.drawString(labels[i], CX, CY);
        display.setTextSize(1);
        display.setTextColor(DIM, BG);
        display.setTextAlign('center', 'top');
        display.drawString('Watch the combo', CX, CY + 24);
        display.setTextAlign('left', 'top');
        drawFooter('Get ready...');
        tone(i < 3 ? 440 + i * 110 : 880, 120);
        delay(280);
    }
}

function copFightMinigame() {
    fightCountdown();
    var seq = buildFightSequence();
    var revealMs = 650;
    var started = now();
    var revealIdx = -1;
    var phase = 0;
    var pos = 0;
    var movePick = 0;
    var painted = '';

    while (true) {
        if (keyboard.getEscPress()) {
            ledOff();
            return 0;
        }
        if (phase === 0) {
            revealIdx = Math.floor((now() - started) / revealMs);
            if (revealIdx >= seq.length) {
                phase = 1;
                pos = 0;
                movePick = 0;
                sfxSelect();
            } else {
                var keyW = 'w' + revealIdx + '|' + seq[revealIdx];
                if (keyW !== painted) {
                    drawFightScene(0, seq, revealIdx, pos, movePick);
                    sfxFightHit();
                    painted = keyW;
                }
            }
        } else {
            if (keyboard.getPrevPress()) {
                movePick = movePick === 0 ? 3 : movePick - 1;
                painted = '';
                sfxMove();
                delay(100);
            }
            if (keyboard.getNextPress()) {
                movePick = (movePick + 1) % 4;
                painted = '';
                sfxMove();
                delay(100);
            }
            if (keyboard.getSelPress()) {
                if (movePick === seq[pos]) {
                    pos++;
                    sfxFightHit();
                    if (pos >= seq.length) {
                        ledPulse(0, 200, 80, false);
                        sfxGood();
                        delay(150);
                        ledOff();
                        return 100;
                    }
                } else {
                    sfxBad();
                    ledOff();
                    return 0;
                }
                painted = '';
            }
            var keyR = 'r' + pos + '|' + movePick;
            if (keyR !== painted) {
                drawFightScene(1, seq, revealIdx, pos, movePick);
                painted = keyR;
            }
        }
        delay(40);
    }
}

function drawCopCar(x, y) {
    display.drawRect(x, y + 4, 28, 10, POLICE);
    display.drawLine(x + 5, y + 4, x + 10, y, POLICE);
    display.drawLine(x + 10, y, x + 18, y, POLICE);
    display.drawLine(x + 18, y, x + 23, y + 4, POLICE);
    display.drawFillRect(x + 12, y - 2, 5, 3, SIREN);
    display.drawFillCircle(x + 6, y + 14, 3, FG);
    display.drawFillCircle(x + 22, y + 14, 3, FG);
    display.setTextSize(1);
    display.setTextColor(BG, POLICE);
    display.setTextAlign('center', 'top');
    display.drawString('PD', x + 14, y + 6);
    display.setTextAlign('left', 'top');
}

function drawRunPlayer(x, y) {
    display.drawFillCircle(x + 4, y - 6, 3, GOOD);
    display.drawLine(x + 4, y - 3, x + 4, y + 5, GOOD);
    display.drawLine(x + 4, y - 1, x + 12, y - 5, GOOD);
    display.drawLine(x + 4, y, x - 1, y + 4, GOOD);
    display.drawLine(x + 4, y + 5, x + 10, y + 9, GOOD);
    display.drawLine(x + 4, y + 5, x - 1, y + 9, GOOD);
}

function drawRunBullet(x, y) {
    display.drawFillRect(x, y - 2, 6, 4, SIREN);
    display.drawLine(x + 6, y - 2, x + 12, y, SIREN);
    display.drawLine(x + 6, y + 1, x + 12, y, SIREN);
}

function runSkillScore(ticks, goal, hits) {
    var score = Math.floor((min(ticks, goal) * 100) / goal);
    var pen = hits * 22;
    return pen >= score ? 0 : score - pen;
}

function copRunMinigame() {
    var officers = run.pending_officers || 1;
    var pressure = runPressure();
    var speed = min(6, 2 + Math.floor(pressure / 25) + Math.floor(officers / 2));
    var maxBullets = min(4, 2 + Math.floor(pressure / 30) + Math.floor(officers / 2));
    var bulletCount = maxBullets;
    var goal = 110 + Math.floor(pressure / 2) + officers * 10 + min(15, run.cop_streak);
    var maxHits = run.heat > 55 ? 2 : 3;
    var laneY = [MENU_TOP + 36, MENU_TOP + 72, MENU_TOP + 108];
    var lane = 1;
    var hits = 0;
    var ticks = 0;
    var bullets = [];
    var i, b, spawnEvery;

    spawnEvery = max(8, 18 - officers - Math.floor(pressure / 20));

    for (i = 0; i < bulletCount; i++) {
        bullets.push({
            x: 70 + i * 24 + rand(20),
            lane: rand(3),
            active: true
        });
    }

    function activeBullets() {
        var n = 0;
        for (i = 0; i < bullets.length; i++) if (bullets[i].active) n++;
        return n;
    }

    function spawnBullet() {
        for (i = 0; i < bullets.length; i++) {
            if (!bullets[i].active) {
                bullets[i].active = true;
                bullets[i].x = W - 8 + rand(18);
                if (rand(100) < 35 + pressure / 3) bullets[i].lane = lane;
                else bullets[i].lane = rand(3);
                return;
            }
        }
    }

    function resetBullet(idx) {
        bullets[idx].x = W - 6 + rand(22);
        if (rand(100) < 40 + Math.floor(pressure / 4)) bullets[idx].lane = lane;
        else bullets[idx].lane = rand(3);
    }

    function paintRun() {
        display.fill(BG);
        display.drawFillRect(0, HEADER_H, W, 16, display.color(20, 24, 48));
        display.setTextSize(1);
        display.setTextColor(CYAN, display.color(20, 24, 48));
        display.setTextAlign('left', 'top');
        display.drawString('RUN x' + officers + ' spd' + speed, 4, HEADER_H + 4);
        display.setTextAlign('right', 'top');
        display.drawString('HIT ' + hits + '/' + maxHits, W - 4, HEADER_H + 4);
        display.setTextAlign('left', 'top');
        drawBar(6, MENU_TOP + 2, W - 12, 6, ticks, goal, CYAN, DIM);
        display.drawRect(6, MENU_TOP + 14, W - 12, laneY[2] - MENU_TOP + 8, LANE);
        for (i = 0; i < 3; i++) {
            if (i === lane) display.drawFillRect(7, laneY[i] - 8, W - 14, 16, display.color(20, 40, 20));
            display.drawLine(8, laneY[i], W - 8, laneY[i], i === lane ? GOOD : LANE);
            for (b = 20; b < W - 16; b += 18) {
                display.drawLine(b, laneY[i] + 5, b + 6, laneY[i] + 5, DIM);
            }
        }
        drawCopCar(W - 38, MENU_TOP + 18);
        drawRunPlayer(14, laneY[lane]);
        for (i = 0; i < bullets.length; i++) {
            if (bullets[i].active) drawRunBullet(bullets[i].x, laneY[bullets[i].lane]);
        }
        drawFooter('PREV up  NEXT down');
    }

    sfxCop();
    display.fill(BG);
    display.drawFillRect(0, HEADER_H, W, 16, display.color(20, 24, 48));
    display.setTextSize(1);
    display.setTextColor(CYAN, display.color(20, 24, 48));
    display.setTextAlign('center', 'top');
    display.drawString('Dodge bullets - PREV up NEXT down', CX, HEADER_H + 4);
    display.setTextAlign('left', 'top');
    drawFooter('Survive the chase');
    delay(900);
    paintRun();
    while (ticks < goal) {
        if (keyboard.getEscPress()) {
            ledOff();
            sfxBack();
            return 0;
        }
        if (keyboard.getPrevPress() && lane > 0) {
            lane--;
            sfxRunWhoosh();
            delay(70);
        }
        if (keyboard.getNextPress() && lane < 2) {
            lane++;
            sfxRunWhoosh();
            delay(70);
        }

        ticks++;
        if (ticks % 30 === 0 && speed < 6) speed++;
        if (ticks % spawnEvery === 0 && activeBullets() < maxBullets) spawnBullet();

        for (i = 0; i < bullets.length; i++) {
            b = bullets[i];
            if (!b.active) continue;
            if (b.x <= speed + 2) {
                resetBullet(i);
                continue;
            }
            b.x -= speed;
            if (b.lane === lane && b.x <= 17 && b.x >= 9) {
                hits++;
                sfxHit();
                ledPulse(255, 40, 40, false);
                resetBullet(i);
                if (hits >= maxHits) {
                    ledOff();
                    return runSkillScore(ticks, goal, hits);
                }
            }
        }

        paintRun();
        if (ticks % 24 === 0) {
            ledPulse(40, 80, 255, ticks % 48 !== 0);
        }
        delay(42);
    }
    ledOff();
    sfxGood();
    return runSkillScore(ticks, goal, hits);
}

function menuScreen(title, items, selected, fullRedraw, hubMode) {
    var i, y, hi, label;
    if (fullRedraw) {
        display.fill(BG);
        drawHeader(title, true);
        if (hubMode) drawHubBanner();
    } else if (hubMode) {
        clearHubMenuArea();
    } else {
        clearContentArea();
    }
    for (i = 0; i < items.length; i++) {
        y = (hubMode ? HUB_MENU_TOP : MENU_TOP) + i * ROW_H;
        if (y + ROW_H > FOOT_Y) break;
        hi = (i === selected);
        label = truncate(items[i], 22);
        if (hi) {
            display.drawFillRect(4, y - 1, W - 8, ROW_H - 1, HI_BG);
            display.setTextColor(ACCENT, HI_BG);
        } else {
            display.setTextColor(FG, BG);
        }
        display.setTextSize(1);
        display.setTextAlign('left', 'top');
        display.drawString(label, 10, y);
        if (hi) display.drawFillRect(8, y + ROW_H - 3, W - 16, 2, ACCENT);
    }
    drawFooter('');
}

function pickMenu(title, items, hubMode) {
    var sel = 0;
    menuScreen(title, items, sel, true, hubMode);
    while (true) {
        if (keyboard.getEscPress()) {
            sfxBack();
            return -1;
        }
        if (keyboard.getNextPress()) {
            sel = (sel + 1) % items.length;
            menuScreen(title, items, sel, false, hubMode);
            sfxMenu();
            delay(120);
        }
        if (keyboard.getPrevPress()) {
            sel = sel === 0 ? items.length - 1 : sel - 1;
            menuScreen(title, items, sel, false, hubMode);
            sfxMenu();
            delay(120);
        }
        if (keyboard.getSelPress()) {
            sfxSelect();
            return sel;
        }
        delay(50);
    }
}

function statusScreen(title, body) {
    splashScreen(title, body, run.location);
}

function tradeMaxQty(drugIdx, selling) {
    var price = run.prices[drugIdx];
    var fit = run.max_coat - coatUsed();
    var affordable = price > 0 ? Math.floor(run.cash / price) : 0;
    if (selling) return invQty(drugIdx);
    return min(fit, affordable);
}

function ownedDrugIndices() {
    var out = [];
    var i;
    for (i = 0; i < 8; i++) if (invQty(i) > 0) out.push(i);
    return out;
}

function doBuy(drugIdx, qty) {
    var price = run.prices[drugIdx];
    var maxQ = tradeMaxQty(drugIdx, false);
    qty = min(qty, maxQ);
    if (qty <= 0) {
        statusScreen('No Deal', 'Not enough cash or coat space.');
        return;
    }
    var cost = price * qty;
    run.cash -= cost;
    addInvQty(drugIdx, qty);
    run.total_bought += cost;
    addArray8('buy_qty', drugIdx, qty);
    addArray8('buy_value', drugIdx, cost);
    if (cost > run.biggest_deal) run.biggest_deal = cost;
    recordAction(1, cost, (drugIdx << 8) | qty);
    if (cost > 5000) run.heat = min(100, run.heat + Math.floor(cost / 5000));
    run.last_msg = 'Bought ' + qty + ' ' + DRUGS[drugIdx].name + ' for ' + money(cost) + '.';
    run.last_msg += '\nCoat now ' + coatUsed() + '/' + run.max_coat + '.';
    sfxBuy();
    ledFlash(0, 180, 80, 60);
    saveRun();
    statusScreen('Purchase OK', run.last_msg);
    postTradeMenu(false);
}

function doSell(drugIdx, qty) {
    var owned = invQty(drugIdx);
    qty = min(qty, owned);
    if (qty <= 0) {
        statusScreen('No Stock', 'Nothing to sell.');
        return;
    }
    var revenue = run.prices[drugIdx] * qty;
    run.cash += revenue;
    setInvQty(drugIdx, owned - qty);
    run.total_sold += revenue;
    addArray8('sell_qty', drugIdx, qty);
    addArray8('sell_value', drugIdx, revenue);
    if (revenue > run.biggest_deal) run.biggest_deal = revenue;
    recordAction(2, revenue, (drugIdx << 8) | qty);
    if (revenue > 5000) run.heat = min(100, run.heat + Math.floor(revenue / 8000));
    run.last_msg = 'Sold ' + qty + ' ' + DRUGS[drugIdx].name + ' for ' + money(revenue) + '.';
    run.last_msg += '\nCoat now ' + coatUsed() + '/' + run.max_coat + '.';
    sfxSell();
    ledFlash(180, 140, 40, 60);
    saveRun();
    statusScreen('Sold', run.last_msg);
    postTradeMenu(true);
}

function postTradeMenu(selling) {
    var pick = pickMenu('Trade done', ['Trade again', 'Back to hub']);
    if (pick === 0) tradeScreen(selling);
}

function pickTradeQty(maxQ) {
    var items = [];
    var qtys = [];
    var pick;
    qtys.push(1);
    items.push('Qty 1');
    if (maxQ >= 5) {
        qtys.push(min(5, maxQ));
        items.push('Qty 5');
    }
    if (maxQ >= 10) {
        qtys.push(min(10, maxQ));
        items.push('Qty 10');
    }
    if (maxQ > 10) {
        qtys.push(maxQ);
        items.push('Max ' + maxQ);
    }
    items.push('Cancel');
    pick = pickMenu('Quantity', items);
    if (pick < 0 || pick === items.length - 1) return 0;
    return qtys[pick];
}

function drawOwnedStrip(activeIdx, owned) {
    var i, idx, x;
    for (i = 0; i < owned.length; i++) {
        idx = owned[i];
        x = 8 + i * 14;
        if (x > W - 24) break;
        drawDrugIcon(idx, x, FOOT_Y - 26, idx === activeIdx);
        if (idx === activeIdx) {
            display.setTextSize(1);
            display.setTextColor(FG, BG);
            display.drawString('' + invQty(idx), x, FOOT_Y - 38);
        }
    }
}

function tradeScreen(selling) {
    var owned = null;
    var sellPos = 0;
    var drugIdx = 1;
    var maxQ;
    var paintKey = '';
    var i;

    if (selling) {
        owned = ownedDrugIndices();
        if (owned.length === 0) {
            sfxEmpty();
            statusScreen('No Stock', 'Coat empty (' + coatUsed() + '/' + run.max_coat + ').\nBuy product first.');
            return;
        }
        sellPos = 0;
        var hot = bestSellDrug();
        if (hot >= 0) {
            for (i = 0; i < owned.length; i++) {
                if (owned[i] === hot) {
                    sellPos = i;
                    break;
                }
            }
        }
    } else {
        var cheap = bestBuyDrug();
        drugIdx = cheap >= 0 ? cheap : 1;
    }

    function currentDrug() {
        return selling ? owned[sellPos] : drugIdx;
    }

    function paintTrade() {
        var d = currentDrug();
        maxQ = tradeMaxQty(d, selling);

        display.fill(BG);
        drawHeader((selling ? 'SELL ' : 'BUY ') + LOCS[run.location].name, true);
        drawDrugIcon(d, 8, MENU_TOP + 2, true);
        drawPriceStrip(d);
        if (selling) drawOwnedStrip(d, owned);
        display.setTextSize(2);
        display.setTextColor(selling ? BAD : GOOD, BG);
        display.setTextAlign('left', 'top');
        display.drawString(truncate(DRUGS[d].name, 10), 24, MENU_TOP);
        display.setTextSize(1);
        display.setTextColor(FG, BG);
        display.drawString('Price ' + money(run.prices[d]) + priceTrend(d), 8, MENU_TOP + 24);
        var hint = drugDealHint(d);
        if (hint) {
            display.setTextColor(hint === 'CHEAP' ? GOOD : BAD, BG);
            display.drawString(hint, W - 40, MENU_TOP + 24);
            display.setTextColor(FG, BG);
        }
        display.drawString('Inv ' + invQty(d) + '  Coat ' + coatUsed() + '/' + run.max_coat, 8, MENU_TOP + 36);
        if (maxQ > 0) {
            display.drawString('Can trade up to ' + maxQ, 8, MENU_TOP + 48);
            display.drawString('Total x1 ' + money(run.prices[d]), 8, MENU_TOP + 60);
            if (selling && invQty(d) > 0) {
                display.setTextColor(GOOD, BG);
                display.drawString('Payout ' + money(run.prices[d] * maxQ), 8, MENU_TOP + 72);
                display.setTextColor(FG, BG);
            } else if (!selling && run.prev_prices && run.prev_prices[d]) {
                display.setTextColor(DIM, BG);
                display.drawString('Was ' + money(run.prev_prices[d]), 8, MENU_TOP + 72);
            }
        } else {
            display.setTextColor(BAD, BG);
            display.drawString(selling ? 'Nothing to sell here' : 'No cash/coat space', 8, MENU_TOP + 48);
        }
        if (selling) {
            display.setTextColor(DIM, BG);
            display.drawString('Stock ' + owned.length + ' type(s)', 8, MENU_TOP + 84);
        }
        drawFooter('PREV/NEXT drug  SEL qty');
        paintKey = d + '|' + maxQ + '|' + run.prices[d] + '|' + coatUsed();
    }

    paintTrade();
    while (true) {
        var d = currentDrug();
        maxQ = tradeMaxQty(d, selling);

        var nextKey = d + '|' + maxQ + '|' + run.prices[d] + '|' + coatUsed();
        if (nextKey !== paintKey) paintTrade();

        if (keyboard.getEscPress()) {
            sfxBack();
            return;
        }
        if (keyboard.getNextPress()) {
            if (selling) sellPos = (sellPos + 1) % owned.length;
            else drugIdx = (drugIdx + 1) % 8;
            sfxMenu();
            delay(80);
        } else if (keyboard.getPrevPress()) {
            if (selling) sellPos = sellPos === 0 ? owned.length - 1 : sellPos - 1;
            else drugIdx = drugIdx === 0 ? 7 : drugIdx - 1;
            sfxMenu();
            delay(80);
        } else if (keyboard.getSelPress()) {
            if (maxQ <= 0) {
                sfxEmpty();
                continue;
            }
            var tradeQty = pickTradeQty(maxQ);
            if (tradeQty <= 0) continue;
            if (selling) doSell(d, tradeQty);
            else doBuy(d, tradeQty);
            return;
        }
        delay(50);
    }
}

function travelScreen() {
    var items = [];
    var i;
    for (i = 0; i < LOCS.length; i++) {
        if (i === run.location) items.push(LOCS[i].name + ' (here)');
        else items.push(LOCS[i].name);
    }
    var pick = pickMenu('Travel', items);
    if (pick < 0 || pick === run.location) return;
    if (!boroughCardScreen(pick)) return;

    travelTransitionAnim(pick);
    run.location = pick;
    if (run.day > 0) run.day--;
    if (run.debt > 0) {
        var oldDebt = run.debt;
        run.debt = Math.floor((run.debt * 112) / 100);
        if (run.debt > oldDebt) sfxDebt();
    }
    recordAction(3, run.prices[0], pick);
    if (run.heat > 0) {
        var decay = randRange(1, 4);
        run.heat = run.heat > decay ? run.heat - decay : 0;
    }
    if (run.day === 0) {
        endGame();
        return;
    }
    startRound();
    ensureRunArrays();
    if (copCheck()) {
        saveRun();
        copScreen();
    } else {
        saveRun();
        marketSplashScreen('Arrived: ' + LOCS[run.location].name, run.last_msg, run.location);
    }
}

function bankScreen() {
    var items = [];
    var halfPay = min(run.cash, Math.floor(run.debt / 2));
    var allPay = min(run.cash, run.debt);
    if (run.coat_offer) items.push('Coat +' + run.coat_increase + ' ($500)');
    items.push('Deposit ' + money(run.cash));
    items.push('Withdraw ' + money(run.bank));
    items.push('Pay half (' + money(halfPay) + ')');
    items.push('Pay all (' + money(allPay) + ')');
    var pick = pickMenu('Bank / Loan', items);
    var amt, coatPick;
    if (pick < 0) return;
    coatPick = run.coat_offer ? 0 : -1;
    if (run.coat_offer && pick === coatPick) {
        if (run.cash < 500) {
            statusScreen('Coat Dealer', 'Need $500 cash on hand.');
            return;
        }
        run.cash -= 500;
        run.max_coat += run.coat_increase;
        recordAction(9, 500, run.coat_increase);
        run.last_msg = 'Bought deeper pockets. Coat now ' + run.max_coat + '.';
        run.coat_offer = false;
        run.coat_increase = 0;
        saveRun();
        sfxCoat();
        ledFlash(80, 200, 255, 90);
        statusScreen('Coat Upgrade', run.last_msg);
        return;
    }
    if (run.coat_offer) pick--;
    if (pick === 0) {
        if (run.cash <= 0) { statusScreen('Bank', 'No cash to deposit.'); return; }
        amt = run.cash;
        run.bank += amt;
        run.cash = 0;
        recordAction(6, amt, 0);
        run.last_msg = 'Deposited ' + money(amt) + '. Bank ' + money(run.bank) + '.';
    } else if (pick === 1) {
        if (run.bank <= 0) { statusScreen('Bank', 'Bank is empty.'); return; }
        amt = run.bank;
        run.cash += amt;
        run.bank = 0;
        recordAction(7, amt, 0);
        run.last_msg = 'Withdrew ' + money(amt) + '. Cash ' + money(run.cash) + '.';
    } else {
        if (run.debt <= 0) { statusScreen('Loan Shark', 'Debt is paid.'); return; }
        var target = pick === 2 ? Math.floor(run.debt / 2) : run.debt;
        amt = min(run.cash, target);
        if (amt <= 0) { statusScreen('Loan Shark', 'No cash to repay.'); return; }
        run.cash -= amt;
        run.debt -= amt;
        recordAction(8, amt, pick === 3 ? 1 : 0);
        run.last_msg = 'Repaid ' + money(amt) + '. Debt ' + money(run.debt) + '.';
    }
    saveRun();
    sfxBank();
    statusScreen('Bank', run.last_msg);
}

function copFight(skill) {
    var officers = run.pending_officers || 1;
    var result = skill - ((officers * 14) + Math.floor(run.heat / 12));
    var loot, loss, lossPct, drug, lost, d;
    run.cops_fought++;
    if (result >= 55) {
        run.fight_wins++;
        run.cop_streak = min(99, run.cop_streak + 1);
        loot = randRange(150, 550) * officers + skill * officers * 5;
        run.cash += loot;
        run.heat = min(100, run.heat + 12 + officers * 2);
        run.last_msg = 'Clean fight! Grabbed ' + money(loot) + '.';
    } else if (result >= 20) {
        run.fight_messy++;
        run.cop_streak = 0;
        loss = Math.floor((run.cash * (6 + officers * 3)) / 100);
        run.cash -= loss;
        run.heat = min(100, run.heat + 15 + officers * 2);
        run.last_msg = 'Messy win. Lost ' + money(loss) + '.';
    } else {
        run.fight_losses++;
        run.cop_streak = 0;
        lossPct = min(78, 18 + officers * 8 + (result < 0 ? min(30, Math.floor(-result / 2)) : 0));
        loss = Math.floor((run.cash * lossPct) / 100);
        drug = 0;
        for (d = 1; d < 8; d++) if (invQty(d) > invQty(drug)) drug = d;
        lost = Math.floor((invQty(drug) * lossPct) / 100);
        run.cash -= loss;
        setInvQty(drug, invQty(drug) - lost);
        run.heat = min(100, run.heat + 22 + officers * 3);
        run.last_msg = 'Lost the fight. -' + money(loss) + ', -' + lost + ' ' + DRUGS[drug].name + '.';
    }
    run.pending_officers = 0;
    recordAction(4, run.cash, (officers << 8) | skill);
    saveRun();
    statusScreen('Aftermath', run.last_msg);
}

function copRun(skill) {
    var officers = run.pending_officers || 1;
    var result = skill - ((officers * 12) + Math.floor(run.heat / 14));
    var fine, drug, lost, bonus, drop;
    run.cops_ran++;
    if (result >= 45) {
        run.run_clean++;
        run.cop_streak = min(99, run.cop_streak + 1);
        drop = min(run.heat, 3 + officers + Math.floor(skill / 35));
        run.heat -= drop;
        bonus = 75 + skill * officers + run.cop_streak * 50;
        run.cash += bonus;
        run.last_msg = 'Clean getaway! Heat -' + drop + '. +' + money(bonus) + '.';
    } else if (result >= 10) {
        run.run_messy++;
        run.cop_streak = 0;
        fine = randRange(100, 550) * officers;
        run.cash = run.cash > fine ? run.cash - fine : 0;
        run.heat = min(100, run.heat + 4 + officers);
        run.last_msg = 'Messy run. Fine ' + money(fine) + '.';
    } else {
        run.run_caught++;
        run.cop_streak = 0;
        fine = randRange(500, 2000) * officers;
        drug = rand(8);
        lost = Math.floor((invQty(drug) * randRange(20, 60)) / 100);
        run.cash = run.cash > fine ? run.cash - fine : 0;
        setInvQty(drug, invQty(drug) - lost);
        run.heat = min(100, run.heat + 12 + officers * 2);
        run.last_msg = 'Caught running. Fine ' + money(fine) + ', lost ' + lost + ' ' + DRUGS[drug].name + '.';
    }
    run.pending_officers = 0;
    recordAction(5, run.cash, (officers << 8) | skill);
    saveRun();
    statusScreen('Aftermath', run.last_msg);
}

function copBriefScreen(officers) {
    var body = '';
    body += 'Officers: ' + officers + '  Heat: ' + run.heat + '%\n';
    body += 'Street pressure: ' + runPressure() + '/100\n';
    body += 'Cop streak: ' + run.cop_streak + '\n\n';
    body += 'FIGHT: memorize combo for loot.\nWin big but heat spikes hard.\n\n';
    body += 'RUN: dodge bullets in 3 lanes.\nClean escape drops heat + cash.\n';
    splashScreen('Cop Stop', body, run.location);
}

function copScreen() {
    var officers = run.pending_officers || 1;
    copAlertScreen(officers);
    copBriefScreen(officers);
    var pick = pickMenu('Choose', ['Fight (loot+heat)', 'Run (cool down)']);
    if (pick < 0) {
        run.pending_officers = 0;
        return;
    }
    var skill = pick === 0 ? copFightMinigame() : copRunMinigame();
    if (pick === 0) copFight(skill);
    else copRun(skill);
}

function statusView() {
    var net = runNet(true);
    var profit = runProfit();
    var body = '';
    body += LOCS[run.location].name + '\n';
    body += 'Net ' + money(net) + '  Rank ' + rankFor(net) + '\n';
    body += 'Profit ' + money(profit) + '  Heat ' + run.heat + '%\n';
    body += 'Bank ' + money(run.bank) + '  Debt ' + money(run.debt) + '\n';
    body += 'Coat ' + coatUsed() + '/' + run.max_coat + '\n';
    var stock = ownedDrugIndices();
    var s, si;
    if (stock.length > 0) {
        body += 'Stock ';
        for (si = 0; si < stock.length && si < 4; si++) {
            s = stock[si];
            body += DRUGS[s].name.substring(0, 4) + ' ' + invQty(s);
            if (si < stock.length - 1 && si < 3) body += ', ';
        }
        if (stock.length > 4) body += '...';
        body += '\n';
    } else {
        body += 'Stock empty\n';
    }
    body += 'Big deal ' + money(run.biggest_deal) + '\n';
    body += 'Cops F/R ' + run.cops_fought + '/' + run.cops_ran + '\n';
    body += 'Cop streak ' + run.cop_streak + '\n';
    if (run.coat_offer) body += 'Coat deal at Bank (+' + run.coat_increase + ')\n';
    body += '\n' + (run.last_msg || '');
    body += '\n\nProfile: /ck42x_dopewars/stats.ck42x';
    statusScreen('Run Status', body);
}

function statsScreen() {
    var body = '';
    body += 'Games ' + stats.games_played + '\n';
    body += 'W/L ' + stats.wins + '/' + stats.losses + '\n';
    body += 'Streak ' + stats.current_streak + ' (best ' + stats.best_streak + ')\n';
    body += 'Best net ' + money(stats.best_net) + '\n';
    body += 'Worst net ' + money(stats.worst_net) + '\n';
    body += 'Rank ' + rankFor(stats.best_net) + '\n';
    body += 'Big deal ' + money(stats.biggest_deal) + '\n';
    body += '\nSound ' + (soundOn ? 'ON' : 'OFF');
    splashScreen('All-Time Stats', body, 0);
}

function endGame() {
    var invVal = invValue(false);
    var net = runNet(false);
    var profit = runProfit();
    updateStatsEnd(net, profit);
    exportStatsProfile(true);
    deleteSave();
    if (net >= 0) {
        sfxWin();
        ledFlash(0, 200, 80, 120);
    } else {
        sfxLose();
        ledFlash(200, 40, 40, 120);
    }
    var body = '';
    body += (net >= 0 ? 'YOU MADE IT' : 'GAME OVER') + '\n';
    body += 'Rank: ' + rankFor(net) + '\n';
    body += 'Net: ' + money(net) + '\n';
    body += 'Profit: ' + money(profit) + '\n';
    body += 'Cash/Bank/Debt: ' + money(run.cash) + ' / ' + money(run.bank) + ' / ' + money(run.debt) + '\n';
    body += 'Inv value: ' + money(invVal) + '\n';
    body += 'Big deal: ' + money(run.biggest_deal) + '\n';
    body += 'Cops F/R: ' + run.cops_fought + '/' + run.cops_ran + '\n';
    body += 'Fight W/M/L: ' + run.fight_wins + '/' + run.fight_messy + '/' + run.fight_losses + '\n';
    body += 'Run clean/messy/caught: ' + run.run_clean + '/' + run.run_messy + '/' + run.run_caught + '\n';
    body += 'Play time: ' + playSeconds() + 's\n';
    body += 'Score code #' + padHex(scoreCode(net, profit)) + '\n';
    body += '\nProfile saved to:\n/ck42x_dopewars/stats.ck42x\n';
    body += '\nSync at ck42x.com/dopeflipper\n';
    body += 'Upload via Bruce WebUI\nor paste manual profile.';
    statusScreen('Run Complete', body);
    run.day = 0;
}

function hubLoop() {
    var items = ['BUY', 'SELL', 'PRICES', 'TRAVEL', 'BANK', 'STATUS', 'NEW RUN'];
    ensureRunArrays();
    while (run.day > 0) {
        if (run.coat_offer) items[4] = 'BANK* coat';
        else items[4] = 'BANK';
        if (run.day <= 5) items[3] = 'TRAVEL !' + run.day + 'd';
        else items[3] = 'TRAVEL';
        var pick = pickMenu(LOCS[run.location].name, items, true);
        if (pick < 0) return;
        if (pick === 0) tradeScreen(false);
        else if (pick === 1) tradeScreen(true);
        else if (pick === 2) marketBoardScreen();
        else if (pick === 3) travelScreen();
        else if (pick === 4) bankScreen();
        else if (pick === 5) statusView();
        else if (pick === 6) {
            if (pickMenu('New run?', ['Cancel', 'Reset run']) === 1) {
                deleteSave();
                newGame();
                return;
            }
        }
    }
}

function newGame() {
    resetRunState();
    startRound();
    saveRun();
    marketSplashScreen('DopeFlipper', run.last_msg, run.location);
    hubLoop();
}

function titleScreen() {
    var frame = 0;
    var theme = LOC_THEMES[0];
    while (true) {
        display.fill(BG);
        drawSkyline(MENU_TOP + 90, theme, Math.floor(frame / 6));
        display.setTextSize(2);
        display.setTextColor(ACCENT, BG);
        display.setTextAlign('center', 'top');
        display.drawString('DopeFlipper', CX, MENU_TOP + 88);
        display.setTextSize(1);
        display.setTextColor(CYAN, BG);
        display.drawString('CK42X x T-Embed', CX, MENU_TOP + 112);
        display.setTextColor(FG, BG);
        display.drawString('Device: ' + truncate(sanitizeDeviceName(stats.device_name), 16), CX, MENU_TOP + 126);
        if (stats.games_played > 0) {
            display.setTextColor(DIM, BG);
            display.drawString('Best ' + money(stats.best_net) + '  ' + rankFor(stats.best_net), CX, MENU_TOP + 140);
        }
        display.setTextColor(DIM, BG);
        display.drawString('ck42x.com/dopeflipper', CX, MENU_TOP + 152);
        display.setTextColor(soundOn ? GOOD : BAD, BG);
        display.drawString('Game sound: ' + (soundOn ? 'ON' : 'OFF'), CX, MENU_TOP + 164);
        display.setTextColor(DIM, BG);
        display.drawString('Bruce sound must be ON', CX, MENU_TOP + 176);
        if ((frame % 20) < 10) {
            display.setTextColor(ACCENT, BG);
            display.drawString('> SEL start <', CX, MENU_TOP + 190);
        }
        display.setTextAlign('left', 'top');
        drawFooter('PREV stats  NEXT test');
        if (keyboard.getEscPress()) {
            ledOff();
            return false;
        }
        if (keyboard.getSelPress()) {
            ledOff();
            sfxSelect();
            return true;
        }
        if (keyboard.getPrevPress()) {
            sfxMenu();
            statsScreen();
            delay(120);
        }
        if (keyboard.getNextPress()) {
            soundOn = !soundOn;
            if (soundOn) sfxTest();
            else tone(220, 100);
            delay(120);
        }
        frame++;
        delay(80);
    }
}

// ---- boot ----
try { storage.mkdir(DATA_DIR); } catch (e7) {}
loadStats();

if (loadRun() && run.day > 0) {
    var netPreview = runNet(true);
    var contItems = ['Continue D' + run.day + ' ' + money(netPreview), 'New run', 'Stats'];
    var cont = pickMenu('Saved run found', contItems);
    if (cont === 1) {
        deleteSave();
        if (!titleScreen()) {} else newGame();
    } else if (cont === 2) {
        statsScreen();
        hubLoop();
    } else if (cont === 0) {
        hubLoop();
    }
} else {
    if (titleScreen()) newGame();
}
