// ================== Cấu hình ==================
const RANK_API_URL = "https://f1oj97uhee.execute-api.ap-southeast-1.amazonaws.com/get";

// ================== NAV + SCROLL ==================
document.querySelectorAll("[data-scroll]").forEach((el) => {
    el.addEventListener("click", () => {
        const target = document.querySelector(el.getAttribute("data-scroll"));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 72,
                behavior: "smooth",
            });
        }
    });
});

// nhớ include đầy đủ các section có trên trang
const sections = [
    "#hero",
    "#about",
    "#features",
    "#leaderboard",
    "#download",
    "#workflow",
    "#team",
];

const navLinks = document.querySelectorAll(".nav-link");

function updateActiveNav() {
    const scrollPos = window.scrollY || window.pageYOffset;
    let currentId = "#hero";

    sections.forEach((id) => {
        const el = document.querySelector(id);
        if (el && scrollPos >= el.offsetTop - 120) {
            currentId = id;
        }
    });

    navLinks.forEach((link) => {
        const target = link.getAttribute("data-scroll");
        if (target === currentId || (currentId === "#hero" && target === "#top")) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

window.addEventListener("scroll", updateActiveNav);
updateActiveNav();

// ================== Nút lên đầu trang ==================
const scrollBtn = document.getElementById("scrollTopBtn");
if (scrollBtn) {
    window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
            scrollBtn.classList.add("visible");
        } else {
            scrollBtn.classList.remove("visible");
        }
    });

    scrollBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ================== Load TOP 3 từ API ==================
async function loadTopRanks() {
    const listEl = document.getElementById("top-rank-list");
    const loadingEl = document.getElementById("rank-loading");
    const errorEl = document.getElementById("rank-error");
    const debugEl = document.getElementById("rank-debug"); // có cũng được, không có thì bỏ qua

    if (!listEl || !loadingEl || !errorEl) return;

    loadingEl.hidden = false;
    errorEl.hidden = true;
    listEl.innerHTML = "";
    if (debugEl) debugEl.textContent = "";

    try {
        const res = await fetch(RANK_API_URL, { method: "GET" });

        if (!res.ok) {
            throw new Error("HTTP " + res.status);
        }

        const data = await res.json();
        console.log("Rank API data:", data);

        // API: { "ok": true, "ranking": [ { Username, Level, Rank }, ... ] }
        if (!data.ok || !Array.isArray(data.ranking)) {
            throw new Error("Dữ liệu không đúng format mong đợi");
        }

        // Sắp xếp theo Rank tăng dần rồi lấy 3 thằng đầu
        const items = data.ranking
            .slice()
            .sort((a, b) => (a.Rank ?? 9999) - (b.Rank ?? 9999));
        const top3 = items.slice(0, 3);

        if (debugEl) {
            debugEl.textContent =
                "Raw ranking từ API:\n" + JSON.stringify(top3, null, 2);
        }

        listEl.innerHTML = "";
        top3.forEach((item, index) => {
            const rank = item.Rank ?? index + 1;
            const name = item.Username ?? "Người chơi " + rank;
            const level = item.Level ?? null;

            const li = document.createElement("li");
            li.className = "rank-item";

            const left = document.createElement("div");
            left.className = "rank-left";

            const medal = document.createElement("div");
            medal.className = "rank-medal rank-" + (index + 1);
            medal.textContent = "#" + rank;

            const nameEl = document.createElement("div");
            nameEl.className = "rank-name";
            nameEl.textContent = name;

            left.appendChild(medal);
            left.appendChild(nameEl);

            const right = document.createElement("div");
            right.className = "rank-right";
            right.textContent =
                level != null ? "Level: " + level : "Top " + rank;

            li.appendChild(left);
            li.appendChild(right);

            listEl.appendChild(li);
        });

        loadingEl.hidden = true;
    } catch (err) {
        console.error("Lỗi khi tải rank:", err);
        loadingEl.hidden = true;
        errorEl.hidden = false;
        errorEl.textContent =
            "Không lấy được dữ liệu từ API. Chi tiết: " + err;

        if (debugEl) {
            debugEl.textContent =
                "Debug error:\n" +
                (err && err.stack ? err.stack : String(err));
        }
    }
}
// ================== Scroll reveal cho section / card ==================
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        ".section, .card, .hero-card, .download-card-main, .download-card-side, .leaderboard-card, .workflow-legend, .workflow-diagram-frame, .team-card"
    );

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("reveal", "reveal-visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
        }
    );

    revealTargets.forEach((el) => {
        // cho trạng thái ban đầu là .reveal (ẩn + dịch xuống)
        el.classList.add("reveal");
        observer.observe(el);
    });
}

// Gọi khi trang load xong
// Gọi khi trang load xong
document.addEventListener("DOMContentLoaded", () => {
    loadTopRanks();
    initScrollReveal();
});
// ================== Load Giftcode từ API ==================
const GIFTCODE_API_URL = "https://h1kdj88cck.execute-api.ap-southeast-1.amazonaws.com/giftcode/all";

async function loadGiftcodes() {
    const listEl = document.getElementById("giftcode-list");
    const loadingEl = document.getElementById("giftcode-loading");
    const errorEl = document.getElementById("giftcode-error");

    if (!listEl || !loadingEl || !errorEl) return;

    loadingEl.hidden = false;
    errorEl.hidden = true;
    listEl.innerHTML = "";

    try {
        const res = await fetch(GIFTCODE_API_URL, { method: "GET" });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const data = await res.json();
        if (!data.ok || !Array.isArray(data.codes)) throw new Error("Sai format API");

        listEl.innerHTML = "";

        data.codes.forEach(code => {
            const li = document.createElement("li");
            li.className = "giftcode-item";
            li.textContent = code;
            listEl.appendChild(li);
        });

        loadingEl.hidden = true;

    } catch (err) {
        loadingEl.hidden = true;
        errorEl.hidden = false;
        errorEl.textContent = "Không lấy được giftcode: " + err;
        console.error("Giftcode error:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadTopRanks();
    loadGiftcodes();  // ⬅ Thêm dòng này
    initScrollReveal();
});

