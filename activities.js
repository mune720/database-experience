/* プログラミング体験 — 追加タブ（要件定義・フローチャート）
   既存のプログラミング機能は programming.js のまま。このファイルでは
   1) 上部タブでの表示切り替え
   2) 要件定義ワークシート（入力 → 要件定義書プレビュー）
   3) フローチャート組み立て（カードをマスに置いて答え合わせ）
   を実装する。入力した内容は保存・外部送信しない。 */
(function () {
  "use strict";

  /* ============================================================
     1. モード（上部タブ）の切り替え
     ============================================================ */

  var SUBTITLES = {
    programming: "図書館情報技術論 ／ 左にコードを書くと、右に結果がすぐ表示されます",
    requirements: "図書館情報技術論 ／ 作る前に「何を作るか」を言葉で決める練習です",
    flowchart: "図書館情報技術論 ／ 処理の流れを図で組み立てる練習です"
  };

  var modeTabs = Array.prototype.slice.call(document.querySelectorAll(".mode-tabs .activity-tab"));
  var sections = {
    programming: document.getElementById("modeProgramming"),
    requirements: document.getElementById("modeRequirements"),
    flowchart: document.getElementById("modeFlowchart")
  };
  var subtitle = document.getElementById("pageSubtitle");

  function switchMode(mode) {
    if (!sections[mode]) return;
    modeTabs.forEach(function (t) {
      var active = t.getAttribute("data-mode") === mode;
      t.classList.toggle("active", active);
      if (active) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    Object.keys(sections).forEach(function (k) {
      sections[k].hidden = (k !== mode);
    });
    if (subtitle && SUBTITLES[mode]) subtitle.textContent = SUBTITLES[mode];
  }

  modeTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      switchMode(tab.getAttribute("data-mode"));
    });
  });

  /* ============================================================
     2. 要件定義ワークシート
     ============================================================ */

  var REQ_EXAMPLE = {
    name: "としょかん貸出システム",
    users: "学生・教員・図書館の司書",
    purpose: "本の貸出と返却を、待たせずに正確に行えるようにするため",
    funcs: [
      "利用者カードと本のバーコードで貸出ができる",
      "返却すると貸出の記録が消える",
      "延滞している人には返却のお知らせが届く"
    ],
    rules: [
      "借りられるのは1人10冊まで・2週間以内",
      "誰が何を借りたかは、本人と司書しか見られない"
    ]
  };

  var req = {
    name: document.getElementById("reqName"),
    users: document.getElementById("reqUsers"),
    purpose: document.getElementById("reqPurpose"),
    funcs: [
      document.getElementById("reqFunc1"),
      document.getElementById("reqFunc2"),
      document.getElementById("reqFunc3")
    ],
    rules: [
      document.getElementById("reqRule1"),
      document.getElementById("reqRule2")
    ],
    doc: document.getElementById("reqDoc"),
    status: document.getElementById("reqStatus"),
    exampleBtn: document.getElementById("reqExampleBtn"),
    clearBtn: document.getElementById("reqClearBtn")
  };

  function reqValue(input) {
    return (input.value || "").trim();
  }

  function addDocSection(title, fill) {
    var h = document.createElement("h3");
    h.className = "req-doc-h";
    h.textContent = title;
    req.doc.appendChild(h);
    fill();
  }

  function addDocText(text) {
    var p = document.createElement("p");
    p.className = "req-doc-p";
    if (text) {
      p.textContent = text;
    } else {
      p.textContent = "（未記入）";
      p.classList.add("req-empty");
    }
    req.doc.appendChild(p);
  }

  function addDocList(values) {
    var filled = values.filter(function (v) { return v !== ""; });
    if (filled.length === 0) {
      addDocText("");
      return;
    }
    var ul = document.createElement("ul");
    ul.className = "req-doc-list";
    filled.forEach(function (v) {
      var li = document.createElement("li");
      li.textContent = v;
      ul.appendChild(li);
    });
    req.doc.appendChild(ul);
  }

  function renderReqDoc() {
    req.doc.textContent = "";

    var title = document.createElement("p");
    title.className = "req-doc-title";
    title.textContent = "要件定義書";
    req.doc.appendChild(title);

    var name = document.createElement("p");
    name.className = "req-doc-name";
    var nameVal = reqValue(req.name);
    name.textContent = nameVal || "（システムの名前）";
    if (!nameVal) name.classList.add("req-empty");
    req.doc.appendChild(name);

    var users = reqValue(req.users);
    var purpose = reqValue(req.purpose);
    var funcs = req.funcs.map(reqValue);
    var rules = req.rules.map(reqValue);

    addDocSection("1. 利用者（誰が使う？）", function () { addDocText(users); });
    addDocSection("2. 目的（何のために？）", function () { addDocText(purpose); });
    addDocSection("3. 機能（できること）", function () { addDocList(funcs); });
    addDocSection("4. ルール（守るべき条件）", function () { addDocList(rules); });

    // 名前・利用者・目的・機能1つ以上 がそろったら完成
    var done = nameVal && users && purpose && funcs.some(function (v) { return v !== ""; });
    req.status.textContent = done ? "完成！" : "記入中";
    req.status.classList.toggle("is-ok", !!done);
  }

  function bindReq() {
    var inputs = [req.name, req.users, req.purpose].concat(req.funcs, req.rules);
    inputs.forEach(function (input) {
      input.addEventListener("input", renderReqDoc);
    });

    req.exampleBtn.addEventListener("click", function () {
      req.name.value = REQ_EXAMPLE.name;
      req.users.value = REQ_EXAMPLE.users;
      req.purpose.value = REQ_EXAMPLE.purpose;
      req.funcs.forEach(function (input, i) { input.value = REQ_EXAMPLE.funcs[i] || ""; });
      req.rules.forEach(function (input, i) { input.value = REQ_EXAMPLE.rules[i] || ""; });
      renderReqDoc();
    });

    req.clearBtn.addEventListener("click", function () {
      var inputs2 = [req.name, req.users, req.purpose].concat(req.funcs, req.rules);
      inputs2.forEach(function (input) { input.value = ""; });
      renderReqDoc();
    });

    renderReqDoc();
  }

  /* ============================================================
     3. フローチャート組み立て
     ============================================================ */

  /* rows: fixed（固定の端子）／ slot（カードを置くマス）／ branch（条件分岐） */
  var FC_PROBLEMS = [
    {
      name: "① 返却の流れ（分岐なし）",
      rows: [
        { kind: "fixed", shape: "terminal", text: "開始" },
        { kind: "slot", shape: "process", answer: "返す本をカウンターに出す" },
        { kind: "slot", shape: "process", answer: "本のバーコードを読み取る" },
        { kind: "slot", shape: "process", answer: "貸出の記録を消す" },
        { kind: "slot", shape: "process", answer: "本を書架（本棚）に戻す" },
        { kind: "fixed", shape: "terminal", text: "終了" }
      ]
    },
    {
      name: "② 貸出の流れ（分岐あり）",
      rows: [
        { kind: "fixed", shape: "terminal", text: "開始" },
        { kind: "slot", shape: "process", answer: "利用者カードを読み取る" },
        { kind: "slot", shape: "process", answer: "本のバーコードを読み取る" },
        {
          kind: "branch",
          cond: { shape: "decision", answer: "貸出中の本が10冊以上？" },
          yes: { shape: "process", answer: "「これ以上は借りられません」と伝える" },
          noLabel: "いいえ"
        },
        { kind: "slot", shape: "process", answer: "貸出を記録する" },
        { kind: "slot", shape: "process", answer: "返却期限を伝える" },
        { kind: "fixed", shape: "terminal", text: "終了" }
      ]
    }
  ];

  var fc = {
    select: document.getElementById("fcSelect"),
    tray: document.getElementById("fcTray"),
    chart: document.getElementById("fcChart"),
    status: document.getElementById("fcStatus"),
    checkBtn: document.getElementById("fcCheckBtn"),
    resetBtn: document.getElementById("fcResetBtn")
  };

  var fcState = {
    problemIndex: 0,
    slots: [],   // { shape, answer, placed, mark }  ※定義順＝埋まる順
    tray: [],    // まだ置いていないカードの文字列
    checked: false
  };

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function loadProblem(index) {
    fcState.problemIndex = index;
    fcState.slots = [];
    var problem = FC_PROBLEMS[index];
    problem.rows.forEach(function (row) {
      if (row.kind === "slot") {
        fcState.slots.push({ shape: row.shape, answer: row.answer, placed: null, mark: null });
      } else if (row.kind === "branch") {
        fcState.slots.push({ shape: row.cond.shape, answer: row.cond.answer, placed: null, mark: null });
        fcState.slots.push({ shape: row.yes.shape, answer: row.yes.answer, placed: null, mark: null });
      }
    });
    fcState.tray = shuffle(fcState.slots.map(function (s) { return s.answer; }));
    fcState.checked = false;
    renderFc();
    setFcStatus("組み立て中", null);
  }

  function setFcStatus(text, kind) {
    fc.status.textContent = text;
    fc.status.classList.remove("is-ok", "is-error", "is-busy");
    if (kind) fc.status.classList.add(kind);
  }

  function clearMarks() {
    if (!fcState.checked) return;
    fcState.checked = false;
    fcState.slots.forEach(function (s) { s.mark = null; });
    setFcStatus("組み立て中", null);
  }

  function placeCard(text) {
    for (var i = 0; i < fcState.slots.length; i++) {
      if (fcState.slots[i].placed === null) {
        fcState.slots[i].placed = text;
        var idx = fcState.tray.indexOf(text);
        if (idx >= 0) fcState.tray.splice(idx, 1);
        clearMarks();
        renderFc();
        return;
      }
    }
  }

  function removeFromSlot(slot) {
    if (slot.placed === null) return;
    fcState.tray.push(slot.placed);
    slot.placed = null;
    slot.mark = null;
    clearMarks();
    renderFc();
  }

  function makeNode(shape, text, extraClass) {
    var div = document.createElement("div");
    div.className = "fc-node fc-" + shape + (extraClass ? " " + extraClass : "");
    div.textContent = text;
    return div;
  }

  function makeSlotEl(slot) {
    var empty = slot.placed === null;
    var el = makeNode(slot.shape, empty ? "？" : slot.placed, "fc-slot" + (empty ? " is-empty" : ""));
    if (slot.mark === "ok") el.classList.add("is-ok");
    if (slot.mark === "ng") el.classList.add("is-ng");
    el.addEventListener("click", function () { removeFromSlot(slot); });
    return el;
  }

  function makeArrow(label) {
    var div = document.createElement("div");
    div.className = "fc-arrow";
    if (label) {
      var span = document.createElement("span");
      span.className = "fc-arrow-label";
      span.textContent = label;
      div.appendChild(span);
    }
    var mark = document.createElement("span");
    mark.textContent = "↓";
    div.appendChild(mark);
    return div;
  }

  function renderFc() {
    // カード置き場
    fc.tray.textContent = "";
    if (fcState.tray.length === 0) {
      var doneMsg = document.createElement("p");
      doneMsg.className = "fc-tray-empty";
      doneMsg.textContent = "すべて置きました。「答え合わせ」を押しましょう。";
      fc.tray.appendChild(doneMsg);
    } else {
      fcState.tray.forEach(function (text) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "fc-card";
        btn.textContent = text;
        btn.addEventListener("click", function () { placeCard(text); });
        fc.tray.appendChild(btn);
      });
    }

    // 組み立てエリア
    fc.chart.textContent = "";
    var slotIndex = 0;
    var rows = FC_PROBLEMS[fcState.problemIndex].rows;
    rows.forEach(function (row, i) {
      if (i > 0) {
        var prev = rows[i - 1];
        fc.chart.appendChild(makeArrow(prev.kind === "branch" ? prev.noLabel : ""));
      }
      if (row.kind === "fixed") {
        fc.chart.appendChild(makeNode(row.shape, row.text));
      } else if (row.kind === "slot") {
        fc.chart.appendChild(makeSlotEl(fcState.slots[slotIndex]));
        slotIndex++;
      } else if (row.kind === "branch") {
        var wrap = document.createElement("div");
        wrap.className = "fc-branch";
        wrap.appendChild(makeSlotEl(fcState.slots[slotIndex]));
        slotIndex++;

        var link = document.createElement("span");
        link.className = "fc-branch-link";
        link.textContent = "はい →";
        wrap.appendChild(link);

        var side = document.createElement("div");
        side.className = "fc-branch-side";
        side.appendChild(makeSlotEl(fcState.slots[slotIndex]));
        slotIndex++;
        var end = document.createElement("span");
        end.className = "fc-branch-end";
        end.textContent = "→ 終了";
        side.appendChild(end);
        wrap.appendChild(side);

        fc.chart.appendChild(wrap);
      }
    });
  }

  function checkFc() {
    var unfilled = fcState.slots.some(function (s) { return s.placed === null; });
    if (unfilled) {
      setFcStatus("まだ空きマスがあります", "is-busy");
      return;
    }
    var correct = 0;
    fcState.slots.forEach(function (s) {
      if (s.placed === s.answer) {
        s.mark = "ok";
        correct++;
      } else {
        s.mark = "ng";
      }
    });
    fcState.checked = true;
    renderFc();
    if (correct === fcState.slots.length) {
      setFcStatus("正解！流れが完成しました", "is-ok");
    } else {
      setFcStatus(correct + " / " + fcState.slots.length + " 正解。赤いマスを見直そう", "is-error");
    }
  }

  function bindFc() {
    FC_PROBLEMS.forEach(function (p, i) {
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = p.name;
      fc.select.appendChild(opt);
    });

    fc.select.addEventListener("change", function () {
      loadProblem(parseInt(fc.select.value, 10) || 0);
    });

    fc.checkBtn.addEventListener("click", checkFc);

    fc.resetBtn.addEventListener("click", function () {
      loadProblem(fcState.problemIndex);
    });

    loadProblem(0);
  }

  /* ============================================================
     4. 起動
     ============================================================ */

  function init() {
    bindReq();
    bindFc();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
