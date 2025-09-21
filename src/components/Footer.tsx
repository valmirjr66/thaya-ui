export default function Footer() {
  return (
    <footer
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100vw",
        backgroundColor: "#3a3a3a",
        color: "#fff",
        height: 25,
        fontSize: 12,
        borderTop: "rgba(255, 255, 255, 0.5) solid 1px",
      }}
    >
      <div style={{ marginLeft: 20 }}>© 2025 Thaya Health</div>
      <div style={{ marginRight: 20 }}>
        Powered By: <u>Cooeso</u>
      </div>
    </footer>
  );
}
