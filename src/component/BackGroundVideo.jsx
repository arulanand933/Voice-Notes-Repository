import React, { useEffect, useRef } from "react";

export default function BackGroundVideo() {
  const ref = useRef(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    console.log("BackGroundVideo: mounted, src=", v.currentSrc || v.src);

    const onLoaded = () => console.log("BackGroundVideo: loadeddata");
    const onPlay = () => console.log("BackGroundVideo: play event");
    const onError = (e) => console.error("BackGroundVideo: error", e, "src=", v.currentSrc || v.src);

    v.addEventListener("loadeddata", onLoaded);
    v.addEventListener("play", onPlay);
    v.addEventListener("error", onError);

    return () => {
      v.removeEventListener("loadeddata", onLoaded);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("error", onError);
    };
  }, []);

  return (
    <video
      ref={ref}
      className="bg-video"
      autoPlay
      loop
      muted
      playsInline
      style={{ pointerEvents: "none" }}
    >
      <source src="/video/bg.mp4" type="video/mp4" />
      {/* Fallback text for very old browsers */}
      Your browser does not support the video tag.
    </video>
  );
}

