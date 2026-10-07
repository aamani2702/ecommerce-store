// ===== BRAND SETTINGS: edit these for each client =====
export const BRAND = {
  name: "ONA Closet",

  // Pick one or write your own:
  //  'Timeless ethnic wear for every celebration'
  //  'Where tradition meets elegance'
  //  'Draped in heritage, designed for today'
  tagline: "Timeless ethnic wear for every celebration",

  // Put the client's real email here
  email: "onagaaamani@gmail.com",
  // Thin bar at the very top. Set to '' to hide it.
  announcement: "Handpicked ethnic wear for every celebration",

  // Optional: put your logo file in frontend/public (for example logo.png) and write '/logo.png'.
  // Leave '' to show the brand name in the script font instead.
  logo: "",

  // The strip of three short lines under the banner. Set to [] to hide it.
  highlights: [
    "Handpicked fabrics",
    "Secure online payments",
    "Easy order tracking",
  ],

  // Banner slides on the home page (they change every 5 seconds).
  // Replace the placeholder images later with your own photos (see Step 10).
  heroSlides: [
    {
      image: "/banners/banner1.jpg",
      label: "New collection",
      title: "Elegance in every drape",
      text: "Handpicked sarees, kurtas and lehengas for weddings and festivals.",
      link: "/shop",
    },
    {
      image: "/banners/banner2.jpg",
      label: "Festive edit",
      title: "Celebrate in tradition",
      text: "Fabrics and colours made for your special days.",
      link: "/shop?occasion=Festive",
    },
    {
      image: "/banners/banner3.jpg",
      label: "Wedding season",
      title: "Dressed for the big day",
      text: "Silk, velvet and handwork for brides and families.",
      link: "/shop?occasion=Wedding",
    },
  ],
  // Your WhatsApp number with country code, no plus sign or spaces (example: '919876543210').
  // Leave '' to hide the WhatsApp button.
  whatsapp: "+919876543210",

  // "Shop by occasion" tiles. 'value' must match the Occasion you type when adding products.
  // Add a photo by putting a file in frontend/public/occasions and writing image: '/occasions/wedding.jpg'
  occasions: [
    { name: "Wedding", value: "Wedding", image: "/occasions/wedding.webp" },
    { name: "Festive", value: "Festive", image: "/occasions/festive.jfif" },
    { name: "Casual", value: "Casual", image: "/occasions/casual.jpg" },
  ],

  // The size guide pop-up. Edit the numbers to match your real measurements.
  sizeGuide: {
    unit: "inches",
    columns: ["Size", "Bust", "Waist", "Hip"],
    rows: [
      ["S", "34", "28", "36"],
      ["M", "36", "30", "38"],
      ["L", "38", "32", "40"],
      ["XL", "40", "34", "42"],
      ["XXL", "42", "36", "44"],
    ],
    note: "These are body measurements. If you are between two sizes, choose the larger one.",
  },

  // Text for the product page panels. Edit these to match your real policies.
  shippingInfo:
    "Orders are packed within 2 to 3 working days. You can follow your order status on the Orders page.",
  returnsInfo:
    "Unpaid orders can be cancelled any time from the order page. For anything else, please contact us by email.",
  careInfo:
    "Dry clean silk and heavily embroidered pieces. Hand wash cotton in cold water and iron on low heat.",

  // Pictures for the category tiles. The key is the category slug.
  // Leave empty to use placeholders. Example once you add the files:
  // sarees: '/categories/sarees.jpg',
  categoryImages: {},
  categoryImages: {
    sarees: "/categories/sarees.webp",
    lehengas: "/categories/lehengas.jpg",
    kurtas: "/categories/kurtas.webp",
    dupattas: "/categories/dupattas.jfif",
    sherwanis: "/categories/sherwanis.jfif",
  },
};
