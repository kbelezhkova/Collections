(function () {
  var catalog = document.getElementById("catalog");
  var search = document.getElementById("search");
  var countEl = document.getElementById("result-count");
  var noResults = document.getElementById("no-results");
  var chips = document.querySelectorAll(".chip");
  var activeFilter = "all";

  function render() {
    var query = search.value.trim().toLowerCase();
    var total = 0;
    catalog.innerHTML = "";

    window.INVENTORY.forEach(function (cat) {
      if (activeFilter !== "all" && cat.group !== activeFilter) return;

      var categoryMatches = cat.category.toLowerCase().indexOf(query) !== -1;
      var items = cat.items.filter(function (item) {
        return !query || categoryMatches || item.toLowerCase().indexOf(query) !== -1;
      });
      if (!items.length) return;
      total += items.length;

      var card = document.createElement("article");
      card.className = "cat-card cat-" + cat.group;

      var head = document.createElement("h3");
      head.textContent = cat.category;
      var badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = items.length;
      head.appendChild(badge);
      card.appendChild(head);

      var list = document.createElement("ul");
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });
      card.appendChild(list);
      catalog.appendChild(card);
    });

    countEl.textContent = query || activeFilter !== "all"
      ? total + (total === 1 ? " item" : " items") + " found"
      : "";
    noResults.hidden = total !== 0;
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      activeFilter = chip.getAttribute("data-filter");
      render();
    });
  });
  search.addEventListener("input", render);

  // Open / closed indicator, based on shop hours (Mon–Fri 8am–4pm, Eastern time).
  function updateOpenStatus() {
    var el = document.getElementById("open-status");
    var parts = {};
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
      }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    } catch (e) {
      return;
    }
    var weekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].indexOf(parts.weekday) !== -1;
    var minutes = parseInt(parts.hour, 10) * 60 + parseInt(parts.minute, 10);
    var open = weekday && minutes >= 8 * 60 && minutes < 16 * 60;
    el.textContent = open ? "We're open now until 4:00 pm" : "We're closed right now — open Monday to Friday, 8 am to 4 pm";
    el.className = "open-status " + (open ? "is-open" : "is-closed");
  }

  document.getElementById("year").textContent = new Date().getFullYear();
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);
  render();
})();
