/* ===================== Utilitaires communs ===================== */

function currentCropSlug(){
    return localStorage.getItem("plantix_current_crop") || "poire";
  }
  function setCurrentCropSlug(slug){
    localStorage.setItem("plantix_current_crop", slug);
  }
  
  /* Injecte la barre de navigation basse (3 onglets) */
  function renderBottomNav(active){
    const tabs = [
      { id: "profile", href: "profile.html", icon: "👤", label: "ملفك الشخصي" },
      { id: "forum",   href: "forum.html",   icon: "💬", label: "المنتدى" },
      { id: "crops",   href: "index.html",   icon: "🌱", label: "محاصيلك" },
    ];
    const nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.innerHTML = tabs.map(t => `
      <a href="${t.href}" class="${t.id===active ? 'active':''}">
        <span class="icon">${t.icon}</span>
        <span class="pill">${t.label}</span>
      </a>
    `).join("");
    document.body.appendChild(nav);
  }
  
  /* Injecte l'entête avec puce de culture optionnelle */
  function renderTopbar({ title, showCropChip = false, backHref = null }){
    const bar = document.createElement("div");
    bar.className = "topbar";
    bar.innerHTML = `
      ${showCropChip ? `<button class="crop-chip" id="cropChipBtn"></button>` : `<span></span>`}
      <h1>${title}</h1>
      ${backHref ? `<a class="back" href="${backHref}">→</a>` : `<span class="back" style="visibility:hidden">→</span>`}
    `;
    document.body.prepend(bar);
  
    if (showCropChip){
      const btn = bar.querySelector("#cropChipBtn");
      const refresh = () => {
        const c = getCropBySlug(currentCropSlug());
        btn.innerHTML = `<span>${c.emoji}</span><span>${c.name}</span><span class="arrow">▾</span>`;
      };
      refresh();
      btn.addEventListener("click", () => openCropPicker(refresh));
    }
  }
  
  /* ===================== Sélecteur de culture (modale) ===================== */
  function openCropPicker(onPick){
    let overlay = document.getElementById("cropPickerOverlay");
    if (!overlay){
      overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.id = "cropPickerOverlay";
      overlay.innerHTML = `
        <div class="sheet">
          <div class="handle"></div>
          <h2 style="margin:0 0 14px;">حدد محصولك</h2>
          <div class="search-box">
            <span>🔍</span>
            <input type="text" id="cropSearchInput" placeholder="بحث">
          </div>
          <div class="notice">ⓘ هذه الميزة متاحة فقط لمجموعة محدودة من المحاصيل.</div>
          <div class="crop-grid" id="cropGrid"></div>
          <button class="btn btn-ghost" style="margin-top:18px;" id="cropCancelBtn">إلغاء</button>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
      overlay.querySelector("#cropCancelBtn").addEventListener("click", () => overlay.classList.remove("open"));
      overlay.querySelector("#cropSearchInput").addEventListener("input", (e) => paintCropGrid(e.target.value, onPick));
    }
    paintCropGrid("", onPick);
    overlay.classList.add("open");
  }
  
  function paintCropGrid(filter, onPick){
    const grid = document.getElementById("cropGrid");
    const f = (filter || "").trim();
    const list = CROPS.filter(c => c.name.includes(f));
    grid.innerHTML = list.map(c => `
      <div class="crop-tile" data-slug="${c.slug}">
        <div class="emoji">${c.emoji}</div>
        <span>${c.name}</span>
      </div>
    `).join("") || `<p class="muted">لا توجد نتائج</p>`;
  
    grid.querySelectorAll(".crop-tile").forEach(tile => {
      tile.addEventListener("click", () => {
        setCurrentCropSlug(tile.dataset.slug);
        document.getElementById("cropPickerOverlay").classList.remove("open");
        if (typeof onPick === "function") onPick();
        if (typeof window.onCropChanged === "function") window.onCropChanged();
      });
    });
  }
  
  /* ===================== Fiche de retour (feedback) ===================== */
  function openFeedbackSheet(){
    let overlay = document.getElementById("feedbackOverlay");
    if (!overlay){
      overlay = document.createElement("div");
      overlay.className = "overlay";
      overlay.id = "feedbackOverlay";
      overlay.innerHTML = `
        <div class="sheet">
          <div class="handle"></div>
          <h2 style="margin:0 0 6px;">يسعدنا سماع ذلك! 😀</h2>
          <p class="muted" style="margin-top:0;">يرجى تحديد الإجابات التي تنطبق على حالتك</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0;">
            ${["المعلومات كانت مفيدة","النتيجة كانت واضحة","كان سهل الاستخدام","أخرى"].map(t=>`<span class="chip" data-fb>${t}</span>`).join("")}
          </div>
          <textarea placeholder="أي شيء آخر تريد ذكره؟ (اختياري)"></textarea>
          <button class="btn btn-primary" style="margin-top:16px;" id="fbSend">إرسال</button>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.classList.remove("open"); });
      overlay.querySelectorAll("[data-fb]").forEach(chip => chip.addEventListener("click", () => chip.classList.toggle("on")));
      overlay.querySelector("#fbSend").addEventListener("click", () => {
        overlay.classList.remove("open");
      });
    }
    overlay.classList.add("open");
  }
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") document.querySelectorAll(".overlay.open").forEach(o => o.classList.remove("open"));
  });