"use client";

export default function VideoBackground() {
  return (
    <>
      <div className="fixed inset-0 -z-20 overflow-hidden">

        <video
          autoPlay
          muted
          loop
          playsInline
          className="
            h-full
            w-full
            object-cover
            opacity-30
          "
        >
          <source
            src="/hero.mp4"
            type="video/mp4"
          />
        </video>

      </div>

      <div
        className="
          fixed
          inset-0
          -z-10
          bg-trasnparent
          backdrop-blur-sm
        "
      />
    </>
  );
}