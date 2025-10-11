// src/pages/_app.js
import '../styles/index.css'; // or adjust the path

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
