// Prices for transportation per day (in USD)
const TRANSPORT_RATES = {
  "Tuk-Tuk": 15,
  "Private AC Car": 45,
  "Luxury Van": 70,
  "Self Drive / Scooter": 10,
  "Public Transit": 5
};

// Default estimated cost for places/food if not specified
const DEFAULT_PRICES = {
  "Hotel": 100,
  "Restaurant": 25,
  "Destination": 10,
  "Experience": 15
};

// Hotel estimated price mapping based on HTML text
const HOTEL_PRICES = {
  "Galle Fort Hotel": 350,
  "Skyline Stay Guest House": 40,
  "The Fort Printers": 250,
  "Jetwing Lighthouse": 220,
  "Amangalla": 1230,
  "Fort Bazaar": 280,
  "Tri Lanka": 195
};

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

// Dynamic Cost Calculation Function
function calculateTotalCost() {
  const days = Number(document.getElementById("days").value) || 1;
  const travelers = Number(document.getElementById("traveler-count").value) || 1;
  const transportType = document.getElementById("transport-type").value;
  const transportRate = TRANSPORT_RATES[transportType] || 0;

  const stays = trip.filter(item => item.type === "Hotel");
  const otherItems = trip.filter(item => item.type !== "Hotel");

  // Calculate Stays Cost: Sum of room price * nights
  let stayTotal = 0;
  stays.forEach(stay => {
    const nightPrice = stay.price || HOTEL_PRICES[stay.name] || DEFAULT_PRICES["Hotel"];
    stayTotal += nightPrice * days;
  });

  // Calculate Transport Cost: Transport rate per day * total days
  const transportTotal = transportRate * days;

  // Calculate Activities & Food Cost: Item price * number of travelers
  let itemsTotal = 0;
  otherItems.forEach(item => {
    const itemPrice = item.price || DEFAULT_PRICES[item.type] || 15;
    itemsTotal += itemPrice * travelers;
  });

  const grandTotal = stayTotal + transportTotal + itemsTotal;

  // Update UI cost breakdown
  document.getElementById("stay-cost").textContent = `$${stayTotal.toLocaleString()}`;
  document.getElementById("transport-cost").textContent = `$${transportTotal.toLocaleString()}`;
  document.getElementById("items-cost").textContent = `$${itemsTotal.toLocaleString()}`;
  document.getElementById("total-cost").textContent = `$${grandTotal.toLocaleString()}`;

  return { stayTotal, transportTotal, itemsTotal, grandTotal };
}

function renderTrip() {
  tripList.innerHTML = "";
  if (!trip.length) {
    tripList.innerHTML = '<div class="empty">Your trip is waiting to happen. Add a destination, hotel or restaurant above.</div>';
    calculateTotalCost();
    return;
  }

  trip.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "trip-item";
    row.innerHTML = `<div class="trip-icon">${item.icon}</div><div><strong></strong><small></small></div><button class="remove" aria-label="Remove item">×</button>`;
    row.querySelector("strong").textContent = item.name;
    row.querySelector("small").textContent = `${item.type} ${item.price ? `($${item.price})` : ''}`;
    row.querySelector(".remove").addEventListener("click", () => {
      trip.splice(index, 1);
      renderTrip();
      output.classList.remove("show");
      copyButton.hidden = downloadButton.hidden = true;
    });
    tripList.appendChild(row);
  });

  calculateTotalCost();
}

// Event Listeners for controls updating total cost live
document.getElementById("days").addEventListener("change", calculateTotalCost);
document.getElementById("traveler-count").addEventListener("input", calculateTotalCost);
document.getElementById("transport-type").addEventListener("change", calculateTotalCost);

// Filter buttons
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

// Add to trip button clicks
document.querySelectorAll(".add-trip").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const type = button.dataset.type;
    if (trip.some(item => item.name === name)) {
      notify("Already added to your trip.");
      return;
    }

    const price = type === "Hotel" ? (HOTEL_PRICES[name] || DEFAULT_PRICES["Hotel"]) : DEFAULT_PRICES[type];
    trip.push({ name, type, icon: button.dataset.icon || (type === "Hotel" ? "🏨" : type === "Restaurant" ? "🍛" : "📍"), price });

    renderTrip();
    button.classList.add("selected");
    button.textContent = "✓ Added";
    notify(`${name} added to your trip`);
  });
});

// Save heart buttons
document.querySelectorAll("[data-save]").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    button.textContent = button.classList.contains("saved") ? "♥" : "♡";
    notify(button.classList.contains("saved") ? `${button.dataset.save} saved` : "Removed from saved places");
  });
});

// Create Itinerary Button
document.getElementById("make-plan").addEventListener("click", () => {
  if (!trip.length) {
    notify("Add at least one place, stay or restaurant first.");
    return;
  }

  const name = document.getElementById("traveler-name").value || "Valued Guest";
  const email = document.getElementById("traveler-email").value || "Not provided";
  const travelers = document.getElementById("traveler-count").value || "1";
  const transport = document.getElementById("transport-type").value;
  const notes = document.getElementById("trip-notes").value || "None";

  const dateValue = document.getElementById("start-date").value;
  const days = Number(document.getElementById("days").value);
  const start = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
  const dateLabel = start ? start.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "Date not set";

  const { stayTotal, transportTotal, itemsTotal, grandTotal } = calculateTotalCost();

  const stays = trip.filter(item => item.type === "Hotel");
  const food = trip.filter(item => item.type === "Restaurant");
  const places = trip.filter(item => item.type !== "Hotel" && item.type !== "Restaurant");

  const lines = [
    "==========================================",
    "  EXPLORE GALLE — CUSTOM TRAVEL ITINERARY  ",
    "==========================================",
    `Traveler Name: ${name}`,
    `Contact Email: ${email}`,
    `Travelers: ${travelers} person(s)`,
    `Arrival Date: ${dateLabel}`,
    `Duration: ${days} Day(s) / ${days} Night(s)`,
    `Selected Transport: ${transport}`,
    `Special Notes: ${notes}`,
    "",
    "------------------------------------------",
    "  DAILY OUTLINE",
    "------------------------------------------",
    ...Array.from({ length: days }, (_, i) => {
      const dayPlaces = places.filter((_, idx) => idx % days === i);
      const dayFood = food.filter((_, idx) => idx % days === i);
      let line = `Day ${i + 1}: `;
      line += dayPlaces.length ? dayPlaces.map(x => x.name).join(" → ") : "Explore Galle Fort & coastline at your leisure";
      if (dayFood.length) line += ` | Food: ${dayFood.map(x => x.name).join(", ")}`;
      return line;
    }),
    "",
    "------------------------------------------",
    "  ACCOMMODATION",
    "------------------------------------------",
    stays.length ? stays.map(x => `• ${x.name} ($${x.price || HOTEL_PRICES[x.name]}/night)`).join("\n") : "• Choose and book accommodation separately.",
    "",
    "------------------------------------------",
    "  SELECTED EXPERIENCES & DINING",
    "------------------------------------------",
    ...trip.map(x => `• ${x.type}: ${x.name}`),
    "",
    "------------------------------------------",
    "  ESTIMATED COST BREAKDOWN",
    "------------------------------------------",
    ` Accommodation Total (${days} nights): $${stayTotal.toLocaleString()}`,
    ` Transport Total (${transport}): $${transportTotal.toLocaleString()}`,
    ` Activities & Dining Est. (${travelers} travelers): $${itemsTotal.toLocaleString()}`,
    "------------------------------------------",
    ` ESTIMATED GRAND TOTAL: $${grandTotal.toLocaleString()}`,
    "==========================================",
    "",
    "Note: Prices are estimates. Please confirm final rates directly with providers."
  ];

  currentPlan = lines.join("\n");
  output.textContent = currentPlan;
  output.classList.add("show");
  copyButton.hidden = downloadButton.hidden = false;

  // Send the full itinerary with total cost via EmailJS
  if (window.emailjs) {
    emailjs.send("service_ymfzk6x", "template_avjtnld", {
      traveler_name: name,
      traveler_email: email,
      total_cost: `$${grandTotal.toLocaleString()}`,
      itinerary_content: currentPlan,
      submission_date: new Date().toLocaleString()
    })
    .then(() => {
      notify("Itinerary generated & sent to your email!");
    }, (error) => {
      console.error("Email sending failed:", error);
      notify("Itinerary generated successfully!");
    });
  } else {
    notify("Itinerary created!");
  }
});

// Clear plan action
document.getElementById("clear-plan").addEventListener("click", () => {
  trip.length = 0;
  document.querySelectorAll(".add-trip").forEach(button => {
    button.classList.remove("selected");
    button.textContent = button.dataset.type === "Hotel" ? "+ Add stay" : "+ Add to trip";
  });
  renderTrip();
  output.classList.remove("show");
  copyButton.hidden = downloadButton.hidden = true;
  notify("Trip selections cleared");
});

// Copy to Clipboard
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentPlan);
    notify("Itinerary copied!");
  } catch {
    const area = document.createElement("textarea");
    area.value = currentPlan;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    notify("Itinerary copied!");
  }
});

// Download TXT File
downloadButton.addEventListener("click", () => {
  const blob = new Blob([currentPlan], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-galle-itinerary.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Initial load
renderTrip();
