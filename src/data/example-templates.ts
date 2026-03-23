interface ExampleTemplate {
  id: string
  title: string
  description: string
  idea: string
}

export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: 'website-starter',
    title: 'Website Starter Package',
    description: 'A simple starter kit for building personal or business websites',
    idea: 'I want to create a simple project starter package for websites. It should include a modern template, easy deployment, and be beginner-friendly. The user should be able to customize colors, fonts, and layout without coding knowledge.',
  },
  {
    id: 'saas-mvp',
    title: 'SaaS MVP',
    description: 'A minimal viable product for a software-as-a-service business',
    idea: 'I want to build a SaaS product where small businesses can manage their customer appointments and send automated reminders via email and SMS. It needs user authentication, a dashboard, and a billing system.',
  },
  {
    id: 'mobile-app',
    title: 'Mobile App',
    description: 'A cross-platform mobile application',
    idea: 'I want to build a mobile app for tracking daily habits and goals. Users should be able to set habits, mark them complete each day, see streaks and statistics, and optionally share progress with friends. It should work on both iOS and Android.',
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce Store',
    description: 'An online store for selling products',
    idea: 'I want to create an online store for a small handmade jewelry business. It needs a product catalog with photos, shopping cart, checkout with payment processing, order tracking, and a simple admin panel to manage products and orders.',
  },
  {
    id: 'api-service',
    title: 'API Service',
    description: 'A backend API service for data processing',
    idea: 'I want to build a REST API service that accepts CSV files, processes and cleans the data (removes duplicates, fixes formatting, validates entries), and returns the cleaned data. It should handle files up to 100MB and support scheduled batch processing.',
  },
  {
    id: 'community-platform',
    title: 'Community Platform',
    description: 'A discussion forum or community site',
    idea: 'I want to create a community platform for local gardeners to share tips, post photos of their gardens, ask questions, and organize local meetups. It should have user profiles, discussion threads, photo galleries, and event management.',
  },
  {
    id: 'local-business',
    title: 'Local Business',
    description: 'A physical store, restaurant, or service business',
    idea: 'I want to open a specialty coffee shop in a neighbourhood with a lot of foot traffic. It should have a small menu focused on quality, a cozy atmosphere for remote workers, and a loyalty program. I need to figure out location, equipment, permits, and how to stand out from chain cafes.',
  },
  {
    id: 'community-event',
    title: 'Community Event',
    description: 'A recurring meetup, workshop, or community gathering',
    idea: 'I want to organize a monthly coding meetup for beginners in my city. It should be welcoming for people who have never been to a tech event, include hands-on pair programming, and help people build a local network. I need to figure out venues, format, promotion, and how to keep people coming back.',
  },
]
