/* 
 * script.js - Core interactive logic for the Explore Galle Chinese tourist platform
 * Handles dynamic cost calculation, trip planning, UI state management, and EmailJS integration
 */

// Daily transportation rates in USD
const TRANSPORT_RATES = {
  "Private AC Car": 100,
  "Luxury Van": 150
};

// Default estimated costs for activities, places, and food items
const DEFAULT_PRICES = {
  "Hotel": 100,
  "Restaurant": 25,
  "Destination": 10,
  "Experience": 15
};

// Specific estimated hotel pricing database mapping (English Hotel Names)
const HOTEL_PRICES = {
  "Galle Fort Hotel": 350,
  "Skyline Stay Guest House": 50,
  "The Fort Printers": 250,
  "Jetwing Lighthouse": 220,
  "Amangalla": 1230,
  "Fort Bazaar": 280,
  "Tri Ahangama": 195
};

const trip = [];
const tripList = document.getElementById("trip-list");
const output = document.getElementById("plan-output");
const copyButton = document.getElementById("copy-plan");
const downloadButton = document.getElementById("download-plan");
const toast = document.getElementById("toast");
let currentPlan = "";

// Notification toast helper function
function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// Calculate total live trip expenses based on selected items, days, and travelers
function calculateTotalCost() {
  const days = Number(document.getElementById("days").value) || 1;
  const travelers = Number(document.getElementById("traveler-count").value) || 1;
  const transportType = document.getElementById("transport-type").value;
  const transportRate = TRANSPORT_RATES[transportType] || 0;

  const stays = trip.filter(item => item.type === "Hotel");
  const otherItems = trip.filter(item => item.type !== "Hotel");

  // Compute total accommodation cost (room rate multiplied by nights)
  let stayTotal = 0;
  stays.forEach(stay => {
    const nightPrice = stay.price || HOTEL_PRICES[stay.name] || DEFAULT_PRICES["Hotel"];
    stayTotal += nightPrice * days;
  });

  // Compute total transportation cost (daily rate multiplied by duration)
  const transportTotal = transportRate * days;

  // Compute activities and dining cost (item cost multiplied by number of travelers)
  let itemsTotal = 0;
  otherItems.forEach(item => {
    const itemPrice = item.price || DEFAULT_PRICES[item.type] || 15;
    itemsTotal += itemPrice * travelers;
  });

  const grandTotal = stayTotal + transportTotal + itemsTotal;

  // Render calculated cost metrics to the UI breakdown panel
  document.getElementById("stay-cost").textContent = `$${stayTotal.toLocaleString()}`;
  document.getElementById("transport-cost").textContent = `$${transportTotal.toLocaleString()}`;
  document.getElementById("items-cost").textContent = `$${itemsTotal.toLocaleString()}`;
  document.getElementById("total-cost").textContent = `$${grandTotal.toLocaleString()}`;

  return { stayTotal, transportTotal, itemsTotal, grandTotal };
}

// Render selected trip items list inside the trip planner panel
function renderTrip() {
  tripList.innerHTML = "";
  if (!trip.length) {
    tripList.innerHTML = '<div class="empty">您的行程清单目前为空，请在上方各版块点击“添加到行程”添加心仪项目。</div>';
    calculateTotalCost();
    return;
  }

  trip.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "trip-item";
    row.innerHTML = `<div class="trip-icon">${item.icon}</div><div><strong></strong><small></small></div><button class="remove" aria-label="移除项目">×</button>`;
    row.querySelector("strong").textContent = item.name;
    row.querySelector("small").textContent = `${item.type === 'Hotel' ? '住宿酒店' : item.type === 'Restaurant' ? '特色餐厅' : '精选景点'} ${item.price ? `($${item.price})` : ''}`;
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

// Event bindings for dynamic cost recalculations when preferences change
document.getElementById("days").addEventListener("change", calculateTotalCost);
document.getElementById("traveler-count").addEventListener("input", calculateTotalCost);
document.getElementById("transport-type").addEventListener("change", calculateTotalCost);

// Category filter buttons behavior setup
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

// Add item to trip planner shortlist buttons listener
document.querySelectorAll(".add-trip").forEach(button => {
  button.addEventListener("click", () => {
    const name = button.dataset.name;
    const type = button.dataset.type;
    if (trip.some(item => item.name === name)) {
      notify("该项目已经存在于您的行程清单中。");
      return;
    }

    const price = type === "Hotel" ? (HOTEL_PRICES[name] || DEFAULT_PRICES["Hotel"]) : DEFAULT_PRICES[type];
    trip.push({ name, type, icon: button.dataset.icon || (type === "Hotel" ? "🏨" : type === "Restaurant" ? "🍛" : "📍"), price });

    renderTrip();
    button.classList.add("selected");
    button.textContent = "✓ 已添加";
    notify(`已成功添加 ${name}`);
  });
});

// Card favorite heart toggle action listener
document.querySelectorAll("[data-save]").forEach(button => {
  button.addEventListener("click", () => {
    button.classList.toggle("saved");
    button.textContent = button.classList.contains("saved") ? "♥" : "♡";
    notify(button.classList.contains("saved") ? `已收藏 ${button.dataset.save}` : "已从收藏夹移除");
  });
});

// Generate Itinerary and dispatch EmailJS backend trigger
document.getElementById("make-plan").addEventListener("click", () => {
  if (!trip.length) {
    notify("请先在上方至少添加一个景点、住宿或餐厅。");
    return;
  }

  const name = document.getElementById("traveler-name").value || "尊贵游客";
  const email = document.getElementById("traveler-email").value || "未提供邮箱";
  const travelers = document.getElementById("traveler-count").value || "1";
  const transport = document.getElementById("transport-type").value === "Private AC Car" ? "豪华私家空调轿车" : "舒适商务车";
  const notes = document.getElementById("trip-notes").value || "无";

  const dateValue = document.getElementById("start-date").value;
  const days = Number(document.getElementById("days").value);
  const start = dateValue ? new Date(`${dateValue}T12:00:00`) : null;
  const dateLabel = start ? start.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }) : "未设定具体日期";

  const { stayTotal, transportTotal, itemsTotal, grandTotal } = calculateTotalCost();

  const stays = trip.filter(item => item.type === "Hotel");
  const food = trip.filter(item => item.type === "Restaurant");
  const places = trip.filter(item => item.type !== "Hotel" && item.type !== "Restaurant");

  // Construct structured text itinerary layout
  const lines = [
    "==========================================",
    "       斯里兰卡加勒 — 专属定制旅行行程单       ",
    "==========================================",
    `游客姓名: ${name}`,
    `联系邮箱: ${email}`,
    `出行人数: ${travelers} 人`,
    `抵达日期: ${dateLabel}`,
    `行程天数: ${days} 天 / ${days} 晚`,
    `包车交通: ${transport}`,
    `特殊备注: ${notes}`,
    "",
    "------------------------------------------",
    "  每日行程景点规划",
    "------------------------------------------",
    ...Array.from({ length: days }, (_, i) => {
      const dayPlaces = places.filter((_, idx) => idx % days === i);
      const dayFood = food.filter((_, idx) => idx % days === i);
      let line = `第 ${i + 1} 天: `;
      line += dayPlaces.length ? dayPlaces.map(x => x.name).join(" → ") : "悠闲探索 Galle Fort 及南海岸风光";
      if (dayFood.length) line += ` | 餐饮推荐: ${dayFood.map(x => x.name).join(", ")}`;
      return line;
    }),
    "",
    "------------------------------------------",
    "  精选住宿安排",
    "------------------------------------------",
    stays.length ? stays.map(x => `• ${x.name} ($${x.price || HOTEL_PRICES[x.name]}/晚)`).join("\n") : "• 住宿请根据喜好另行预订。",
    "",
    "------------------------------------------",
    "  已选特色体验与餐饮清单",
    "------------------------------------------",
    ...trip.map(x => `• [${x.type === 'Hotel' ? '住宿' : x.type === 'Restaurant' ? '餐厅' : '景点'}] ${x.name}`),
    "",
    "------------------------------------------",
    "  参考费用预算明细 (USD)",
    "------------------------------------------",
    ` 住宿费用总计 (${days} 晚): $${stayTotal.toLocaleString()}`,
    ` 包车交通总计 (${transport}): $${transportTotal.toLocaleString()}`,
    ` 门票餐饮消费预估 (${travelers} 人): $${itemsTotal.toLocaleString()}`,
    "------------------------------------------",
    ` 预估总计参考费用: $${grandTotal.toLocaleString()}`,
    "==========================================",
    "",
    "温馨提示：以上价格为系统参考估算，最终预订费用请与相关服务商直接确认。"
  ];

  currentPlan = lines.join("\n");
  output.textContent = currentPlan;
  output.classList.add("show");
  copyButton.hidden = downloadButton.hidden = false;

  // Send formatted summary via EmailJS API integration
  if (window.emailjs) {
    emailjs.send("service_ymfzk6x", "template_avjtnld", {
      traveler_name: name,
      traveler_email: email,
      total_cost: `$${grandTotal.toLocaleString()}`,
      itinerary_content: currentPlan,
      submission_date: new Date().toLocaleString()
    })
    .then(() => {
      notify("定制行程单已生成并成功发送至您的邮箱！");
    }, (error) => {
      console.error("Email dispatch failed:", error);
      notify("行程单生成成功！");
    });
  } else {
    notify("专属定制行程单已成功创建！");
  }
});

// Clear trip selections action handler
document.getElementById("clear-plan").addEventListener("click", () => {
  trip.length = 0;
  document.querySelectorAll(".add-trip").forEach(button => {
    button.classList.remove("selected");
    button.textContent = button.dataset.type === "Hotel" ? "+ 添加住宿" : "+ 添加到行程";
  });
  renderTrip();
  output.classList.remove("show");
  copyButton.hidden = downloadButton.hidden = true;
  notify("已清空当前所有行程选择");
});

// Copy formatted text itinerary to clipboard helper
copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentPlan);
    notify("定制行程单已成功复制到剪贴板！");
  } catch {
    const area = document.createElement("textarea");
    area.value = currentPlan;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    notify("定制行程单已成功复制！");
  }
});

// Download itinerary content as a text file handler
downloadButton.addEventListener("click", () => {
  const blob = new Blob([currentPlan], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-galle-luxury-itinerary.txt";
  a.click();
  URL.revokeObjectURL(url);
});

// Initial render call on page load
renderTrip();