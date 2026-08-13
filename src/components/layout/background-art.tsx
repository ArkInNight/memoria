function BackgroundArt({ darkMode }: { darkMode: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
          darkMode ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: "url(/images/Inside_Suitcase_Day_BG.webp)" }}
      />

      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out ${
          darkMode ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: "url(/images/Inside_Suitcase_Night_BG.webp)" }}
      />
    </div>
  );
}

export { BackgroundArt };
