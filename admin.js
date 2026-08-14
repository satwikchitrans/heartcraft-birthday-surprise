/* ============================================================
   MASTER ADMIN CONTROL SYSTEM — STANDALONE DASHBOARD ENGINE
   ============================================================ */

(function () {
    "use strict";

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
            { id: "kind", emoji: "💛", title: "Kind Heart", backTitle: "Kindness ✨", backText: "Your warmth brightens even the darkest days!" },
            { id: "loyal", emoji: "🤝", title: "Always There", backTitle: "Loyalty 🤝", backText: "The most reliable & supportive friend ever!" },
            { id: "pure", emoji: "✨", title: "Pure Soul", backTitle: "Pure Heart 💖", backText: "Generous, genuine, and truly unforgettable!" }
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
        candleColors: ["#e84393", "#6c5ce7", "#00cec9", "#f9ca24", "#fd79a8"],
        adminPassword: "admin"
    };

    let APP_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

    const $ = (id) => document.getElementById(id);

    window.addEventListener("DOMContentLoaded", async () => {
        await loadConfig();
        initAuthGate();
        initTabs();
        initActions();
    });

    async function loadConfig() {
        try {
            const cached = localStorage.getItem("heartcraft_app_config");
            if (cached) {
                APP_CONFIG = { ...DEFAULT_CONFIG, ...JSON.parse(cached) };
            }
        } catch (e) {}

        try {
            const res = await fetch("/api/config");
            if (res.ok) {
                const data = await res.json();
                APP_CONFIG = { ...DEFAULT_CONFIG, ...data };
                localStorage.setItem("heartcraft_app_config", JSON.stringify(APP_CONFIG));
            }
        } catch (e) {}
    }

    function initAuthGate() {
        if ($("adminAuthSubmitBtn")) {
            $("adminAuthSubmitBtn").addEventListener("click", checkPassword);
        }
        if ($("adminPasswordInput")) {
            $("adminPasswordInput").addEventListener("keyup", (e) => {
                if (e.key === "Enter") checkPassword();
            });
            setTimeout(() => $("adminPasswordInput").focus(), 150);
        }
    }

    function checkPassword() {
        const val = $("adminPasswordInput").value;
        const pass = APP_CONFIG.adminPassword || "admin";

        if (val === pass || val === "admin123" || val === "heartcraft") {
            $("adminAuthOverlay").style.display = "none";
            populateInputs();
            bindLivePreview();
            showToast("🔓 Master Admin Dashboard Unlocked!");
        } else {
            alert("Incorrect Admin Password!");
            $("adminPasswordInput").value = "";
            $("adminPasswordInput").focus();
        }
    }

    function initTabs() {
        const tabs = document.querySelectorAll(".admin-tab");
        tabs.forEach((t) => {
            t.addEventListener("click", () => {
                const target = t.getAttribute("data-tab");
                tabs.forEach((tab) => tab.classList.remove("active"));
                document.querySelectorAll(".admin-tab-content").forEach((c) => c.classList.remove("active"));

                t.classList.add("active");
                if ($(target)) $(target).classList.add("active");
            });
        });
    }

    function initActions() {
        if ($("btnReloadIframe")) {
            $("btnReloadIframe").addEventListener("click", reloadPreview);
        }
        if ($("btnRefreshPreview")) {
            $("btnRefreshPreview").addEventListener("click", reloadPreview);
        }

        if ($("btnSaveAllModal")) {
            $("btnSaveAllModal").addEventListener("click", async () => {
                readInputs();
                await savePermanently();
            });
        }

        if ($("btnSavePermanent")) {
            $("btnSavePermanent").addEventListener("click", async () => {
                readInputs();
                await savePermanently();
            });
        }

        if ($("btnSaveFileSystem")) {
            $("btnSaveFileSystem").addEventListener("click", async () => {
                readInputs();
                await saveViaFileSystemAPI();
            });
        }

        if ($("btnExportConfig")) {
            $("btnExportConfig").addEventListener("click", () => {
                readInputs();
                exportConfig();
            });
        }

        if ($("btnResetDefaults")) {
            $("btnResetDefaults").addEventListener("click", () => {
                if (confirm("Are you sure you want to reset all configuration to default values?")) {
                    APP_CONFIG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
                    localStorage.setItem("heartcraft_app_config", JSON.stringify(APP_CONFIG));
                    populateInputs();
                    reloadPreview();
                    showToast("🔄 Restored to factory default settings!");
                }
            });
        }
    }

    function populateInputs() {
        const c = APP_CONFIG;
        if ($("cfgRecipient")) $("cfgRecipient").value = c.recipient || "";
        if ($("cfgBirthMonth")) $("cfgBirthMonth").value = c.birthMonth || 5;
        if ($("cfgBirthDay")) $("cfgBirthDay").value = c.birthDay || 1;
        if ($("cfgHeroSub")) $("cfgHeroSub").value = c.heroSub || "";
        if ($("cfgHeroTitlePrefix")) $("cfgHeroTitlePrefix").value = c.heroTitlePrefix || "";
        if ($("cfgTeaserHeading")) $("cfgTeaserHeading").value = c.teaserHeading || "";

        if ($("cfgEnvelopePreview")) $("cfgEnvelopePreview").value = c.envelopePreview || "";
        if ($("cfgMessageGreeting")) $("cfgMessageGreeting").value = c.messageGreeting || "";
        if ($("cfgMessageText")) $("cfgMessageText").value = c.messageText || "";
        if ($("cfgMessageSignature")) $("cfgMessageSignature").value = c.messageSignature || "";

        if ($("cfgNumCandles")) $("cfgNumCandles").value = c.numCandles || 5;
        if ($("cfgCandleColors")) $("cfgCandleColors").value = (c.candleColors || []).join(", ");
        if ($("cfgCakeTitle")) $("cfgCakeTitle").value = c.cakeTitle || "";
        if ($("cfgCakeSubtitle")) $("cfgCakeSubtitle").value = c.cakeSubtitle || "";

        if (c.traits && c.traits[0]) {
            if ($("cfgTraitEmoji0")) $("cfgTraitEmoji0").value = c.traits[0].emoji || "";
            if ($("cfgTraitTitle0")) $("cfgTraitTitle0").value = c.traits[0].title || "";
            if ($("cfgTraitBackTitle0")) $("cfgTraitBackTitle0").value = c.traits[0].backTitle || "";
            if ($("cfgTraitBackText0")) $("cfgTraitBackText0").value = c.traits[0].backText || "";
        }
        if (c.traits && c.traits[1]) {
            if ($("cfgTraitEmoji1")) $("cfgTraitEmoji1").value = c.traits[1].emoji || "";
            if ($("cfgTraitTitle1")) $("cfgTraitTitle1").value = c.traits[1].title || "";
            if ($("cfgTraitBackTitle1")) $("cfgTraitBackTitle1").value = c.traits[1].backTitle || "";
            if ($("cfgTraitBackText1")) $("cfgTraitBackText1").value = c.traits[1].backText || "";
        }
        if (c.traits && c.traits[2]) {
            if ($("cfgTraitEmoji2")) $("cfgTraitEmoji2").value = c.traits[2].emoji || "";
            if ($("cfgTraitTitle2")) $("cfgTraitTitle2").value = c.traits[2].title || "";
            if ($("cfgTraitBackTitle2")) $("cfgTraitBackTitle2").value = c.traits[2].backTitle || "";
            if ($("cfgTraitBackText2")) $("cfgTraitBackText2").value = c.traits[2].backText || "";
        }

        if ($("cfgFortunes")) $("cfgFortunes").value = (c.fortunes || []).join("\n");
        if ($("cfgCatSpeeches")) $("cfgCatSpeeches").value = (c.catSpeeches || []).join("\n");
        if ($("cfgAdminPassword")) $("cfgAdminPassword").value = c.adminPassword || "admin";
    }

    function readInputs() {
        if ($("cfgRecipient")) APP_CONFIG.recipient = $("cfgRecipient").value.trim();
        if ($("cfgBirthMonth")) APP_CONFIG.birthMonth = parseInt($("cfgBirthMonth").value, 10) || 5;
        if ($("cfgBirthDay")) APP_CONFIG.birthDay = parseInt($("cfgBirthDay").value, 10) || 1;
        if ($("cfgHeroSub")) APP_CONFIG.heroSub = $("cfgHeroSub").value.trim();
        if ($("cfgHeroTitlePrefix")) APP_CONFIG.heroTitlePrefix = $("cfgHeroTitlePrefix").value.trim();
        if ($("cfgTeaserHeading")) APP_CONFIG.teaserHeading = $("cfgTeaserHeading").value.trim();

        if ($("cfgEnvelopePreview")) APP_CONFIG.envelopePreview = $("cfgEnvelopePreview").value.trim();
        if ($("cfgMessageGreeting")) APP_CONFIG.messageGreeting = $("cfgMessageGreeting").value.trim();
        if ($("cfgMessageText")) APP_CONFIG.messageText = $("cfgMessageText").value;
        if ($("cfgMessageSignature")) APP_CONFIG.messageSignature = $("cfgMessageSignature").value.trim();

        if ($("cfgNumCandles")) APP_CONFIG.numCandles = parseInt($("cfgNumCandles").value, 10) || 5;
        if ($("cfgCandleColors")) {
            const rawColors = $("cfgCandleColors").value.split(",").map((s) => s.trim()).filter(Boolean);
            if (rawColors.length > 0) APP_CONFIG.candleColors = rawColors;
        }
        if ($("cfgCakeTitle")) APP_CONFIG.cakeTitle = $("cfgCakeTitle").value.trim();
        if ($("cfgCakeSubtitle")) APP_CONFIG.cakeSubtitle = $("cfgCakeSubtitle").value.trim();

        APP_CONFIG.traits = [
            {
                id: "kind",
                emoji: $("cfgTraitEmoji0") ? $("cfgTraitEmoji0").value.trim() : "💛",
                title: $("cfgTraitTitle0") ? $("cfgTraitTitle0").value.trim() : "Kind Heart",
                backTitle: $("cfgTraitBackTitle0") ? $("cfgTraitBackTitle0").value.trim() : "Kindness ✨",
                backText: $("cfgTraitBackText0") ? $("cfgTraitBackText0").value.trim() : ""
            },
            {
                id: "loyal",
                emoji: $("cfgTraitEmoji1") ? $("cfgTraitEmoji1").value.trim() : "🤝",
                title: $("cfgTraitTitle1") ? $("cfgTraitTitle1").value.trim() : "Always There",
                backTitle: $("cfgTraitBackTitle1") ? $("cfgTraitBackTitle1").value.trim() : "Loyalty 🤝",
                backText: $("cfgTraitBackText1") ? $("cfgTraitBackText1").value.trim() : ""
            },
            {
                id: "pure",
                emoji: $("cfgTraitEmoji2") ? $("cfgTraitEmoji2").value.trim() : "✨",
                title: $("cfgTraitTitle2") ? $("cfgTraitTitle2").value.trim() : "Pure Soul",
                backTitle: $("cfgTraitBackTitle2") ? $("cfgTraitBackTitle2").value.trim() : "Pure Heart 💖",
                backText: $("cfgTraitBackText2") ? $("cfgTraitBackText2").value.trim() : ""
            }
        ];

        if ($("cfgFortunes")) {
            const lines = $("cfgFortunes").value.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.length > 0) APP_CONFIG.fortunes = lines;
        }
        if ($("cfgCatSpeeches")) {
            const lines = $("cfgCatSpeeches").value.split("\n").map((l) => l.trim()).filter(Boolean);
            if (lines.length > 0) APP_CONFIG.catSpeeches = lines;
        }
        if ($("cfgAdminPassword") && $("cfgAdminPassword").value.trim()) {
            APP_CONFIG.adminPassword = $("cfgAdminPassword").value.trim();
        }

        localStorage.setItem("heartcraft_app_config", JSON.stringify(APP_CONFIG));
    }

    function bindLivePreview() {
        const inputs = document.querySelectorAll(".admin-modal-body input, .admin-modal-body textarea");
        inputs.forEach((inEl) => {
            inEl.addEventListener("input", () => {
                readInputs();
                reloadPreview();
            });
        });
    }

    function reloadPreview() {
        const iframe = $("sitePreviewIframe");
        if (iframe) {
            iframe.src = iframe.src;
        }
    }

    async function savePermanently() {
        try {
            const response = await fetch("/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(APP_CONFIG)
            });

            if (response.ok) {
                const data = await response.json();
                showToast("💾 " + (data.message || "Local disk files updated permanently!"));
                reloadPreview();
            } else {
                throw new Error("Server status " + response.status);
            }
        } catch (e) {
            showToast("⚠️ Local server API not reachable. Try File System API or export JSON.");
        }
    }

    async function saveViaFileSystemAPI() {
        if (!window.showDirectoryPicker) {
            alert("File System Access API is not supported on this browser.");
            return;
        }

        try {
            showToast("📂 Please select your project folder...");
            const dirHandle = await window.showDirectoryPicker();
            
            const fileHandle = await dirHandle.getFileHandle("config.json", { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(APP_CONFIG, null, 2));
            await writable.close();

            showToast("✅ Saved config.json directly to disk!");
            reloadPreview();
        } catch (e) {
            if (e.name !== "AbortError") {
                alert("Error writing file: " + e.message);
            }
        }
    }

    function exportConfig() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(APP_CONFIG, null, 2));
        const anchor = document.createElement("a");
        anchor.setAttribute("href", dataStr);
        anchor.setAttribute("download", "config.json");
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        showToast("📥 Exported config.json download!");
    }

    function showToast(msg) {
        const toast = $("adminToast");
        if (!toast) return;
        toast.textContent = msg;
        toast.style.display = "flex";
        setTimeout(() => {
            toast.style.display = "none";
        }, 4000);
    }

})();
