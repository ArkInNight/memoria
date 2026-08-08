function BackgroundArt({ darkMode }: { darkMode: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      {darkMode ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/9_暴雨前夕_compress.jpg)" }}
        />
      ) : (
        <>
          {/* light: warm paper backdrop with faint orange glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_-10%,rgba(176,94,21,0.10)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_110%,rgba(176,94,21,0.07)_0%,transparent_45%)]" />
        </>
      )}
    </div>
  );
}

export { BackgroundArt };
