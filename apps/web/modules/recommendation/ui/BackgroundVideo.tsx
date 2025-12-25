export default function BackgroundVideo() {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="
          fixed
          inset-0
          w-full
          h-full
          object-cover
          z-0
        "
      >
        <source src="/videos/hero-bg-clip.mp4" type="video/mp4" />
      </video>

      {/* Overlay oscuro */}
      <div className="fixed inset-0 bg-black/50 z-0" />
    </>
  );
}
