  
  // Filter buttons for destination, hotel and restaurant categories
  document.querySelectorAll("[data-filter-group]").forEach(group => {
    group.querySelectorAll(".filter-btn").forEach(button => {
      button.addEventListener("click", () => {
        group.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        const filter = button.dataset.filter;
        const section = group.dataset.filterGroup;
        const container = document.getElementById(
          section === "destination" ? "destination-cards" :
          section === "hotel" ? "hotel-cards" : "restaurant-cards"
        );
        container.querySelectorAll(".card").forEach(card => {
          card.hidden = filter !== "all" && card.dataset.category !== filter;
        });
      });
    });
  });

  const trip = [];
  const tripList = document.getElementById("trip-list");
  const output = document.getElementById("plan-output");
  const copyButton = document.getElementById("copy-plan");
  const downloadButton = document.getElementById("download-plan");
  const toast = document.getElementById("toast");
  let currentPlan = "";

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function renderTrip() {
    tripList.innerHTML = "";
    if (!trip.length) {
      tripList.innerHTML = '<div class="empty">Your trip is waiting to happen. Add a destination, hotel or restaurant above.</div>';
      return;
    }
    trip.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "trip-item";
      row.innerHTML = `<div class="trip-icon">${item.icon}</div><div><strong></strong><small></small></div><button class="remove" aria-label="Remove item">×</button>`;
      row.querySelector("strong").textContent = item.name;
      row.querySelector("small").textContent = item.type;
      row.querySelector(".remove").addEventListener("click", () => {
        trip.splice(index, 1);
        renderTrip();
        output.classList.remove("show");
        copyButton.hidden = downloadButton.hidden = true;
      });
      tripList.appendChild(row);
    });
  }

  document.querySelectorAll(".add-trip").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      if (trip.some(item => item.name === name)) {
        notify("Already added to your trip.");
        return;
      }
      trip.push({name, type: button.dataset.type, icon: button.dataset.icon || "📍"});
      renderTrip();
      button.classList.add("selected");
      button.textContent = "✓ Added";
      notify(`${name} added to your trip`);
    });
  });

  document.querySelectorAll("[data-save]").forEach(button => {
    button.addEventListener("click", () => {
      button.classList.toggle("saved");
      button.textContent = button.classList.contains("saved") ? "♥" : "♡";
      notify(button.classList.contains("saved") ? `${button.dataset.save} saved` : "Removed from saved places");
    });
  });

  document.getElementById("make-plan").addEventListener("click", () => {
    if (!trip.length) {
      notify("Add at least one place, stay or restaurant first.");
      return;
    }
    const dateValue = document.getElementById("start-date").value;
    const days = Number(document.getElementById("days").value);
    const start = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
    const dateLabel = start ? start.toLocaleDateString(undefined, {year:"numeric", month:"long", day:"numeric"}) : "Date not set";
    const stays = trip.filter(item => item.type === "Hotel");
    const food = trip.filter(item => item.type === "Restaurant");
    const places = trip.filter(item => item.type !== "Hotel" && item.type !== "Restaurant");
    const lines = [
      "EXPLORE GALLE — MY TRIP PLAN",
      `Arrival: ${dateLabel}`,
      `Length: ${days} day${days > 1 ? "s" : ""}`,
      "",
      "SUGGESTED OUTLINE",
      ...Array.from({length: days}, (_, i) => {
        const dayPlaces = places.filter((_, idx) => idx % days === i);
        const dayFood = food.filter((_, idx) => idx % days === i);
        let line = `Day ${i + 1}: `;
        line += dayPlaces.length ? dayPlaces.map(x => x.name).join(" → ") : "Explore Galle at your own pace";
        if (dayFood.length) line += ` | Food: ${dayFood.map(x => x.name).join(", ")}`;
        return line;
      }),
      "",
      "STAY",
      stays.length ? stays.map(x => "• " + x.name).join("\n") : "Choose and book accommodation separately.",
      "",
      "SELECTED ITEMS",
      ...trip.map(x => `• ${x.type}: ${x.name}`),
      "",
      "Remember to confirm opening hours, routes, weather, prices and bookings directly."
    ];
    currentPlan = lines.join("\n");
    output.textContent = currentPlan;
    output.classList.add("show");
    copyButton.hidden = downloadButton.hidden = false;

    // 🚀 Send the generated itinerary to your email via EmailJS with error checking
    emailjs.send("service_ymfzk6x", "template_avjtnld", {
      itinerary_content: currentPlan,
      submission_date: new Date().toLocaleString()
    })
    .then((response) => {
      console.log("SUCCESS!", response.status, response.text);
      notify("Itinerary successfully emailed to you!");
    }, (error) => {
      console.error("FAILED...", error);
      notify("Failed to send email. Check console.");
    });
  });

  document.getElementById("clear-plan").addEventListener("click", () => {
    trip.length = 0;
    document.querySelectorAll(".add-trip").forEach(button => {
      button.classList.remove("selected");
      button.textContent = button.dataset.type === "Hotel" ? "+ Add stay" :
        button.dataset.type === "Restaurant" ? "+ Add to trip" : "+ Add to trip";
    });
    renderTrip();
    output.classList.remove("show");
    copyButton.hidden = downloadButton.hidden = true;
    notify("Trip selections cleared");
  });

  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(currentPlan);
      notify("Itinerary copied!");
    } {
      const area = document.createElement("textarea");
      area.value = currentPlan;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      notify("Itinerary copied!");
    }
  });

  downloadButton.addEventListener("click", () => {
    const blob = new Blob([currentPlan], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-galle-itinerary.txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  renderTrip();