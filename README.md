This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## PlayAI Book Reader

A web application that allows users to upload PDF files, extract text, and convert it into speech using a text-to-speech (TTS) service. The application also provides the ability to control the TTS voice selection and listen to the audio playback.

### Technologies Used

- React - Frontend framework for building the user interface.
- Next.js - React framework used for server-side rendering and routing.
- React-PDF - Library for rendering PDF files and extracting text.
- Play.AI TTS API - API for converting text to speech with different voice options.
- Tailwind CSS - Utility-first CSS framework for styling.
- CircularLoader - A simple loading spinner for indicating processing state.

### How to Run the App
#### 1. Clone the repository

```
git clone https://github.com/MohitKambli/PlayAI-Book-Reader.git
```

#### 2. Install dependencies
Navigate to the project directory and install the dependencies:

```
cd playai-book-reader
npm install
```

#### 3. Set up environment variables
Create a .env file in the root directory and add the following environment variables:

```
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_USER_ID=your-user-id
```

Replace your-api-key and your-user-id with the actual credentials for accessing the Play.AI API.

#### 4. Run the application
To run the app in development mode, use the following command:

```
npm run dev
```

The app will be available at http://localhost:3000.

#### 5. Build and deploy
To build the application for production:

```
npm run build
npm run start
```


### Features

- PDF Upload: Users can upload PDF files, and the text is extracted for further processing.
- Voice Selection: Users can select from a variety of voices for the text-to-speech conversion.
- Audio Playback: Once the text is converted to speech, users can listen to the audio directly from the browser.
- Loading Indicator: A loading spinner is shown while the TTS process is being handled.

### Design Decisions

- Modular Components: The app is structured with reusable components such as PDFUploader, PDFViewer, AudioPlayer, and VoiceSelection. This modularity allows for easy maintenance and scalability.
- State Management: The app uses React's useState and useEffect hooks to manage component state, such as the current page of the PDF, loading status, and audio playback.
- Asynchronous Handling: Text-to-speech conversion is handled asynchronously, with the app displaying a loading spinner while waiting for the audio to be processed. Once ready, the audio player is shown with playback controls.
- Responsive UI: Tailwind CSS is used to ensure the app has a responsive design, providing a smooth experience on both desktop and mobile devices.
