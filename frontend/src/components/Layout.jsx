import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "220px",
          padding: "20px",
          borderRight: "1px solid #ccc",
        }}
      >
        <Sidebar />
      </div>

      <main
        style={{
          flex: 1,
          padding: "30px",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;