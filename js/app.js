/* ============================================================
   種德中藥行 · JUNG-DE — website application (plain JS, no build)
   ------------------------------------------------------------
   This file wires the design into a working, routable website.
   You normally won't need to touch this — edit js/data.js for
   content. Components below are faithful ports of the design
   system primitives (Button, LineButton, Tag, ProductCard …).
   ============================================================ */
(function () {
  "use strict";

  /* Content is loaded from the editable JSON files in content/ (managed by
     the /admin 後臺). D is filled in by init() before anything renders. */
  var D = {};

  /* Top navigation is structural (it maps to routes) so it lives in code,
     not in the 後臺 — changing it could break links. */
  var NAV = [
    { label: "首頁",        route: "home" },
    { label: "關於種德",     route: "about" },
    { label: "漢方茶品",     route: "category", param: "tea" },
    { label: "漢方佳餚",     route: "category", param: "food" },
    { label: "藥草香袋",     route: "category", param: "sachet" },
    { label: "漢方主題文章",  route: "articles" },
    { label: "客製化服務",    route: "content", param: "service" },
  ];

  /* ---- tiny hyperscript helper ---------------------------- */
  function h(tag, attrs) {
    var el = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === "class") el.className = v;
      else if (k === "style") el.setAttribute("style", v);
      else if (k === "html") el.innerHTML = v;
      else if (k === "onClick") el.addEventListener("click", v);
      else if (k === "onSubmit") el.addEventListener("submit", v);
      else el.setAttribute(k, v);
    });
    var kids = Array.prototype.slice.call(arguments, 2);
    append(el, kids);
    return el;
  }
  function append(el, kids) {
    kids.forEach(function (c) {
      if (c == null || c === false) return;
      if (Array.isArray(c)) append(el, c);
      else if (typeof c === "string" || typeof c === "number") el.appendChild(document.createTextNode(String(c)));
      else el.appendChild(c);
    });
  }
  function icon(name, style) { return h("i", { class: name, "aria-hidden": "true", style: style }); }
  function bg(src) { return "background-image:url(" + src + ")"; }

  /* ---- routing -------------------------------------------- */
  function routeToHash(route, param) {
    switch (route) {
      case "home": return "#/";
      case "about": return "#/about";
      case "category": return "#/category/" + param;
      case "articles": return "#/articles";
      case "content": return "#/content/" + param;
      case "product": return "#/product/" + (param && param.id ? param.id : param);
      default: return "#/";
    }
  }
  function parseHash() {
    var raw = (location.hash || "").replace(/^#\/?/, "");
    var parts = raw.split("/").filter(Boolean);
    if (parts.length === 0) return { route: "home" };
    var head = parts[0];
    if (head === "about") return { route: "about" };
    if (head === "articles") return { route: "articles" };
    if (head === "category") return { route: "category", param: parts[1] || "tea" };
    if (head === "content") return { route: "content", param: parts[1] || "service" };
    if (head === "product") return { route: "product", param: parts[1] };
    return { route: "home" };
  }
  function navigate(route, param) { location.hash = routeToHash(route, param); }
  function navLinkProps(route, param) {
    return { href: routeToHash(route, param) };
  }

  /* =========================================================
     Components
     ========================================================= */
  function Button(opts) {
    opts = opts || {};
    var cls = "btn btn--" + (opts.variant || "primary") + (opts.size === "sm" ? " btn--sm" : "");
    var attrs = { class: cls };
    var tag = "button";
    if (opts.href) { tag = "a"; attrs.href = opts.href; }
    if (opts.onClick) attrs.onClick = opts.onClick;
    if (opts.disabled) attrs.disabled = "disabled";
    if (opts.type) attrs.type = opts.type;
    var kids = [];
    if (opts.icon && !opts.iconRight) kids.push(icon(opts.icon));
    kids.push(opts.label);
    if (opts.icon && opts.iconRight) kids.push(icon(opts.icon));
    return h.apply(null, [tag, attrs].concat(kids));
  }

  function LineButton(opts) {
    opts = opts || {};
    var cls = "line-btn" + (opts.variant === "outline" ? " line-btn--outline" : "") + (opts.size === "sm" ? " line-btn--sm" : "");
    return h("a", { class: cls, href: opts.href || D.line, target: "_blank", rel: "noopener" },
      icon("ri-line-fill"), opts.label || "加入 LINE 好友");
  }

  function Tag(text, variant, size) {
    return h("span", { class: "tag tag--" + (variant || "category") + (size === "lg" ? " tag--lg" : "") }, text);
  }

  function SectionHeading(opts) {
    var cls = "section-heading";
    if (opts.size === "sm") cls += " size-sm";
    if (opts.size === "lg") cls += " size-lg";
    if (opts.center) cls += " is-center";
    if (opts.onDark) cls += " on-dark";
    return h("header", { class: cls, style: opts.style },
      opts.eyebrow ? h("span", { class: "eyebrow" }, icon("ri-leaf-line"), opts.eyebrow) : null,
      h("h2", { class: "title" }, opts.title),
      opts.desc ? h("p", { class: "desc" }, opts.desc) : null);
  }

  function FeatureItem(o) {
    return h("div", { class: "feature-item" },
      h("span", { class: "fi-icon" }, icon(o.icon)),
      h("div", { class: "stack", style: "gap:2px;align-items:center" },
        h("span", { class: "fi-label" }, o.label),
        o.sub ? h("span", { class: "fi-sub" }, o.sub) : null));
  }

  function ProductCard(p) {
    var save = h("button", {
      class: "pc-save", "aria-label": "收藏",
      onClick: function (e) {
        e.stopPropagation(); e.preventDefault();
        var saved = save.classList.toggle("is-saved");
        save.firstChild.className = saved ? "ri-heart-3-fill" : "ri-heart-3-line";
      }
    }, icon("ri-heart-3-line"));

    var media = h("div", { class: "pc-media" },
      h("div", { class: "pc-img", style: bg(p.image) }),
      (p.tags && p.tags.length) ? h("div", { class: "pc-tags" }, p.tags.map(function (t) { return Tag(t, "property"); })) : null,
      save);

    var priceRow = (p.price != null) ? h("div", { class: "pc-price" },
      h("span", { class: "now" }, "NT " + p.price),
      (p.oldPrice != null) ? h("span", { class: "old" }, "NT " + p.oldPrice) : null) : null;

    return h("article", { class: "product-card", onClick: function () { navigate("product", p); } },
      media,
      h("div", { class: "pc-body" }, h("h3", { class: "pc-name" }, p.name), priceRow));
  }

  function ArticleCard(a, layout) {
    var row = layout === "row";
    return h("article", { class: "article-card " + (row ? "article-card--row" : "article-card--stacked") },
      h("div", { class: "ac-media", style: bg(a.image) }),
      h("div", { class: "ac-body" },
        h("div", { class: "ac-head" }, Tag(a.cat, "category"), h("h3", { class: "ac-title" }, a.title)),
        h("p", { class: "ac-excerpt" }, a.excerpt),
        h("div", { class: "ac-foot" },
          h("a", { class: "ac-more", href: "#/articles" }, "閱讀更多 ", icon("ri-arrow-right-line")))));
  }

  function Field(o) {
    var input = h("input", { type: o.type || "text", placeholder: o.placeholder || "", name: o.name || "" });
    if (o.required) input.setAttribute("required", "required");
    return h("label", { class: "field" },
      o.label ? h("span", {}, o.label) : null,
      h("div", { class: "field-control" }, o.icon ? icon(o.icon) : null, input));
  }

  function Blob(tone, size, pos) {
    return h("div", { class: "blob", "aria-hidden": "true",
      style: "width:" + size + "px;height:" + Math.round(size * 0.62) + "px;background:" + tone + ";" + (pos || "") });
  }
  function Wave(from, to, flip) {
    var w = h("div", { class: "wave" + (flip ? " flip" : ""), style: "background:" + from });
    w.innerHTML = '<svg viewBox="0 0 1440 90" preserveAspectRatio="none"><path d="M0,40 C320,100 760,0 1080,40 C1260,62 1380,52 1440,44 L1440,90 L0,90 Z" fill="' + to + '"/></svg>';
    return w;
  }
  function CircleImage(src, size, extra) {
    return h("div", { class: "circle-img", style: "width:" + size + "px;height:" + size + "px;" + bg(src) + ";" + (extra || "") });
  }
  function YearMark(text, extra) { return h("span", { class: "year-mark", style: extra }, text); }

  function CTABand(title, note) {
    return h("section", { class: "cta-band" },
      h("div", { class: "inner" },
        h("h2", {}, title || "想了解更多？用 LINE 跟我們聊聊"),
        LineButton({ label: "加入 LINE 好友" }),
        h("p", {}, note || ("本站不提供線上結帳，歡迎透過 LINE 或來電 " + D.shop.phone + " 詢問、訂購，亦可至門市自取。"))));
  }

  /* ---- Site header (shared, responsive) ------------------- */
  function SiteHeader(active, scrim) {
    var header = h("header", { class: "site-header " + (scrim ? "site-header--scrim" : "site-header--solid") });
    function isActive(item) {
      if (item.route !== active.route) return false;
      if (item.route === "category" || item.route === "content") return item.param === active.param;
      return true;
    }
    var navLinks = D.nav.map(function (item) {
      return h("a", Object.assign({ class: isActive(item) ? "is-active" : "" }, navLinkProps(item.route, item.param)), item.label);
    });
    var menuLinks = D.nav.map(function (item) {
      return h("a", Object.assign({ class: isActive(item) ? "is-active" : "" }, navLinkProps(item.route, item.param)), item.label);
    });
    var hamburger = h("button", { class: "hamburger", "aria-label": "選單",
      onClick: function () { header.classList.toggle("is-open"); } }, icon("ri-menu-line"));

    var inner = h("div", { class: "site-header__inner" },
      h("a", { class: "site-header__logo", href: "#/" }, h("img", { src: "assets/logo-green.png", alt: D.shop.name })),
      h("nav", { class: "site-nav" }, navLinks),
      h("span", { class: "site-header__spacer" }),
      h("div", { class: "site-header__actions" },
        h("button", { class: "site-header__search", "aria-label": "搜尋" }, icon("ri-search-line")),
        h("a", { class: "header-line", href: D.line, target: "_blank", rel: "noopener" },
          icon("ri-line-fill"),
          h("span", { class: "line-full" }, "LINE 諮詢"),
          h("span", { class: "line-short" }, "LINE")),
        hamburger));

    header.appendChild(inner);
    header.appendChild(h("nav", { class: "site-menu" }, menuLinks));
    return header;
  }

  /* ---- Site footer (shared) ------------------------------- */
  function SiteFooter() {
    var s = D.shop;
    var contacts = [
      { icon: "ri-map-pin-line", text: s.address },
      { icon: "ri-time-line", text: s.hoursWeekday },
      { icon: "ri-phone-line", text: s.phone },
    ];
    var columns = [
      { title: "關於種德", links: [
        { label: "品牌故事", route: "about" },
        { label: "百年傳承", route: "content", param: "heritage" },
        { label: "媒體採訪", route: "content", param: "press" },
        { label: "門市資訊", route: "home" },
      ] },
      { title: "漢方服務", links: [
        { label: "漢方茶品", route: "category", param: "tea" },
        { label: "漢方佳餚", route: "category", param: "food" },
        { label: "藥草香袋", route: "category", param: "sachet" },
        { label: "客製化服務", route: "content", param: "service" },
      ] },
    ];
    var brandCol = h("div", { class: "site-footer__brand" },
      h("h3", {}, s.name),
      h("ul", { class: "footer-contact" }, contacts.map(function (c) {
        return h("li", {}, h("span", { class: "fc-icon" }, icon(c.icon)), c.text);
      })),
      h("div", {}, LineButton({ size: "sm", label: "加入 LINE 好友" })));

    var cols = columns.map(function (col) {
      return h("nav", { class: "footer-col" },
        h("h4", {}, col.title),
        h("ul", {}, col.links.map(function (l) {
          return h("li", {}, h("a", navLinkProps(l.route, l.param), l.label));
        })));
    });

    return h("footer", { class: "site-footer" },
      h("div", { class: "site-footer__texture", "aria-hidden": "true" }),
      h.apply(null, ["div", { class: "site-footer__inner jd-footer-grid" }, brandCol].concat(cols)),
      h("div", { class: "site-footer__note" },
        h("p", {}, "本店僅提供 LINE 訂購與付款，恕不提供線上刷卡。歡迎來電 " + s.phone + " 或加入 LINE 好友洽詢。")));
  }

  /* =========================================================
     Screens
     ========================================================= */
  function HomeScreen() {
    var cats = [
      { key: "tea", name: "漢方茶品", image: "assets/photo-brew.png", desc: "可沖泡的小份量茶飲" },
      { key: "food", name: "漢方佳餚", image: "assets/photo-dining.png", desc: "藥食同源的家常進補" },
      { key: "sachet", name: "藥草香袋", image: "assets/photo-herbs.png", desc: "隨身安神的草本氣息" },
    ];
    var root = h("div", {});

    // Hero
    var hero = h("section", { class: "hero" },
      h("div", { class: "hero__bg", style: bg("assets/photo-store.png") }),
      h("div", { class: "hero__scrim", style: "background:linear-gradient(180deg, rgba(86,52,64,.55), rgba(86,52,64,.32) 40%, rgba(86,52,64,.6))" }),
      h("div", { class: "hero__content" },
        SiteHeader({ route: "home" }, true),
        h("div", { class: "hero-body" },
          h("span", { class: "since" }, "SINCE 1950"),
          h("h1", { html: "傳承老中醫的智慧，<br/>每一口都喝得到的溫柔呵護" }),
          h("p", {}, "近百年老店，佐以溫和漢方草本。我們從不做過多的推銷，只推薦最適合您的。"),
          h("div", { class: "hero-actions" },
            Button({ label: "了解種德中藥房", onClick: function () { navigate("about"); } }),
            LineButton({ label: "加入 LINE 好友" })))));
    root.appendChild(hero);

    // Benefits band
    root.appendChild(h("section", { class: "bg-card" },
      h("div", { class: "benefits" },
        FeatureItem({ icon: "ri-award-line", label: "三代傳承", sub: "有口皆碑" }),
        FeatureItem({ icon: "ri-shield-check-line", label: "嚴格把關", sub: "真材實料" }),
        FeatureItem({ icon: "ri-truck-line", label: "一兩天進貨", sub: "藥材新鮮" }),
        FeatureItem({ icon: "ri-line-fill", label: "加 LINE", sub: "領取好康" }))));

    // Product intro
    root.appendChild(h("section", { class: "bg-page rel clip" },
      Blob("var(--champagne-60)", 620, "right:-160px;top:40px"),
      h("div", { class: "page jd-split rel", style: "padding:var(--space-9) var(--space-5)" },
        h("div", { class: "media-rect", style: bg("assets/photo-brew.png") }),
        h("div", { class: "stack gap-3" },
          SectionHeading({ eyebrow: "商品介紹", title: "喝得到的新鮮與健康",
            desc: "老闆娘秉持著「種德」的信念，將大份量的漢方加以改良，變成小份量可沖泡的茶飲，經過多次試味、試飲、烹煮，調配最好喝、不苦澀的自然味道。" }),
          h("div", {}, Button({ variant: "secondary", icon: "ri-arrow-right-line", iconRight: true, label: "看看漢方茶品", onClick: function () { navigate("category", "tea"); } }))))));

    // 熱門商品
    root.appendChild(h("section", { class: "bg-card" },
      h("div", { class: "page", style: "padding:var(--space-9) var(--space-5)" },
        SectionHeading({ title: "熱門商品", size: "sm", style: "margin-bottom:var(--space-4)" }),
        h.apply(null, ["div", { class: "scroll-row" }].concat(D.products.slice(0, 6).map(ProductCard))))));

    // Categories
    root.appendChild(h("section", { class: "bg-alt rel clip" },
      h("div", { class: "page center-text", style: "padding:var(--space-9) var(--space-5)" },
        SectionHeading({ title: "商品分類", center: true, style: "margin-bottom:var(--space-6)" }),
        h.apply(null, ["div", { class: "cat-picker" }].concat(cats.map(function (c) {
          return h("button", { class: "cat-tile", onClick: function () { navigate("category", c.key); } },
            CircleImage(c.image, 180),
            h("span", { class: "cat-name" }, c.name),
            h("span", { class: "cat-desc" }, c.desc));
        }))))));

    // Articles preview
    root.appendChild(h("section", { class: "bg-card" },
      h("div", { class: "page", style: "padding:var(--space-9) var(--space-5)" },
        h("div", { class: "row wrap", style: "justify-content:space-between;align-items:flex-end;margin-bottom:var(--space-4);gap:16px" },
          SectionHeading({ eyebrow: "漢方主題文章", title: "養生知識，慢慢讀" }),
          Button({ variant: "ghost", icon: "ri-arrow-right-line", iconRight: true, label: "全部文章", onClick: function () { navigate("articles"); } })),
        h.apply(null, ["div", { class: "jd-grid-3" }].concat(D.articles.slice(0, 3).map(function (a) { return ArticleCard(a, "stacked"); }))))));

    // Store info
    root.appendChild(Wave("var(--surface-card)", "var(--bg-page)"));
    root.appendChild(h("section", { class: "bg-page" },
      h("div", { class: "page", style: "padding:var(--space-7) var(--space-5) var(--space-9)" },
        h("div", { class: "store-card jd-split-flush" },
          h("div", { class: "info" },
            SectionHeading({ title: "聯絡我們 / 門市資料",
              desc: "種德藥房位於樹林火車站對面，古樸的店內充滿著草本的氣息。歡迎客人來我們的店裡走走逛逛，一定會有意外的收穫！" }),
            h("ul", {},
              h("li", {}, icon("ri-map-pin-line"), D.shop.address),
              h("li", {}, icon("ri-time-line"), D.shop.hoursWeekday),
              h("li", {}, icon("ri-phone-line"), D.shop.phone)),
            h("div", {}, LineButton({ size: "sm", label: "用 LINE 詢問" }))),
          h("div", { class: "map", style: bg("assets/photo-map.png") })))));

    root.appendChild(SiteFooter());
    return root;
  }

  function AboutScreen() {
    var root = h("div", {}, SiteHeader({ route: "about" }, false));

    root.appendChild(h("section", { class: "bg-alt rel clip" },
      Blob("var(--champagne-100)", 680, "left:-200px;top:60px"),
      h("div", { class: "page rel", style: "padding:var(--space-9) var(--space-5)" },
        h("span", { style: "font-family:var(--font-latin);letter-spacing:.2em;color:var(--redwood);font-weight:700;font-size:var(--fs-sm)" }, "種德藥房 JUNG-DE"),
        h("h1", { style: "margin:var(--space-2) 0 var(--space-4)" }, "近百年老店，傳承古法"),
        h("p", { style: "max-width:62ch;font-size:var(--fs-lg);line-height:1.9;color:var(--text-body)" },
          "種德藥房成立於1950年，為黃自強中醫師白手起家，24歲即開始行醫，秉持著「為大眾種下福田，以德待人」的期許醫治病人。如今由第三代老闆娘繼承種德的傳統，為客人把關好每一份漢方，從不做過多的推銷，只推薦最適合的，溫柔呵護客人的每一份健康。"))));

    var entries = [
      { route: "heritage", img: "assets/photo-family.png", eyebrow: "種德的故事", title: "百年傳承", body: "從1950年白手起家，到三代同心的初心不變。看看種德一路走來的足跡。", cta: "查看完整年表" },
      { route: "press", img: "assets/photo-store.png", eyebrow: "媒體採訪", title: "古樸典雅，受邀拍攝", body: "曾受邀電視台採訪，也參與導演吳念真的廣告拍攝。看看鏡頭下的種德。", cta: "看看報導" },
    ];
    root.appendChild(h("section", { class: "bg-card" },
      h.apply(null, ["div", { class: "page jd-grid-2", style: "padding:var(--space-9) var(--space-5)" }].concat(entries.map(function (c) {
        return h("button", { class: "entry-card", onClick: function () { navigate("content", c.route); } },
          h("div", { class: "cover", style: bg(c.img) }),
          h("div", { class: "body" },
            SectionHeading({ eyebrow: c.eyebrow, title: c.title, desc: c.body, size: "sm" }),
            h("span", { class: "more" }, c.cta + " ", icon("ri-arrow-right-line"))));
      })))));

    root.appendChild(h("section", { class: "bg-page rel clip" },
      Blob("var(--champagne-60)", 620, "right:-180px;top:-40px"),
      h("div", { class: "page jd-split rel", style: "padding:var(--space-9) var(--space-5)" },
        h("div", { class: "stack gap-3" },
          SectionHeading({ eyebrow: "種德的溫柔", title: "遵循古法，也體貼現代步調",
            desc: "漢方經過層層程序把關，依據藥材的特性，從篩藥、清洗到曬藥，確保藥材的品質。我們也將大份量的漢方改良為小份量茶飲，並新增代煎、代磨粉等服務，替客人節省時間，維持健康好心情。" }),
          h("div", {}, Button({ variant: "secondary", size: "sm", icon: "ri-arrow-right-line", iconRight: true, label: "了解客製化服務", onClick: function () { navigate("content", "service"); } }))),
        h("div", { style: "display:grid;place-items:center" }, CircleImage("assets/photo-chamomile.jpg", 360)))));

    root.appendChild(h("section", { class: "bg-card" },
      h("div", { class: "page pullquote", style: "padding:var(--space-9) var(--space-5)" },
        icon("ri-double-quotes-l"),
        h("p", {}, "傳承老中醫的智慧，佐以溫和漢方草本，每一口都喝得到的溫柔呵護"))));

    root.appendChild(CTABand("想更認識種德嗎？"));
    root.appendChild(SiteFooter());
    return root;
  }

  function CategoryScreen(key) {
    var c = D.categories[key];
    if (!c) { key = "tea"; c = D.categories.tea; }
    var items = D.products.filter(function (p) { return p.cat === key; });
    var root = h("div", {}, SiteHeader({ route: "category", param: key }, false));

    root.appendChild(h("section", { class: "bg-alt rel clip" },
      Blob("var(--champagne-100)", 640, "left:-180px;top:40px"),
      h("div", { class: "page jd-split rel", style: "padding:var(--space-9) var(--space-5)" },
        h("div", { class: "stack gap-3" },
          SectionHeading({ eyebrow: c.eyebrow, title: c.title, desc: c.lead }),
          h("div", { class: "row wrap gap-2" },
            LineButton({ size: "sm", label: "用 LINE 詢問" }),
            Button({ variant: "ghost", size: "sm", icon: "ri-arrow-right-line", iconRight: true, label: "客製化服務", onClick: function () { navigate("content", "service"); } }))),
        CircleImage(c.hero, 360, "justify-self:center"))));

    root.appendChild(h("section", { class: "bg-card" },
      h("div", { class: "page jd-split", style: "padding:var(--space-9) var(--space-5)" },
        h("div", { class: "media-rect", style: bg(c.story.image) }),
        SectionHeading({ eyebrow: "種德的呵護", title: c.story.title, desc: c.story.body }))));

    root.appendChild(h("section", { class: "bg-page" },
      h("div", { class: "page", style: "padding:var(--space-9) var(--space-5)" },
        SectionHeading({ title: "所有" + c.eyebrow, size: "sm", style: "margin-bottom:var(--space-5)" }),
        h.apply(null, ["div", { class: "jd-grid-4" }].concat(items.map(ProductCard))))));

    root.appendChild(CTABand("對" + c.eyebrow + "有興趣嗎？"));
    root.appendChild(SiteFooter());
    return root;
  }

  function ContentScreen(key) {
    var c = D.content[key];
    if (!c) { key = "service"; c = D.content.service; }
    var active = key === "service" ? { route: "content", param: "service" } : { route: "about" };
    var root = h("div", {}, SiteHeader(active, false));

    // Hero
    root.appendChild(h("section", { class: "rel clip" },
      h("div", { class: "hero__bg", style: bg(c.hero) }),
      h("div", { class: "hero__scrim", style: "background:linear-gradient(180deg, rgba(86,52,64,.62), rgba(86,52,64,.46))" }),
      h("div", { class: "hero-body rel", style: "padding:var(--space-10) var(--space-5)" },
        h("span", { class: "eyebrow-light" }, c.eyebrow),
        h("h1", { style: "margin:var(--space-2) 0 var(--space-3)" }, c.title),
        h("p", { style: "max-width:60ch;line-height:1.9" }, c.lead))));

    // Timeline
    if (c.timeline) {
      root.appendChild(h("section", { class: "bg-card" },
        h("div", { class: "page", style: "padding:var(--space-9) var(--space-5)" },
          SectionHeading({ eyebrow: "年表", title: "百年傳承的足跡", style: "margin-bottom:var(--space-6)" }),
          h.apply(null, ["div", { class: "jd-grid-4" }].concat(D.timeline.map(function (t) {
            return h("div", { class: "timeline-card" }, h("p", {}, t.text), YearMark(t.year));
          }))))));
    }

    // Alternating sections
    c.sections.forEach(function (s, i) {
      var imageLeft = s.side === "left";
      var bgcls = i % 2 === 0 ? "bg-page" : "bg-alt";
      var img = h("div", { class: "media-rect", style: bg(s.image) });
      var txt = SectionHeading({ eyebrow: s.eyebrow, title: s.title, desc: s.body });
      var sec = h("section", { class: bgcls + " rel clip" });
      if (i % 2 === 1) sec.appendChild(Blob("var(--champagne-100)", 560, "right:-160px;top:-30px"));
      sec.appendChild(h("div", { class: "page jd-split rel", style: "padding:var(--space-9) var(--space-5)" },
        imageLeft ? img : txt, imageLeft ? txt : img));
      root.appendChild(sec);
    });

    // Form or CTA
    if (c.form) {
      root.appendChild(h("section", { class: "bg-card" },
        h("div", { class: "page", style: "padding:var(--space-9) var(--space-5)" },
          SectionHeading({ eyebrow: "預約諮詢", title: "留下需求，我們用 LINE 回覆您",
            desc: "填寫後我們會盡快透過 LINE 或電話與您聯繫。當然，您也可以直接加入 LINE 好友詢問。",
            center: true, style: "margin-bottom:var(--space-5)" }),
          ServiceForm())));
    } else {
      root.appendChild(CTABand());
    }

    root.appendChild(SiteFooter());
    return root;
  }

  function ServiceForm() {
    var status = h("span", { class: "form-status", style: "display:none" }, icon("ri-checkbox-circle-fill"), "已收到，我們會盡快與您聯繫！");
    var textarea = h("textarea", { class: "field-textarea", rows: "4", placeholder: "想諮詢的體質調理、代煎代磨或其他需求…" });
    return h("form", { class: "service-form", onSubmit: function (e) { e.preventDefault(); status.style.display = "inline-flex"; } },
      h("div", { class: "jd-form-2" },
        Field({ label: "您的姓名", placeholder: "請輸入姓名", required: true }),
        Field({ label: "聯絡電話 / LINE ID", icon: "ri-phone-line", placeholder: "09xx-xxx-xxx", required: true })),
      h("label", { class: "field" }, h("span", {}, "需求說明"), textarea),
      h("div", { class: "row wrap gap-2" },
        Button({ variant: "primary", type: "submit", label: "送出需求" }),
        LineButton({ size: "sm", variant: "outline", label: "或直接加 LINE" }),
        status));
  }

  function ArticlesScreen() {
    var cats = ["全部文章", "常見症狀", "養生配方", "中藥料理", "其他"];
    var active = "全部文章";
    var root = h("div", {}, SiteHeader({ route: "articles" }, false));
    var listWrap = h("div", { class: "stack gap-3" });
    var filterRow = h("div", { class: "filter-row" });

    function renderList() {
      listWrap.innerHTML = "";
      var list = active === "全部文章" ? D.articles : D.articles.filter(function (a) { return a.cat === active; });
      list.forEach(function (a) { listWrap.appendChild(ArticleCard(a, "row")); });
    }
    function renderFilters() {
      filterRow.innerHTML = "";
      cats.forEach(function (c) {
        filterRow.appendChild(Button({ size: "sm", variant: c === active ? "primary" : "secondary", label: c,
          onClick: function () { active = c; renderFilters(); renderList(); } }));
      });
    }
    renderFilters(); renderList();

    var pager = h("div", { class: "pager" }, h("button", {}, icon("ri-arrow-left-s-line")));
    [1, 2, 3, 4].forEach(function (n) { pager.appendChild(h("button", { class: n === 1 ? "is-active" : "" }, String(n))); });
    pager.appendChild(h("button", {}, icon("ri-arrow-right-s-line")));

    root.appendChild(h("section", { class: "bg-page", style: "min-height:60vh" },
      h("div", { class: "page", style: "padding:var(--space-8) var(--space-5) var(--space-9)" },
        SectionHeading({ eyebrow: "漢方主題文章", title: "養生知識，慢慢讀", style: "margin-bottom:var(--space-5)" }),
        filterRow, listWrap, pager)));
    root.appendChild(SiteFooter());
    return root;
  }

  function ProductScreen(id) {
    var p = D.products.filter(function (x) { return x.id === id; })[0] || D.products[0];
    var related = D.products.filter(function (x) { return x.id !== p.id; }).slice(0, 4);
    var catName = (D.categories[p.cat] || {}).eyebrow || "漢方商品";
    var root = h("div", {}, SiteHeader({ route: "category", param: p.cat }, false));

    var info = h("div", { class: "stack gap-3" },
      h("div", { class: "row wrap", style: "gap:8px" }, p.tags.map(function (t) { return Tag(t, "category"); })),
      h("h1", { style: "margin:0" }, p.name),
      h("p", { style: "font-size:var(--fs-md);line-height:1.8;color:var(--text-body);margin:0" },
        "依據藥材特性，從篩藥、清洗到曬藥層層把關，調配最好喝、不苦澀的自然味道。小份量可沖泡設計，替忙碌的您節省時間，也喝得到真材實料的溫柔呵護。"),
      h("div", { class: "product-price-big" },
        h("span", { class: "now" }, "NT " + p.price),
        p.oldPrice ? h("span", { class: "old" }, "NT " + p.oldPrice) : null),
      h("div", { class: "product-props" },
        [["ri-leaf-line", "草本配方"], ["ri-fire-line", "可沖泡 / 可代煎"], ["ri-timer-line", "沖泡約 5 分鐘"], ["ri-truck-line", "歡迎來電洽詢"]].map(function (pair) {
          return h("div", {}, icon(pair[0]), pair[1]);
        })),
      h("div", { class: "row wrap gap-2", style: "margin-top:var(--space-1)" },
        LineButton({ label: "用 LINE 訂購 / 詢問" }),
        Button({ variant: "secondary", icon: "ri-heart-3-line", label: "加入收藏" })),
      h("p", { class: "fineprint" }, "※ 本站不提供線上結帳，歡迎透過 LINE 或來電 " + D.shop.phone + " 訂購，亦可至門市自取。"));

    var gallery = h("div", { class: "stack gap-2" },
      h("div", { class: "gallery-main", style: bg(p.image) }),
      h("div", { class: "gallery-thumbs" },
        ["assets/photo-brew.png", "assets/photo-chamomile.jpg", "assets/photo-herbs.png"].map(function (f) {
          return h("div", { style: bg(f) });
        })));

    root.appendChild(h("section", { class: "bg-page" },
      h("div", { class: "page", style: "padding:var(--space-6) var(--space-5) var(--space-9)" },
        h("div", { class: "breadcrumb" },
          h("a", { href: "#/" }, "首頁"), h("span", { class: "sep" }, "/"),
          h("a", { href: routeToHash("category", p.cat) }, catName), h("span", { class: "sep" }, "/"),
          h("span", { class: "current" }, p.name)),
        h("div", { class: "jd-split items-start" }, gallery, info))));

    root.appendChild(h("section", { class: "bg-card" },
      h("div", { class: "page", style: "padding:var(--space-9) var(--space-5)" },
        SectionHeading({ title: "你也許會喜歡", size: "sm", style: "margin-bottom:var(--space-4)" }),
        h.apply(null, ["div", { class: "jd-grid-4" }].concat(related.map(ProductCard))))));

    root.appendChild(SiteFooter());
    return root;
  }

  /* =========================================================
     Render / router
     ========================================================= */
  function render() {
    var r = parseHash();
    var mount = document.getElementById("app");
    var view;
    switch (r.route) {
      case "about": view = AboutScreen(); break;
      case "category": view = CategoryScreen(r.param); break;
      case "articles": view = ArticlesScreen(); break;
      case "content": view = ContentScreen(r.param); break;
      case "product": view = ProductScreen(r.param); break;
      default: view = HomeScreen();
    }
    mount.innerHTML = "";
    mount.appendChild(view);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---- content loader ------------------------------------- */
  function loadJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path + " (" + r.status + ")");
      return r.json();
    });
  }
  function indexBy(arr, key) {
    var m = {}; (arr || []).forEach(function (it) { m[it[key]] = it; }); return m;
  }
  function init() {
    Promise.all([
      loadJSON("content/settings.json"),
      loadJSON("content/products.json"),
      loadJSON("content/categories.json"),
      loadJSON("content/pages.json"),
      loadJSON("content/articles.json"),
      loadJSON("content/timeline.json"),
    ]).then(function (res) {
      var settings = res[0], products = res[1], categories = res[2], pages = res[3], articles = res[4], timeline = res[5];

      var catMap = {};
      (categories.items || []).forEach(function (c) {
        catMap[c.key] = { eyebrow: c.eyebrow, title: c.title, lead: c.lead, hero: c.hero,
          story: { title: c.storyTitle, body: c.storyBody, image: c.storyImage } };
      });
      var pageMap = {};
      (pages.items || []).forEach(function (p) {
        pageMap[p.key] = { eyebrow: p.eyebrow, title: p.title, lead: p.lead, hero: p.hero,
          timeline: !!p.showTimeline, form: !!p.showForm, sections: p.sections || [] };
      });

      D = {
        line: settings.line,
        shop: settings.shop,
        nav: NAV,
        products: products.items || [],
        categories: catMap,
        content: pageMap,
        articles: articles.items || [],
        timeline: timeline.items || [],
      };
      window.JD_DATA = D;

      render();
      window.addEventListener("hashchange", render);
    }).catch(function (e) {
      document.getElementById("app").innerHTML =
        '<div style="max-width:640px;margin:80px auto;padding:0 24px;font-family:sans-serif;color:#563440;line-height:1.7">' +
        '<h1 style="font-size:24px">內容載入失敗</h1><p>' + (e && e.message ? e.message : e) + '</p>' +
        '<p style="color:#6f6e6c">提示：本機預覽請用小型伺服器（例如在 site 資料夾執行 <code>python -m http.server 8000</code> 後開 http://localhost:8000），' +
        '不能直接雙擊 index.html 開啟。網站上線到 Netlify 後一切正常。</p></div>';
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
