/* ==========================================================================
   The Goblin's Guide — app logic.
   Map + markers, search/filter, geolocation "Near You" list, planning mode.
   ========================================================================== */

(function () {
  "use strict";

  const LONDON_CENTRE = [51.5107, -0.1246]; // Trafalgar Square-ish
  const WALK_M_PER_MIN = 80;

  // ---- state ----
  let userLoc = null;          // {lat, lng} or null
  let geoStatus = "idle";      // idle | asking | ok | denied | unsupported
  let searchTerm = "";
  let typeFilter = "all";      // all | pub | bar
  let bestOnly = false;
  let nearSort = "near";       // near | best
  let planPoint = null;        // {lat, lng} or null
  let planRadius = 800;
  let planActive = false;

  // ---- rating → colour / size ----
  // continuous spectrum: full red at ≤3.5, through orange/amber, to full green
  // at ≥4.7. The exponent keeps green scarce — most pubs sit in 4.0–4.5, so a
  // linear ramp would paint nearly everything greenish.
  function ratingColor(r) {
    if (r == null) return "#8a63ad"; // unrated OSM entries
    const x = Math.max(0, Math.min(1, (r - 3.5) / (4.7 - 3.5)));
    const t = Math.pow(x, 1.6);
    return `hsl(${Math.round(t * 125)}, 78%, ${Math.round(48 - t * 6)}%)`;
  }
  function ratingSize(r) {
    // 3.8 → ~24px, 4.4 → ~36px, 4.7 → ~42px
    const s = 18 + (r - 3.5) * 20;
    return Math.max(20, Math.min(46, Math.round(s)));
  }
  function stars(r) {
    const full = Math.round(r);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  // ---- distance helpers ----
  function haversineM(a, b) {
    const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
    const s =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function fmtDist(m) {
    return m < 950 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1)} km`;
  }
  function walkMins(m) {
    return Math.max(1, Math.round(m / WALK_M_PER_MIN));
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---- filtering ----
  function matchesFilters(p) {
    if (typeFilter !== "all" && p.type !== typeFilter) return false;
    if (bestOnly && p.rating < 4.4) return false;
    if (searchTerm) {
      const hay = (p.name + " " + p.area + " " + p.keywords.join(" ") + " " + p.desc).toLowerCase();
      if (!hay.includes(searchTerm)) return false;
    }
    return true;
  }
  function visiblePubs() {
    return ALL.filter(matchesFilters);
  }

  // ==========================================================================
  // Dataset: curated (rated) + full OSM coverage (unrated)
  // ==========================================================================
  const normName = (s) =>
    s.toLowerCase().replace(/^(the|ye olde?)\s+/, "").replace(/[^a-z0-9]/g, "");
  const curatedKeys = PUBS.map((p) => ({ key: normName(p.name), lat: p.lat, lng: p.lng }));
  const EXTRAS = (typeof OSM_PUBS === "undefined" ? [] : OSM_PUBS)
    // drop OSM entries the curated list already covers (same name within 300 m)
    .filter((o) => {
      const k = normName(o.name);
      return !curatedKeys.some((c) => c.key === k && haversineM(c, o) < 300);
    })
    .map((o) => ({ ...o, area: "", desc: "", rating: null }));
  const ALL = PUBS.concat(EXTRAS);
  ALL.forEach((p, i) => (p._idx = i)); // stable id — names can repeat (two Doves)

  // ==========================================================================
  // Map
  // ==========================================================================
  const map = L.map("map", { zoomControl: false, attributionControl: true })
    .setView(LONDON_CENTRE, 13);
  L.control.zoom({ position: "topright" }).addTo(map);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }).addTo(map);

  let youMarker = null;
  let planMarker = null;
  let planCircle = null;

  function ratingBadge(p) {
    return p.rating != null
      ? `<span class="rating-badge" style="background:${ratingColor(p.rating)}">${p.rating.toFixed(1)}</span>`
      : `<span class="rating-badge unrated">&mdash;</span>`;
  }

  function popupHtml(p) {
    const dist = userLoc ? haversineM(userLoc, p) : null;
    const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
    const badge = p.rating != null
      ? `<span class="rating-badge" style="background:${ratingColor(p.rating)}">${p.rating.toFixed(1)} ${stars(p.rating)}</span>`
      : `<span class="rating-badge unrated">unrated</span>`;
    return `
      <div class="pop-name">${escapeHtml(p.name)}</div>
      <div class="pop-meta">
        ${badge}
        &nbsp;${escapeHtml(p.area || "London")} &middot; ${p.type}
        ${dist != null ? ` &middot; ${fmtDist(dist)} (&#128694; ${walkMins(dist)} min)` : ""}
      </div>
      ${p.desc ? `<div class="pop-desc">${escapeHtml(p.desc)}</div>` : ""}
      <div>${p.keywords.map((k) => `<span class="kw">${escapeHtml(k)}</span>`).join("")}</div>
      <div class="pop-links"><a href="${gmaps}" target="_blank" rel="noopener">&#129517; Walking directions</a></div>`;
  }

  // full-coverage OSM layer: thousands of small dots, so draw them on canvas
  const canvasRenderer = L.canvas({ padding: 0.4 });
  EXTRAS.forEach((p) => {
    const m = L.circleMarker([p.lat, p.lng], {
      renderer: canvasRenderer,
      radius: 4.5,
      color: "#241333",
      weight: 1,
      fillColor: "#8a63ad",
      fillOpacity: 0.8,
    }).addTo(map);
    m.bindPopup(() => popupHtml(p), { maxWidth: 290 });
    p._marker = m;
  });

  PUBS.forEach((p) => {
    const size = ratingSize(p.rating);
    const icon = L.divIcon({
      className: "",
      html: `<div class="pub-marker${p.type === "bar" ? " bar-type" : ""}"
                  style="width:${size}px;height:${size}px;background:${ratingColor(p.rating)};
                         font-size:${Math.max(9, size * 0.34)}px">
               ${size >= 30 ? p.rating.toFixed(1) : ""}
             </div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
    const m = L.marker([p.lat, p.lng], {
      icon,
      // better pubs sit on top of the pile
      zIndexOffset: Math.round(p.rating * 100),
      title: p.name,
    }).addTo(map);
    m.bindPopup(() => popupHtml(p), { maxWidth: 290 });
    p._marker = m;
  });

  function refreshMarkers() {
    let shown = 0;
    ALL.forEach((p) => {
      const show = matchesFilters(p);
      if (show) shown++;
      if (p.rating != null) {
        const el = p._marker.getElement();
        if (!el) return;
        el.querySelector(".pub-marker").classList.toggle("dim", !show);
      } else {
        p._marker.setStyle(
          show ? { opacity: 1, fillOpacity: 0.8 } : { opacity: 0.05, fillOpacity: 0.05 }
        );
      }
    });
    document.getElementById("result-count").textContent =
      shown === ALL.length ? `${shown} spots` : `${shown} of ${ALL.length}`;
  }

  function focusPub(p) {
    switchView("map");
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 16), { duration: 0.7 });
    setTimeout(() => p._marker.openPopup(), 750);
  }

  // ==========================================================================
  // Geolocation
  // ==========================================================================
  function locate(pan) {
    if (!("geolocation" in navigator)) {
      geoStatus = "unsupported";
      renderNearList();
      return;
    }
    geoStatus = "asking";
    renderNearList();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        geoStatus = "ok";
        if (youMarker) {
          youMarker.setLatLng([userLoc.lat, userLoc.lng]);
        } else {
          youMarker = L.marker([userLoc.lat, userLoc.lng], {
            icon: L.divIcon({ className: "", html: '<div class="you-marker"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
            zIndexOffset: 1000,
            title: "You are here",
          }).addTo(map);
        }
        if (pan) map.flyTo([userLoc.lat, userLoc.lng], 15, { duration: 0.8 });
        renderNearList();
      },
      () => {
        geoStatus = "denied";
        renderNearList();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  document.getElementById("locate-btn").addEventListener("click", () => locate(true));

  // ==========================================================================
  // Near You list
  // ==========================================================================
  function nearOrigin() {
    return userLoc || { lat: LONDON_CENTRE[0], lng: LONDON_CENTRE[1] };
  }

  function renderNearList() {
    const statusEl = document.getElementById("near-status");
    const listEl = document.getElementById("near-list");

    const msgs = {
      idle: "",
      asking: "Summoning your location…",
      ok: "Sorted from where you stand. Choose wisely, mortal.",
      denied: "Location denied — showing distances from central London. Enable location for the real magic.",
      unsupported: "No location powers on this device — showing central London.",
    };
    statusEl.textContent = msgs[geoStatus] || "";

    const origin = nearOrigin();
    const rows = visiblePubs()
      .map((p) => ({ p, dist: haversineM(origin, p) }))
      .sort((a, b) =>
        nearSort === "near"
          ? a.dist - b.dist
          : // "best worth the walk": rating dominates, distance tie-breaks it down;
            // unrated spots count as a middling 3.5
            ((b.p.rating ?? 3.5) * 2 - b.dist / 1000) - ((a.p.rating ?? 3.5) * 2 - a.dist / 1000)
      )
      .slice(0, 40);

    listEl.innerHTML = rows.length
      ? rows
          .map(({ p, dist }) => {
            const color = ratingColor(p.rating);
            return `
        <div class="pub-card" style="border-left-color:${color}" data-idx="${p._idx}">
          <div class="card-top">
            <span class="card-name">${escapeHtml(p.name)}</span>
            ${ratingBadge(p)}
          </div>
          <div class="card-meta">
            <span class="type-tag">${p.type}</span>
            ${escapeHtml(p.area || "London")} &middot; ${fmtDist(dist)} &middot; &#128694; ${walkMins(dist)} min
          </div>
          ${p.keywords.length ? `<div class="card-kws">${p.keywords.map((k) => `<span class="kw">${escapeHtml(k)}</span>`).join("")}</div>` : ""}
        </div>`;
          })
          .join("")
      : '<p class="plan-empty">Nothing matches, Lager Boy. Broaden your search.</p>';

    listEl.querySelectorAll(".pub-card").forEach((card) => {
      card.addEventListener("click", () => {
        const p = ALL[Number(card.dataset.idx)];
        if (p) focusPub(p);
      });
    });
  }

  document.querySelectorAll(".sort-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".sort-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      nearSort = btn.dataset.sort;
      renderNearList();
    });
  });

  // ==========================================================================
  // Planning mode
  // ==========================================================================
  const planPanel = document.getElementById("plan-panel");
  const areaSelect = document.getElementById("plan-area");

  // populate area dropdown with centroids from the data
  (function () {
    const areas = {};
    PUBS.forEach((p) => {
      (areas[p.area] ||= []).push(p);
    });
    Object.keys(areas)
      .sort()
      .forEach((a) => {
        const opt = document.createElement("option");
        opt.value = a;
        opt.textContent = `${a} (${areas[a].length})`;
        areaSelect.appendChild(opt);
      });
  })();

  function setPlanPoint(lat, lng, zoomTo) {
    planPoint = { lat, lng };
    if (!planMarker) {
      planMarker = L.marker([lat, lng], {
        icon: L.divIcon({ className: "", html: '<div class="plan-marker">&#128204;</div>', iconSize: [30, 30], iconAnchor: [15, 28] }),
        draggable: true,
        zIndexOffset: 1100,
      }).addTo(map);
      planMarker.on("dragend", () => {
        const ll = planMarker.getLatLng();
        setPlanPoint(ll.lat, ll.lng, false);
      });
    } else {
      planMarker.setLatLng([lat, lng]);
    }
    if (!planCircle) {
      planCircle = L.circle([lat, lng], {
        radius: planRadius, color: "#f28c28", weight: 1.5,
        fillColor: "#f28c28", fillOpacity: 0.08, dashArray: "6 6",
      }).addTo(map);
    } else {
      planCircle.setLatLng([lat, lng]);
    }
    if (zoomTo) map.flyTo([lat, lng], 15, { duration: 0.7 });
    renderPlanResults();
  }

  function clearPlan() {
    planActive = false;
    planPanel.classList.add("hidden");
    if (planMarker) { map.removeLayer(planMarker); planMarker = null; }
    if (planCircle) { map.removeLayer(planCircle); planCircle = null; }
    planPoint = null;
  }

  function renderPlanResults() {
    const el = document.getElementById("plan-results");
    if (!planPoint) {
      el.innerHTML = '<p class="plan-empty">No pin yet. Tap the map where you’ll be.</p>';
      return;
    }
    if (planCircle) planCircle.setRadius(planRadius);
    const inReach = visiblePubs()
      .map((p) => ({ p, dist: haversineM(planPoint, p) }))
      .filter((r) => r.dist <= planRadius)
      // rated first (best on top), then unrated by distance
      .sort((a, b) => (b.p.rating ?? 0) - (a.p.rating ?? 0) || a.dist - b.dist);
    const rows = inReach.slice(0, 12);
    const more = inReach.length - rows.length;

    el.innerHTML = rows.length
      ? rows
          .map(({ p, dist }) => `
        <div class="plan-result" data-idx="${p._idx}">
          ${ratingBadge(p)}
          <span class="name">${escapeHtml(p.name)}${p.keywords[0] ? ` <span class="dist">&middot; ${escapeHtml(p.keywords[0])}</span>` : ""}</span>
          <span class="dist">${fmtDist(dist)}</span>
        </div>`)
          .join("") +
        (more > 0 ? `<p class="plan-empty">&hellip;plus ${more} more within reach &mdash; zoom the map to browse them.</p>` : "")
      : '<p class="plan-empty">Not a decent drop within reach. Widen the radius, mortal.</p>';

    el.querySelectorAll(".plan-result").forEach((row) => {
      row.addEventListener("click", () => {
        const p = ALL[Number(row.dataset.idx)];
        if (p) { map.flyTo([p.lat, p.lng], 16, { duration: 0.6 }); p._marker.openPopup(); }
      });
    });
  }

  map.on("click", (e) => {
    if (planActive) setPlanPoint(e.latlng.lat, e.latlng.lng, false);
  });

  areaSelect.addEventListener("change", () => {
    const area = areaSelect.value;
    if (!area) return;
    const members = PUBS.filter((p) => p.area === area);
    const lat = members.reduce((s, p) => s + p.lat, 0) / members.length;
    const lng = members.reduce((s, p) => s + p.lng, 0) / members.length;
    setPlanPoint(lat, lng, true);
  });

  const radiusInput = document.getElementById("plan-radius");
  radiusInput.addEventListener("input", () => {
    planRadius = Number(radiusInput.value);
    document.getElementById("radius-val").textContent =
      planRadius < 1000 ? `${planRadius} m` : `${(planRadius / 1000).toFixed(2).replace(/0+$/, "").replace(/\.$/, "")} km`;
    renderPlanResults();
  });

  document.getElementById("plan-close").addEventListener("click", () => {
    clearPlan();
    setActiveTab("map");
  });

  // ==========================================================================
  // Tabs / views
  // ==========================================================================
  function setActiveTab(name) {
    document.querySelectorAll("#tabbar .tab").forEach((t) =>
      t.classList.toggle("active", t.dataset.view === name));
  }

  function switchView(name) {
    setActiveTab(name);
    if (name === "plan") {
      // plan lives on the map view with its panel open
      document.getElementById("view-map").classList.add("active");
      document.getElementById("view-near").classList.remove("active");
      planActive = true;
      planPanel.classList.remove("hidden");
      map.invalidateSize();
      if (!planPoint && userLoc) setPlanPoint(userLoc.lat, userLoc.lng, true);
      renderPlanResults();
      return;
    }
    planActive = false;
    if (name !== "map") planPanel.classList.add("hidden");
    document.getElementById("view-map").classList.toggle("active", name === "map");
    document.getElementById("view-near").classList.toggle("active", name === "near");
    if (name === "map") {
      map.invalidateSize();
      if (planPoint) planPanel.classList.remove("hidden"), (planActive = true);
    }
    if (name === "near") {
      renderNearList();
      if (geoStatus === "idle") locate(false);
    }
  }

  document.querySelectorAll("#tabbar .tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  // ==========================================================================
  // Search & filters
  // ==========================================================================
  const searchInput = document.getElementById("search");
  let searchTimer = null;
  searchInput.addEventListener("input", () => {
    // debounced — restyling ~4.5k markers per keystroke would stutter on phones
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchTerm = searchInput.value.trim().toLowerCase();
      refreshMarkers();
      renderNearList();
      if (planActive) renderPlanResults();
    }, 150);
  });
  document.getElementById("clear-search").addEventListener("click", () => {
    searchInput.value = "";
    searchTerm = "";
    refreshMarkers();
    renderNearList();
    if (planActive) renderPlanResults();
    searchInput.focus();
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      if (chip.id === "best-only") {
        bestOnly = !bestOnly;
        chip.classList.toggle("active", bestOnly);
      } else {
        document.querySelectorAll(".filter-chip[data-type]").forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        typeFilter = chip.dataset.type;
      }
      refreshMarkers();
      renderNearList();
      if (planActive) renderPlanResults();
    });
  });

  // legend collapse
  document.getElementById("legend-toggle").addEventListener("click", () => {
    document.getElementById("legend").classList.toggle("collapsed");
  });

  // ---- boot ----
  refreshMarkers();
  renderNearList();
  locate(true); // ask politely on load; falls back gracefully if denied
})();
