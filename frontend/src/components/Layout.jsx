import Sidebar from "./Sidebar.jsx";

function Layout({ children }) {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <Sidebar />

      <main
        className="flex-grow-1 p-3 p-md-4"
        style={{
          marginLeft: "250px",
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </div>
  );
}

export default Layout;