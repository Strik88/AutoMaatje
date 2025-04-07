# Automaatje App

Dit is een React-applicatie voor het coördineren van vervoer, gebouwd met Vite, React Router, Tailwind CSS en @dnd-kit.

## Setup

1.  **Installeer dependencies:**
    ```bash
    npm install
    ```

2.  **Configureer Firebase:**
    *   Maak een Firebase project aan op [https://firebase.google.com/](https://firebase.google.com/).
    *   Voeg een Web App toe aan je Firebase project.
    *   Kopieer de Firebase configuratie (apiKey, authDomain, etc.).
    *   Vervang de placeholder waarden in `src/firebase/config.js` door je eigen Firebase configuratie.

3.  **Start de development server:**
    ```bash
    npm run dev
    ```
    De applicatie is nu beschikbaar op `http://localhost:5173` (of een andere poort als 5173 bezet is).

## Belangrijkste Technologieën

*   **Frontend Framework:** React (via Vite)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **Drag and Drop:** @dnd-kit/core
*   **Backend/Database:** Firebase (Firestore, Authentication - nog te implementeren)

## Volgende Stappen

*   Implementeer Firebase Authentication (login, registratie, user roles).
*   Implementeer Firestore database structuur en functies voor het ophalen/opslaan van data (uitjes, auto's, kinderen, toewijzingen).
*   Implementeer de drag-and-drop logica volledig met @dnd-kit in `HeenreisPage` en `TerugreisPage`.
*   Verbind de frontend state met Firebase data (real-time updates).
*   Implementeer de specifieke logica voor het koppelen van heen- en terugreis.
*   Voeg het vervoersverzoekensysteem toe.
*   Bouw de instellingen/configuratie pagina.
*   Verfijn de UI/UX en styling.
