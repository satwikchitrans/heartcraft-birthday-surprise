/* ============================================================
   BIRTHDAY HEARTCRAFT — ULTIMATE INTERACTIVITIES & AUDIO
   ============================================================ */

(function () {
    "use strict";

    // ─── DEFAULT CONFIGURATION ──────────────────────────────────
    const DEFAULT_CONFIG = {
        recipient: "AANCHAL",
        birthMonth: 8,
        birthDay: 24,
        numCandles: 4,
        heroSub: "Someone crafted this with ❤️",
        heroTitlePrefix: "A little surprise for",
        teaserHeading: "Something special is waiting inside...",
        teaserHint: "Tap below to unwrap your surprise 🎁",
        envelopePreview: "For AANCHAL ✨",
        envelopeHint: "Tap the wax seal to open! 💌",
        birthdayHeroLine1: "HAPPY",
        birthdayHeroLine2: "BIRTHDAY",
        birthdayHeroLine3: "AANCHAL!",
        birthdaySubtitle: "Today is all about YOU! ✨",
        cakeTitle: "Make a Wish! ✨",
        cakeSubtitle: "Tap each candle or blow into your mic to blow them out!",
        candlesHint: "🌬️ Blow out all the candles!",
        messageGreeting: "Dear AANCHAL,",
        messageText: `Wishing you the most magical birthday filled with love, laughter, and all the beautiful moments your heart can hold.

You bring so much joy to everyone around you and today we celebrate the incredible person you are!

May this new year of your life bring you endless happiness, exciting adventures, and all your dreams coming true.

You deserve nothing but the best! 🌟✨`,
        messageSignature: "— With all my love ❤️",
        traits: [
            {
                id: "kind",
                emoji: "💛",
                title: "Kind Heart",
                backTitle: "Kindness ✨",
                backText: "Your warmth brightens even the darkest days!"
            },
            {
                id: "loyal",
                emoji: "🤝",
                title: "Always There",
                backTitle: "Loyalty 🤝",
                backText: "The most reliable & supportive friend ever!"
            },
            {
                id: "pure",
                emoji: "✨",
                title: "Pure Soul",
                backTitle: "Pure Heart 💖",
                backText: "Generous, genuine, and truly unforgettable!"
            }
        ],
        catSpeeches: [
            "Meow! Happy Birthday! 🐾",
            "You're the purr-fect friend! 💕",
            "Have the most magical day ever! 🎂",
            "Sending you lots of purrs & hugs! 💖",
            "Besties forever & ever! 🌟",
            "Party hard & eat lots of cake! 🍰"
        ],
        fortunes: [
            "🌟 A year filled with boundless laughter, unforgettable adventures, and endless joy awaits you!",
            "✨ Your smile has the magic to light up any room. Keep shining bright today and always!",
            "💖 Every wish you make today is taking flight into the universe. Get ready for miracles!",
            "🌈 You deserve all the sweetness, warmth, and love the world has to offer!",
            "⭐ Success, happiness, and wonderful surprises will follow you wherever you go this year!",
            "🎉 May your heart always be light, your smile radiant, and your days full of magic!",
            "🎁 The universe is plotting something wonderfully happy for you this year!",
            "🌸 May your path be lined with flowers and every step bring you closer to your dreams!",
            "👑 Happy Birthday to a true queen! Stay iconic, stay kind, and stay YOU!",
            "🍰 May your year be as sweet as birthday cake and filled with golden memories!"
        ],
        finalTitle: "Happy Birthday,",
        finalSubtitle: "May your day be as wonderful as you are!",
        candleColors: ["#e84393","#6c5ce7","#00cec9","#f9ca24","#fd79a8"],
        adminPassword: "admin"
    };

    // ACTIVE RUNTIME CONFIGURATION
    let APP_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    // ─── STATE ────────────────────────────────────────────────
    const pages = [
        "pageLanding",
        "pageReveal",
        "pageBirthday",
        "pageCake",
        "pageMessage",
        "pageBond",
        "pageFinal"
    ];
    let currentPageIndex = 0;
    let musicPlaying = false;
    let audioCtx = null;
    let candlesBlown = 0;
    let typingTimer = null;
    let isTypingComplete = false;
    let loveCount = 0;
    let vibePower = 0;
    let catSpeechIndex = 0;
    let micListening = false;
    let micStream = null;

    // ─── DOM REFS ─────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);
    const loadingOverlay = $("loadingOverlay");
    const sparkleField = $("sparkleField");
    const confettiCanvas = $("confettiCanvas");
    const musicToggle = $("musicToggle");
    const backBtn = $("backBtn");

    // ─── INIT APP ─────────────────────────────────────────────
    window.addEventListener("DOMContentLoaded", async () => {
        // Load configuration from local server or local storage
        await loadConfiguration();

        // Apply configuration to DOM
        applyConfig(APP_CONFIG);

        // Initialize features
        initSparkles();
        initTapHearts();
        initLandingBalloons();
        initCountdown();
        initCandles();
        initInteractiveEmojis();
        initCakeSlicing();
        initTraitCards();
        initVibeMeter();
        initPetMascot();
        initMessageCard();
        initFortuneGenerator();
        initFireworks();

        resizeConfettiCanvas();
        window.addEventListener("resize", resizeConfettiCanvas);

        // Hide loading screen softly
        setTimeout(() => {
            if (loadingOverlay) loadingOverlay.classList.add("hidden");
            if (musicToggle) musicToggle.classList.add("visible");
        }, 1600);

        // Global Event Bindings
        $("surpriseBtn").addEventListener("click", () => navigateTo(1));
        $("toPageCake").addEventListener("click", () => navigateTo(3));
        $("toPageMsg").addEventListener("click", () => navigateTo(4));
        $("toPageBond").addEventListener("click", () => navigateTo(5));
        $("toPageFinal").addEventListener("click", () => navigateTo(6));
        $("partyPopperBtn").addEventListener("click", () => {
            launchConfetti();
            playPopSound();
        });
        $("replayBtn").addEventListener("click", replay);
        backBtn.addEventListener("click", goBack);
        musicToggle.addEventListener("click", toggleMusic);

        // Envelope Seal & Click
        const envelope = $("envelope");
        if (envelope) {
            envelope.addEventListener("click", openEnvelope);
        }
    });

    // ─── CONFIGURATION HYDRATION ──────────────────────────────
    async function loadConfiguration() {
        try {
            const cached = localStorage.getItem("heartcraft_app_config");
            if (cached) {
                const parsed = JSON.parse(cached);
                APP_CONFIG = { ...DEFAULT_CONFIG, ...parsed };
            }
        } catch (e) {
            console.warn("Could not read local storage config:", e);
        }

        try {
            const response = await fetch("/api/config");
            if (response.ok) {
                const serverConfig = await response.json();
                APP_CONFIG = { ...DEFAULT_CONFIG, ...serverConfig };
                localStorage.setItem("heartcraft_app_config", JSON.stringify(APP_CONFIG));
            }
        } catch (e) {
            // Server API not reachable (running static file)
        }
    }

    function applyConfig(config) {
        const r = config.recipient || "AANCHAL";

        // Update titles and headlines
        if ($("pageTitle")) $("pageTitle").textContent = `Happy Birthday ${r}! 🎂 | HeartCraft`;
        if ($("loadingRecipient")) $("loadingRecipient").textContent = `Preparing your surprise for ${r}...`;
        if ($("heroSub") && config.heroSub) $("heroSub").textContent = config.heroSub;
        if ($("heroTitlePrefix") && config.heroTitlePrefix) $("heroTitlePrefix").textContent = config.heroTitlePrefix;
        if ($("landingRecipient")) $("landingRecipient").textContent = r;
        if ($("teaserHeading") && config.teaserHeading) $("teaserHeading").textContent = config.teaserHeading;
        if ($("teaserHint") && config.teaserHint) $("teaserHint").textContent = config.teaserHint;

        // Envelope page
        if ($("envelopeLetterPreview")) $("envelopeLetterPreview").textContent = config.envelopePreview || `For ${r} ✨`;
        if ($("envelopeHint") && config.envelopeHint) $("envelopeHint").textContent = config.envelopeHint;

        // Birthday Reveal Page
        if ($("bdayHeroLine1") && config.birthdayHeroLine1) $("bdayHeroLine1").textContent = config.birthdayHeroLine1;
        if ($("bdayHeroLine2") && config.birthdayHeroLine2) $("bdayHeroLine2").textContent = config.birthdayHeroLine2;
        if ($("bdayHeroLine3")) $("bdayHeroLine3").textContent = config.birthdayHeroLine3 || `${r.toUpperCase()}!`;
        if ($("birthdaySubtitle") && config.birthdaySubtitle) $("birthdaySubtitle").textContent = config.birthdaySubtitle;

        // Cake Page
        if ($("cakeTitle") && config.cakeTitle) $("cakeTitle").textContent = config.cakeTitle;
        if ($("cakeSubtitle") && config.cakeSubtitle) $("cakeSubtitle").textContent = config.cakeSubtitle;

        // Personal Message Page
        if ($("messageGreeting")) $("messageGreeting").textContent = config.messageGreeting || `Dear ${r},`;
        if ($("messageSignature")) $("messageSignature").textContent = config.messageSignature || `— With all my love ❤️`;

        // Traits & Bond Page
        if (config.traits && Array.isArray(config.traits)) {
            config.traits.forEach((t, i) => {
                if ($(`traitEmoji${i}`)) $(`traitEmoji${i}`).textContent = t.emoji || "✨";
                if ($(`traitTitle${i}`)) $(`traitTitle${i}`).textContent = t.title || "Special Trait";
                if ($(`traitBackTitle${i}`)) $(`traitBackTitle${i}`).textContent = t.backTitle || "Title ✨";
                if ($(`traitBackText${i}`)) $(`traitBackText${i}`).textContent = t.backText || "Description note";
            });
        }

        // Final Wish Page
        if ($("finalTitleHeader")) {
            $("finalTitleHeader").innerHTML = `${config.finalTitle || "Happy Birthday,"} <span class="highlight" id="finalRecipient">${r}</span>! 🎂`;
        }
        if ($("finalSubtitle") && config.finalSubtitle) $("finalSubtitle").textContent = config.finalSubtitle;
        if ($("createOwnFooter")) $("createOwnFooter").textContent = `Crafted with ❤️ for ${r}`;

        // Re-init dynamic components dependent on config
        initCandles();
    }

    // ─── PAGE NAVIGATION ─────────────────────────────────────
    function navigateTo(index) {
        if (index === currentPageIndex || index < 0 || index >= pages.length) return;

        const nextPage = $(pages[index]);

        // Deactivate all pages cleanly
        pages.forEach((id) => {
            const el = $(id);
            if (el) el.classList.remove("active", "exit-left", "exit-right", "enter-left");
        });

        // Activate new page
        nextPage.classList.add("active");
        nextPage.scrollTop = 0;
        currentPageIndex = index;

        if (backBtn) backBtn.style.display = index > 0 ? "block" : "none";

        // Page-specific trigger hooks
        if (index === 2) {
            setTimeout(() => launchConfetti(), 300);
            if (!musicPlaying) startMusic();
        }
        if (index === 4) {
            setTimeout(() => startTyping(), 500);
        }
        if (index === 6) {
            setTimeout(() => launchConfetti(), 400);
        }
    }

    function goBack() {
        if (currentPageIndex > 0) {
            navigateTo(currentPageIndex - 1);
        }
    }

    function replay() {
        pages.forEach((id) => {
            $(id).classList.remove("active", "exit-left", "exit-right", "enter-left");
        });
        currentPageIndex = 0;
        $(pages[0]).classList.add("active");
        backBtn.style.display = "none";

        // Reset all states
        resetCandles();
        resetMessage();
        resetTraits();
        vibePower = 0;
        updateVibeMeter();

        // Reset birthday hero lines
        document.querySelectorAll(".bday-hero-line").forEach((el) => {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.animation = "";
        });
    }

    // ─── INTERACTIVE TAP HEART SPAWNER ────────────────────────
    function initTapHearts() {
        const tapLayer = $("tapHeartLayer");
        const symbols = ["💖", "✨", "💕", "⭐", "🌸", "🎉", "💌"];

        document.addEventListener("click", (e) => {
            if (e.target.closest("button") || e.target.closest(".envelope") || e.target.closest(".trait-card")) return;

            const heart = document.createElement("div");
            heart.className = "tap-heart";
            heart.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            heart.style.left = e.clientX + "px";
            heart.style.top = e.clientY + "px";
            tapLayer.appendChild(heart);

            setTimeout(() => {
                if (heart.parentNode) heart.parentNode.removeChild(heart);
            }, 1200);
        });
    }

    // ─── LANDING BALLOONS ─────────────────────────────────────
    function initLandingBalloons() {
        const balloons = document.querySelectorAll(".balloon-item");
        balloons.forEach((b) => {
            b.addEventListener("click", (e) => {
                e.stopPropagation();
                if (b.classList.contains("popped")) return;
                b.classList.add("popped");
                playPopSound();
                createMiniExplosion(e.clientX, e.clientY);
            });
        });
    }

    // ─── ENVELOPE REVEAL ──────────────────────────────────────
    function openEnvelope() {
        const flap = $("envelopeFlap");
        const seal = $("envelopeSeal");
        const letter = $("envelopeLetter");
        const hint = $("envelopeHint");

        if (flap.classList.contains("open")) return;

        playPopSound();
        if (seal) seal.classList.add("broken");
        
        setTimeout(() => {
            flap.classList.add("open");
            if (hint) hint.style.opacity = "0";
        }, 150);

        setTimeout(() => {
            if (letter) letter.classList.add("rise");
        }, 450);

        setTimeout(() => {
            navigateTo(2);
        }, 1400);
    }

    // ─── SPARKLE PARTICLES ────────────────────────────────────
    function initSparkles() {
        const count = 30;
        for (let i = 0; i < count; i++) {
            setTimeout(() => createSparkle(), i * 180);
        }
        setInterval(() => createSparkle(), 500);
    }

    function createSparkle() {
        if (!sparkleField) return;
        const particle = document.createElement("div");
        const type = Math.floor(Math.random() * 5);
        const size = 4 + Math.random() * 6;
        const left = Math.random() * 100;
        const duration = 6 + Math.random() * 8;
        const delay = Math.random() * 2;
        const drift = -40 + Math.random() * 80;
        const peakOpacity = 0.3 + Math.random() * 0.5;

        particle.className = `sparkle-particle sparkle-type-${type}`;
        particle.style.cssText = `
            left: ${left}%;
            --size: ${size}px;
            --drift: ${drift}px;
            --peak-opacity: ${peakOpacity};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;

        sparkleField.appendChild(particle);
        setTimeout(() => {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, (duration + delay) * 1000);
    }

    // ─── COUNTDOWN ────────────────────────────────────────────
    function initCountdown() {
        function getNextBirthday() {
            const now = new Date();
            let year = now.getFullYear();
            const month = APP_CONFIG.birthMonth || 5;
            const day = APP_CONFIG.birthDay || 1;
            let bday = new Date(year, month - 1, day, 0, 0, 0);
            if (bday <= now) {
                bday = new Date(year + 1, month - 1, day, 0, 0, 0);
            }
            return bday;
        }

        function update() {
            const now = new Date();
            const target = getNextBirthday();
            const diff = target - now;

            if (diff <= 0) {
                $("cdDays").textContent = "00";
                $("cdHours").textContent = "00";
                $("cdMins").textContent = "00";
                $("cdSecs").textContent = "00";
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const mins = Math.floor((diff / (1000 * 60)) % 60);
            const secs = Math.floor((diff / 1000) % 60);

            $("cdDays").textContent = String(days).padStart(2, "0");
            $("cdHours").textContent = String(hours).padStart(2, "0");
            $("cdMins").textContent = String(mins).padStart(2, "0");
            $("cdSecs").textContent = String(secs).padStart(2, "0");
        }

        update();
        setInterval(update, 1000);
    }

    // ─── INTERACTIVE EMOJIS ───────────────────────────────────
    function initInteractiveEmojis() {
        const emojis = document.querySelectorAll(".interactive-emoji");
        emojis.forEach((el) => {
            el.addEventListener("click", (e) => {
                playPopSound();
                createMiniExplosion(e.clientX, e.clientY);
                el.style.transform = "scale(1.5) rotate(20deg)";
                setTimeout(() => (el.style.transform = ""), 300);
            });
        });
    }

    // ─── CANDLES & MIC BLOWING ────────────────────────────────
    function initCandles() {
        const row = $("candlesRow");
        if (!row) return;
        row.innerHTML = "";
        candlesBlown = 0;

        const num = APP_CONFIG.numCandles || 5;
        const colors = APP_CONFIG.candleColors || ["#e84393", "#6c5ce7", "#00cec9", "#f9ca24", "#fd79a8"];

        for (let i = 0; i < num; i++) {
            const candle = document.createElement("div");
            candle.className = "candle";
            candle.innerHTML = `
                <div class="candle-smoke" id="smoke${i}"></div>
                <div class="candle-flame" id="flame${i}"></div>
                <div class="candle-stick" style="background: ${colors[i % colors.length]}"></div>
            `;
            candle.addEventListener("click", () => blowCandle(i));
            row.appendChild(candle);
        }

        const micBtn = $("micBlowBtn");
        if (micBtn) {
            micBtn.addEventListener("click", toggleMicBlowing);
        }

        const relightBtn = $("relightBtn");
        if (relightBtn) {
            relightBtn.addEventListener("click", resetCandles);
        }
    }

    function resetCandles() {
        candlesBlown = 0;
        const num = APP_CONFIG.numCandles || 5;
        for (let i = 0; i < num; i++) {
            const flame = $(`flame${i}`);
            const smoke = $(`smoke${i}`);
            if (flame) flame.classList.remove("blown");
            if (smoke) smoke.classList.remove("visible");
        }
        const hint = $("candlesHint");
        if (hint) {
            hint.textContent = APP_CONFIG.candlesHint || "🌬️ Blow out all the candles!";
            hint.classList.remove("done");
        }
        const continueBtn = $("toPageMsg");
        if (continueBtn) continueBtn.style.display = "none";
        const relightBtn = $("relightBtn");
        if (relightBtn) relightBtn.style.display = "none";
    }

    function blowCandle(index) {
        const flame = $(`flame${index}`);
        const smoke = $(`smoke${index}`);
        if (!flame || flame.classList.contains("blown")) return;

        flame.classList.add("blown");
        if (smoke) smoke.classList.add("visible");
        candlesBlown++;
        playBlowSound();

        const totalCandles = APP_CONFIG.numCandles || 5;
        if (candlesBlown >= totalCandles) {
            setTimeout(() => {
                const hint = $("candlesHint");
                if (hint) {
                    hint.textContent = "🎉 Wish granted! Your dreams will come true!";
                    hint.classList.add("done");
                }
                const continueBtn = $("toPageMsg");
                if (continueBtn) {
                    continueBtn.style.display = "inline-flex";
                    continueBtn.style.animation = "fadeInUp 0.6s ease forwards";
                }
                const relightBtn = $("relightBtn");
                if (relightBtn) relightBtn.style.display = "inline-block";

                launchConfetti();
            }, 500);
        }
    }

    function toggleMicBlowing() {
        const micBtn = $("micBlowBtn");
        if (micListening) {
            stopMicBlowing();
            if (micBtn) micBtn.textContent = "🎤 Blow into Mic";
            return;
        }

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("Microphone access is not supported on this browser.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
            micStream = stream;
            micListening = true;
            if (micBtn) micBtn.textContent = "🎙️ Listening... Blow now!";

            const ctx = createAudioContext();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const totalCandles = APP_CONFIG.numCandles || 5;

            function checkBlow() {
                if (!micListening) return;
                analyser.getByteFrequencyData(dataArray);

                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                const average = sum / dataArray.length;

                if (average > 45 && candlesBlown < totalCandles) {
                    blowCandle(candlesBlown);
                }

                if (candlesBlown < totalCandles) {
                    requestAnimationFrame(checkBlow);
                } else {
                    stopMicBlowing();
                    if (micBtn) micBtn.textContent = "✨ All Candles Blown!";
                }
            }
            checkBlow();
        }).catch(() => {
            alert("Microphone permission denied. You can tap candles to blow them out!");
        });
    }

    function stopMicBlowing() {
        micListening = false;
        if (micStream) {
            micStream.getTracks().forEach((t) => t.stop());
            micStream = null;
        }
    }

    // ─── CAKE SLICING & SPRINKLES ─────────────────────────────
    function initCakeSlicing() {
        const cake = $("interactiveCake");
        const cut = $("cakeSliceCut");

        if (!cake) return;

        cake.addEventListener("click", (e) => {
            const rect = cake.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const colors = APP_CONFIG.candleColors || ["#e84393", "#6c5ce7", "#00cec9", "#f9ca24", "#fd79a8"];
            const sprinkle = document.createElement("div");
            sprinkle.className = "sprinkle-dot";
            sprinkle.style.left = x + "px";
            sprinkle.style.top = y + "px";
            sprinkle.style.background = colors[Math.floor(Math.random() * colors.length)];
            cake.appendChild(sprinkle);

            if (cut && !cut.classList.contains("active")) {
                cut.classList.add("active");
                playPopSound();
            }
        });
    }

    // ─── MESSAGE CARD & TYPEWRITER ────────────────────────────
    function initMessageCard() {
        const card = $("messageCard");
        const sendBtn = $("sendLoveBtn");

        if (card) {
            card.addEventListener("click", skipTyping);
        }

        if (sendBtn) {
            sendBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                loveCount++;
                $("loveCount").textContent = loveCount;
                playPopSound();
                spawnLoveStream();
            });
        }
    }

    function startTyping() {
        const msgEl = $("messageText");
        const signature = document.querySelector(".message-signature");
        if (!msgEl) return;

        if (typingTimer) clearInterval(typingTimer);
        msgEl.innerHTML = '<span class="typing-cursor"></span>';
        if (signature) signature.classList.remove("visible");
        isTypingComplete = false;

        let charIndex = 0;
        const speed = 25;
        const msgContent = APP_CONFIG.messageText || DEFAULT_CONFIG.messageText;

        typingTimer = setInterval(() => {
            if (charIndex < msgContent.length) {
                const cursor = msgEl.querySelector(".typing-cursor");
                const char = msgContent[charIndex];

                if (char === "\n") {
                    cursor.insertAdjacentHTML("beforebegin", "<br>");
                } else {
                    cursor.insertAdjacentText("beforebegin", char);
                }
                charIndex++;
            } else {
                finishTyping();
            }
        }, speed);
    }

    function skipTyping() {
        if (isTypingComplete) return;
        finishTyping();
    }

    function finishTyping() {
        if (typingTimer) clearInterval(typingTimer);
        const msgEl = $("messageText");
        const signature = document.querySelector(".message-signature");

        const msgContent = APP_CONFIG.messageText || DEFAULT_CONFIG.messageText;
        if (msgEl) {
            msgEl.innerHTML = msgContent.replace(/\n/g, "<br>");
        }
        if (signature) {
            setTimeout(() => signature.classList.add("visible"), 200);
        }
        isTypingComplete = true;
    }

    function resetMessage() {
        if (typingTimer) clearInterval(typingTimer);
        const msgEl = $("messageText");
        const signature = document.querySelector(".message-signature");
        if (msgEl) msgEl.textContent = "";
        if (signature) signature.classList.remove("visible");
        isTypingComplete = false;
    }

    function spawnLoveStream() {
        const tapLayer = $("tapHeartLayer");
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                const heart = document.createElement("div");
                heart.className = "tap-heart";
                heart.textContent = Math.random() > 0.5 ? "💖" : "❤️";
                heart.style.left = (20 + Math.random() * 60) + "%";
                heart.style.top = (60 + Math.random() * 30) + "%";
                tapLayer.appendChild(heart);

                setTimeout(() => {
                    if (heart.parentNode) heart.parentNode.removeChild(heart);
                }, 1200);
            }, i * 100);
        }
    }

    // ─── TRAIT FLIP CARDS ─────────────────────────────────────
    function initTraitCards() {
        const cards = document.querySelectorAll(".trait-card");
        cards.forEach((c) => {
            c.addEventListener("click", () => {
                c.classList.toggle("flipped");
                playPopSound();
            });
        });
    }

    function resetTraits() {
        const cards = document.querySelectorAll(".trait-card");
        cards.forEach((c) => c.classList.remove("flipped"));
    }

    // ─── BESTIE POWER VIBE METER ──────────────────────────────
    function initVibeMeter() {
        const box = $("vibeMeterBox");
        if (box) {
            box.addEventListener("click", () => {
                vibePower = Math.min(100, vibePower + 20);
                updateVibeMeter();
                playPopSound();
            });
        }
    }

    function updateVibeMeter() {
        const fill = $("vibeFill");
        const percent = $("vibePercent");
        const hint = $("vibeHint");

        if (fill) fill.style.width = vibePower + "%";
        if (percent) percent.textContent = vibePower + "%";

        if (hint) {
            if (vibePower >= 100) {
                hint.textContent = "🔥 BESTIE POWER MAXED OUT! 100% 💕";
                hint.style.color = "var(--accent-gold)";
                launchConfetti();
            } else {
                hint.textContent = "Tap to charge up Bestie Vibes! 💕";
                hint.style.color = "rgba(255, 255, 255, 0.4)";
            }
        }
    }

    // ─── INTERACTIVE PET MASCOT ───────────────────────────────
    function initPetMascot() {
        const cat = $("friendChar");
        const speech = $("friendSpeech");

        if (cat) {
            cat.addEventListener("click", () => {
                const speeches = APP_CONFIG.catSpeeches || DEFAULT_CONFIG.catSpeeches;
                catSpeechIndex = (catSpeechIndex + 1) % speeches.length;
                if (speech) speech.textContent = speeches[catSpeechIndex];
                playPopSound();
                cat.style.transform = "scale(1.3) rotate(15deg)";
                setTimeout(() => (cat.style.transform = ""), 300);
            });
        }
    }

    // ─── FORTUNE GENERATOR ────────────────────────────────────
    function initFortuneGenerator() {
        const btn = $("drawWishBtn");
        const card = $("fortuneCard");
        const text = $("fortuneText");

        if (btn) {
            btn.addEventListener("click", () => {
                const fortunes = APP_CONFIG.fortunes || DEFAULT_CONFIG.fortunes;
                const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
                if (text) text.textContent = randomFortune;
                if (card) card.style.display = "block";
                playPopSound();
                launchConfetti();
            });
        }
    }

    // ─── FIREWORKS ────────────────────────────────────────────
    function initFireworks() {
        const btn = $("fireworksBtn");
        if (btn) {
            btn.addEventListener("click", () => {
                playPopSound();
                launchFireworksDisplay();
            });
        }
    }

    // ─── CONFETTI CANVAS ENGINE ───────────────────────────────
    function resizeConfettiCanvas() {
        if (!confettiCanvas) return;
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    function launchConfetti() {
        if (!confettiCanvas) return;
        const ctx = confettiCanvas.getContext("2d");
        const W = confettiCanvas.width;
        const H = confettiCanvas.height;
        const colors = [
            "#e84393", "#fd79a8", "#6c5ce7", "#00cec9",
            "#f9ca24", "#ffeaa7", "#ff6b6b", "#a29bfe",
            "#fab1d0", "#55efc4", "#ff7675", "#74b9ff"
        ];

        const pieces = [];
        const count = 160;

        for (let i = 0; i < count; i++) {
            pieces.push({
                x: W * 0.5 + (Math.random() - 0.5) * W * 0.5,
                y: H * 0.4,
                vx: (Math.random() - 0.5) * 18,
                vy: -8 - Math.random() * 14,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotSpeed: (Math.random() - 0.5) * 15,
                gravity: 0.16 + Math.random() * 0.1,
                opacity: 1,
                shape: Math.random() > 0.5 ? "rect" : "circle"
            });
        }

        let frame = 0;
        const maxFrames = 200;

        function animate() {
            if (frame > maxFrames) {
                ctx.clearRect(0, 0, W, H);
                return;
            }

            ctx.clearRect(0, 0, W, H);

            pieces.forEach((p) => {
                p.x += p.vx;
                p.vy += p.gravity;
                p.y += p.vy;
                p.vx *= 0.99;
                p.rotation += p.rotSpeed;

                if (frame > maxFrames * 0.7) {
                    p.opacity -= 0.02;
                    if (p.opacity < 0) p.opacity = 0;
                }

                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;

                if (p.shape === "rect") {
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                } else {
                    ctx.beginPath();
                    ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });

            frame++;
            requestAnimationFrame(animate);
        }

        animate();
    }

    // ─── ELECTRIC NEON FIREWORKS ENGINE ───────────────────────
    function launchFireworksDisplay() {
        if (!confettiCanvas) return;
        const ctx = confettiCanvas.getContext("2d");
        const W = confettiCanvas.width;
        const H = confettiCanvas.height;

        // Launch 14 cascading neon fireworks bursts over 4.5 seconds
        const burstCount = 14;
        for (let i = 0; i < burstCount; i++) {
            setTimeout(() => {
                const cx = (0.15 + Math.random() * 0.7) * W;
                const cy = (0.15 + Math.random() * 0.45) * H;
                createNeonFireworksBurst(ctx, cx, cy);
            }, i * 320);
        }
    }

    function createNeonFireworksBurst(ctx, cx, cy) {
        const W = confettiCanvas.width;
        const H = confettiCanvas.height;

        // Electric Neon Palettes
        const neonPalettes = [
            ["#00f3ff", "#00b8ff", "#e6ffff"], // Neon Electric Cyan
            ["#ff007f", "#ff55a3", "#ffe6f2"], // Neon Magenta
            ["#39ff14", "#70ff52", "#ebffea"], // Electric Lime
            ["#ffe600", "#ffea4d", "#fffce6"], // Neon Gold
            ["#b000ff", "#d466ff", "#f6e6ff"], // Electric Purple
            ["#ff3b00", "#ff7340", "#ffede6"], // Neon Flame
            ["#00ffb7", "#66ffd4", "#e6fff8"]  // Neon Mint
        ];

        const palette = neonPalettes[Math.floor(Math.random() * neonPalettes.length)];
        const primaryNeon = palette[0];
        const secondaryNeon = palette[1];
        const sparkWhite = palette[2];

        const particles = [];
        const particleCount = 90; // High density neon burst

        // Outer Ring & Inner Core Particles
        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const isInner = Math.random() > 0.65;
            const speed = isInner ? (2 + Math.random() * 4) : (5 + Math.random() * 9);
            
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: isInner ? (1.5 + Math.random() * 2) : (2.5 + Math.random() * 3.5),
                color: isInner ? sparkWhite : (Math.random() > 0.3 ? primaryNeon : secondaryNeon),
                alpha: 1,
                decay: 0.004 + Math.random() * 0.004, // Very slow, graceful fade (lasts ~3 seconds!)
                friction: 0.965,
                gravity: 0.045,
                flicker: Math.random() > 0.4
            });
        }

        // Sparkling Trail Glitter Particles
        for (let i = 0; i < 25; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 1 + Math.random() * 1.5,
                color: "#ffffff",
                alpha: 1,
                decay: 0.003 + Math.random() * 0.003,
                friction: 0.98,
                gravity: 0.02,
                flicker: true
            });
        }

        let frame = 0;
        const maxFrames = 220; // Extended 3.5+ seconds total life

        function render() {
            if (frame > maxFrames || particles.every(p => p.alpha <= 0)) {
                return;
            }

            // Draw glowing particles with additive neon blending
            particles.forEach((p) => {
                if (p.alpha <= 0) return;

                // Motion physics
                p.vx *= p.friction;
                p.vy *= p.friction;
                p.vy += p.gravity;
                p.x += p.vx;
                p.y += p.vy;

                // Slow alpha fade out
                p.alpha -= p.decay;
                if (p.alpha < 0) p.alpha = 0;

                let drawAlpha = p.alpha;
                if (p.flicker && Math.random() > 0.3) {
                    drawAlpha *= (0.7 + Math.random() * 0.3);
                }

                ctx.save();
                ctx.globalCompositeOperation = "lighter"; // Intense neon glow overlay
                ctx.globalAlpha = drawAlpha;
                ctx.shadowBlur = 14;
                ctx.shadowColor = p.color;
                ctx.fillStyle = p.color;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            frame++;
            requestAnimationFrame(render);
        }

        render();
    }

    function createMiniExplosion(x, y) {
        if (!confettiCanvas) return;
        const ctx = confettiCanvas.getContext("2d");
        const particles = [];
        const colors = ["#ffd700", "#ff6b81", "#70a1ff", "#7bed9f"];

        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1
            });
        }

        let frame = 0;
        function render() {
            if (frame > 40) return;
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.025;
                if (p.alpha < 0) p.alpha = 0;

                ctx.save();
                ctx.globalAlpha = p.alpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            frame++;
            requestAnimationFrame(render);
        }
        render();
    }

    // ─── AUDIO SYNTHESIZER (Web Audio API) ────────────────────
    function createAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function startMusic() {
        const ctx = createAudioContext();
        musicPlaying = true;
        if (musicToggle) musicToggle.textContent = "⏸ Pause Music";
        playBirthdaySong(ctx);
    }

    function stopMusic() {
        musicPlaying = false;
        if (musicToggle) musicToggle.textContent = "🎵 Play Music";
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
        }
    }

    function toggleMusic() {
        if (musicPlaying) {
            stopMusic();
        } else {
            startMusic();
        }
    }

    function playBirthdaySong(ctx) {
        const tempo = 0.32;
        const notes = [
            { freq: 262, dur: 0.75, start: 0 },
            { freq: 262, dur: 0.25, start: 0.75 },
            { freq: 294, dur: 1, start: 1 },
            { freq: 262, dur: 1, start: 2 },
            { freq: 349, dur: 1, start: 3 },
            { freq: 330, dur: 2, start: 4 },

            { freq: 262, dur: 0.75, start: 6 },
            { freq: 262, dur: 0.25, start: 6.75 },
            { freq: 294, dur: 1, start: 7 },
            { freq: 262, dur: 1, start: 8 },
            { freq: 392, dur: 1, start: 9 },
            { freq: 349, dur: 2, start: 10 },

            { freq: 262, dur: 0.75, start: 12 },
            { freq: 262, dur: 0.25, start: 12.75 },
            { freq: 523, dur: 1, start: 13 },
            { freq: 440, dur: 1, start: 14 },
            { freq: 349, dur: 1, start: 15 },
            { freq: 330, dur: 1, start: 16 },
            { freq: 294, dur: 2, start: 17 },

            { freq: 466, dur: 0.75, start: 19 },
            { freq: 466, dur: 0.25, start: 19.75 },
            { freq: 440, dur: 1, start: 20 },
            { freq: 349, dur: 1, start: 21 },
            { freq: 392, dur: 1, start: 22 },
            { freq: 349, dur: 2, start: 23 }
        ];

        const totalDuration = 25;

        function playOnce(offset) {
            notes.forEach(({ freq, dur, start }) => {
                const t = ctx.currentTime + offset + start * tempo;

                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, t);
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.08, t + 0.05);
                gain.gain.setValueAtTime(0.08, t + dur * tempo * 0.7);
                gain.gain.linearRampToValueAtTime(0, t + dur * tempo);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(t);
                osc.stop(t + dur * tempo + 0.1);

                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = "triangle";
                osc2.frequency.setValueAtTime(freq * 2, t);
                gain2.gain.setValueAtTime(0, t);
                gain2.gain.linearRampToValueAtTime(0.02, t + 0.05);
                gain2.gain.setValueAtTime(0.02, t + dur * tempo * 0.6);
                gain2.gain.linearRampToValueAtTime(0, t + dur * tempo);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start(t);
                osc2.stop(t + dur * tempo + 0.1);
            });
        }

        const loopDuration = totalDuration * tempo + 1;
        playOnce(0);

        let loopCount = 1;
        const maxLoops = 20;
        const loopInterval = setInterval(() => {
            if (!musicPlaying || loopCount >= maxLoops) {
                clearInterval(loopInterval);
                return;
            }
            try {
                playOnce(loopDuration * loopCount);
            } catch (e) {
                clearInterval(loopInterval);
            }
            loopCount++;
        }, loopDuration * 1000);
    }

    function playBlowSound() {
        try {
            const ctx = createAudioContext();
            const bufferSize = ctx.sampleRate * 0.3;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
            }

            const source = ctx.createBufferSource();
            source.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = 1800;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

            source.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            source.start();
        } catch (e) {
            // Audio fallback
        }
    }

    function playPopSound() {
        try {
            const ctx = createAudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.09);
        } catch (e) {
            // Audio fallback
        }
    }

})();
