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

  // Pictures for the category tiles. The key is the category slug.
  // Leave empty to use placeholders. Example once you add the files:
  // sarees: '/categories/sarees.jpg',
  categoryImages: {},
  categoryImages: {
    sarees: "/categories/sarees.webp",
  },
};
