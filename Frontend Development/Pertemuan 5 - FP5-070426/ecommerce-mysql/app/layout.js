import "bootstrap/dist/css/bootstrap.min.css";

export const metadata = {
  title: "E-Commerce App",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  );
}