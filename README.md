# Personalized Fairy Tale Generator

This project is a web application that allows parents to create personalized bedtime stories for their children. It uses the Gemini LLM API to generate customized fairy tales based on the child's name, age, topic, and other preferences.

## Features

- Form for child information (name, age) and story preferences
- Ready-made topic options or custom topic input
- Option to specify the story's intended message
- Ability to add supporting characters to appear in the story
- Real-time story generation
- Option to print generated stories
- Logging of all requests and responses in a JSON file

## Project Structure

```
/personalized-fairy-tale-generator
├─ /frontend
│    ├─ index.html       // User form and story display page
│    ├─ styles.css       // CSS style file
│    └─ script.js        // Form data collection, backend communication
├─ /backend
│    ├─ server.js        // Express server, API endpoints
│    ├─ data.json        // Temporary data logging file
│    └─ package.json     // Node.js dependencies
└─ README.md             // Project description
```

## Installation

### Requirements

- Node.js (v14 or higher)
- NPM or Yarn
- Gemini API key (optional)

### Steps

1. Clone the project:
   ```bash
   git clone https://github.com/username/personalized-fairy-tale-generator.git
   cd personalized-fairy-tale-generator
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file and add your Gemini API key (optional):
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage

1. Enter the child's name and age in the "Required Information" section of the form.
2. In the "Optional Information" section:
   - Specify the message the story should convey (optional)
   - Select from ready-made topics or enter a custom topic
   - Specify supporting characters you want in the story (optional)
3. Click the "Generate Story" button and wait for the story to be generated.
4. Read the generated story. If you wish, you can:
   - Print it
   - Create a new story
