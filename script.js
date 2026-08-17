/* ==========================================================================
   SHINOBI HUD - FRONT-END PURA (HTML/CSS/JS via CEF)
   Escopo isolado: apenas a interface visual. Sem gameplay no JS.
   Protocolo com o Pawn: evento "shinobi:updateHud" (nome do player + 7 valores inteiros)
   ========================================================================== */

function updateHud(playerName, hp, maxHp = 100, chakra, maxChakra = 7000, stamina, maxStamina = 100, level = 1) {
    /* NOME DO JOGADOR */
    if (playerName) {
        document.getElementById('player-name').innerText = playerName;
    }

    /* HP: barra + cor de estado (verde >50%, laranja >25%, vermelho) */
    const hpPercent = (Math.max(0, hp) / Math.max(1, maxHp)) * 100;
    const hpBar = document.getElementById('hp-bar');
    hpBar.style.width = hpPercent + '%';
    hpBar.className = hpPercent > 50 ? 'bar-fill health-green'
                   : hpPercent > 25 ? 'bar-fill health-orange'
                                    : 'bar-fill health-red';
    document.getElementById('hp-text').innerText = `${Math.max(0, hp)}/${maxHp}`;

    /* ENERGIA/CHAKRA */
    const chakraPercent = (Math.max(0, chakra) / Math.max(1, maxChakra)) * 100;
    document.getElementById('chakra-bar').style.width = chakraPercent + '%';
    document.getElementById('chakra-text').innerText = `${Math.max(0, chakra)}/${maxChakra}`;

    /* STAMINA */
    const staminaPercent = (Math.max(0, stamina) / Math.max(1, maxStamina)) * 100;
    document.getElementById('stamina-bar').style.width = staminaPercent + '%';

    /* NÍVEL */
    document.getElementById('level-text').innerText = level;
}

/* --------------------------------------------------------------------------
   UI SCALING - escala proporcional nos 2 eixos (nao estica em telas 4:3).
   FullHD (1920x1080) = 1.0 | 4K = 2.0 | 1366x768 = ~0.71
   -------------------------------------------------------------------------- */
const hudContainer = document.querySelector('.hud-container');
const BASE_W = 1920;
const BASE_H = 1080;

function applyUIScale() {
    let factor = Math.min(window.innerWidth / BASE_W, window.innerHeight / BASE_H);
    factor = Math.max(0.5, Math.min(3.0, factor));
    hudContainer.style.transform = 'scale(' + factor + ')';
}
applyUIScale();
window.addEventListener('resize', applyUIScale);

/* --------------------------------------------------------------------------
   BRIDGE DO CEF (plugin samp-cef / SA-MP 0.3.7)
   - "game:hud:setComponentVisible" = oculta vida/dinheiro/radar/armadura
     nativos do GTA SA (plugin injeta este comando no jogo).
   - "shinobi:updateHud" = valores vindos do Pawn.
   Fora do jogo (browser comum) a HUD fica visivel com os valores estaticos.
   -------------------------------------------------------------------------- */
if (typeof cef !== 'undefined') {
    cef.emit('game:hud:setComponentVisible', 'interface', false);

    /* Atualizado para escutar o nome do jogador na primeira posição da bridge */
    cef.on('shinobi:updateHud', (playerName, hp, maxHp, chakra, maxChakra, stamina, maxStamina, level) => {
        updateHud(playerName, hp, maxHp, chakra, maxChakra, stamina, maxStamina, level);
    });

    if (typeof cef.setTransparent === 'function') cef.setTransparent(1);
    if (typeof cef.setFocused === 'function') cef.setFocused(0);
} else {
    console.warn('[SHINOBI-HUD] Bridge CEF ausente: pagina aberta fora do jogo.');
}

/* ==========================================================================
   SENTINELA DE VIDA - capturado pelo Pawn via OnCefBrowserConsoleMessage:
   "[HUD-JS][P x] HUD Front-End Carregada com Sucesso!"
   ========================================================================== */
console.log("HUD Front-End Carregada com Sucesso!");
