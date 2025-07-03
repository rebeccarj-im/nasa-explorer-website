# NASA Oracle Explorer - NASA API Card Browser

A web application that explores NASA's open APIs through an interactive card interface, designed to encourage exploration of NASA's vast astronomical databases with a cosmic energy healing theme.


## Technologies Used

**Frontend:**
- React 18
- TypeScript
- CSS Modules

**Backend:**
- Node.js
- Express

**NASA APIs:**
- APOD (Astronomy Picture of the Day)
- EPIC (Earth Polychromatic Imaging Camera)
- NASA Image and Video Library

## Features

- Interactive home page with card interface for browsing NASA content (hover / use dropdown menu)
- Three API exploration filters for search your card:
  - Daily Astronomy Picture (APOD)
  - Earth imagery (EPIC)
  - NASA Image Library search
- Save favorite cards to personal collection
- Clean, minimalist UI with smooth animations
- Responsive design for desktop and mobile

## Setup and Installation

1.Clone the repository:
xxx

2.Install dependencies for both frontend and backend

- npm install
- cd client
- npm install

3.Configuration
Create a .env file in the root directory with the following content:
- NASA_API_KEY=your_api_key_here
- PORT=5050

4.Run it!
- Start the backend server (from root directory):
node server.js

- Start the frontend development server (in a new terminal tab):
npm run dev

5.The problems that I didn't fix
- Sometimes the process of loading image may fail (not very stable)
- For the gallery page, it need several seconds to load the whole pic.

6.The proposed feature
- Make a cyber postcard with collected(favorite) card.
- Add sound feedback to enhance accessibility.
- Add a back button on favorite page.
