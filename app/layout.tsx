
import './style.css';

export const metadata = {
  title: "LLM Comparison Platform",
  description: "Compare AI models, vote on responses, and track performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <footer
          style={{
            textAlign: "center",
            padding: "20px",
            marginTop: "40px",
            borderTop: "1px solid #ddd",
            fontSize: "14px",
            color: "#777",
          }}
        >
          Dr Tian&apos;s technical assignment
        </footer>
      </body>
    </html>
  );
}
