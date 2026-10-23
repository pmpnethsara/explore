## https://pmpnethsara.github.io/explore/
# Explore Sri Lanka 🇱🇰

A Sri Lanka travel planning website designed to help travelers explore the beautiful of Sri Lanka. Visitors can discover popular destinations, explore accommodation and restaurants, and create a personalized travel itinerary.

## 🌴 Features

- **Explore Destinations** 
- **Accommodation Guide** 
- **Restaurants and Cafés** 
- **Category Filters** – Filter destinations based on your interests.
- **Favorites** – Mark places you would like to visit.
- **Trip Planner** – Add destinations and other places to your travel plan.
- **Custom Itinerary** – Generate a travel itinerary based on your arrival date and trip duration.
- **Copy and Download** – Copy your itinerary or download it as a text file.
- **Responsive Design** – Browse the website on desktop and mobile devices.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Git and GitHub
- GitHub Pages for hosting

**Planned integration:** Supabase can be used to store travel preferences and user-submitted travel requests.

## 📂 Project Structure

```text
explore-Sri Lanka/
├── index.html
├── style.css
├── script.js
└── README.md
```

- `index.html` – Website structure and content.
- `style.css` – Website styling and responsive layout.
- `script.js` – Interactive features and trip-planning functionality.
- `README.md` – Project documentation.

## 🚀 Run the Website Locally

### 1. Clone the repository

Replace `YOUR-USERNAME` with your GitHub username.

```bash
git clone https://github.com/YOUR-USERNAME/explore-galle.git
```

### 2. Open the project directory

```bash
cd explore-galle
```

### 3. Start a local PHP server

If PHP is installed, run:

```bash
php -S localhost:8000
```

### 4. Open the website

Visit the following address in your browser:

http://localhost:8000

You can also open `index.html` directly in a browser for basic static website functionality.

## 🌐 Deploy with GitHub Pages

1. Push your project files to a GitHub repository.
2. Open the repository on GitHub.
3. Navigate to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder.
6. Click **Save**.

Your website will be available at:

```text
https://YOUR-USERNAME.github.io/explore-galle/
```

Replace `YOUR-USERNAME` with your GitHub username. GitHub may take a few minutes to publish the website.

## 📥 Collecting User Travel Requests

The website can be extended to collect information from visitors, such as:

- Name and contact details
- Arrival date and trip duration
- Number of travelers
- Preferred destinations
- Accommodation and dining preferences
- Special travel requirements

**Important:** GitHub Pages only hosts static files; it does not store form submissions or provide a database.

To save and review user submissions later, integrate a backend service such as **Supabase**. Configure database permissions carefully, validate submissions, and never expose secret or service-role API keys in browser-side JavaScript.

## 🔒 Security and Privacy

- Collect only the information needed for travel planning.
- Explain how submitted information will be used.
- Do not publish private user submissions in the public repository.
- Use appropriate database access policies.
- Never commit passwords, secret keys, or private credentials to GitHub.

## 🎯 Project Goal

The goal of Explore Galle is to make planning a trip to Galle easier by bringing travel inspiration, accommodation options, dining suggestions, and itinerary planning together in one website.

## 📌 Future Improvements

- Save travel requests to a database.
- Add an administrator dashboard to review submissions.
- Add maps and destination directions.
- Include estimated travel costs and transportation options.
- Add destination reviews and ratings.
- Improve accessibility and multilingual support.
- Add links to official hotel, restaurant, and attraction websites.

## 📄 License

This project is intended for educational and personal development purposes. Add a license file if you want to specify how others may use, modify, and distribute your code.

---

**Explore Sri Lanka — Discover the beauty of Sri Lanka, one destination at a time.** 🇱🇰
